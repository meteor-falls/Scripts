Bot = function (name, color, prefix, italics) {
    italics = italics || false;
    prefix = prefix || (italics ? "+" : "±");
    color = color || "red";

    this.name = name;
    this.prefix = prefix;
    this.color = color;
    this.italics = italics;
    this.italicsPart = italics ? ["<i>", "</i>"] : ["", ""];
};

Bot.prototype.markup = function (message) {
    return "<font color='" + this.color + "'><timestamp/>" + this.prefix + "<b>" + this.italicsPart[0] + this.name + ":" + this.italicsPart[1] + "</b></font> " + message;
};

Bot.prototype.sendAll = function (message, channel) {
    if (message === "") {
        sys.sendAll(message, channel);
        return;
    }

    var markup = this.markup(message);
    if (channel === undefined) {
        sys.sendHtmlAll(markup);
    } else {
        sys.sendHtmlAll(markup, channel);
    }
};

Bot.prototype.sendMessage = function (player, message, channel) {
    if (message === "") {
        sys.sendMessage(player, message, channel);
        return;
    }

    var markup = this.markup(message);
    if (channel === undefined) {
        sys.sendHtmlMessage(player, markup);
    } else {
        sys.sendHtmlMessage(player, markup, channel);
    }
};

Bot.prototype.line = function (src, channel) {
    if (channel !== undefined) {
        sys.sendMessage(src, "", channel);
    } else {
        sys.sendMessage(src, "");
    }
};

Bot.prototype.lineAll = function (channel) {
    if (channel !== undefined) {
        sys.sendAll("", channel);
    } else {
        sys.sendAll("");
    }
};

module.exports.Bot = Bot;
module.reload = function () {
    // These are all meant to be globals.
    bot      = new Bot("Bot", "#0a4aff");
    guard    = new Bot("Guard", "#a80000");
    watchbot = new Bot("Watch", "#00aa7f");
    topicbot = new Bot("Channel Topic", "#cc0000");
    setbybot = new Bot("Set By", "#ffaf1e");
    capsbot  = new Bot("CAPSBot", "#31945e");
    flbot    = new Bot("FloodBot", "#39ab5a");
    rtdbot   = new Bot("RTD", "#1c4eaa");

    // Then there are also lesser used bots, as static properties on Bot
    Bot.kick = new Bot("Kick", "#d6000f");
    Bot.mute = new Bot("Mute", "#5b1eff");
    Bot.unmute = new Bot("Unmute", "#089107");
    Bot.reason = new Bot("Reason", "#000ff4");
    return true;
};
