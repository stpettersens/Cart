/*
	A shopping cart implemented via the client-side in TypeScript.

	Copyright 2015 Sam Saint-Pettersen.
	Released under the MIT License.
*/

/// <reference path="typings/jquery.d.ts" />
/// <reference path="typings/jquery.cookie.d.ts" />

class Cart {

	private static cart: string = 'Cart';
	private static forceCookie: boolean = false;
	private static cookie: string = 'cart';
	private static cookieTTL: number = 365;
	private static page: string;
	private static currency: string;
	private static bootstrap: boolean = false;
	private static striped: boolean = false;
	private static alerts: boolean = false;
	private static items: string[];
	private static prices: number[];
	private static qtys: number[];

	// Is Storage object supported by user browser?
	private static isStorageSupported(): boolean {
		var storage: boolean = false;
		if(typeof(Storage) != undefined) {
			storage = true;
		}
		return storage;
	}

	// Show an alert.
	private static showAlert(message: string): void {
		if(Cart.alerts) {
			$('#cart-alert').append('<div id="alert-for-cart" class="alert-success">' + message + '.</div>');

			setTimeout(function() {
				$('#alert-for-cart').remove();
			}, 2500);
		}
	}

	// Reset cart.
	private static reset(): void {
		Cart.items = new Array<string>();
		Cart.prices = new Array<number>();
		Cart.qtys = new Array<number>();
	}

	// Store an item to cart.
	private static store(value: string): void {
		// Use localStorage when possible.
		if(!Cart.forceCookie && Cart.isStorageSupported()) {
			localStorage.setItem('cart_item_' + localStorage.length, value);
		}
		else {
			// Otherwise, use a cookie.
			var items: string = $.cookie(Cart.cookie);
			if(items == undefined) items = '';
			items += value + ',';
			$.removeCookie(Cart.cookie);
			$.cookie(Cart.cookie, items, { expires: Cart.cookieTTL, path: '/' });
		}
	}

	// Remove an item from cart.
	private static removeIt(value: string): void {
		// Use localStorage when possible.
		if(!Cart.forceCookie && Cart.isStorageSupported()) {
			var i: number = localStorage.length - 1;
			while((localStorage.length - 1) >= 0) {
				var item: string = localStorage.getItem('cart_item_' + i);
				if(item.search(value) != -1) {
					localStorage.removeItem('cart_item_' + i);
					break; // Remove only one at a time.
				}
				i--;
			}
			// Correct storage indexes and restore in lcoalStorage.
			var corrected: string[] = new Array<string>();
			for(var key in localStorage) {
				if(key.search('cart_item_') != -1) {
					corrected.push(localStorage.getItem(key));
				}
			}
			Cart.empty(true);
			for(var i: number = 0; i < corrected.length; i++) {
				Cart.store(corrected[i]);
			}
		}
		else {
			// Otherwise: use a cookie.
			var items: string = $.cookie(Cart.cookie);
			items = items.replace(value + ',', '');
			Cart.empty(true);
			$.cookie(Cart.cookie, items, { expires: Cart.cookieTTL, path: '/' });
			if(items == '') Cart.empty(true);
		}
	}

	// Push to arrays from localStorage.
	private static pushFromStorage(): void {
		for(var i: number = 0; i < localStorage.length; i++) {
			var np: string[] = localStorage.getItem('cart_item_' + i).split(':');
			var index: number = Cart.items.indexOf(np[0]);
			if(index == -1) {
				Cart.items.push(np[0]);
				Cart.prices.push(parseFloat(np[1]));
				Cart.qtys.push(1);
			}
			else Cart.qtys[index] = Cart.qtys[index] + 1;
		}
	}

	// Push to arrays from cookie.
	private static pushFromCookie(): void {
		var cookie = $.cookie(Cart.cookie);
		var values: string[] = new Array<string>();
		if(cookie != undefined) values = cookie.split(',');
		for(var i: number = 0; i < values.length; i++) {
			if(values[i] == '') continue;
			var np: string[] = values[i].split(':');
			var index: number = Cart.items.indexOf(np[0]);
			if(index == -1) {
				Cart.items.push(np[0]);
				Cart.prices.push(parseFloat(np[1]));
				Cart.qtys.push(1);
			}
			else Cart.qtys[index] = Cart.qtys[index] + 1;
		}
	}

	// Get number of items in cart
	private static getNumberItems(): number {
		Cart.reset();
		if(!Cart.forceCookie && Cart.isStorageSupported()) {
			Cart.pushFromStorage();
		}
		else {
			Cart.pushFromCookie();
		}
		var items: string[] = new Array<string>();
		if(!Cart.forceCookie && Cart.isStorageSupported()) {
			for(var key in localStorage) {
				if(key.search('cart_item_') != -1) {
					items.push(localStorage.getItem(key));
				}
			}
		}
		else {
			var stritems: string = $.cookie(Cart.cookie);
			if(stritems != undefined) {
				var i: string[] = stritems.split(',');
				for(var x: number = 0; x < i.length; x++) {
					if(i[x] != '') items.push(i[x]);
				}
			}
		}
		return items.length;
	}

