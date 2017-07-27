var gulp = require('gulp');
var paths = require('./paths');
var $ = require('gulp-load-plugins')();
var del = require('del');

var pkg = require('../package.json');
var banner = ['/**',
    ' * <%= pkg.name %>',
    ' * @version v<%= pkg.version %>',
    ' * Copyright 2013-' + new Date().getFullYear() + ' <%= pkg.author %>',
    ' */',
    ''
].join('\n');

function errrHandler(e) {
    $.util.beep();
    $.util.log(e);
}

gulp.task('tmp:clean', function (cb) {
    del(paths.tmpDir, cb);
});

gulp.task('tmp:3rdjs', ['tmp:clean'], function () {
    return gulp.src(paths.thirdPartyPaths, {base: paths.srcDir})
        .pipe($.order(paths.thirdPartyPaths, {base: './'}))
        .pipe($.plumber({
            errorHandler: errrHandler
        }))
        .pipe($.concat('3rd.js'))
        // .pipe($.rev())
        .pipe(gulp.dest(paths.tmpDirJS));
});

// Copy and minify JavaScript files to dist dir
gulp.task('tmp:js', ['tmp:clean'], function () {
    return gulp.src(paths.appPaths, {base: paths.srcDir})
        .pipe($.order(paths.appPaths, {base: './'}))
        .pipe($.plumber({
            errorHandler: errrHandler
        }))
        .pipe($.concat('app.js'))
        .pipe($.stripDebug())
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe($.header(banner, {
            pkg: pkg
        }))
        // .pipe($.rev())
        .pipe(gulp.dest(paths.tmpDirJS));
});

// Compile and minify CSS from Less files
gulp.task('tmp:css', ['tmp:clean'], function () {
    return gulp.src(paths.less)
        .pipe($.plumber({
            errorHandler: errrHandler
        }))
        .pipe($.less())
        .pipe($.csso())
        .pipe($.header(banner, {
            pkg: pkg
        }))
        // .pipe($.rev())
        .pipe(gulp.dest(paths.tmpDirCSS));
});

// Copy and minify HTML to dist dir
gulp.task('tmp:html', ['tmp:clean'], function () {
    return gulp.src(paths.html, {base: paths.srcDir})
        //.pipe($.minifyHtml())
        .pipe(gulp.dest(paths.tmpDir));
});

// Copy images to dist dir
gulp.task('tmp:images', ['tmp:clean'], function () {
    return gulp.src(paths.images, {base: paths.srcDir})
        .pipe(gulp.dest(paths.tmpDir));
});

// Copy fonts to dist dir
gulp.task('tmp:fonts', ['tmp:clean'], function () {
    return gulp.src(paths.fonts, {base: paths.srcDir})
        .pipe(gulp.dest(paths.tmpDir));
});

gulp.task('tmp', ['tmp:3rdjs', 'tmp:js', 'tmp:css', 'tmp:html', 'tmp:images', 'tmp:fonts']);

gulp.task('dist:clean', function (cb) {
    del(paths.distDir, cb);
});

gulp.task('dist:rev', ['tmp', 'dist:clean'], function () {
// gulp.task('dist:rev', ['dist:clean'], function () {
    return gulp.src(paths.tmpDir + '**')
        .pipe($.revAll.revision({ dontSearchFile: ['3rd.js'] }))
        .pipe(gulp.dest(paths.distDir))
        // .pipe($.revAll.versionFile())
        // .pipe(gulp.dest(paths.distDir));
});

// Link scripts and style sheets to index.html
gulp.task('dist:linker', ['dist:rev'], function () {
    return gulp.src(paths.index)
        .pipe($.linker({
            scripts: paths.distJSLinker,
            startTag: '<!--SCRIPTS-->',
            endTag: '<!--SCRIPTS END-->',
            fileTmpl: '<script src="%s"></script>',
            appRoot: paths.distDir
        }))
        .pipe($.linker({
            scripts: paths.distCSSLinker,
            startTag: '<!--STYLES-->',
            endTag: '<!--STYLES END-->',
            fileTmpl: '<link rel="stylesheet" href="%s">',
            appRoot: paths.distDir
        }))
        .pipe($.minifyHtml())
        .pipe(gulp.dest(paths.distDir));
});

gulp.task('dist:copy', ['dist:linker'], function () {
    return gulp.src([paths.json, paths.images], {base: paths.srcDir})
	.pipe(gulp.dest(paths.distDir));
});

gulp.task('dist', ['dist:rev', 'dist:linker', 'dist:copy', 'dist:clean']);

gulp.task('build', ['tmp', 'dist']);
