function Rank(name, table) {
    this.name = name;
    this.table = table || name;
    this.members = {};
    this.load();
}

var rank = Rank.prototype;

rank.toEntry = function (name) {
    var user = SESSION.users(sys.id(name) || name);

    if (user && user.originalName) {
        name = user.originalName;
    }

    return (name || "").toLowerCase();
};

rank.hasMember = function (name) {
    var ip, aliases,
        alias,
        len, i;

    name = this.toEntry(name);

    ip = sys.dbIp(name);
    if (this.members.hasOwnProperty(name.toLowerCase())) {
        return true;
    }

    aliases = sys.aliases(ip);

    if (!aliases || (len = aliases.length) === 1) {
        return false;
    }

    for (i = 0; i < len; i += 1) {
        alias = aliases[i];
        if (this.members.hasOwnProperty(alias.toLowerCase())) {
            return true;
        }
    }

    return false;
};

rank.addMember = function (name) {
    this.members[this.toEntry(name)] = 1;
    return this;
};

rank.removeMember = function (name) {
    delete this.members[this.toEntry(name)];
    return this;
};

rank.toggleMember = function (name) {
    if (this.hasMember(name)) {
        this.removeMember(name);
        return 'remove';
    } else {
        this.addMember(name);
        return 'add';
    }
};

rank.save = function () {
    Reg.save(this.table, this.members);
    return this;
};

rank.load = function () {
    this.members = Reg.get(this.table) || {};
    return this;
};

Rank.hasMemberIncludingAuth = function (name) {
    var ip, aliases,
        alias,
        len, i;

    name = this.toEntry(name);

    ip = sys.dbIp(name);
    if (sys.maxAuth(ip) > 0 || Utils.isMaintainer(name)) {
        return true;
    }

    if (this.members.hasOwnProperty(name.toLowerCase())) {
        return true;
    }

    aliases = sys.aliases(ip);

    if (!aliases || (len = aliases.length) === 1) {
        return false;
    }

    for (i = 0; i < len; i += 1) {
        alias = aliases[i];
        if (this.members.hasOwnProperty(alias.toLowerCase())) {
            return true;
        }
    }

    return false;
};

exports.Rank = Rank;
exports.load = function () {
    var plus = new Rank("MF+", "plusmembers"),
        plusplus = new Rank("MF++", "plusplusmembers");

    plusplus.hasMember = Rank.hasMemberIncludingAuth;
    plus.hasMember = function (name) {
        // don't call hasMemberIncludingAuth twice here for performance
        return plusplus.hasMember(name) || Rank.prototype.hasMember.call(this, name);
    };

    global.Ranks = {};
    Ranks.Rank = Rank;

    Ranks.plus = plus;
    Ranks.plusplus = plusplus;
};

module.reload = function () {
    module.exports.load();
    return true;
};
