const gulp = require('gulp');
const { src, dest } = gulp;
const fs = require('fs');
const crypto = require('crypto');
const minify = require('gulp-minify');
const interpolate = require('../lib/gulp-interpolate.js');
const replaceContent = require('../lib/gulp-replace-content.js');


const config = require('../tasks.config.js');
let templateDistLaunch = fs.readFileSync('build/templates/launch-dist.js', 'utf8');

let fileHash = function(file) {
    let contents = fs.readFileSync(file.path, 'utf8');
    return crypto.createHash('md5').update(contents).digest('hex');
}

gulp.task('buildDistLaunchers', function() {
    return src(['dist/*.js', '!**/*.min.js'])
        .pipe(replaceContent(templateDistLaunch))
        .pipe(interpolate([
            ['___DIST_URL___', (file) => `${config.hostingRoot}/dist/${file.stem}.min.js`],
            ['___DIST_HASH___', fileHash],
        ]))
        .pipe(minify({
            noSource: true,
            ext: {
                min: '.js'
            }
        }))
        .pipe(dest('launch/'));
});