	// Render items in cart.
	public static renderItems(): void {
		var total: number = 0;
		var c: string = Cart.currency;
		Cart.reset();
		if(!Cart.forceCookie && Cart.isStorageSupported()) {
			Cart.pushFromStorage();
		}
		else {
			Cart.pushFromCookie();
		}
		if(Cart.items.length > 0) {
			$('#cart').append('<table id="cart-contents"><tr><td>Item</td>' 
			+ '<td>Price</td><td>Qty</td><td>Subtotal</td><td>&nbsp;</td></tr>');
			for(var i = 0; i < Cart.items.length; i++) {
				$('#cart-contents').append('<tr><td class="item">' + Cart.items[i] + '</td>' +
				'<td class="price">' + c + ' ' + Cart.prices[i].toFixed(2) + '</td><td class="qty">' + 
				Cart.qtys[i] + '</td><td class="subtotal">' + c + ' ' + (Cart.prices[i] * Cart.qtys[i]).toFixed(2) +
				'</td><td><button onclick="Cart.removeItem(' + i + ')">X</button>' + 
				'&nbsp;<button onclick="Cart.changeQty(' + i + ',true);">+</button>' +
				'&nbsp;<button onclick="Cart.changeQty(' + i + ',false);">-</button>' +
				'</td></tr>');
				total += Cart.prices[i] * Cart.qtys[i];
			}
			$('#cart-contents').append('</tr></table>');
			$('#cart-contents').append('<p id="total"><br/><strong>Total: ' + c + ' ' + total.toFixed(2) + '</strong></p>');
			if(Cart.bootstrap) {
				$('#cart-contents').addClass('table');
				if(Cart.striped) 
					$('#cart-contents').addClass('table-striped');
			}
			$('#cart').append('<p><button onclick="Cart.empty();">Empty ' + Cart.cart + '</button></p>');	
		}
		else $('#cart').append('<p><em>Your ' + Cart.cart.toLowerCase() + ' is empty.</em></p>');
	}

	// Empty the cart.
	public static empty(noprompt?: boolean): void {
		if(!noprompt)
			var empty: boolean = confirm('Really empty the ' + Cart.cart.toLowerCase() + '?');
		if(empty || noprompt) {
			if(!Cart.forceCookie && Cart.isStorageSupported()) {
				for(var key in localStorage) {
					if(key.search('cart_item_') != -1) {
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
	}

	// Change quantity of an item in cart.
	public static changeQty(index: number, increment: boolean): void {
		var item: string = $('.item:eq(' + index + ')').text();
		var price: string = $('.price:eq(' + index + ')').text();
		var qty: string = $('.qty:eq(' + index + ')').text();
		if(increment) {
			Cart.store(item + ':' + price.replace(/\$|\£\s*/, ''));
		}
		else {
			Cart.removeIt(item + ':' + price.replace(/\$|\£\s*/, ''));
		}
		$('#cart').empty();
		Cart.renderItems();
	}

	// Remove an item from cart.
	public static removeItem(index: number): void {
		Cart.reset();
		if(!Cart.forceCookie && Cart.isStorageSupported()) {
			Cart.pushFromStorage();
			localStorage.clear();
		}
		else {
			Cart.pushFromCookie();
			$.removeCookie(Cart.cookie);
		}
		Cart.items.splice(index, 1);
		Cart.prices.splice(index, 1);
		for(var i: number = 0; i < Cart.items.length; i++) {
			Cart.store(Cart.items[i] + ':' + Cart.prices[i]);
		}
		$('#cart').empty();
		Cart.renderItems();
	}

	// Add an item to cart.
	public static addItem(id: number): void {
		var item: string = $('#product-' + id +'> .name').text();
		$('#product-' + id).each(function() {
			Cart.store(item + ':' + $('#product-' + id + '> .price').text().replace(/\$|\£\s*/, ''));
		});
		Cart.showAlert('Added ' + item + ' to ' + Cart.cart.toLowerCase());
		Cart.renderCart(Cart.page);
	}

	// Configure cart instead of using defaults.
	// Set name, force cookie use instead of localStorage,
	// Set currency symbol, use bootstrap for tables,
	// use striped tables, use alerts.
	public static configure(name?: string, forceCookie?: boolean, currency?: string, bootstrap?: boolean, striped?: boolean, alerts?: boolean): void {
		if(name != null) Cart.cart = name;
		if(forceCookie != null) Cart.forceCookie = forceCookie;
		if(currency != null) Cart.currency = currency;
		else Cart.currency = '$';
		if(bootstrap != null) Cart.bootstrap = bootstrap;
		if(striped != null) Cart.striped = striped;
		if(alerts != null) Cart.alerts = alerts;
	}

	// Render cart box with item count.
	public static renderCart(page: string): void {
		Cart.page = page;
		var cart: string = '<div id="cart-items">';
		cart += '<a href="' + Cart.page + '">' + Cart.cart + '</a>';
		cart += ' [' + Cart.getNumberItems() + ']';
		cart += '</div><br/><br/>';
		$('#cart-box').empty();
		$('#cart-box').append(cart);
	} 
}
