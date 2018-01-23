'use strict';

const del = require('del');
const gulp = require('gulp');
const rename = require('gulp-rename');
const run = require('run-sequence');
const path = require('path');
const fs = require('fs');
const data = require('gulp-data');
const handlebars = require('gulp-compile-handlebars');
const htmlBeautify = require('gulp-html-beautify');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
// if using webpack modules
const webpack = require('webpack-stream');

gulp.task('clean', function() {
    del(['./dist/*']);
});

gulp.task('html', function() {

    // set up some inital template data
    // will be extended with .json data
    let date = new Date();
    let templateData = {
        lastUpdated: date.toDateString()
    };

    let options = {
        ignorePartials: true,
        batch: ['./src/templates/partials']
    };

    gulp.src('src/templates/*.hbs')
        .pipe(data(function(file) {
            // get data from json
            return JSON.parse(fs.readFileSync('./src/data/tr-data.json'));
        }))
        .pipe(handlebars(templateData, options))
        .pipe(rename(function(path) {
            path.extname = '.html';
        }))
        .pipe(htmlBeautify({
            indentSize: 2
        }))
        .pipe(gulp.dest('./dist'));
});

// gulp.task('js', function() {
//     // Run js through babel and export to dist
//     gulp.src('src/js/*.js')
//         .pipe(babel({
//             presets: ['env']
//         }))
//         .pipe(gulp.dest('./dist/scripts'));
//     // Copy any static scripts over to dist
//     gulp.src('./src/js/static/*.js')
//         .pipe(gulp.dest('./dist/scripts'));
// });

// if using webpack and modules
gulp.task('js', function() {
    // Run js through babel and export to dist
    return gulp.src('src/js/script.js')
        .pipe(webpack())
        .pipe(rename('script.js'))
        .pipe(gulp.dest('./dist/scripts'));
});

gulp.task('css', function() {
    let bootstrapPath = path.join(__dirname,
        'node_modules/bootstrap-sass/assets/stylesheets/');
    gulp.src('src/css/*.scss')
        .pipe(sass({
            includePaths: [bootstrapPath]
        }).on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('images', function() {
    gulp.src('./src/images/*')
        .pipe(gulp.dest('./dist/images'));
});

gulp.task('default', ['clean'], function() {
    run('html', 'js', 'css', 'images');
    gulp.watch('./src/css/*.scss', ['css']);
    gulp.watch('./src/js/*.js', ['js']);
    gulp.watch('./src/templates/**/*.hbs', ['html']);
    gulp.watch('./src/data/*.json', ['html']);
});
