/*
Copyright 2017 Alexis Ryan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');
const less = require('gulp-less');
const preprocess = require('gulp-preprocess');
const merge = require('merge-stream');
const url = require('url');
const shell = require('gulp-shell')
const gap = require('gulp-append-prepend');
const rename = require("gulp-rename");

const tsOptions = require('./tsconfig.json').compilerOptions;

const tsOptions_ES5 = Object.assign({}, tsOptions, {
    target: "ES5"
});

const tsOptions_ES6 = Object.assign({}, tsOptions, {
    target: "ES6"
});

const browser_scripts = [
    'src/*.ts',
    'src/browser/*.ts'
];
const uwp_scripts = [
    'src/*.ts',
    'src/reader/*.ts',
    'src/reader/uwp/*.ts'
];
const droid_scripts = [
    'src/*.ts',
    'src/reader/*.ts',
    'src/reader/compat/*.ts',
    'src/reader/droid/*.ts'
];
const ios_scripts = [
    'src/*.ts',
    'src/reader/*.ts',
    'src/reader/compat/*.ts',
    'src/reader/messaging/*.ts',
    'src/reader/ios/*.ts'
];
const win81_scripts = [
    'src/*.ts',
    'src/reader/*.ts',
    'src/reader/compat/*.ts',
    'src/reader/messaging/*.ts',
    'src/reader/win81/*.ts'
];

function scripts() {
    return gulp.src(browser_scripts)
        .pipe(sourcemaps.init())
        .pipe(ts(tsOptions_ES6))
        .pipe(sourcemaps.write('src-maps'))
        .pipe(gulp.dest('build/browser/chrome'))
        .pipe(gulp.dest('build/browser/edge'));
}
gulp.task('scripts', scripts);

function copyJQuery(dest)
{
    return gulp.src("node_modules/jquery/dist/jquery.slim.min.js")
        .pipe(rename({ basename: "jquery" }))
        .pipe(gap.appendText("//# sourceMappingURL=http://10.0.0.51:8080/node_modules/jquery/dist/jquery.slim.min.map"))
        .pipe(gulp.dest('build/' + dest));
}

var reader = {
    "reader.scripts.uwp": () => {
        return gulp.src(uwp_scripts)
            .pipe(sourcemaps.init())
            .pipe(ts(tsOptions_ES6))
            .pipe(sourcemaps.write('src-maps', { sourceMappingURL: (file) => { return url.parse('http://10.0.0.51:8080/build/reader/uwp/src-maps/' + file.basename + ".map").href; } }))
            .pipe(gulp.dest('build/reader/uwp'));
    },
    "reader.scripts.droid": () => {
        return gulp.src(droid_scripts)
            .pipe(sourcemaps.init())
            .pipe(ts(tsOptions_ES5))
            .pipe(sourcemaps.write('src-maps', { sourceMappingURL: (file) => { return url.parse('http://10.0.0.51:8080/build/reader/droid/src-maps/' + file.basename + ".map").href; } }))
            .pipe(gulp.dest('build/reader/droid'));
    },
    "reader.scripts.ios": () => {
        return gulp.src(ios_scripts)
            .pipe(sourcemaps.init())
            .pipe(ts(tsOptions_ES5))
            .pipe(sourcemaps.write('src-maps', { sourceMappingURL: (file) => { return url.parse('http://10.0.0.51:8080/build/reader/ios/src-maps/' + file.basename + ".map").href; } }))
            .pipe(gulp.dest('build/reader/ios'));
    },
    "reader.scripts.win81": () => {
        return gulp.src(win81_scripts)
            .pipe(sourcemaps.init())
            .pipe(ts(tsOptions_ES5))
            .pipe(sourcemaps.write('src-maps', { sourceMappingURL: (file) => { return url.parse('http://10.0.0.51:8080/build/reader/win81/src-maps/' + file.basename + ".map").href; } }))
            .pipe(gulp.dest('build/reader/win81'));
    },

    "reader.styles.uwp": () => {
        return gulp.src('src/*.less')
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(sourcemaps.write('src-maps', {sourceMappingURL: (file) => { return url.parse('http://10.0.0.51:8080/build/reader/uwp/src-maps/' + file.basename + ".map").href; }}))
            .pipe(gulp.dest('build/reader/uwp'));
    },
    "reader.styles.droid": () => {
        return gulp.src('src/*.less')
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(sourcemaps.write('src-maps', { sourceMappingURL: (file) => { return url.parse('http://10.0.0.51:8080/build/reader/droid/src-maps/' + file.basename + ".map").href; } }))
            .pipe(gulp.dest('build/reader/droid'));
    },
    "reader.styles.ios": () => {
        return gulp.src('src/*.less')
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(sourcemaps.write('src-maps', { sourceMappingURL: (file) => { return url.parse('http://10.0.0.51:8080/build/reader/ios/src-maps/' + file.basename + ".map").href; } }))
            .pipe(gulp.dest('build/reader/ios'));
    },
    "reader.styles.win81": () => {
        return gulp.src('src/*.less')
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(sourcemaps.write('src-maps', { sourceMappingURL: (file) => { return url.parse('http://10.0.0.51:8080/build/reader/win81/src-maps/' + file.basename + ".map").href; } }))
            .pipe(gulp.dest('build/reader/win81'));
    },
    "reader.jquery.uwp": () =>  {
        return copyJQuery('reader/uwp');
    },
    "reader.jquery.droid": () =>  {
        return copyJQuery('reader/droid');
    },
    "reader.jquery.ios": () =>  {
        return copyJQuery('reader/ios');
    },
    "reader.jquery.win81": () =>  {
        return copyJQuery('reader/win81');
    }
};

exports["reader.scripts"] = reader.scripts = gulp.series(reader["reader.scripts.uwp"], reader["reader.scripts.droid"], reader["reader.scripts.ios"], reader["reader.scripts.win81"]);
exports["reader.scripts.uwp"] = reader.scripts.uwp = reader["reader.scripts.uwp"];
exports["reader.scripts.droid"] = reader.scripts.droid = reader["reader.scripts.droid"]
exports["reader.scripts.ios"] = reader.scripts.ios = reader["reader.scripts.ios"]
exports["reader.scripts.win81"] = reader.scripts.win81 = reader["reader.scripts.win81"]

exports["reader.styles"] = reader.styles = gulp.series(reader["reader.styles.uwp"], reader["reader.styles.droid"], reader["reader.styles.ios"], reader["reader.styles.win81"]);
exports["reader.styles.uwp"] = reader.styles.uwp = reader["reader.styles.uwp"];
exports["reader.styles.droid"] = reader.styles.droid = reader["reader.styles.droid"];
exports["reader.styles.ios"] = reader.styles.ios = reader["reader.styles.ios"];
exports["reader.styles.win81"] = reader.styles.win81 = reader["reader.styles.win81"];

exports["reader.jquery"] = reader.jquery = gulp.series(reader["reader.jquery.uwp"], reader["reader.jquery.droid"], reader["reader.jquery.ios"], reader["reader.jquery.win81"]);
exports["reader.jquery.uwp"] = reader.jquery.uwp = reader["reader.jquery.uwp"];
exports["reader.jquery.droid"] = reader.jquery.droid = reader["reader.jquery.droid"];
exports["reader.jquery.ios"] = reader.jquery.ios = reader["reader.jquery.ios"];
exports["reader.jquery.win81"] = reader.jquery.win81 = reader["reader.jquery.win81"];

exports["reader.uwp"] = reader.uwp = gulp.series(reader.scripts.uwp, reader.styles.uwp, reader.jquery.uwp);
exports["reader.uwp.scripts"] = reader.uwp.scripts = reader.scripts.uwp;
exports["reader.uwp.styles"] = reader.uwp.styles = reader.styles.uwp;
exports["reader.uwp.jquery"] = reader.uwp.jquery = reader.jquery.uwp;

exports["reader.droid"] = reader.droid = gulp.series(reader.scripts.droid, reader.styles.droid, reader.jquery.droid);
exports["reader.droid.scripts"] = reader.droid.scripts = reader.scripts.droid;
exports["reader.droid.styles"] = reader.droid.styles = reader.styles.droid;
exports["reader.droid.jquery"] = reader.droid.jquery = reader.jquery.droid;

exports["reader.ios"] = reader.ios = gulp.series(reader.scripts.ios, reader.styles.ios, reader.jquery.ios);
exports["reader.ios.scripts"] = reader.ios.scripts = reader.scripts.ios;
exports["reader.ios.styles"] = reader.ios.styles = reader.styles.ios;
exports["reader.ios.jquery"] = reader.ios.jquery = reader.jquery.ios;

exports["reader.win81"] = reader.win81 = gulp.series(reader.scripts.win81, reader.styles.win81, reader.jquery.win81);
exports["reader.win81.scripts"] = reader.win81.scripts = reader.scripts.win81;
exports["reader.win81.styles"] = reader.win81.styles = reader.styles.win81;
exports["reader.win81.jquery"] = reader.win81.jquery = reader.jquery.win81;

exports["reader"] = reader = Object.assign(gulp.series(reader.scripts, reader.styles, reader.jquery), reader);

function styles() {
    return gulp.src('src/*.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write('src-maps'))
        .pipe(gulp.dest('build/browser/edge'))
        .pipe(gulp.dest('build/browser/chrome'));
}
gulp.task('styles', styles);

function images() {
    return gulp.src('src/browser/images/*.png')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest('build/browser/edge/images'))
        .pipe(gulp.dest('build/browser/chrome/images'));
}
gulp.task('images', images);

function pages() {
    var edge = gulp.src('src/browser/*.html')
        .pipe(preprocess({ context: { BROWSER: 'Edge' } }))
        .pipe(gulp.dest('build/browser/edge'));

    var chrome = gulp.src('src/browser/*.html')
        .pipe(preprocess({ context: { BROWSER: 'Chrome' } }))
        .pipe(gulp.dest('build/browser/chrome'));

    return merge(edge, chrome);
}
gulp.task('pages', pages);

function extras() {
    var edge = gulp.src('src/browser/edge/**/*')
        .pipe(gulp.dest('build/browser/edge'));

    var chrome = gulp.src('src/browser/chrome/**/*')
        .pipe(gulp.dest('build/browser/chrome'));

    return merge(edge, chrome);
}
gulp.task('extras', extras);

