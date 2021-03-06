var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    header  = require('gulp-header'),
    rename = require('gulp-rename'),
    minifyCSS = require('gulp-minify-css'),
    package = require('./package.json'),
    concat = require('gulp-concat');

var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');

gulp.task('css', function () {
    return gulp.src('src/scss/*.scss')
    .pipe(sass({errLogToConsole: true}))
    .pipe(autoprefixer('last 4 version'))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(minifyCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('app/assets/css'));
    // .pipe(browserSync.reload({stream:true}));
});

gulp.task('lint', function () {
  return gulp.src([
    'src/js/**/*.js',
    '!src/js/vendor/**/*.js'
  ]).pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default'));
});

gulp.task('js', ['lint'], function(){
  var files = [
    'src/js/vendor/jquery.min.js',
    'src/js/vendor/underscore.js',
    'src/js/vendor/backbone.js',
    'src/js/views/add-book.js',
    'src/js/views/about.js',
    'src/js/scripts.js'
  ];
  gulp.src(files)
    // .pipe(header(banner, { package : package }))
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('app/assets/js'))
    .pipe(uglify())
    // .pipe(header(banner, { package : package }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('app/assets/js'));
    // .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: "app"
        }
    });
});
gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('default', ['css', 'js', 'browser-sync'], function () {
    gulp.watch("src/scss/*/*.scss", ['css']);
    gulp.watch("src/js/**/*.js", ['js']);
    gulp.watch("app/*.html", ['bs-reload']);
});
