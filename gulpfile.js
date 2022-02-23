/*
SPDX-Copyright: Copyright (c) Capital One Services,LLC
SPDX-License-Identifier: Apache-2.0

Copyright 2018 Capital One Services, LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
 */

var gulp = require('gulp');
var watch = require('gulp-watch');
var ts = require('gulp-typescript');
var exec = require('child_process').exec;
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var tsify = require("tsify");
gulp.task('ng-build', function (cb) {
    console.log('running ng build...');
    exec('ng build', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
        return true;
    });
});
gulp.task('content-script', function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: 'content-script/boot.ts'
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('content-script.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('ng-build-watch', function (cb) {
    console.log('running ng build...');
    exec('ng build --watch', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
        return true;
    });
});
gulp.task('watch', function() {
    gulp.watch(['content-script/*.ts'], ['content-script']);
});

gulp.task('build', gulp.series('ng-build', 'content-script'));
gulp.task('default', gulp.series('ng-build-watch', 'content-script', 'watch'));
