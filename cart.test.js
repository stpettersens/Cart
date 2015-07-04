/*
  Tests for shopping cart.
  Invoke npm run test
*/
var cart = require('./cart.node.js'),
  should = require('should'),
  AsciiTable = require('ascii-table');

function emit(msg) {
  var table = new AsciiTable();
  table.setHeading('Item', 'Price', 'Qty', '', '', '');
  var message = msg.toString();
  if(message.indexOf(',') != -1) {
      var a_message = message.split(',');
      for(var i = 0; i < a_message.length; i++) {
          var col = a_message[i].split('|');
          table.addRow(col[0], col[1], col[2], 'X', '+', '-');
      }
      message = table.toString();
  }
  else if(message.indexOf('|') != -1) {
    var col = message.split('|');
    table.addRow(col[0], col[1], col[2], 'X', '+', '-');
    message = table.toString();
  }
  else message = '\t' + message;
  console.log(message);
}

describe('Configure cart:', function() {
  it('Configure as \'Cart\' using cookie and $ as currency', function() {
      cart.configure(null, true, '$');
  });
});

describe('Render the cart:', function() {
  it('Should be called \'Cart\' and have 0 items in it.', function() {
      emit(cart.renderCart());
      cart.renderCart().should.equal('Cart => 0');
  });
});

describe('Add items to cart:', function() {
  it('Add 2x Super Soda @ $ 0.85 to cart', function() {
      for(var i = 0; i < 2; i++) cart.addItem(1);
  });
  it('Add 1x Dakota Cola @ $ 0.70 to cart', function() {
      cart.addItem(2);
  });
  it('Add 7x Soda Water (250ml) @ $ 1.50 to cart', function() {
      for(var i = 0; i < 7; i++) cart.addItem(3);
  });
});

describe('Check items in cart', function() {
  it('There should now be 10 items in the cart', function() {
      emit(cart.renderItems());
      cart.getNumberItems().should.equal(10);
  });
});

describe('Add more items to cart:', function() {
  it('Add 1x Super Soda to cart (via changeQty)', function() {
      cart.changeQty(0, true);
  });
});

describe('Recheck items in cart', function() {
  it('There should now be 11 items in the cart', function() {
      cart.getNumberItems().should.equal(11);
      emit(cart.renderItems());
  });
});

describe('Remove items from cart:', function() {
  it('Remove 3x Super Soda from cart; should have 8 items now', function() {
    for(var i = 0; i < 3; i++) cart.changeQty(0, false);
    cart.getNumberItems().should.equal(8);
    emit(cart.renderItems());
  });

  it('Remove any Soda Waters from cart; should have 1 item now', function() {
    cart.removeItem(1);
    cart.getNumberItems().should.equal(1);
    emit(cart.renderItems());
  });

  it('Empty the cart; should have 0 items now', function() {
    cart.empty(true);
    cart.getNumberItems().should.equal(0);
  });
});
