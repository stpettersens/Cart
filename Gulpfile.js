/*
	Compile Cart.ts to JavaScript for end-use.
*/

var gulp = require('gulp'),
      fs = require('fs'),
     tsc = require('gulp-typescript'),
  insert = require('gulp-insert'),
 replace = require('gulp-replace'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify');

var header = '/*' +
'\nA shopping cart implemented via the client-side in TypeScript.' +
'\nCopyright 2015 Sam Saint-Pettersen.' +
'\nReleased under the MIT License.' +
'\nhttps://github.com/stpettersens/Cart' +
'\n*/\n';

gulp.task('js', function() {
	return gulp.src('Cart.ts')
	.pipe(tsc({
		noImplicitAny: true,
		removeComments: true,
		out: 'cart.js'
	}))
	.pipe(gulp.dest('.'))
	.pipe(insert.prepend(header))
	.pipe(gulp.dest('.'));
});

gulp.task('node', function() {
	return gulp.src('Cart.ts')
	.pipe(tsc({
		noImplicitAny: true,
		removeComments: true,
		out: 'cart.node.js'
	}))
	.pipe(gulp.dest('.'))
	.pipe(insert.prepend('var $ = require(\'jquery\')(jsdom.jsdom(\'' +
	'<div id="cart-alert"></div>' +
	'<div id="cart-box"></div>' +
	'<div id="product-1">' +
	'<p class="item name">Supa Soda</p>' +
	'<p class="price">$ 0.85</p>' +
	'<p class="qty">5</p>' +
	'</div>' +
	'<div id="product-2">' +
	'<p class="item name">Dakota Cola</p>' +
	'<p class="price">$ 0.70</p>' +
	'<p class="qty">5</p>' +
	'</div>' +
	'<div id="product-3">' +
	'<p class="item name">Soda Water (250ml)</p>' +
	'<p class="price">$ 1.50</p>' +
	'<p class="qty>"5</p>' +
	'</div>\').parentWindow);\n'))
	.pipe(insert.prepend('var fc = require(\'fake-cookie\');\n'))
	.pipe(insert.prepend('var Storage = \'ssp-fake-storage\';\n'))
	.pipe(insert.prepend('var jsdom = require(\'node-jsdom\');\n'))
	.pipe(insert.prepend('var localStorage = require(\'ssp-fake-storage\');\n'))
	.pipe(insert.prepend(header))
	.pipe(insert.prepend('/* FOR HEADLESS TESTING IN NODE.JS ONLY. DO NOT USE IN BROWSER. */\n'))
	.pipe(insert.append('module.exports = Cart'))
	.pipe(replace(/(localStorage).length/g, '$1.count'))
	.pipe(replace(/for \(var key in (localStorage)\)/g,
	'for (var i = 0; i < $1.count; i++)'))
	.pipe(replace(/key.search/g, 'localStorage.key(i).search'))
	.pipe(replace(/key.indexOf/g, 'localStorage.key()'))
	.pipe(replace(/(localStorage.getItem)\(key\)/g, '$1(localStorage.key(i))'))
	.pipe(replace(/(localStorage.removeItem)\(key\)/g, '$1(localStorage.key(i))'))
	.pipe(replace(/\$.(cookie)/g, 'fc.$1'))
	.pipe(replace(/\$.(removeCookie)/g, 'fc.$1'))
	.pipe(gulp.dest('.'));
})

gulp.task('jsmin', function() {
	return gulp.src('Cart.ts')
	.pipe(tsc({
		noImplicitAny: true,
		removeComments: true,
		out: 'cart.js'
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
