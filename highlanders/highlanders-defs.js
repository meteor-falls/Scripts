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
