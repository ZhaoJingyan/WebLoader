var gulp = require('gulp');
var typescript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var typescriptProject = typescript.createProject('tsconfig.json');
var browserSync = require('browser-sync').create();

gulp.task('compile', function () {
    let tsResult = typescriptProject.src()
        .pipe(sourcemaps.init())
        .pipe(typescriptProject());
    return tsResult.js
        .pipe(sourcemaps.write("./", {
            includeContent: false,
            sourceRoot: "../"
        }))
        .pipe(gulp.dest("./"));
});


gulp.task('server', ['compile'], function () {

    browserSync.init({
        server: './',
        port: 8080,
        open: 'tunnel',
        browser: "chrome"
    });

    gulp.watch("src/ts/*", ['compile']);
    gulp.watch("dist/load.js").on('change', browserSync.reload);

});