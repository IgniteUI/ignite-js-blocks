'use strict';

const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const del = require('del');
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const process = require('process');
const fs = require('fs');
const argv = require('yargs').argv;
const sassdoc = require('sassdoc');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const { series } = require('gulp');
const {spawnSync} = require('child_process');
const slash = require('slash');

const STYLES = {
    SRC: './projects/igniteui-angular/src/lib/core/styles/themes/presets/**/*',
    DIST: './dist/igniteui-angular/styles',
    MAPS: './maps',
    THEMING: {
        SRC: './projects/igniteui-angular/src/lib/core/styles/**/*',
        DIST: './dist/igniteui-angular/lib/core/styles'
    },
    CONFIG: {
        outputStyle: 'compressed'
    }
};

const DOCS_OUTPUT_PATH = slash(path.join(__dirname, 'dist', 'igniteui-angular', 'docs'));

const TYPEDOC_THEME = {
    SRC: slash(path.join(__dirname, 'node_modules', 'igniteui-typedoc-theme', 'src')),
    OUTPUT: slash(path.join(DOCS_OUTPUT_PATH, 'typescript'))
};

module.exports.buildStyle = () => {
    const prefixer = postcss([autoprefixer({
        cascade: false,
        grid: true
    })]);

    gulp.src(STYLES.THEMING.SRC)
        .pipe(gulp.dest(STYLES.THEMING.DIST));

    const myEventEmitter = new EventEmitter();

    return gulp.src(STYLES.SRC)
        .pipe(sourcemaps.init())
        .pipe(sass.sync(STYLES.CONFIG).on('error', err => {
            sass.logError.bind(myEventEmitter)(err);
            myEventEmitter.emit('end');
            process.exit(1);
        }))
        .pipe(prefixer)
        .pipe(sourcemaps.write(STYLES.MAPS))
        .pipe(gulp.dest(STYLES.DIST))
};

module.exports.copyGitHooks = async (cb) => {

    if (process.env.AZURE_PIPELINES || process.env.TRAVIS || process.env.CI || !fs.existsSync('.git')) {
        return;
    }

    const gitHooksDir = './.git/hooks/';
    const defaultCopyHookDir = gitHooksDir + 'scripts/';
    const dirs = [
        gitHooksDir,
        defaultCopyHookDir,
        defaultCopyHookDir + 'templates',
        defaultCopyHookDir + 'templateValidators',
        defaultCopyHookDir + 'utils'
    ];

    dirs.forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdir(dir, (err) => {
                if (err) {
                    throw err;
                }
            });
        }
    });

    const defaultHookDir = './.hooks/scripts/';

    fs.copyFileSync(defaultHookDir + 'templates/default.js',
        defaultCopyHookDir + 'templates/default.js');

    fs.copyFileSync(defaultHookDir + 'templateValidators/default-style-validator.js',
        defaultCopyHookDir + 'templateValidators/default-style-validator.js');

    fs.copyFileSync(defaultHookDir + 'utils/issue-validator.js',
        defaultCopyHookDir + 'utils/issue-validator.js');

    fs.copyFileSync(defaultHookDir + 'utils/line-limits.js',
        defaultCopyHookDir + 'utils/line-limits.js');

    fs.copyFileSync(defaultHookDir + 'common.js',
        defaultCopyHookDir + 'common.js');

    fs.copyFileSync(defaultHookDir + 'validate.js',
        defaultCopyHookDir + 'validate.js');

    fs.copyFileSync('./.hooks/prepare-commit-msg',
        './.git/hooks/prepare-commit-msg');

    return await cb();
};

module.exports.copyMigrations = (cb) => {
    gulp.src([
        './projects/igniteui-angular/migrations/**/*.json',
        '!**/tsconfig.json'
    ]).pipe(gulp.dest('./dist/igniteui-angular/migrations'));

    cb();
};

module.exports.copySchematics = (cb) => {
    gulp.src([
        './projects/igniteui-angular/schematics/**/*.json',
        '!**/tsconfig.json'
    ]).pipe(gulp.dest('./dist/igniteui-angular/schematics'));

    cb();
};

const typedocBuildTheme = (cb) => {
    spawnSync(`typedoc`, [TYPEDOC.PROJECT_PATH,
    "--tsconfig",
    path.join(__dirname,"tsconfig.json")], { stdio: 'inherit', shell: true });
    cb();
};
typedocBuildTheme.displayName = 'typedoc-build:theme';

const browserReload = (cb) => {
    browserSync.reload();

    cb();
};

const typedocServe = (cb) => {
    const config = {
        server: {
            baseDir: TYPEDOC_THEME.OUTPUT
        },
        port: 3000
    }

    browserSync.init(config);

    cb();
};

function typedocWatchFunc(cb) {
    gulp.watch([
        slash(path.join(TYPEDOC_THEME.SRC, 'assets', 'js', 'src', '/**/*.{ts,js}')),
        slash(path.join(TYPEDOC_THEME.SRC, 'assets', 'css', '/**/*.{scss,sass}')),
        slash(path.join(TYPEDOC_THEME.SRC, '/**/*.hbs')),
        slash(path.join(TYPEDOC_THEME.SRC, 'assets', 'images', '/**/*.{png,jpg,gif}')),
      ], series(typedocBuildTheme, browserReload));

      cb();
}


const TYPEDOC = {
    EXPORT_JSON_PATH: slash(path.join(DOCS_OUTPUT_PATH, 'typescript-exported')),
    PROJECT_PATH: slash(path.join(__dirname, 'projects', 'igniteui-angular', 'src', 'public_api.ts')),
    TEMPLATE_STRINGS_PATH: slash(path.join(__dirname, 'extras', 'template', 'strings', 'shell-strings.json'))
};

