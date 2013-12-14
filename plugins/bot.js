Bot = function (name, color, prefix, italics) {
    italics = italics || false;
    prefix = prefix || (italics ? "+" : "±");
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

    if (message === "") {
        sys.sendAll(message, channel);
        return;
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
    
    if (message === "") {
        sys.sendMessage(player, message, channel);
        return;
    }
    
    var message_format = "<font color='" + this.color + "'><timestamp/>" + this.prefix + "<b>" + italics[0] + this.name + ":" + italics[1] + "</b></font> " + message;

    if (channel === undefined) {
        sys.sendHtmlMessage(player, message_format);
        return;
    }

    sys.sendHtmlMessage(player, message_format, channel);
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
module.exports.inject = function () {
    // These are all meant to be globals.
    bot      = new Bot("Bot", "#0a4aff");
    guard    = new Bot("Guard", "#a80000");
    watchbot = new Bot("Watch", "#00aa7f");
    topicbot = new Bot("Topic", "#cc0000");
    setbybot = new Bot("Set By", "#ffaf1e");
    capsbot  = new Bot("CAPSBot", "#31945e");
    flbot    = new Bot("FloodBot", "#39ab5a");
};