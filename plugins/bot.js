/*jslint continue: true, es5: true, evil: true, forin: true, sloppy: true, vars: true, regexp: true, newcap: true, nomen: true*/
/*global sys, SESSION, script: true, Qt, print, gc, version,
    global: false, Plugin: true, Config: true, module: true, exports: true,
    bot: true, Reg: true, Leaguemanager: true, Lists: true, html_escape: true, namecolor: true, CommandList: true, namecolor: true, MathJS: true, format: true, cut: true, JSESSION: true, emoteFormat: true, hasEmotesToggled: true, tourmode: true, tourmembers: true, getTier: true, tourtier: true, tourplayers: true, roundnumber: true, isFinals: true, battlesLost: true, tourbattlers: true, battlesStarted: true, hasEmotePerms: true, Emotetoggles: true, rouletteon: true, spinTypes: true, EmoteList: true, TableList: true, MegaUsers: true, FloodIgnore: true, Capsignore: true, Autoidle: true, Emoteperms: true, Feedmon: true, getTimeString: true, tournumber: true, prize: true, isTier: true, tournumber: true, Kickmsgs: true, Welmsgs: true, Banmsgs: true, Channeltopics: true, android: true, topicbot: true, Mutes: true, Rangebans: true, getAuth: true, muteall: true, andJoin: true, kick: true, tempBanTime: true, stringToTime: true, tempBan: true, pruneMutes: true, nightclub: true, Nightclub: true, supersilence: true, ev_name: true, getName: true, ban: true, Plugins: true, PHandler: true, reloadPlugin: true, htmlchatoff: true, bots: true, html_strip: true, fisherYates: true, servername: true, isBanned: true, loginMessage: true, logoutMessage: true, cmp: true, floodIgnoreCheck: true, removeTag: true, randcolor: true, colormodemessage: true, lolmessage: true, pewpewpewmessage: true, hasBasicPermissions: true, hasDrizzleSwim: true, hasSandCloak: true, ChannelNames: true, staffchannel: true, testchan: true, watch: true, aliasKick: true, reconnectTrolls: true, nthNumber: true, ChannelLink: true, addChannelLinks: true, firstGen: true, randPoke: true, formatPoke: true, hasIllegalChars: true, teamSpammers: true, Feedmons: true, addEmote: true, Bot: true
*/

/* Documentation for prototype Bot:
   Creates a bot. Example:
   vpbot = new Bot("Meteor Falls", "red", "+", true);
   
   Function documentation:
   new Bot (name, color, prefix, withItalics):
   Creates a bot with name name, colored color. Prefix is optional and can be empty. 
   Default is "+". withItalics can be true/false depending if the bot should have italics like auth.
   Example: vpbot = new Bot("Meteor Falls", "green");
   
   Bot.sendAll(message, channel):
   Sends message to channel. The message will be formatted with given configuration.
   Channel is optional and if none given sends message to every channel.
   Example: vpbot.sendAll("Welcome to Meteor Falls!");
   
   Bot.sendMessage(id, message, channel):
   Sends message to id in channel. The message will be formatted with given configuration.
   Channel is optional and if none given sends message to every channel.
   Example: vpbot.sendMessage(src, "Hey, "+sys.name(src)+"!", 0);
*/
Bot = function (name, color, prefix, italics) {
    italics = italics || false;
    prefix = prefix || italics ? "+" : "±";
    color = color || "red";

    this.name = name;
    this.prefix = prefix;
    this.color = color;
    this.italics = italics;
};

Bot.prototype.sendAll = function (message, channel) {
    var italics = ["", ""];
    if (this.italics) {
        italics = ["<i>", "</i>"];
    }

    var message_format = "<font color='" + this.color + "'><timestamp/>" + this.prefix + "<b>" + italics[0] + this.name + ":" + italics[1] + "</b></font> " + message;

    if (channel === undefined) {
        sys.sendHtmlAll(message_format);
        return;
    }

    sys.sendHtmlAll(message_format, channel);
};

Bot.prototype.sendMessage = function (player, message, channel) {
    var italics = ["", ""];
    if (this.italics) {
        italics = ["<i>", "</i>"];
    }

    var message_format = "<font color='" + this.color + "'><timestamp/>" + this.prefix + "<b>" + italics[0] + this.name + ":" + italics[1] + "</b></font> " + message;

    if (channel === undefined) {
        sys.sendHtmlMessage(player, message_format);
        return;
    }

    sys.sendHtmlMessage(player, message_format, channel);
};

module.exports.Bot = Bot;