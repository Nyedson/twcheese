const path = require('path');
const ROOT = path.resolve(__dirname, '../../');

const gulp = require('gulp');
const { src, dest, series } = gulp;
const beautify = require('gulp-jsbeautifier');
const header = require('gulp-header');
const fs = require('fs');
const webpack = require('webpack');
const interpolate = require(`${ROOT}/build/lib/gulp-interpolate.js`);
const replaceContent = require(`${ROOT}/build/lib/gulp-replace-content.js`);
const { prependToEachLine } = require(`${ROOT}/build/lib/string.js`);

const config = require(`${ROOT}/build/tasks.config.js`);
let stagingDir = `${ROOT}/temp/webpack/`;

function compileToolSetup(done) {
    fs.readdir(`${ROOT}/src/ToolSetup`, function(err, items) {
        let webpackConfigs = [];
        for (item of items) {
            webpackConfigs.push({
                entry: path.resolve(`${ROOT}/src/ToolSetup`, item),
                output: {
                    path: stagingDir,
                    filename: item
                },
                resolve: {
                    alias: {
                        '/twcheese': ROOT
                    }
                },
                optimization: {
                    minimize: false
                },
                mode: 'production'
            });
        }
        webpack(webpackConfigs, (err, stats) => done());
    });
}

let compiledToolSetup = function(file) {
    return fs.readFileSync(stagingDir + file.relative, 'utf8');
}


let templateDist= fs.readFileSync(`${ROOT}/build/templates/dist.js`, 'utf8');

function applyDistTemplate() {
    return src(`${ROOT}/src/ToolSetup/*.js`)
        .pipe(replaceContent(templateDist))
        .pipe(header(config.templates.header))
        .pipe(interpolate(config.interpolate))
        .pipe(beautify())
        .pipe(interpolate([
            ['___COMPILED_TOOL_SETUP___', (file) => prependToEachLine(' '.repeat(8), compiledToolSetup(file))]
        ]))
        .pipe(dest(`${ROOT}/dist/`));
}

gulp.task('buildDist', series(compileToolSetup, applyDistTemplate));
