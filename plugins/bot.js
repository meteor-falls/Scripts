/*jslint continue: true, es5: true, evil: true, forin: true, sloppy: true, vars: true, regexp: true, newcap: true*/
/*global sys, SESSION, script: true, Qt, print, gc, version,
    global: false, Plugin: true, Config: true, module: true, exports: true*/

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
    if (!italics) {
        italics = false;
    }
    if (prefix == undefined) {
        prefix = italics ? "+" : "±";
    }
    if (!color) {
        color = "red";
    }

    this.name = name;
    this.prefix = prefix;
    this.color = color;
    this.italics = italics;
}

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
}

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
}

module.exports['Bot'] = Bot;