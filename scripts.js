;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};var Config, ignoreNextChanMsg;

Config = {
  servername: "Meteor Falls",
  maintainers: ["TheUnknownOne", "[ᴠᴘ]ʙʟᴀᴅᴇ"],
  dataurl: "http://meteor-falls.github.io/Server-Shit/",
  emotesurl: "http://meteor-falls.github.io/Emotes/emotes.json",
  emojiurl: "http://meteor-falls.github.io/Emotes/emoji.json",
  plugindir: "plugins/",
  datadir: "data/",
  stripHtmlFromChannelMessages: true,
  emotesEnabled: true,
  characterLimit: 600
};

ignoreNextChanMsg = false;

require('./session').register();

global.poScript = {
  serverStartUp: function() {
    var startUpTime;
    startUpTime = +sys.time();
    return script.init();
  },
  init: function() {
    return sys.resetProfiling();
  },
  warning: function(func, message, backtrace) {
    return require.callPlugins("warning", func, message, backtrace);
  },
  beforeNewMessage: function(message) {
    return require.callPlugins("beforeNewMessage", message);
  },
  afterNewMessage: function(message) {
    return require.callPlugins("afterNewMessage", message);
  },
  beforeServerMessage: function(message) {
    return require.callPlugins("beforeServerMessage", message);
  },
  beforeChannelJoin: function(src, channel) {
    return require.callPlugins("beforeChannelJoin", src, channel);
  },
  beforeChannelDestroyed: function(channel) {
    return require.callPlugins("beforeChannelDestroyed", channel);
  },
  afterChannelCreated: function(chan, name, src) {
    return require.callPlugins("afterChannelCreated", chan, name, src);
  },
  afterChannelJoin: function(src, chan) {
    return require.callPlugins("afterChannelJoin", src, chan);
  },
  beforeLogIn: function(src) {
    return require.callPlugins("beforeLogIn", src);
  },
  afterLogIn: function(src, defaultChan) {
    return require.callPlugins("afterLogIn", src, defaultChan);
  },
  beforeChangeTier: function(src, team, oldtier, newtier) {
    return require.callPlugins("beforeChangeTier", src, team, oldtier, newtier);
  },
  beforeChangeTeam: function(src) {
    return require.callPlugins("beforeChangeTeam", src);
  },
  beforeChatMessage: function(src, message, chan) {
    return require.callPlugins("beforeChatMessage", src, message, chan);
  },
  beforeLogOut: function(src) {
    return require.callPlugins("beforeLogOut", src);
  },
  afterChangeTeam: function(src) {
    return require.callPlugins("afterChangeTeam", src);
  },
  beforePlayerKick: function(src, bpl) {
    return require.callPlugins("beforePlayerKick", src, bpl);
  },
  beforePlayerBan: function(src, bpl, time) {
    return require.callPlugins("beforePlayerBan", src, bpl, time);
  },
  beforeChallengeIssued: function(src, dest) {
    return require.callPlugins("beforeChallengeIssued", src, dest);
  },
  beforeBattleMatchup: function(src, dest, clauses, rated, mode, team1, team2) {
    return require.callPlugins("beforeBattleMatchup", src, dest, clauses, rated, mode, team1, team2);
  },
  afterBattleStarted: function(src, dest, info, id, t1, t2) {
    return require.callPlugins("afterBattleStarted", src, dest, info, id, t1, t2);
  },
  afterBattleEnded: function(src, dest, desc) {
    return require.callPlugins("afterBattleEnded", src, dest, desc);
  },
  afterChatMessage: function(src, message, chan) {
    return require.callPlugins("afterChatMessage", src, message, chan);
  },
  beforePlayerRegister: function(src) {
    return Utils.watch.notify(Utils.nameIp(src) + " registered.");
  },
  battleConnectionLost: function() {
    return Utils.watch.notify("Connection to the battle server has been lost.");
  }
};


},{"./session":2}],2:[function(require,module,exports){
var Channel, User, register, sessid;

sessid = "Meteor Falls Script v1.0.0";

User = (function() {
  function User(id) {
    var ip;
    this.id = id;
    ip = sys.ip(id);
    this.ip = ip;
    this.floodCount = 0;
    this.teamChanges = 0;
    this.caps = 0;
    this.muted = false;
    this.semuted = false;
    this.originalName = sys.name(id);
    this.loginTime = sys.time();
    this.lastEmote = [];
  }

  return User;

})();

Channel = (function() {
  function Channel(id) {
    this.id = id;
    this.name = sys.channel(id);
    this.creator = "";
    this.topic = "";
    this.setBy = "";
    this.members = {};
    this.auth = {};
    this.mutes = {};
    this.bans = {};
    this.bots = true;
    this.isPublic = true;
  }

  return Channel;

})();

register = function() {
  SESSION.identifyScriptAs(sessid);
  SESSION.registerUserFactory(User);
  SESSION.registerChannelFactory(Channel);
  return SESSION.refill();
};

module.exports = {
  User: User,
  Channel: Channel,
  sessid: sessid,
  register: register
};


},{}]},{},[1])
;poScript; 