function typedocBuildExportFn(cb) {
    spawnSync('typedoc', [
        TYPEDOC.PROJECT_PATH,
        "--generate-json",
        TYPEDOC.EXPORT_JSON_PATH,
        "--tags",
        "--params",
        "--tsconfig",
        path.join(__dirname,"tsconfig.json")],
        { stdio: 'inherit', shell: true });
    cb();
}

function typedocImportJsonFn(cb) {
    spawnSync('typedoc', [
        TYPEDOC.PROJECT_PATH,
        "--generate-from-json",
        TYPEDOC.EXPORT_JSON_PATH,
        "--warns",
        "--tsconfig",
        path.join(__dirname,"tsconfig.json")],
        { stdio: 'inherit', shell: true});
    cb();
}

function createDocsOutputDirFn(cb) {
    !fs.existsSync(DOCS_OUTPUT_PATH) && fs.mkdirSync(DOCS_OUTPUT_PATH);
    cb();
}

function cleanTypedocOutputDirFn(cb) {
    del.sync(slash(path.join(DOCS_OUTPUT_PATH, 'typescript')));
    cb();
}

function typedocBuildDocsJA (cb) {
        spawnSync('typedoc',[
            TYPEDOC.PROJECT_PATH,
            '--generate-from-json',
            slash(path.join(__dirname, 'i18nRepo', 'typedoc', 'ja')),
            '--templateStrings',
            TYPEDOC.TEMPLATE_STRINGS_PATH,
            '--warns',
            '--localize',
            'jp',
            "--tsconfig",
            path.join(__dirname,"tsconfig.json")], { stdio: 'inherit', shell: true });

        cb();
}

function typedocBuildDocsEN (cb) {
        spawnSync('typedoc', [
            TYPEDOC.PROJECT_PATH,
            '--localize',
            'en',
            "--tsconfig",
            path.join(__dirname,"tsconfig.json")], { stdio: 'inherit', shell: true});

        cb();
}

const SASSDOC = {
    PROJECT_PATH: path.join(__dirname, 'projects', 'igniteui-angular', 'src', 'lib', 'core', 'styles'),
    DEST: path.join(DOCS_OUTPUT_PATH, 'sass'),
    OPTIONS: path.join(__dirname, '.sassdocrc'),
};

const sassdocCleanOutputDir = (cb) => {
    del.sync(SASSDOC.DEST);
    cb();
}

function sassdocBuildJson(cb) {
    const options = JSON.parse(fs.readFileSync(SASSDOC.OPTIONS, 'utf8'));

    const { convert, exportDir } = argv;

    options.convert = convert;
    options.exportDir = exportDir;

    gulp.src(`${SASSDOC.PROJECT_PATH}/**/*.scss`)
        .pipe(sassdoc(options));

    cb();

}

function sassdocImportJson(cb) {
    const options = JSON.parse(fs.readFileSync(SASSDOC.OPTIONS, 'utf8'));

    const {render, importDir} = argv;

    options.render = render;
    options.json_dir = importDir;
    options.shellStringsPath = path.join(__dirname, 'extras', 'template', 'strings', 'shell-strings.json');

    gulp.src(`${SASSDOC.PROJECT_PATH}/**/*.scss`)
        .pipe(sassdoc(options));

    cb();
}

function sassdocBuildJA (cb) {
    const pathTranslations = path.join(__dirname, 'i18nRepo', 'sassdoc', 'ja');
    const options = JSON.parse(fs.readFileSync(SASSDOC.OPTIONS, 'utf8'));

    options.lang = 'jp';
    options.render = argv.render;
    options.json_dir = pathTranslations;
    options.shellStringsPath = path.join(__dirname, 'extras', 'template', 'strings', 'shell-strings.json');

    gulp.src(`${SASSDOC.PROJECT_PATH}/**/*.scss`)
        .pipe(sassdoc(options));

    cb();
}

function sassdocBuildEN (cb) {
    const options = JSON.parse(fs.readFileSync(SASSDOC.OPTIONS, 'utf8'));

    options.lang = 'en';
    options.shellStringsPath = path.join(__dirname, 'extras', 'template', 'strings', 'shell-strings.json');

    gulp.src(`${SASSDOC.PROJECT_PATH}/**/*.scss`)
        .pipe(sassdoc(options));

    cb();
}

module.exports.createDocsOutputDir = createDocsOutputDirFn;

/**
 * Typedoc build tasks
 */
module.exports.exportTypedocJson = typedocBuildExportFn;
module.exports.cleanTypedocOutputDir = cleanTypedocOutputDirFn;
module.exports.typedocBuildTheme = typedocBuildTheme;
module.exports.importTypedocJson = typedocImportJsonFn;
module.exports.typedocServe = series(
    typedocBuildTheme,
    typedocWatchFunc,
    typedocServe
);
module.exports.typedocBuildDocsJA = series(
    this.createDocsOutputDir,
    this.cleanTypedocOutputDir,
    typedocBuildDocsJA
);
module.exports.typedocBuildDocsEN = series(
    this.createDocsOutputDir,
    this.cleanTypedocOutputDir,
    typedocBuildDocsEN
);

/**
 * Sassdoc build tasks
 */
module.exports.sassdocCleanOutputDir = sassdocCleanOutputDir;
module.exports.sassdocImportJson = sassdocImportJson;
module.exports.sassdocBuildJson = sassdocBuildJson;
module.exports.sassdocBuildJA = series(sassdocCleanOutputDir, sassdocBuildJA);
module.exports.sassdocBuildEN = series(sassdocCleanOutputDir, sassdocBuildEN);
