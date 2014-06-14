var hlr = {
    version: 0,

    maintainers: ['TheUnknownOne'],
    support: ['TheUnknownOne'],

    isMaintainer: function (id) {
        return hlr.maintainers.indexOf(hlr.nameOf(id)) > -1;
    },
    onSupportTeam: function (id) {
        return hlr.support.indexOf(hlr.nameOf(id)) > -1;
    },

    channame: "Highlanders",
    chan: -1
};

hlr.chan = sys.createChannel(hlr.channame) || sys.channelId(hlr.channame);
