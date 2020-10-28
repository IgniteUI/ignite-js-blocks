import { Element } from '@angular/compiler';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile, serializeNodes } from '../common/util';

const version = '11.0.0';

export default function (): Rule {
    return (host: Tree, context: SchematicContext) => {
        context.logger.info(
            `Applying migration for Ignite UI for Angular to version ${version}`
        );

        const update = new UpdateChanges(__dirname, host, context);

        const TAGS = ['igx-grid', 'igx-tree-grid', 'igx-hierarchical-grid'];
        const prop = ['[showToolbar]', 'showToolbar'];
        const changes = new Map<string, FileChange[]>();

        const applyChanges = () => {
            for (const [path, change] of changes.entries()) {
                let buffer = host.read(path).toString();

                change.sort((c, c1) => c.position - c1.position)
                    .reverse()
                    .forEach(c => buffer = c.apply(buffer));

                host.overwrite(path, buffer);
            }
        };

        const addChange = (path: string, change: FileChange) => {
            changes.has(path) ? changes.get(path).push(change) : changes.set(path, [change]);
        };


        const makeNgIf = (name: string, value: string) => {
            return name.startsWith('[') && value !== 'true';
        };

        const moveTemplateIfAny = (grid: Element) => {
            const ngTemplates = findElementNodes([grid], ['ng-template']);
            const toolbarTemplate = ngTemplates.filter(template => hasAttribute(template as Element, 'igxToolbarCustomContent'))[0];
            if (toolbarTemplate) {
                return `\n${serializeNodes((toolbarTemplate as Element).children).join('')}\n`;
            }
            return '';
        };

        // General migration

        // Prepare the file changes
        for (const path of update.templateFiles) {
            findElementNodes(parseFile(host, path), TAGS)
                .filter(grid => hasAttribute(grid as Element, prop))
                .map(node => getSourceOffset(node as Element))
                .forEach(offset => {
                    const { startTag, file, node } = offset;
                    const { name, value } = getAttribute(node, prop)[0];
                    const text = `\n<igx-grid-toolbar${makeNgIf(name, value) ? ` *ngIf="${value}"` : ''}>${moveTemplateIfAny(node)}</igx-grid-toolbar>\n`;
                    addChange(file.url, new FileChange(startTag.end, text));
                });
        }

        applyChanges();
        changes.clear();

        // Remove toolbar templates after migration
        for (const path of update.templateFiles) {
            findElementNodes(parseFile(host, path), TAGS)
                .filter(grid => hasAttribute(grid as Element, prop))
                .map(grid => findElementNodes([grid], ['ng-template']))
                .reduce((prev, curr) => prev.concat(curr), [])
                .filter(template => hasAttribute(template as Element, 'igxToolbarCustomContent'))
                .forEach(node => {
                    const { startTag, endTag, file } = getSourceOffset(node as Element);
                    const replaceText = file.content.substring(startTag.start, endTag.end);
                    addChange(file.url, new FileChange(startTag.start, '', replaceText, 'replace'));
                });
        }

        applyChanges();

        // Remove the input properties
        update.applyChanges();
    };
}
