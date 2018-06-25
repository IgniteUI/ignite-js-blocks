import {
    Rule,
    SchematicContext,
    SchematicsException,
    Tree
} from '@angular-devkit/schematics';
import { getImportModulePositions } from '../common/tsUtils';
import { UpdateChanges } from '../common/UpdateChanges';

export default function(): Rule {
    return (host: Tree, context: SchematicContext) => {
        context.logger.info('Applying migration for Ignite UI for Angular to version 6.0.1');

        const update = new UpdateChanges(__dirname, host, context);
        // update.applyChanges();

        // rename submodule imports
        for (const entry of update.tsFiles) {
            let content = entry.content.toString();
            if (content.indexOf('igniteui-angular/') !== -1) {
                const pos = getImportModulePositions(content, 'igniteui-angular/');
                for (let i = pos.length; i--;) {
                    content = content.slice(0, pos[i].start) + 'igniteui-angular' + content.slice(pos[i].end);
                }
                host.overwrite(entry.path, content);
            }
        }
    };
}
