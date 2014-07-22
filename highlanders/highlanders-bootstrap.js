hlr.player.initStorage();
hlr.addCommands();

module.exports = hlr;
module.exports.serverShutDown = module.onUnload = function () {
    hlr.player.jsonstore.saveAll();

    sys.writeToFile(hlr._uniqItemId.file, hlr._uniqItemId.id);
};

var stepTimer = 0;
module.exports.step = function () {
    stepTimer += 1;

    if (hlr._uniqItemId.dirty) {
        sys.writeToFile(hlr._uniqItemId.file, hlr._uniqItemId.id);
    }

    if (stepTimer % hlr.player.jsonstore.saverate === 0) {
        hlr.player.jsonstore.saveAll();
    }
};

module.reload = function () {
    return true;
};
