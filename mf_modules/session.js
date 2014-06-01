function User(id) {
    var ip = sys.ip(id);

    this.id = id;
    this.ip = ip;
    this.floodCount = 0;
    this.teamChanges = 0;
    this.caps = 0;
    this.muted = false;
    this.semuted = false;

    this.originalName = sys.name(id);
    this.loginTime = +sys.time();

    // This is an array so we can track multiple emotes in their last message.
    this.lastEmote = [];
}

function Channel(id) {
    this.id   = id;
    this.name = sys.channel(id);

    this.creator = '';
    this.topic   = '';
    this.setBy   = '';

    this.members = {};
    this.auth    = {};
    this.mutes   = {};
    this.bans    = {};

    this.bots     = true;
    this.isPublic = true;
}

function bootstrapSESSION() {
    SESSION.identifyScriptAs("Meteor Falls Script v0.11.0");
    SESSION.registerUserFactory(User);
    SESSION.registerChannelFactory(Channel);
    SESSION.refill();
}

module.exports = {
    User: User,
    Channel: Channel,
    bootstrapSESSION: bootstrapSESSION
};