function libs() {
    return gulp.src(['lib/**/*', 'node_modules/jquery/dist/jquery*'])
        .pipe(gulp.dest('build/browser/edge/lib'))
        .pipe(gulp.dest('build/browser/chrome/lib'));
}
gulp.task('libs', libs);

function json() {
    var edge = gulp.src('src/browser/*.json')
        .pipe(preprocess({ context: { BROWSER: 'Edge' }, extension: 'js' }))
        .pipe(gulp.dest('build/browser/edge'));

    var chrome = gulp.src('src/browser/*.json')
        .pipe(preprocess({ context: { BROWSER: 'Chrome' }, extension: 'js' }))
        .pipe(gulp.dest('build/browser/chrome'));

    return merge(edge, chrome);
}
gulp.task('json', json);

var build = gulp.series(scripts, styles, images, pages, json, extras, libs, reader);
gulp.task('default', build);

gulp.task('watch', gulp.series(build, function () {
    gulp.watch('src/**/*.ts', [scripts, reader.scripts]);
    gulp.watch('src/**/*.less', styles);
    gulp.watch('src/browser/images/*.png', images);
    gulp.watch('src/**/*.html', pages);
    gulp.watch('src/**/*.json', json);
    gulp.watch('src/extras/**/*', extras);
    gulp.watch('lib/**/*', libs);
}));

gulp.task('sourcemapserver', shell.task(['http-server .']));
