import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Options } from '../interfaces/options';
import { installPackageJsonDependencies } from '../utils/package-handler';
import { logSuccess, addDependencies, overwriteJsonFile,
    getPropertyFromWorkspace, getConfigFile } from '../utils/dependency-handler';

import { addResetCss } from './add-normalize';
import { getWorkspace } from '@schematics/angular/utility/config';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';


/**
 * Checks whether a property exists in the angular workspace.
 */
function propertyExistsInWorkspace(targetProp: string, workspace: WorkspaceSchema): boolean {
  const foundProp = getPropertyFromWorkspace(targetProp, workspace);
  return foundProp !== null && foundProp.key === targetProp;
}

function enablePolyfills(tree: Tree, context: SchematicContext): string {
  const workspace = getWorkspace(tree);
  const project = workspace.projects[workspace.defaultProject];
  const targetFile = getConfigFile(project, 'polyfills');
  if (!tree.exists(targetFile)) {
    context.logger.warn(`${targetFile} not found. You may need to update polyfills.ts manually.`);
    return;
  }

  // Match all commented import statements that are core-js/es6/*
  const pattern = /\/{2}\s{0,}(import\s{0,}\'core\-js\/es6\/.+)/;
  let polyfillsData = tree.read(targetFile).toString();
  if (pattern.test(polyfillsData)) {
    let result: any;
    while (result = pattern.exec(polyfillsData)) {
      polyfillsData = polyfillsData.replace(result[0], result[1]);
    }
  }

  return polyfillsData;
}

function enableWebAnimationsAndGridSupport(tree: Tree, targetFile: string, polyfillsData: any): void {
  // Target the web-animations-js commented import statement and uncomment it.
  const webAnimationsLine = '// import \'web-animations-js\';';
  polyfillsData = polyfillsData.replace(webAnimationsLine,
    webAnimationsLine.substring(3, webAnimationsLine.length));

  tree.overwrite(targetFile, polyfillsData);
}

function readInput(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.polyfills) {
      const workspace = getWorkspace(tree);
      const targetProperty = 'es5BrowserSupport';
      const project = workspace.projects[workspace.defaultProject];
      const polyfillsFile = getConfigFile(project, 'polyfills');
      const propertyExists = propertyExistsInWorkspace(targetProperty, workspace);
      let polyfillsData = tree.read(polyfillsFile).toString();
      if (propertyExists) {
        // If project targets angular cli version >= 7.3
        workspace.projects[workspace.defaultProject].architect.build.options[targetProperty] = true;
        enableWebAnimationsAndGridSupport(tree, polyfillsFile, polyfillsData);
        overwriteJsonFile(tree, 'angular.json', workspace);
      } else {
        // If project targets angular cli version < 7.3
        polyfillsData = enablePolyfills(tree, context);
        enableWebAnimationsAndGridSupport(tree, polyfillsFile, polyfillsData);
      }
    }
  };
}

function addNormalize(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.resetCss) {
      const result = addResetCss(tree);
      if (!result) {
        context.logger.warn(`Could not complete adding reset styles. Those may need to be added manually.`);
      }
    }
  };
}

export default function (options: Options): Rule {
  return chain([
    readInput(options),
    addNormalize(options),
    addDependencies(options),
    installPackageJsonDependencies(options),
    logSuccess(options)
  ]);
}
