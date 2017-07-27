var gulp = require('gulp');
var paths = require('./paths');
var $ = require('gulp-load-plugins')();

function errrHandler(e) {
    $.util.beep();
    $.util.log(e);
}

// Copy JavaScript files to public dir
gulp.task('js', ['clean:js'], function () {
    return gulp.src(paths.js)
        .pipe($.changed(paths.publicDirJS, {
            hasChanged: $.changed.compareSha1Digest
        }))
        .pipe(gulp.dest(paths.publicDirJS));
});
// Copy css files to public dir
gulp.task('css', ['clean:css'], function () {
    return gulp.src(paths.css)
        .pipe($.changed(paths.publicDirCSS, {
            hasChanged: $.changed.compareSha1Digest
        }))
        .pipe(gulp.dest(paths.publicDirCSS));
});
// Copy JavaScript files to public dir - MOCKUP
gulp.task('jsMock', ['clean:js'], function () {
    return gulp.src([paths.js, '!assets/js/common/{models,models/**}'])
        .pipe($.changed(paths.publicDirJS, {
            hasChanged: $.changed.compareSha1Digest
        }))
        .pipe(gulp.dest(paths.publicDirJS));
});


// Lint Task
gulp.task('jshint', function () {
    return gulp.src([
        paths.js,
        '!assets/js/dependencies/**/*',
        '!assets/js/common/{models-mock,models-mock/**}',
        '!assets/js/{mock,mock/**}'
    ])
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});
// Lint Release Task
gulp.task('jshintMock', function () {
    return gulp.src([
        paths.js,
        '!assets/js/dependencies/**/*',
        '!assets/js/{models,models/**}',
        '!assets/js/{mock,mock/**}'
    ])
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});


// Compile CSS from Less files
gulp.task('less', ['clean:css'], function () {
    return gulp.src(paths.less)
        .pipe($.plumber({
            errorHandler: errrHandler
        }))
        .pipe($.sourcemaps.init())
        .pipe($.less())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(paths.publicDirCSS));
});

// Copy HTML to public dir
gulp.task('html', ['clean:html'], function () {
    return gulp.src(paths.html)
        .pipe($.changed(paths.publicDirHTML, {
            hasChanged: $.changed.compareSha1Digest
        }))
        .pipe(gulp.dest(paths.publicDirHTML));
});

gulp.task('sw', ['html'], function () {
    return gulp.src(paths.sw)
        .pipe(gulp.dest(paths.publicDir));
});

// Copy images to public dir
gulp.task('images', ['clean:images'], function () {
    return gulp.src(paths.images)
        .pipe($.changed(paths.publicDirImages, {
            hasChanged: $.changed.compareSha1Digest
        }))
        .pipe(gulp.dest(paths.publicDirImages));
});

// Copy fonts to public dir
gulp.task('fonts', ['clean:fonts'], function () {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest(paths.publicDirFonts));
});

// Link scripts and style sheets to index.html
gulp.task('linker', ['js', 'css'], function () {
    return gulp.src([paths.index,paths.login])
        .pipe($.linker({
            scripts: paths.publicJSLinker,
            startTag: '<!--SCRIPTS-->',
            endTag: '<!--SCRIPTS END-->',
            fileTmpl: '<script src="%s"></script>',
            appRoot: paths.publicDir
        }))
        .pipe($.linker({
            scripts: paths.publicCSSLinker,
            startTag: '<!--STYLES-->',
            endTag: '<!--STYLES END-->',
            fileTmpl: '<link rel="stylesheet" href="%s">',
            appRoot: paths.publicDir
        }))
        .pipe(gulp.dest(paths.publicDir));
});
// Link scripts and style sheets to index.html - MOCKUP
gulp.task('linkerMock', ['jsMock', 'less'], function () {
    return gulp.src(paths.index)
        .pipe($.linker({
            scripts: paths.publicJSLinker,
            startTag: '<!--SCRIPTS-->',
            endTag: '<!--SCRIPTS END-->',
            fileTmpl: '<script src="%s"></script>',
            appRoot: paths.publicDir
        }))
        .pipe($.linker({
            scripts: paths.publicCSSLinker,
            startTag: '<!--STYLES-->',
            endTag: '<!--STYLES END-->',
            fileTmpl: '<link rel="stylesheet" href="%s">',
            appRoot: paths.publicDir
        }))
        .pipe(gulp.dest(paths.publicDir));
});


gulp.task('copy', ['clean'], function () {
    return gulp.src(paths.help, {
        base: 'help'
    }).pipe(gulp.dest(paths.publicHelpDir));
});

gulp.task('data', ['clean:data'], function () {
    return gulp.src(paths.data)
        .pipe($.changed(paths.publicDirData, {
            hasChanged: $.changed.compareSha1Digest
        }))
        .pipe(gulp.dest(paths.publicDirData));
});

gulp.task('compileMock', ['html', 'linkerMock', 'images', 'fonts', 'copy']);

// Compile all files
gulp.task('compile', ['html', 'linker', 'images', 'fonts', 'data']);
