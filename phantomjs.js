/*
  Headless tests for shopping cart via phantomjs.
*/
var page = require('webpage').create();

console.log('Testing Cart...');
page.open('cart-demo.html', function(s) {
    page.render('test.png');
    phantom.exit();
});
