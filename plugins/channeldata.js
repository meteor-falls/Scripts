(function () {
    var currentVersion = 1,
        file = "channeldata.json";

    var defaultValues = {
        bots: true,
        auth: {},
        creator: '',
        mutes: {},
        bans: {},
        isPublic: true
    };

    var fields = ["bots", "auth", "creator", "mutes", "bans", "isPublic"];

    function ChannelManager() {
        this.data = {};
        this.version = -1;

        if (sys.fileExists(file)) {
            this.data = JSON.parse(sys.getFileContent(file));
        } else {
            sys.writeToFile(file, "{}");
        }

        this.version = this.data.version || currentVersion;
        return this;
    }

    ChannelManager.prototype.find = function (cname) {
        cname = cname.toLowerCase();
        return this.data[cname];
    };

    ChannelManager.prototype.get = function (cname, key) {
        var chan = this.find(cname);
        if (!chan) {
            return null;
        }
        return chan[key] || defaultValues[key];
    };

    // Expects a SESSION object
    ChannelManager.prototype.populate = function (chan) {
        var name = chan.name.toLowerCase(),
            obj = this.find(name);
        if (!obj) {
            return false;
        }

        var field, len, i;
        for (i = 0, len = fields.length; i < len; i += 1) {
            field = fields[i];
            if (obj.hasOwnProperty(field)) {
                chan[field] = obj[field];
            }
        }

        return true;
    };

    ChannelManager.prototype.update = function (cname, key, value) {
        cname = cname.toLowerCase();
        this.data[cname][key] = value;
        return this;
    };

    ChannelManager.prototype.unregister = function (cname) {
        delete this.data[cname];
        return this;
    };

    ChannelManager.prototype.save = function () {
        sys.writeToFile(file, JSON.stringify(this.data));
        return this;
    };

    exports.ChannelManager = ChannelManager;
    exports.manager = new ChannelManager();
    module.preferCache = true;
    module.reload = function () {
        module.exports.manager = new ChannelManager();
        return true;
    }'
}());
