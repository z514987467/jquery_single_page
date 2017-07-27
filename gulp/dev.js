var gulp = require('gulp');
var paths = require('./paths');
var $ = require('gulp-load-plugins')();
var merge = require('merge-stream');

// Run server after project compiled
gulp.task('server', ['compile'], function () {
    require('colors');
    require('../server').listen(process.env.PORT || 1337);
    $.util.log('http server '.blue + 'started '.green.bold + 'on port '.blue + String(process.env.PORT || 1337).yellow);
});

gulp.task('sprites-png', function () {
    var spriteData = gulp.src('images/icons/**/*.png', {
        cwd: 'assets'
    })
        .pipe($.spritesmith({
            imgName: 'sprite.png',
            imgPath: '../images/_sprite/sprite.png',
            padding: 10,
            cssName: 'sprite.less',
            cssFormat: 'less',
            cssTemplate: 'gulp/cssTemplate',
            cssVarMap: function (sprite) {
                sprite.name = 'icon-' + sprite.source_image.match(/assets\/images\/icons\/(.+)\.png/)[1].replace(/\//g, '-');
            }
        }));
    var imgStream = spriteData.img
        .pipe(gulp.dest('./assets/images/_sprite'));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
        .pipe(gulp.dest('./assets/styles/_sprite'));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream);
});

// SVG sprites
gulp.task('sprites', function () {
    var config = {
        shape: {
            dimension: {
                maxWidth: 35, // this is where you set the icon size. New style requires 24x24
                maxHeight: 35,
                attributes: false
            },
            spacing: { // Add padding
                padding: 0
            }
        },
        mode: {
            css: {
                dest: './styles/',
                bust: false,
                render: {
                    less: {
                        dest: './_generated/sprite.less'
                    },
                },
                sprite: '../images/_generated/sprite.svg',
            }
        }
    };
    return gulp.src(paths.svg, {
        cwd: 'assets'
    })
        .pipe($.svgSprite(config))
        .pipe(gulp.dest(paths.svgDest));
});

gulp.task('default', ['server'], watch);
gulp.task('watch', ['compile'], watch);
gulp.task('watchMock', ['compileMock'], watchMock);
gulp.task('test', ['jshint', 'jshintMock']);
gulp.task('sloc', function(){
    gulp.src(paths.appPaths)
        .pipe($.sloc());
});
// Watch added, changed, or deleted files
function watch() {
    $.livereload.listen();

    var watcher = gulp.watch([
        paths.publicDirJS,
        paths.publicDirCSS,
        paths.publicDirHTML
    ].map(function (str) {
        return str + '/**';
    }));

    watcher.on('change', $.livereload.changed);

    gulp.watch(paths.js, function (event) {
        var msg = [
            $.util.colors.magenta(event.path),
            'was',
            $.util.colors.cyan(event.type)
        ];
        $.util.log(msg.join(' '));

        // If js files are modified, copy them to public dir
        gulp.src([paths.js, '!assets/js/common/{models-mock,models-mock/**}', '!assets/js/{mock,mock/**}'])
            .pipe($.changed(paths.publicDirJS, {
                hasChanged: $.changed.compareSha1Digest
            }))
            .pipe($.jshint('.jshintrc'))
            .pipe($.jshint.reporter('jshint-stylish'))
            .pipe(gulp.dest(paths.publicDirJS));

        // Only adding or deleting files trigger linker
        if (event.type != 'changed') {
            gulp.src(paths.index)
                .pipe($.linker({
                    scripts: paths.jsPaths,
                    startTag: '<!--SCRIPTS-->',
                    endTag: '<!--SCRIPTS END-->',
                    fileTmpl: '<script src="%s"></script>',
                    appRoot: './assets'
                }))
                .pipe(gulp.dest(paths.publicDir));
        }
    });

    gulp.watch(paths.lesses, ['less']);
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.images, ['images']);
    gulp.watch(paths.sw, ['sw']);
}

// Watch added, changed, or deleted files
function watchMock() {
    $.livereload.listen();

    var watcher = gulp.watch([
        paths.publicDirJS,
        paths.publicDirCSS,
        paths.publicDirHTML
    ].map(function (str) {
        return str + '/**';
    }));

    watcher.on('change', $.livereload.changed);

    gulp.watch(paths.js, function (event) {
        var msg = [
            $.util.colors.magenta(event.path),
            'was',
            $.util.colors.cyan(event.type)
        ];
        $.util.log(msg.join(' '));

        // If js files are modified, copy them to public dir
        gulp.src([paths.js, '!assets/js/common/{models,models/**}'])
            .pipe($.changed(paths.publicDirJS, {
                hasChanged: $.changed.compareSha1Digest
            }))
            .pipe(gulp.dest(paths.publicDirJS));

        // Only adding or deleting files trigger linker
        if (event.type != 'changed') {
            gulp.src(paths.index)
                .pipe($.linker({
                    scripts: paths.jsPaths,
                    startTag: '<!--SCRIPTS-->',
                    endTag: '<!--SCRIPTS END-->',
                    fileTmpl: '<script src="%s"></script>',
                    appRoot: './assets'
                }))
                .pipe(gulp.dest(paths.publicDir));
        }
    });

    gulp.watch(paths.lesses, ['less']);
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.images, ['images']);
}
