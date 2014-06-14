hlr.player.initStorage();
hlr.initItemStorage();

hlr.addClasses();
hlr.addItems();
hlr.addCommands();

module.exports = hlr;
exports.serverShutDown = function () {
    var len, i;
    for (i = 0, len = hlr.persistence.stores.length; i < len; i += 1) {
        hlr.persistence.stores[i].saveAll();
    }
};

var stepTimer = 0;
exports.step = function () {
    stepTimer += 1;

    var store, len, i;
    for (i = 0, len = hlr.persistence.stores.length; i < len; i += 1) {
        store = hlr.persistence.stores[i];
        if (store.saverate % stepTimer === 0) {
            store.saveAll();
        }
    }
};

module.reload = function () {
    // Update commands inside events
    require.reload('events.js');
    return true;
};
