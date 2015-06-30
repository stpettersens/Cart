/*
	Compile cart.ts to JavaScript for end-use.
*/

var gulp = require('gulp'),
	  fs = require('fs'),
	 tsc = require('gulp-typescript'),
  insert = require('gulp-insert'),
  concat = require('gulp-concat'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify');

var header = '/*' +
'\nA shopping cart implemented via the client-side in TypeScript.' +
'\nCopyright 2015 Sam Saint-Pettersen.' +
'\nReleased under the MIT License.' +
'\nhttps://github.com/stpettersens/Cart' +
'\n*/\n';

gulp.task('js', function() {
	return gulp.src('cart.ts')
	.pipe(tsc({
		noImplicitAny: true,
		removeComments: true
	}))
	.pipe(gulp.dest('.'))
	.pipe(insert.prepend(header))
	.pipe(concat('cart.js'))
	.pipe(gulp.dest('.'));
});

gulp.task('jsmin', function() {
	return gulp.src('cart.ts')
	.pipe(tsc({
		noImplicitAny: true,
		removeComments: true
	}))
	.pipe(insert.prepend(header))
	.pipe(gulp.dest('.'))
	.pipe(rename('cart.min.js'))
	.pipe(uglify())
	.pipe(insert.prepend(header))
	.pipe(gulp.dest('.'));
});

gulp.task('clean', function() {
	fs.unlinkSync('cart.js');
	fs.unlinkSync('cart.min.js');
});

gulp.task('default', ['jsmin'], function(){});
