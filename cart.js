var Cart = (function () {
    function Cart() {
    }
    Cart.isStorageSupported = function () {
        var storage = false;
        if (typeof (Storage) != 'undefined') {
            storage = true;
        }
        return storage;
    };
    Cart.showAlert = function (message) {
        if (Cart.alerts) {
            $('#cart-alert').append('<div id="alert-for-cart" class="alert-success">' + message + '.</div>');
            setTimeout(function () {
                $('#alert-for-cart').remove();
            }, 2500);
        }
    };
    Cart.reset = function () {
        Cart.items = new Array();
        Cart.prices = new Array();
        Cart.qtys = new Array();
    };
    Cart.store = function (value) {
        if (!Cart.forceCookie && Cart.isStorageSupported()) {
            localStorage.setItem('cart_item_' + localStorage.length, value.replace(/\:\s*/, ':'));
        }
        else {
            var items = $.cookie(Cart.cookie);
            if (items == undefined)
                items = '';
            items += value + ',';
            $.removeCookie(Cart.cookie);
            $.cookie(Cart.cookie, items, { expires: Cart.cookieTTL, path: '/' });
        }
    };
    Cart.removeIt = function (value) {
        if (!Cart.forceCookie && Cart.isStorageSupported()) {
            var a_value = value.split('(');
            if (a_value[1] != null)
                value = a_value[0];
            var i = localStorage.length - 1;
            while ((localStorage.length - 1) >= 0) {
                var item = localStorage.getItem('cart_item_' + i);
                if (item.search(value) != -1) {
                    localStorage.removeItem('cart_item_' + i);
                    break;
                }
                i--;
            }
            var corrected = new Array();
            for (var key in localStorage) {
                if (key.search('cart_item_') != -1) {
                    corrected.push(localStorage.getItem(key));
                }
            }
            Cart.empty(true);
            for (var i = 0; i < corrected.length; i++) {
                Cart.store(corrected[i]);
            }
        }
        else {
            var items = $.cookie(Cart.cookie);
            items = items.replace(value + ',', '');
            Cart.empty(true);
            $.cookie(Cart.cookie, items, { expires: Cart.cookieTTL, path: '/' });
            if (items == '')
                Cart.empty(true);
        }
    };
    Cart.pushFromStorage = function () {
        for (var i = 0; i < localStorage.length; i++) {
            var np = localStorage.getItem('cart_item_' + i).split(':');
            var index = Cart.items.indexOf(np[0]);
            if (index == -1) {
                Cart.items.push(np[0]);
                Cart.prices.push(parseFloat(np[1]));
                Cart.qtys.push(1);
            }
            else
                Cart.qtys[index] = Cart.qtys[index] + 1;
        }
    };
    Cart.pushUnrelatedFromStorage = function () {
        Cart.unrelated = new Array();
        for (var i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).search('cart_item_') == -1)
                Cart.unrelated.push(localStorage.key(i) + '=>' + localStorage.getItem(localStorage.key(i)));
        }
    };
    Cart.restoreUnrelated = function () {
        for (var i = 0; i < Cart.unrelated.length; i++) {
            var kv = Cart.unrelated[i].split('=>');
            localStorage.setItem(kv[0], kv[1]);
        }
    };
    Cart.pushFromCookie = function () {
        var cookie = $.cookie(Cart.cookie);
        var values = new Array();
        if (cookie != undefined)
            values = cookie.split(',');
        for (var i = 0; i < values.length; i++) {
            if (values[i] == '')
                continue;
            var np = values[i].split(':');
            var index = Cart.items.indexOf(np[0]);
            if (index == -1) {
                Cart.items.push(np[0]);
                Cart.prices.push(parseFloat(np[1]));
                Cart.qtys.push(1);
            }
            else
                Cart.qtys[index] = Cart.qtys[index] + 1;
        }
    };
    Cart.getNumberItems = function () {
        Cart.reset();
        if (!Cart.forceCookie && Cart.isStorageSupported()) {
            Cart.pushFromStorage();
        }
        else {
            Cart.pushFromCookie();
        }
        var items = new Array();
        if (!Cart.forceCookie && Cart.isStorageSupported()) {
            for (var key in localStorage) {
                if (key.search('cart_item_') != -1) {
                    items.push(localStorage.getItem(key));
                }
            }
        }
        else {
            var stritems = $.cookie(Cart.cookie);
            if (stritems != undefined) {
                var i = stritems.split(',');
                for (var x = 0; x < i.length; x++) {
                    if (i[x] != '')
                        items.push(i[x]);
                }
            }
        }
        return items.length;
    };
    Cart.renderItems = function () {
        var total = 0;
        var c = Cart.currency;
        Cart.reset();
        if (!Cart.forceCookie && Cart.isStorageSupported()) {
            Cart.pushFromStorage();
        }
        else {
            Cart.pushFromCookie();
        }
        if (Cart.items.length > 0) {
            $('#cart').append('<table id="cart-contents"><tr><td>Item</td>' + '<td>Price</td><td>Qty</td><td>Subtotal</td><td>&nbsp;</td></tr>');
            for (var i = 0; i < Cart.items.length; i++) {
                $('#cart-contents').append('<tr><td class="item">' + Cart.items[i] + '</td>' + '<td class="price">' + c + ' ' + Cart.prices[i].toFixed(2) + '</td><td class="qty">' + Cart.qtys[i] + '</td><td class="subtotal">' + c + ' ' + (Cart.prices[i] * Cart.qtys[i]).toFixed(2) + '</td><td><button onclick="Cart.removeItem(' + i + ')">X</button>' + '&nbsp;<button onclick="Cart.changeQty(' + i + ',true);">+</button>' + '&nbsp;<button onclick="Cart.changeQty(' + i + ',false);">-</button>' + '</td></tr>');
                total += Cart.prices[i] * Cart.qtys[i];
            }
            $('#cart-contents').append('</tr></table>');
            $('#cart-contents').append('<p id="total"><br/><strong>Total: ' + c + ' ' + total.toFixed(2) + '</strong></p>');
            $('#cart').append('<p><button onclick="Cart.empty();">Empty ' + Cart.cart + '</button></p>');
            if (Cart.bootstrap) {
                $('button').addClass('btn');
                $('button').addClass('btn-default');
                $('#cart-contents').addClass('table');
                if (Cart.striped)
                    $('#cart-contents').addClass('table-striped');
            }
        }
        else
            $('#cart').append('<p><em>Your ' + Cart.cart.toLowerCase() + ' is empty.</em></p>');
        var at_price_list = new Array();
        for (var i = 0; i < Cart.items.length; i++) {
            at_price_list.push(Cart.items[i] + '|' + Cart.currency + ' ' + Cart.prices[i].toFixed(2) + '|' + Cart.qtys[i]);
        }
        return at_price_list;
    };
    Cart.empty = function (noprompt) {
        if (!noprompt)
            var empty = confirm('Really empty the ' + Cart.cart.toLowerCase() + '?');
        if (empty || noprompt) {
            if (!Cart.forceCookie && Cart.isStorageSupported()) {
                for (var key in localStorage) {
                    if (key.search('cart_item_') != -1) {
                        localStorage.removeItem(key);
                    }
                }
            }
            else {
                $.removeCookie(Cart.cookie);
            }
            $('#cart').empty();
            Cart.renderItems();
        }
    };
    Cart.changeQty = function (index, increment) {
        var item = $('.item:eq(' + index + ')').text();
        var price = $('.price:eq(' + index + ')').text();
        var qty = $('.qty:eq(' + index + ')').text();
        var pattern = new RegExp('\\' + Cart.currency + '\s*', 'ig');
        if (increment) {
            Cart.store(item + ':' + price.replace(pattern, ''));
        }
        else {
            Cart.removeIt(item + ':' + price.replace(pattern, ''));
        }
        $('#cart').empty();
        Cart.renderItems();
    };
    Cart.removeItem = function (index) {
        Cart.reset();
        if (!Cart.forceCookie && Cart.isStorageSupported()) {
            Cart.pushFromStorage();
            Cart.pushUnrelatedFromStorage();
            localStorage.clear();
            Cart.restoreUnrelated();
        }
        else {
            Cart.pushFromCookie();
            $.removeCookie(Cart.cookie);
        }
        Cart.items.splice(index, 1);
        Cart.prices.splice(index, 1);
        for (var i = 0; i < Cart.items.length; i++) {
            Cart.store(Cart.items[i] + ':' + Cart.prices[i]);
        }
        $('#cart').empty();
        Cart.renderItems();
    };
    Cart.addItem = function (id) {
        var pattern = new RegExp('\\' + Cart.currency + '\s*', 'ig');
        var item = $('#product-' + id + '> .name').text();
        var price = null;
        $('#product-' + id).each(function () {
            price = $('#product-' + id + '> .price').text();
            Cart.store(item + ':' + price.replace(pattern, ''));
        });
        Cart.showAlert('Added ' + item + ' to ' + Cart.cart.toLowerCase());
        Cart.renderCart(Cart.page);
    };
    Cart.configure = function (name, forceCookie, currency, bootstrap, striped, alerts) {
        if (name != null)
            Cart.cart = name;
        if (forceCookie != null)
            Cart.forceCookie = forceCookie;
        if (currency != null)
            Cart.currency = currency;
        else
            Cart.currency = '$';
        if (bootstrap != null)
            Cart.bootstrap = bootstrap;
        if (striped != null)
            Cart.striped = striped;
        if (alerts != null)
            Cart.alerts = alerts;
    };
    Cart.renderCart = function (page) {
        Cart.page = page;
        var cart = '<div id="cart-items">';
        cart += '<a href="' + Cart.page + '">' + Cart.cart + '</a>';
        cart += ' [' + Cart.getNumberItems() + ']';
        cart += '</div><br/><br/>';
        $('#cart-box').empty();
        $('#cart-box').append(cart);
        return Cart.cart + ' => ' + Cart.getNumberItems().toString();
    };
    Cart.cart = 'Cart';
    Cart.forceCookie = false;
    Cart.cookie = 'cart';
    Cart.cookieTTL = 365;
    Cart.bootstrap = false;
    Cart.striped = false;
    Cart.alerts = false;
    return Cart;
})();
