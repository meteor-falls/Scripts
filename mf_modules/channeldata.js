var currentVersion = 1,
    file = "channeldata.json";

var defaultValues = {
    creator: '',
    topic: '',
    setBy: '',
    members: {},
    auth: {},
    mutes: {},
    bans: {},
    bots: true,
    isPublic: true
};

var fields = ["creator", "topic", "setBy", "members", "auth", "mutes", "bans", "bots", "isPublic"];

function ChannelManager() {
    this.data = {};
    this.version = currentVersion;

    if (sys.fileExists(file)) {
        this.data = JSON.parse(sys.getFileContent(file));
    } else {
        sys.writeToFile(file, "{}");
    }

    if (!this.data.hasOwnProperty('__meta__')) {
        this.data.__meta__ = {version: this.version};
    }

    // Channels can't have a double dash.
    this.version = this.data.__meta__.version || currentVersion;
    return this;
}

var manager = ChannelManager.prototype;
manager.find = function (cname) {
    cname = cname.toLowerCase();
    return this.data[cname];
};

manager.get = function (cname, key) {
    var chan = this.find(cname);
    if (!chan) {
        return null;
    }
    return chan[key] || defaultValues[key];
};

// Expects a SESSION object
manager.populate = function (chan) {
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

// Expects a SESSION object.
manager.absorb = function (chan) {
    var name = chan.name.toLowerCase(),
        data = (this.data[name] || (this.data[name] = {}));

    var field, len, i;
    for (i = 0, len = fields.length; i < len; i += 1) {
        field = fields[i];
        if (chan.hasOwnProperty(field)) {
            data[field] = chan[field];
        }
    }

    return this;
};

manager.update = function (cname, key, value) {
    cname = cname.toLowerCase();
    if (!(cname in this.data)) {
        this.data[cname] = {};
    }

    this.data[cname][key] = value;
    return this;
};

// Expects a SESSION object
manager.sync = function (chan, key) {
    var cname = chan.name.toLowerCase();
    if (!this.data.hasOwnProperty(cname)) {
        this.data[cname] = {};
    }

    this.data[cname][key] = chan[key];
    return this;
};

manager.unregister = function (cname) {
    delete this.data[cname.toLowerCase()];
    return this;
};

manager.save = function () {
    sys.writeToFile(file, JSON.stringify(this.data));
    return this;
};

manager.dump = function () {
    var dataKeys = Object.keys(this.data);
    return [
        "ChannelManager dump @ " + (new Date()).toUTCString(),
        "Version " + this.version,
        (dataKeys.length - 1) + " channels.", // Exclude __meta__
        dataKeys.length + " keys, being:",
        dataKeys.join(", ")
    ].join("\n");
};

module.exports = {
    ChannelManager: ChannelManager,
    manager: new ChannelManager()
};
