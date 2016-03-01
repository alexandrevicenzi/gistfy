var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    minifyJs = require('gulp-uglify'),
    minifyCss = require('gulp-cssnano');

gulp.task('minify-js', function () {
  return gulp.src(['static/assets/js/app.js', 'static/assets/js/tab.js'])
    .pipe(minifyJs())
    .pipe(rename({
        extname: '.min.js'
    }))
    .pipe(gulp.dest('static/assets/js'));
});

gulp.task('minify-css', function () {
  return gulp.src(['static/assets/styles/*.css', '!static/assets/styles/*.min.css'])
    .pipe(minifyCss())
    .pipe(rename({
        extname: '.min.css'
    }))
    .pipe(gulp.dest('static/assets/styles'));
});

gulp.task('lint', function () {
    return gulp.src('src/*.js')
        .pipe(jshint({
            curly: true,
            eqeqeq: true,
            latedef: true,
            undef: true,
            unused: true,
            eqnull: true,
            node: true
        }))
        .pipe(jshint.reporter("default"));
});

gulp.task('minify', ['minify-css', 'minify-js']);
gulp.task('default', ['lint', 'minify']);
