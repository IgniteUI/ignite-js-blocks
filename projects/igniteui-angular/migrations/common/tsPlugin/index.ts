import { TSLanguageService } from './TSLanguageService';

const init = (modules: { typescript: typeof import('typescript/lib/tsserverlibrary') }) => {
    const _ts = modules.typescript;
    let tsLanguageService = null;

    /**
     * Returns a cached version of the TSLS.
     * Useful if other global or local plugins modify it.
     */
    const getTypeScriptLanguageService = (): ts.LanguageService => tsLanguageService;

    const create = (info: ts.server.PluginCreateInfo): TSLanguageService => {
        tsLanguageService = info.languageService;
        return {
            ...info.languageService,
            getTypeScriptLanguageService
        };
    };

    return { create };
};

export = init;
