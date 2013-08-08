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