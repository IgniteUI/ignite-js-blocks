import { Element } from '@angular/compiler';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, getAttribute, findElementNodes, getSourceOffset, hasAttribute, parseFile } from '../common/util';

const version = '12.0.0';

export default (): Rule => (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`
    );

    // eslint-disable-next-line max-len
    const UPDATE_NOTE = `<!--NOTE: This component has been updated by Infragistics migration: v${version}\nPlease check your template whether all bindings/event handlers are correct.-->\n`;

    const COMPONENTS = [
        {
            component: 'igx-bottom-nav',
            tags: ['igx-bottom-nav-item', 'igx-tab-panel', 'igx-tab'],
            tabItem: 'igx-bottom-nav-item',
            headerItem: 'igx-bottom-nav-header',
            panelItem: 'igx-bottom-nav-content',
            iconDirective: 'igxBottomNavHeaderIcon',
            labelDirective: 'igxBottomNavHeaderLabel'
        },
        {
            component: 'igx-tabs',
            tags: ['igx-tabs-group', 'igx-tab-item'],
            tabItem: 'igx-tab-item',
            headerItem: 'igx-tab-header',
            panelItem: 'igx-tab-content',
            iconDirective: 'igxTabHeaderIcon',
            labelDirective: 'igxTabHeaderLabel'
        }
    ];

    const EDITOR_COMPONENTS = [{
        COMPONENT: 'igx-date-picker',
        TEMPLATE_DIRECTIVE: 'igxDatePickerTemplate',
        TEMPLATE_WARN_MSG:
            `\n<!-- igxDatePickerTemplate has been removed.
Label, prefix, suffix and hint can now be projected directly.
See https://www.infragistics.com/products/ignite-ui-angular/angular/components/date-picker -->\n`
    }, {
        COMPONENT: 'igx-time-picker',
        TEMPLATE_DIRECTIVE: 'igxTimePickerTemplate',
        TEMPLATE_WARN_MSG:
            `\n<!-- igxTimePickerTemplate has been removed.
Label, prefix, suffix and hint can now be projected directly.
See https://www.infragistics.com/products/ignite-ui-angular/angular/components/time-picker -->\n`
    }];
    const EDITORS_MODE = ['[mode]', 'mode'];
    const EDITORS_LABEL = ['[label]', 'label'];
    const EDITORS_LABEL_VISIBILITY = ['[labelVisibility]', 'labelVisibility'];

    const update = new UpdateChanges(__dirname, host, context);
    const changes = new Map<string, FileChange[]>();
    const htmlFiles = update.templateFiles;
    const sassFiles = update.sassFiles;
    const _tsFiles = update.tsFiles;
    let applyComment = false;

    const applyChanges = () => {
        for (const [path, change] of changes.entries()) {
            let buffer = host.read(path).toString();

            change.sort((c, c1) => c.position - c1.position)
                .reverse()
                .forEach(c => buffer = c.apply(buffer));

            host.overwrite(path, buffer);
            applyComment = true;
        }
    };

    const addChange = (path: string, change: FileChange) => {
        if (changes.has(path)) {
            changes.get(path).push(change);
        } else {
            changes.set(path, [change]);
        }
    };

    const isEmptyOrSpaces = (str) => str === null || str === '' || str === '\n' || str === '\r\n' || str.match(/^[\r\n\t]* *$/) !== null;

    // Replace the tabsType input with tabsAligment
    for (const path of htmlFiles) {
        findElementNodes(parseFile(host, path), 'igx-tabs')
            .forEach(node => {
                if (hasAttribute(node as Element, 'type')) {
                    const { startTag, file } = getSourceOffset(node as Element);
                    const tabsType = getAttribute(node as Element, 'type')[0];
                    let alignment;
                    if (tabsType.value.toLowerCase() === 'fixed') {
                        alignment = 'justify';
                    } else if (tabsType.value.toLowerCase() === 'contentfit') {
                        alignment = 'start';
                    }
                    const tabAlignment = alignment ? ` tabAlignment="${alignment}"` : '';
                    addChange(file.url, new FileChange(startTag.end - 1, tabAlignment));
                }
            });
    }
    applyChanges();
    changes.clear();

    for (const comp of COMPONENTS) {
        for (const path of htmlFiles) {
            // Replace the <ng-template igxTab> if any with <igx-tab-item>
            findElementNodes(parseFile(host, path), comp.tags)
                .map(tab => findElementNodes([tab], 'ng-template'))
                .reduce((prev, curr) => prev.concat(curr), [])
                .filter(template => hasAttribute(template as Element, 'igxTab'))
                .forEach(node => {
                    const { startTag, endTag, file } = getSourceOffset(node as Element);
                    const content = file.content.substring(startTag.end, endTag.start);
                    const textToReplace = file.content.substring(startTag.start, endTag.end);
                    const tabPanel = `<${comp.headerItem}>${content}</${comp.headerItem}>`;
                    addChange(file.url, new FileChange(startTag.start, tabPanel, textToReplace, 'replace'));
                });

            applyChanges();
            changes.clear();

            // Convert label and icon to igx-tab-header children ->
            // <igx-icon igxTabHeaderIcon> and <span igxTabHeaderLabel>
            findElementNodes(parseFile(host, path), comp.tags).
                map(node => getSourceOffset(node as Element)).
                forEach(offset => {
                    const { startTag, file, node } = offset;
                    // Label content
                    let labelText = '';
                    if (hasAttribute(node, 'label')) {
                        const labelAttr = getAttribute(node, 'label')[0];
                        labelText = `\n<span ${comp.labelDirective}>${labelAttr.value}</span>`;
                    }
                    // Icon content
                    let iconText = '';
                    if (hasAttribute(node, 'icon')) {
                        const iconAttr = getAttribute(node, 'icon')[0];
                        iconText = `\n<igx-icon ${comp.iconDirective}>${iconAttr.value}</igx-icon>`;
                    }
                    // RouterLink
                    let routerLinkText = '';
                    if (hasAttribute(node, 'routerLink')) {
                        const routerLink = getAttribute(node, 'routerLink')[0];
                        routerLinkText = ` ${routerLink.name}="${routerLink.value}"`;
                    }

                    let classText = '';
                    if ((node.name === 'igx-tab-item' || node.name === 'igx-tab') && hasAttribute(node, 'class')) {
                        const classAttr = getAttribute(node, 'class')[0].value;
                        classText = !isEmptyOrSpaces(classAttr) ? ` class="${classAttr}"` : '';
                    }

                    if (iconText || labelText || routerLinkText) {
                        // Get igx-tab-header if it's present
                        const headerNode = findElementNodes([offset.node], comp.headerItem)
                            .map(hNode => getSourceOffset(hNode as Element));

                        if (headerNode && headerNode.length > 0) {
                            addChange(file.url, new FileChange(headerNode[0].startTag.end - 1, `${routerLinkText}${classText}`));
                        } else {
                            // eslint-disable-next-line max-len
                            const tabHeader = `\n<${comp.headerItem}${routerLinkText}${classText}>${iconText}${labelText}\n</${comp.headerItem}>`;
                            addChange(file.url, new FileChange(startTag.end, tabHeader));
                        }
                    }
                });

            applyChanges();
            changes.clear();

            // Grab the content between <igx-tabs-group> and create a <igx-tab-content>
            // Also migrate class from igx-tabs-group to igx-tab-content, if any
            findElementNodes(parseFile(host, path), comp.tags)
                .map(node => getSourceOffset(node as Element))
                .forEach(offset => {
                    const tabHeader = offset.node.children.find(c => (c as Element).name === comp.headerItem);
                    let classAttrText = '';
                    if (offset.node.name === 'igx-tab-panel' || offset.node.name === 'igx-tabs-group') {
                        const classAttr = hasAttribute(offset.node, 'class') ? getAttribute(offset.node, 'class')[0].value : '';
                        classAttrText = !isEmptyOrSpaces(classAttr) ? ` class="${classAttr}"` : '';
                    }

                    if (tabHeader) {
                        const content = offset.file.content.substring(tabHeader.sourceSpan.end.offset, offset.endTag.start);
                        // Since igx-tab-item tag is common for old and new igx-tabs
                        // Check whether igx-tab-content is already present!
                        const tabContentTag = new RegExp(String.raw`${comp.panelItem}`);
                        const hasTabContent = content.match(tabContentTag);

                        if (!hasTabContent && !isEmptyOrSpaces(content)) {
                            const tabPanel = `\n<${comp.panelItem}${classAttrText}>${content}</${comp.panelItem}>\n`;
                            addChange(offset.file.url, new FileChange(tabHeader.sourceSpan.end.offset, tabPanel, content, 'replace'));
                        }
                    }
                });

            applyChanges();
            changes.clear();

            // Insert a comment indicating the change/replacement
            if (applyComment) {
                findElementNodes(parseFile(host, path), comp.component).
                    map(node => getSourceOffset(node as Element)).
                    forEach(offset => {
                        const { startTag, file } = offset;
                        const commentText = UPDATE_NOTE;
                        addChange(file.url, new FileChange(startTag.start, commentText));
                    });

                applyChanges();
                changes.clear();
            }
        }

        for (const sassPath of sassFiles) {
            const origContent = host.read(sassPath).toString();
            let newContent = origContent;
            let changed = false;
            for (const item of comp.tags) {
                const searchText = new RegExp(String.raw`${item}(?=[\s])`);
                let replaceText = '';
                if (comp.component === 'igx-tabs') {
                    if (item === 'igx-tab-item') {
                        replaceText = comp.headerItem;
                    } else if (item === 'igx-tabs-group') {
                        replaceText = comp.panelItem;
                    }
                }
                if (comp.component === 'igx-bottom-nav') {
                    if (item === 'igx-tab') {
                        replaceText = comp.headerItem;
                    } else if (item === 'igx-tab-panel') {
                        replaceText = comp.panelItem;
                    }
                }

                if (searchText.test(origContent)) {
                    changed = true;
                    newContent = newContent.replace(searchText, replaceText);
                }
            }
            if (changed) {
                host.overwrite(sassPath, newContent);
            }
        }
    }

    // igxDatePicker & igxTimePicker migrations
    for (const comp of EDITOR_COMPONENTS) {
        for (const path of htmlFiles) {

            // DatePicker and TimePicker don't support templates anymore.
            // That is why migrations inserts a comment to notify the developer to remove the templates.
            findElementNodes(parseFile(host, path), comp.COMPONENT)
                .map(editor => findElementNodes([editor], 'ng-template'))
                .reduce((prev, curr) => prev.concat(curr), [])
                .filter(template => hasAttribute(template as Element, comp.TEMPLATE_DIRECTIVE))
                .map(node => getSourceOffset(node as Element))
                .forEach(offset => {
                    const { startTag, file } = offset;
                    addChange(file.url, new FileChange(startTag.start, comp.TEMPLATE_WARN_MSG));
                });

            // DatePicker and TimePicker default mode is changed to dropdown.
            // 1. That is why any occurrence of drop down mode is removed and
            // 2. dialog mode is added for those that didn't explicitly set the mode prop.

            // 1. Remove dropdown mode
            findElementNodes(parseFile(host, path), comp.COMPONENT)
            .filter(template => hasAttribute(template as Element, EDITORS_MODE))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { file } = offset;
                getAttribute(offset.node as Element, EDITORS_MODE).forEach(attr => {
                    const { sourceSpan, value } = attr;
                    if (value.replace(/'/g,'').replace(/"/g,'') === 'dropdown') {
                        const attrKeyValue = file.content.substring(sourceSpan.start.offset, sourceSpan.end.offset);
                        addChange(file.url, new FileChange(sourceSpan.start.offset, '', attrKeyValue, 'replace'));
                    }
                });
            });

            // 2. Insert dialog mode
            findElementNodes(parseFile(host, path), comp.COMPONENT)
            .filter(template => !hasAttribute(template as Element, EDITORS_MODE))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file } = offset;
                addChange(file.url, new FileChange(startTag.end - 1, ' mode="dialog"'));
            });


            // Remove label property and project it as <label igxLabel></label>
            // Check also labelVisibility value.
            findElementNodes(parseFile(host, path), comp.COMPONENT)
            .filter(template => hasAttribute(template as Element, EDITORS_LABEL))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file } = offset;
                let visibilityValue: string | boolean = true;
                if (hasAttribute(offset.node as Element, EDITORS_LABEL_VISIBILITY)) {
                    const visibility = getAttribute(offset.node as Element, EDITORS_LABEL_VISIBILITY);
                    visibilityValue = visibility[0].value;
                }

                getAttribute(offset.node as Element, EDITORS_LABEL).forEach(attr => {
                    const { sourceSpan, name, value } = attr;
                    const attrKeyValue = file.content.substring(sourceSpan.start.offset, sourceSpan.end.offset);
                    let label;
                    const ngIF = (typeof visibilityValue === 'boolean') ? `` : ` *ngIf="${visibilityValue}"`;
                    if (name.startsWith('[')) {
                        label = `\n<label igxLabel${ngIF}>{{${value}}}</label>`;
                    } else {
                        label = `\n<label igxLabel${ngIF}>${value}</label>`;
                    }
                    addChange(file.url, new FileChange(sourceSpan.start.offset, '', attrKeyValue, 'replace'));
                    addChange(file.url, new FileChange(startTag.end, label));
                });
            });

            // If label and labelVisibility are not set this means that we should project default labels: "Date" & "Time"
            findElementNodes(parseFile(host, path), comp.COMPONENT)
            .filter(template => !hasAttribute(template as Element, EDITORS_LABEL) &&
                !hasAttribute(template as Element, EDITORS_LABEL_VISIBILITY))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                if (findElementNodes([offset.node], 'label').length === 0) {
                const { startTag, file } = offset;
                addChange(file.url,
                    new FileChange(startTag.end, `\n<label igxLabel>${comp.COMPONENT === 'igx-date-picker' ? 'Date' : 'Time' }</label>`));
                }
            });

            applyChanges();
            changes.clear();
        }
    }

    // input group disabled property
    const INPUT_GROUP_CHANGES = {
        GROUP_TAG: 'igx-input-group',
        ATTRIBUTES: ['[disabled]', 'disabled'],
        INPUT_TAG: ['input', 'textarea'],
        DIRECTIVE: 'igxInput'
    };

    for (const path of htmlFiles) {
        const inputGroups = findElementNodes(parseFile(host, path), INPUT_GROUP_CHANGES.GROUP_TAG);
        inputGroups.forEach((el) => {
            const parentEl = (el as Element);
            if (hasAttribute(parentEl, INPUT_GROUP_CHANGES.ATTRIBUTES)) {
                const inputChildren = findElementNodes([el], INPUT_GROUP_CHANGES.INPUT_TAG)
                    .reduce((prev, curr) => prev.concat(curr), [])
                    .filter(template => hasAttribute(template as Element, INPUT_GROUP_CHANGES.DIRECTIVE));
                INPUT_GROUP_CHANGES.ATTRIBUTES.forEach((a: string) => {
                    const attr = getAttribute(parentEl, a)[0];
                    if (attr) {
                        inputChildren.forEach((node: Element) => {
                            if (!hasAttribute(node, INPUT_GROUP_CHANGES.ATTRIBUTES)) {
                                const { startTag, file } = getSourceOffset(node as Element);
                                // input is self-closing, so the element === startTag
                                const repTxt = file.content.substring(startTag.start, startTag.end);
                                const matches = repTxt.match(/\/?>/g);
                                // should always be only 1 match
                                const lastIndex = repTxt.indexOf(matches[0]);
                                let property = `${attr.name}`;
                                if (attr.name === INPUT_GROUP_CHANGES.ATTRIBUTES[0] || attr.value) {
                                    property += `="${attr.value}"`;
                                }
                                const addedAttr =
                                    `${repTxt.substring(0, lastIndex)} ${property}${repTxt.substring(lastIndex)}`;
                                addChange(file.url, new FileChange(startTag.start, addedAttr, repTxt, 'replace'));
                            }
                        });
                    }
                });
            }
        });
        applyChanges();
        changes.clear();
    }

    // Apply all selector and input changes
    update.applyChanges();
};
