var gulp = require('gulp');
var paths = require('./paths');
var del = require('del');

var flag = {};

// Remove all files from public folder,
// but only remove once
////////////////////////////////////////////////
gulp.task('clean:js', function (cb) {
    flag['js'] ? cb() : flag['js'] = !del(paths.publicDirJS, cb);
});

gulp.task('clean:css', function (cb) {
    flag['css'] ? cb() : flag['css'] = !del(paths.publicDirCSS, cb);
});

gulp.task('clean:html', function (cb) {
    if (flag['html']) {
        cb();
    } else {
        var removeHTML = [
            paths.publicDirHTML,
            paths.publicDir + 'index.html',
            paths.publicDir + 'index-http.html'
        ];
        flag['html'] = !del(removeHTML, cb);
    }
});

gulp.task('clean:images', function (cb) {
    flag['images'] ? cb() : flag['images'] = !del(paths.publicDirImages, cb);
});

gulp.task('clean:fonts', function (cb) {
    del(paths.publicDirFonts, cb);
});

gulp.task('clean:help', function (cb) {
    del(paths.publicHelpDir, cb);
});

gulp.task('clean:data', function (cb) {
    del(paths.publicDirData, cb);
});

gulp.task('clean', [
    'clean:js',
    'clean:css',
    'clean:html',
    'clean:images',
    'clean:fonts',
    'clean:help'
]);

// Remove all files from dist folder
////////////////////////////////////////////////
gulp.task('dist:clean:js', function (cb) {
    del(paths.distDirJS, cb);
});

gulp.task('dist:clean:css', function (cb) {
    del(paths.distDirCSS, cb);
});

gulp.task('dist:clean:html', function (cb) {
    var removeHTML = [
        paths.distDirHTML,
        paths.distDir + 'index.html',
        paths.publicDir + 'index-http.html'
    ];
    del(removeHTML, cb);
});

gulp.task('dist:clean:images', function (cb) {
    del(paths.distDirImages, cb);
});

gulp.task('dist:clean:fonts', function (cb) {
    del(paths.distDirFonts, cb);
});

gulp.task('clean:build', [
    'dist:clean:js',
    'dist:clean:css',
    'dist:clean:html',
    'dist:clean:images',
    'dist:clean:fonts'
]);
