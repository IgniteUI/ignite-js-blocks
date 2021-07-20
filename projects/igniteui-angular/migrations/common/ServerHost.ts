import { Tree } from '@angular-devkit/schematics';
import * as pathFs from 'path';
import * as ts from 'typescript/lib/tsserverlibrary';
import { CUSTOM_TS_PLUGIN_NAME, CUSTOM_TS_PLUGIN_PATH } from './tsUtils';

/**
 * Langauge server host is responsible for **most** of the FS operations / checks
 * Angular's Ivy LS sometimes bypasses these, calling path methods instead of tsLsHost operations
 */
export class ServerHost implements ts.server.ServerHost {
    public readonly args: string[];
    public readonly newLine: string;
    public readonly useCaseSensitiveFileNames: boolean;

    constructor(private host: Tree) {
        this.args = ts.sys.args;
        this.newLine = ts.sys.newLine;
        this.useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
    }

    /**
     * Read a file's content from the Virtual Tree
     * If file does not exist in virtual tree, check in physical FS
     */
    public readFile(path: string, encoding?: string): string | undefined {
        let content;
        // ensure the path is relative, so it can be found in the Tree, reflecting latest state
        path = pathFs.relative(this.getCurrentDirectory(), path);
        try {
            content = this.host.read(path).toString(encoding);
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            return content || ts.sys.readFile(path, encoding);
        }
    }

    public getFileSize(path: string): number {
        return ts.sys.getFileSize(path);
    }

    public watchFile(path: string, callback: ts.FileWatcherCallback, pollingInterval?: number):
        ts.FileWatcher {
        return ts.sys.watchFile(path, callback, pollingInterval);
    }

    public watchDirectory(path: string, callback: ts.DirectoryWatcherCallback, recursive?: boolean):
        ts.FileWatcher {
        return ts.sys.watchDirectory(path, callback, recursive);
    }

    public resolvePath(path: string): string {
        return ts.sys.resolvePath(path);
    }

    /**
     * Checks for file in Virtual Tree w/ relative path
     * If file does not exist in virtual tree, check in physical FS
     */
    public fileExists(path: string): boolean {
        // check for file in Tree, as schematics might need for check
        path = pathFs.relative(this.getCurrentDirectory(), path);
        let flag = false;
        try {
            // Tree.exists throws on invalid paths instead of returning false
            flag = this.host.exists(path);
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            return flag || ts.sys.fileExists(path);
        }
    }

    public directoryExists(path: string): boolean {
        let exists: boolean;
        path = pathFs.relative(this.getCurrentDirectory(), path);
        try {
            exists = this.host.getDir(path) !== void 0;
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            return exists || ts.sys.directoryExists(path);
        }
    }

    public getExecutingFilePath(): string {
        return ts.sys.getExecutingFilePath();
    }

    public getCurrentDirectory(): string {
        // both TS and NG lang serves work with absolute paths
        // we provide cwd instead of tree root so paths can be resolved to absolute ones
        return process.cwd();
    }

    /**
     * Get all subdirs of a directory from the Tree mapped to absolute paths
     */
    public getDirectories(path: string): string[] {
        // check directory contents in Tree (w/ relative paths)
        path = pathFs.relative(this.getCurrentDirectory(), path);
        // return directory contents w/ absolute paths for LS
        return this.host.getDir(path).subdirs.map(e => pathFs.resolve(e));
    }

    /**
     * Get all files of a directory from the Tree mapped to absolute paths
     */
    public readDirectory(path: string): string[] {
        // check directory contents in Tree (w/ relative paths)
        path = pathFs.relative(this.getCurrentDirectory(), path);
        // return directory contents w/ absolute paths for LS
        return this.host.getDir(path).subfiles.map(e => pathFs.resolve(e));
    }

    public require(initialPath: string, moduleName: string) {
        try {
            const paths = [initialPath];
            if (moduleName === CUSTOM_TS_PLUGIN_NAME) {
                moduleName = CUSTOM_TS_PLUGIN_PATH;
                paths.push(__dirname);
            }
            const modulePath = require.resolve(moduleName, { paths });
            return {
                module: require(modulePath),
                error: undefined,
            };
        } catch (e) {
            return {
                module: undefined,
                error: e as Error,
            };
        }
    }

    public getModifiedTime(path: string): Date | undefined {
        return ts.sys.getModifiedTime(path);
    }

    public realpath(path: string): string {
        return ts.sys.realpath(path);
    }

    public createSHA256Hash(data: string): string {
        return ts.sys.createSHA256Hash(data);
    }

    //#region Not implemented methods

    public write(_data: string): void {
        throw new Error('Method "write" not implemented.');
        // ts.sys.write(data);
    }

    public writeOutputIsTTY(): boolean {
        throw new Error('Method "writeOutputIsTTY" not implemented.');
        // return ts.sys.writeOutputIsTTY();
    }

    public writeFile(_path: string, _data: string, _writeByteOrderMark?: boolean): void {
        throw new Error('Method "writeFile" not implemented.');
        // return ts.sys.writeFile(path, data, writeByteOrderMark);
    }

    public createDirectory(_path: string): void {
        throw new Error('Method "createDirectory" not implemented.');
        // return ts.sys.createDirectory(path);
    }

    public setModifiedTime(_path: string, _time: Date): void {
        throw new Error('Method "setModifiedTime" not implemented.');
        // return ts.sys.setModifiedTime(path, time);
    }

    public deleteFile(_path: string): void {
        throw new Error('Method "deleteFile" not implemented.');
        // return ts.sys.deleteFile(path);
    }

    public createHash(_data: string): string {
        throw new Error('Method "createHash" not implemented.');
        // return ts.sys.createHash(data);
    }

    public getMemoryUsage(): number {
        throw new Error('Method "getMemoryUsage" not implemented.');
        // return ts.sys.getMemoryUsage();
    }

    public exit(_exitCode?: number): void {
        throw new Error('Method "exit" not implemented.');
        // return ts.sys.exit(exitCode);
    }

    public setTimeout(_callback: (...argsv: any[]) => void, _ms: number, ..._args: any[]): any {
        throw new Error('Method "setTimeout" not implemented.');
        // return ts.sys.setTimeout(callback, ms, ...args);
    }

    public clearTimeout(_timeoutId: any): void {
        throw new Error('Method "clearTimeout" not implemented.');
        // return ts.sys.clearTimeout(timeoutId);
    }

    public clearScreen(): void {
        throw new Error('Method "clearScreen" not implemented.');
        // return ts.sys.clearScreen();
    }

    public base64decode(_input: string): string {
        throw new Error('Method "base64decode" not implemented.');
        // return ts.sys.base64decode(input);
    }

    public base64encode(_input: string): string {
        throw new Error('Method "base64encode" not implemented.');
        // return ts.sys.base64encode(input);
    }

    public setImmediate(_callback: (...argsv: any[]) => void, ..._args: any[]): any {
        throw new Error('Method "setImmediate" not implemented.');
        // return setImmediate(callback, ...args);
    }

    public clearImmediate(_timeoutId: any): void {
        throw new Error('Method "clearImmediate" not implemented.');
        // return clearImmediate(timeoutId);
    }

    //#endregion
}
