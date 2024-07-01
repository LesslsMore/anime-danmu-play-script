(function() {
    var originalSetItem = localStorage.setItem;
    var originalRemoveItem = localStorage.removeItem;

    localStorage.setItem = function(key, value) {
        var event = new Event('itemInserted');
        event.key = key;
        event.value = value;
        document.dispatchEvent(event);
        originalSetItem.apply(this, arguments);
    };

    localStorage.removeItem = function(key) {
        var event = new Event('itemRemoved');
        event.key = key;
        document.dispatchEvent(event);
        originalRemoveItem.apply(this, arguments);
    };
})();

// document.addEventListener('itemRemoved', function(e) {
//     console.log('Removed: ', e.key);
// });
