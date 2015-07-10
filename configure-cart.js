$(document).ready(function() {
  // Don't set a custom name for cart.
  // Force use of cookie instead of localStorage.
  // Use $ for currency.
  // Use bootstrap for table and buttons.
  // Use striped boostrap table.
  // Use alerts.
  Cart.configure(null, true, '$', true, true, true);
});
