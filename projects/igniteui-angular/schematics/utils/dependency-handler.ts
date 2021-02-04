import { workspaces } from '@angular-devkit/core';
import { SchematicContext, Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { Options } from '../interfaces/options';
import { createHost } from './util';

export enum PackageTarget {
    DEV = 'devDependencies',
    REGULAR = 'dependencies',
    NONE = 'none'
}
export interface PackageEntry {
    name: string;
    target: PackageTarget;
}

const schematicsPackage = '@igniteui/angular-schematics';
/**
 * Dependencies are explicitly defined here, so we avoid adding
 * unnecessary packages to the consuming project's deps
 */
export const DEPENDENCIES_MAP: PackageEntry[] = [
    // dependencies
    { name: 'hammerjs', target: PackageTarget.REGULAR },
    { name: 'jszip', target: PackageTarget.REGULAR },
    { name: 'tslib', target: PackageTarget.NONE },
    { name: 'resize-observer-polyfill', target: PackageTarget.REGULAR },
    { name: '@types/hammerjs', target: PackageTarget.DEV },
    { name: 'igniteui-trial-watermark', target: PackageTarget.NONE },
    { name: 'lodash.mergewith', target: PackageTarget.NONE },
    { name: 'uuid', target: PackageTarget.NONE },
    { name: 'web-animations-js', target: PackageTarget.REGULAR },
    { name: '@igniteui/material-icons-extended', target: PackageTarget.REGULAR },
    // peerDependencies
    { name: '@angular/forms', target: PackageTarget.NONE },
    { name: '@angular/common', target: PackageTarget.NONE },
    { name: '@angular/core', target: PackageTarget.NONE },
    { name: '@angular/animations', target: PackageTarget.NONE },
    // igxDevDependencies
    { name: '@igniteui/angular-schematics', target: PackageTarget.DEV }
];

export const getWorkspacePath = (host: Tree): string => {
    const targetFiles = ['/angular.json', '/.angular.json'];
    return targetFiles.filter(p => host.exists(p))[0];
};

const logIncludingDependency = (context: SchematicContext, pkg: string, version: string): void =>
    context.logger.info(`Including ${pkg} - Version: ${version}`);

const getTargetedProjectOptions = (project: workspaces.ProjectDefinition, target: string) => {
    if (project.targets &&
        project.targets[target] &&
        project.targets[target].options) {
        return project.targets[target].options;
    }

    const projectTarget = project.targets.get(target);
    if (projectTarget) {
        return projectTarget.options;
    }

    throw new SchematicsException(`Cannot determine the project's configuration for: ${target}`);
};

export const getConfigFile = (project: workspaces.ProjectDefinition, option: string, configSection: string = 'build'): string => {
    const options = getTargetedProjectOptions(project, configSection);
    if (!options) {
        throw new SchematicsException(`Could not find matching ${configSection} section` +
            `inside of the workspace config ${project.sourceRoot} `);
    }
    if (!options[option]) {
        throw new SchematicsException(`Could not find the project ${option} file inside of the ` +
            `workspace config ${project.sourceRoot}`);
    }
    return options[option];

};

export const overwriteJsonFile = (tree: Tree, targetFile: string, data: any) =>
    tree.overwrite(targetFile, JSON.stringify(data, null, 2) + '\n');


export const logSuccess = (options: Options): Rule => (tree: Tree, context: SchematicContext) => {
    context.logger.info('');
    context.logger.warn('Ignite UI for Angular installed');
    context.logger.info('Learn more: https://www.infragistics.com/products/ignite-ui-angular');
    context.logger.info('');
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addDependencies = (options: Options) => async (tree: Tree, context: SchematicContext): Promise<void> => {
    const pkgJson = require('../../package.json');

    await includeDependencies(pkgJson, context, tree);

    // Add web-animations-js to dependencies
    Object.keys(pkgJson.peerDependencies).forEach(pkg => {
        if (pkg.includes('web-animations')) {
            const version = pkgJson.peerDependencies[pkg];
            addPackageToPkgJson(tree, pkg, version, PackageTarget.REGULAR);
            logIncludingDependency(context, pkg, version);
            return;
        }
    });

    addPackageToPkgJson(tree, schematicsPackage, pkgJson.igxDevDependencies[schematicsPackage], PackageTarget.DEV);
};

/** Checks whether a property exists in the angular workspace. */
export const propertyExistsInWorkspace = (targetProp: string, workspace: workspaces.WorkspaceDefinition): boolean => {
    const foundProp = getPropertyFromWorkspace(targetProp, workspace);
    return foundProp !== null && foundProp.key === targetProp;
};

/** Recursively search for the first property that matches targetProp within a json file. */
export const getPropertyFromWorkspace = (targetProp: string, workspace: any, curKey = ''): { key: string; value: any } => {
    if (workspace.hasOwnProperty(targetProp)) {
        return { key: targetProp, value: workspace[targetProp] };
    }

    const workspaceKeys = Object.keys(workspace);
    for (const key of workspaceKeys) {
        // If the target property is an array, return its key and its contents.
        if (Array.isArray(workspace[key])) {
            return {
                key: curKey,
                value: workspace[key]
            };
        } else if (workspace[key] instanceof Object) {
            // If the target property is an object, go one level in.
            if (workspace.hasOwnProperty(key)) {
                const newValue = getPropertyFromWorkspace(targetProp, workspace[key], key);
                if (newValue) {
                    return newValue;
                }
            }
        }
    }

    return null;
};

const addHammerToConfig = async (project: workspaces.ProjectDefinition, tree: Tree, config: string): Promise<void> => {
    const projectOptions = getTargetedProjectOptions(project, config);
    const tsPath = getConfigFile(project, 'main', config);
    const hammerImport = 'import \'hammerjs\';\n';
    const tsContent = tree.read(tsPath).toString();
    // if there are no elements in the architect[config]options.scripts array that contain hammerjs
    // and the "main" file does not contain an import with hammerjs
    if (!projectOptions.scripts.some(el => el.includes('hammerjs')) && !tsContent.includes(hammerImport)) {
        // import hammerjs in the specified by config main file
        const mainContents = hammerImport + tsContent;
        tree.overwrite(tsPath, mainContents);
    }
};

const includeDependencies = async (pkgJson: any, context: SchematicContext, tree: Tree): Promise<void> => {
    const workspaceHost = createHost(tree);
    const { workspace } = await workspaces.readWorkspace(tree.root.path, workspaceHost);
    const project = workspace.projects.get(workspace.extensions['defaultProject'] as string);
    for (const pkg of Object.keys(pkgJson.dependencies)) {
        const version = pkgJson.dependencies[pkg];
        const entry = DEPENDENCIES_MAP.find(e => e.name === pkg);
        if (!entry || entry.target === PackageTarget.NONE) {
            continue;
        }
        switch (pkg) {
            case 'hammerjs':
                logIncludingDependency(context, pkg, version);
                addPackageToPkgJson(tree, pkg, version, entry.target);
                await addHammerToConfig(project, tree, 'build');
                await addHammerToConfig(project, tree, 'test');
                break;
            default:
                logIncludingDependency(context, pkg, version);
                addPackageToPkgJson(tree, pkg, version, entry.target);
                break;
        }
    }
    await workspaces.writeWorkspace(workspace, workspaceHost);
};

export const addPackageToPkgJson = (tree: Tree, pkg: string, version: string, target: string): boolean => {
    const targetFile = 'package.json';
    if (tree.exists(targetFile)) {
        const sourceText = tree.read(targetFile).toString();
        const json = JSON.parse(sourceText);

        if (!json[target]) {
            json[target] = {};
        }

        if (!json.dependencies[pkg]) {
            json[target][pkg] = version;
            json[target] =
                Object.keys(json[target])
                    .sort()
                    .reduce((result, key) => (result[key] = json[target][key]) && result, {});
            tree.overwrite(targetFile, JSON.stringify(json, null, 2) + '\n');
        }

        return true;
    }

    return false;
};
