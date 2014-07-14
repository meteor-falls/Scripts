var hlr = {
    version: '0.0.1',

    maintainers: ['TheUnknownOne'],

    isMaintainer: function (id) {
        return hlr.maintainers.indexOf(hlr.nameOf(id)) > -1;
    },

    channame: "Highlanders",
    chan: -1
};

hlr.chan = sys.createChannel(hlr.channame) || sys.channelId(hlr.channame);
hlr._uniqItemId = {id: 0, dirty: false, file: ".hlruniqitemid"};

if (!sys.fileExists(hlr._uniqItemId.file)) {
    sys.writeToFile(hlr._uniqItemId.file, "0");
}

hlr._uniqItemId.id = parseInt(sys.getFileContent(hlr._uniqItemId.file));

hlr.uniqItemId = function () {
    var id = hlr._uniqItemId.id;
    hlr._uniqItemId.id += 1;
    hlr._uniqItemId.dirty = true;
    return id;
};

