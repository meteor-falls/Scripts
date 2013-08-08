/* Meteor Falls Version 0.3 Scripts.
By: HHT, TheUnknownOne, Ethan
Credit to: Max, Lutra
*/
/* Documentation for class Reg:
   - Everything is stored in the file Reg.json
   
   Reg.save (key, value):
   Creates/overwrites key with value.
   Example: Reg.save("Server_Name", "Hello");
   
   Reg.init (key, value):
   Creates key with value (no overwrite).
   Example: Reg.init("Script_Loaded", true);
   
   Reg.get (key):
   Gets data associated with key. Can be undefined (if the key doesn't exist)
   Example: Reg.get("Server_Name");
   
   Reg.remove (key):
   Removes key.
   Example: Reg.remove("Server_Name");
   
   Reg.removeIf (function): [ADVANCED]
   Removes all keys which the function returns true on. Function passed gets two parameters. 
   First is the data associated with the current key, second is the name of the key.
   Example: Reg.removeIf(function (key_data, key_name) {
   if (key_name.indexOf("AutoIdle") != -1) {
   return true;
   }
   
   return false;
   });
   
   Reg.removeIfValue (key, value):
   Removes key if the data associated with it is value.
   Example: Reg.removeIfValue("Server_Name", "Hello");

   Reg.saveData ():
   Saves all data stored to Reg.json. All functions do this automaticly, so no need to use this.
   Example: Reg.saveData();

   Reg.clearAll ():
   Removes ALL data stored and clears Reg.json. Useful if you made a huge mistake or change that requires it to be flushed.
   Example: Reg.clearAll();   
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
/* Documentation for prototype CommandList:
   Create a command list. Example:
   
   var User = new CommandList("title commands", "blue");
   User.add("cmd1", "desc for cmd1");
   etc.
   User.finish();
   Lists.User = User;
   
   To display, use: 
   Lists.User.display(src, chan);
   
   Function documentation:
   new CommandList (title, bordercolor, help, list_type):
   Creates a command list with title, title. The borders will be colored with bordercolor.
   Help is the help message (default is "Type the following in the main chat in order to use them:")
   list_type should be "ul" (unordered list) or "ol" (ordered list). Default is ul.
   Example: var User = new CommandList("User Commands", "red", "This is the list of user commands:", "ol");
   
   CommandList.add (command, description):
   Adds command with description to the command list.
   description is useless if the title of the list did not contain "Commands" (for rules and other lists.)
   Example: User.add("cmd1", "desc for cmd1");
   
   CommandList.finish ():
   Needs to be called to finish the command list (adds final border).
   Example: User.finish();
   
   CommandList.display (player, channel):
   Displays the command list to id player in channel channel.
   Example: User.display(1, 0);
   
   Note: Can also be used for rules and other lists.
*/
var Config = {
	// Configuration for the script. Edit as you please.
	repourl: "https://raw.github.com/meteor-falls/Scripts/master/plugins/", // Repo to load plugins from.
	plugindir: "scripts/", // Plugin directory.
	serverowner: "HHT", // The server owner.
	evalperms: ['hht', 'ethan'], // People who can use eval.
	updateperms: ['hht', 'ethan', 'ian', 'theunknownone'], // People who can update scripts/tiers.
	
	// Do not touch unless you are adding a new plugin.
	plugins: ['init.js', 'commands.js', 'lists.js', 'bot.js', 'reg.js'] // Plugins to load on script load.
};

function PluginHandler(dir) {
	this.dir = dir;
	if (sys.filesForDirectory(this.dir) == undefined) {
		sys.makeDir(dir);
	}
	this.plugins = {};
}
PluginHandler.prototype.load = function(plugin_name, webcall) {
	var fileContent;
	if (webcall) {
		var resp = sys.synchronousWebCall(Config.repourl+plugin_name);
		fileContent = resp;
		sys.writeToFile(this.dir+plugin_name, fileContent);
	} else {
		fileContent = sys.getFileContent(this.dir+plugin_name);
	}
	if (fileContent == undefined) return false;
	var module = {exports:{}};
	try {
		eval(fileContent);
	} catch(e) {
		sys.sendAll("Error loading plugin "+plugin_name+": "+e+" on line "+e.lineNumber);
		return false;
	}
	this.plugins[plugin_name] = module.exports;
	return module.exports;
}
PluginHandler.prototype.unload = function(plugin_name) {
	if (!this.plugins.hasOwnProperty(plugin_name)) return false;
	delete this.plugins[plugin_name];
	return true;
}
PluginHandler.prototype.callplugins = function(event) {
	var args = Array.prototype.slice.call(arguments, 1);
	var ret = true;
	for (var plugin in plugins) {
		if (plugins[plugin].hasOwnProperty(event)) {
			try {
				if (plugins[plugin][event].apply(plugins[plugin], args)) ret = false;
			} catch(e) {
				;
			}
		}
	}
	return ret;
}
var PHandler = new PluginHandler(Config.plugindir);
for (var i = 0; i < Config.plugins.length; i++) {
	PHandler.load(Config.plugins[i], true);
}
function Plugins(plugin_name) {
	if (!PHandler.plugins.hasOwnProperty(plugin_name)) return null;
	return PHandler.plugins[plugin_name];
}

var global = this;

function poUser(id) {
	this.id = id;
	this.ip = sys.ip(id);
	this.floodCount = 0;
	this.caps = 0;
	this.muted = false;

	this.originalName = "";
	this.megauser = false;
}

SESSION.identifyScriptAs("MF Script 0.3 Beta");
SESSION.registerUserFactory(poUser);

({
	serverStartUp: function () {
		script.init();
	},
	init: function () {
		Plugins('init.js')['init']();
	},
	afterNewMessage: function (message) {
		if (message.substr(0, 33) == "The name of the server changed to") {
			servername = message.substring(34, message.lastIndexOf("."));
			return;
		}
		if (message == "Script Check: OK") {
			sys.sendHtmlAll("<b><i><font color=Blue><font size=4>+ScriptBot:</font></b><b><i><font color=Black><font size=4> Server Owner " + Config.serverowner + " has updated the scripts!</font></b></i>");
			script.init();
			return;
		}
	},

	beforeChannelJoin: function (src, channel) {
		var user = SESSION.users(src);
		if (channel == staffchannel && !user.megauser && getAuth(src) < 1 || channel == watch && getAuth(src) < 1) {
			guard.sendMessage(src, "HEY! GET AWAY FROM THERE!", 0);
			watchbot.sendAll(sys.name(src) + "(IP: " + sys.ip(src) + ") tried to join " + sys.channel(channel) + "!", watch);
			sys.stopEvent();
			return;
		}
		if (channel !== android && sys.os(src) == "android") {
			guard.sendMessage(src, "Sorry, you cannot go to a channel other than Android Channel.", android);
			watchbot.sendAll(sys.name(src) + "(IP: " + sys.ip(src) + ") tried to join " + sys.channel(channel) + " with an android phone!", watch);
			sys.stopEvent();
		}
	},

	beforeChannelDestroyed: function (channel) {
		if (channel == staffchannel || channel == league || channel == watch || channel == android) {
			sys.stopEvent();
			return;
		}
		var cname = sys.channel(channel);
		ChannelNames.splice(ChannelNames.indexOf(cname), 1);
	},
	
	megauserCheck: function (src) {
		SESSION.users(src).megauser = sys.name(src).toLowerCase() in MegaUsers;
	},

	afterChannelCreated: function (chan, name, src) {
		ChannelNames.push(name);
	},

	afterChannelJoin: function (src, chan) {
		var channelToLower = sys.channel(chan).toLowerCase();
		var topic = (Channeltopics[channelToLower] !== undefined) ? Channeltopics[channelToLower] : "No channel topic has been set.";
		if (chan !== 0 && chan !== android) {
			topicbot.sendMessage(src, topic.topic, chan);
		}
		if (chan == android) {
			topicbot.sendMessage(src, "This is the Android user channel. Feel free to chat and battle with other android users. Click <a href='http://code.google.com/p/pokemon-online-android/wiki/TeamLoadTutorial'>here</a> to learn how to import a team.", chan);
		}
		if (chan != 0 && chan !== android) {
			watchbot.sendAll(sys.name(src) + "(IP: " + sys.ip(src) + ") has joined " + sys.channel(chan) + "!", watch);
		}
	},

	beforeLogIn: function (src) {
		// RangeBans - In Order: HotSpot Shield, Anime Oblivion Advertisers, Swizz, EDOGAWD, Swizz again, Moonlight //
		if (sys.ip(src).substr(0, 6) == "74.115" || sys.ip(src).substr(0, 4) == "151." || sys.ip(src).substr(0, 6) == "74.177" || sys.ip(src).substr(0, 7) == "197.216" || sys.ip(src).substr(0, 6) == "78.129" || sys.ip(src).substr(0, 7) == "174.14174.141") {
			watchbot.sendAll("A noob who was rangebanned tried to log in and got kicked! (IP: " + sys.ip(src) + ")", watch);
			sys.kick(src);
			return;
		}
		var srcip = sys.ip(src);
		if (reconnectTrolls[srcip] != undefined) {
			sys.stopEvent();
			return;
		}

		pruneTempbans();

		var poUser = SESSION.users(src),
			cu_rb, t_n = sys.time() * 1;
		if (typeof Tempbans[srcip] !== "undefined") {
			if (sys.auth(src) > 2) return;
			poUser.autokick = true;
			bot.sendMessage(src, "You are tempbanned! Remaining time: " + getTimeString(Tempbans[srcip].time - t_n), 0);
			sys.stopEvent();
			watchbot.sendAll("Tempbanned IP [" + sys.ip(src) + "] tried to log in.", watch);
			return;
		}

		for (var x in Rangebans) {
			if (x == srcip.substr(0, x.length)) {
				if (sys.auth(src) > 2) return;
				poUser.autokick = true;
				bot.sendMessage(src, "You are rangebanned!", 0);
				//bot.sendMessage(src, "You are rangebanned! Remaining time: " + getTimeString(Tempbans[srcip].time - t_n), 0);
				sys.stopEvent();
				watchbot.sendAll("Rangebanned IP [" + sys.ip(src) + "] tried to log in.", watch);
			}
		}

		if (sys.name(src) == "HHT" || sys.name(src) == "Warm Fusion") {
			var ip = sys.ip(src);
			var sip = ip.substr(0, 9);
			if (sip != "74.77.226" && ip != "127.0.0.1") {
				sys.stopEvent();
				poUser.autokick = true;
			}
		}
        
        if (sys.os(src) === "android") {
            sys.kick(src, 0);
            sys.putInChannel(src, android);
			watchbot.sendAll("Android user, " + sys.name(src) + ", was kicked out of " + sys.channel(0) + " and placed in the Android Channel.", watch);
        }
	},
	afterLogIn: function (src) {
		var poUser = SESSION.users(src),
			myName = sys.name(src),
			ip = sys.ip(src),
			myAuth = getAuth(src),
            numPlayers = sys.numPlayers(),
            newRecord = false;

		poUser.originalName = sys.name(src);

		if (Autoidle[myName.toLowerCase()] != undefined) {
			sys.changeAway(src, true);
		}

		if (myAuth > 0) {
			sys.putInChannel(src, watch);
			sys.putInChannel(src, staffchannel);
		}
		
        //if (!uniqueVisitors.ips[ip]) {
            //uniqueVisitors.count += 1;
            //uniqueVisitors.ips[ip] = uniqueVisitors.count;
        //}
        
        //uniqueVisitors.total += 1;
    
        if (numPlayers > Reg.get("maxPlayersOnline")) {
            Reg.save("maxPlayersOnline", numPlayers);
            newRecord = true;
        }
        
        function displayBot(name, message, color) {
            sys.sendHtmlMessage(src, "<font color='" + color + "'><timestamp/> ±<b>" + name + ":</b></font> " + message, 0);
        }
        
        displayBot("ServerBot", "Hey, <b><font color='" + namecolor(src) + "'>" + sys.name(src) + "</font></b>!", "purple");
        displayBot("CommandBot", "Type <b>/commands</b> for a list of commands, <b>/rules</b> for a list of rules, and <b>/league</b> for the league.", "green");
        displayBot("ForumBot", "Get in touch with the community by joining the <b><a href='http://meteorfalls.icyboards.net/'>Meteor Falls Forums</a></b>!", "blue");
        displayBot("StatsBot", "There are <b>" + numPlayers + "</b> players online. You are the <b>" + nthNumber(src) + "</b> player to join. At most, there were <b>" + Reg.get("maxPlayersOnline") + "</b> players online" + (newRecord ? " (new record!)" : "") + ".", "goldenrod");
        
		var MOTD = Reg.get("MOTD");
		if (MOTD !== "") {
            displayBot("Message of the Day", MOTD, "red");
		}

        sys.sendMessage(src, '');
		if (sys.numPlayers() < 30 && sys.os(src) != "android" && Welmsgs[sys.name(src).toLowerCase()] == undefined) {
			loginMessage(sys.name(src), namecolor(src));
		}
        
		if (Welmsgs[sys.name(src).toLowerCase()] != undefined) {
			var theirmessage = Welmsgs[sys.name(src).toLowerCase()];
            var msg = (theirmessage !== undefined) ? theirmessage.message : loginMessage(sys.name(src), namecolor(src));
            if (theirmessage != undefined) { 
                msg = msg.replace(/{server}/gi, Reg.get("servername"));
                msg = emoteFormat(msg);
            }
            sys.sendHtmlAll(msg, 0);
        }
			
		pruneMutes();
		if (Mutes[ip] != undefined) {
			var myMute = Mutes[ip],
				muteStr = myMute.time != 0 ? getTimeString(myMute.time - sys.time() * 1) : "forever";
			poUser.muted = true;
			bot.sendMessage(src, "You are muted for " + muteStr + ". By: " + myMute.by + ". Reason: " + myMute.reason, 0);
		}
		
		var drizzleSwim = hasDrizzleSwim(src);
		if (drizzleSwim !== false) {
			bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.");
			sys.changeTier(src, drizzleSwim, "5th Gen Ubers");
		}

		script.megauserCheck(src);

		if (tourmode == 1) {
			sys.sendMessage(src, "", 0);
			sys.sendHtmlMessage(src, border, 0);
			sys.sendHtmlMessage(src, "<font color=blue><timestamp/><b>±±± A " + tourtier + " tournament is in signup phase, " + script.tourSpots() + " space(s) are left! ±±±</font></b><br><font color=red><timestamp/><b>Type <font color=black>/join</font> to join!</font></b>", 0);
			sys.sendHtmlMessage(src, border, 0);
			sys.sendMessage(src, "", 0);
		} else if (tourmode == 2) {
			sys.sendMessage(src, "", 0);
			sys.sendHtmlMessage(src, border, 0);
			sys.sendHtmlMessage(src, "<font color=blue><timestamp/><b>±±± A tournament (" + tourtier + ") is currently running. ±±±</font></b>", 0);
			sys.sendHtmlMessage(src, border, 0);
			sys.sendMessage(src, "", 0);
		}

		var tier = getTier(src, "5th Gen OU");
		if (tier) {
			script.dreamAbilityCheck(src);
		}
	},
	
	beforeChangeTier: function (src, oldtier, newtier) {
		var drizzleSwim = hasDrizzleSwim(src);
		if (drizzleSwim !== false) {
			bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.");
			sys.changeTier(src, drizzleSwim, "5th Gen Ubers");
			sys.stopEvent();
		}
		if (newtier == "5th Gen OU") {
			if (script.dreamAbilityCheck(src)) {
				sys.stopEvent();
			}
		}
	},
	
	beforeChangeTeam: function(src) {
		var drizzleSwim = hasDrizzleSwim(src);
		if (drizzleSwim !== false) {
			bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.");
			sys.changeTier(src, drizzleSwim, "5th Gen Ubers");
			sys.stopEvent();
		}
	},
	
	beforeChatMessage: function (src, message, chan) {
		if (getAuth(src) < 1 && message.length > 600) {
			sys.stopEvent();
			bot.sendMessage(src, "Sorry, your message has exceeded the 600 character limit.",chan);
			watchbot.sendAll(" User, "+sys.name(src)+", has tried to post a message that exceeds the 600 character limit. Take action if need be. <ping/>",watch);
			return;
		}
		if (message == "<3") {
			sys.stopEvent();
			sys.sendAll(sys.name(src)+": <3",chan);
			watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);
			return;
		}
		if (message == ">_<") {
			sys.stopEvent();
			sys.sendAll(sys.name(src) + ": >_<", chan);
			watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);
			return;
		}
		
		var poUser = SESSION.users(src),
			isMuted = poUser.muted,
			originalName = poUser.originalName,
			isLManager = Leaguemanager == originalName.toLowerCase(),
			myAuth = getAuth(src);
			
		if (hasIllegalChars(message)) {
			bot.sendMessage(src, 'WHY DID YOU TRY TO POST THAT, YOU NOOB?!', chan)
			watchbot.sendAll(html_escape(sys.name(src)) + ' TRIED TO POST A BAD CODE! KILL IT! <ping/>', watch);
			sys.stopEvent();
			script.afterChatMessage(src, message, chan);
			return;
		}
		
		if (myAuth < 2 && isMuted) {
			pruneMutes();
			if (Mutes[sys.ip(src)] == undefined) {
				poUser.muted = false;
			} else {
				sys.stopEvent();
				var myMute = Mutes[sys.ip(src)],
					muteStr = myMute.time != 0 ? getTimeString(myMute.time - sys.time() * 1) : "forever";
				bot.sendMessage(src, "Shut up! You are muted for " + muteStr + "! By: " + myMute.by + ". Reason: " + myMute.reason, chan);
				watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Muted Message -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);
				script.afterChatMessage(src, message, chan);
				return;
			}
		}

		if (myAuth < 1 && muteall) {
			sys.stopEvent();
			bot.sendMessage(src, "Shut up! Silence is on!", chan);
			watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Silence Message -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);
			script.afterChatMessage(src, message, chan);
			return;
		}
		if (myAuth < 2 && supersilence) {
			sys.stopEvent();
			bot.sendMessage(src, "Shut up! Super Silence is on!", chan);
			watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Silence Message -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);
			script.afterChatMessage(src, message, chan);
			return;
		}

		if ((message[0] == '/' || message[0] == '!') && message.length > 1) {
			print("[#" + sys.channel(chan) + "] Command -- " + sys.name(src) + ": " + message);
			sys.stopEvent();
			var command;
			var commandData;
			var pos = message.indexOf(' ');
			if (pos != -1) {
				command = message.substring(1, pos).toLowerCase();
				commandData = message.substr(pos + 1);
			} else {
				command = message.substr(1).toLowerCase();
			}
			var tar = sys.id(commandData);
			
			if (myAuth >= 3) {
				if (command == "updateplugin") {
					if (commandData == undefined) {
						bot.sendMessage(src, "Specify a plugin!", chan);
						return;
					}
					bot.sendMessage(src, "Updating plugin "+commandData+"...", chan);
					if (PHandler.load(commandData, true)) {
						bot.sendMessage(src, "Plugin "+commandData+" updated successfully!", chan);
					} else {
						bot.sendMessage(src, "Failure updating plugin "+commandData, chan);
					}
					return;
				}
				if (command == "removeplugin") {
					if (commandData == undefined) {
						bot.sendMessage(src, "Specify a plugin!", chan);
						return;
					}
					if (PHandler.unload(commandData)) {
						bot.sendMessage(src, "Plugin "+commandData+" removed successfully!", chan);
					} else {
						bot.sendMessage(src, "Plugin "+commandData+" doesn't exist.", chan);
					}
					return;
				}
			}
			
			Plugins('commands.js').handle(src, message, command, commandData, tar, chan);
			return;
		}

		// if ((markdownson && sys.auth(src) < 1) || sys.auth(src) > 0) {
		var oldmessage = message;

		var emotes = false,
			oldEmoteMsg;
		if (myAuth > 0) {
			var msg = format(src, html_escape(message).replace(/&lt;_&lt;/g, "<_<").replace(/&gt;_&gt;/g, ">_>").replace(/&gt;_&lt;/g, ">_<"));
			if (!htmlchatoff && sys.auth(src) == 3) {
				msg = format(src, message);
			}

			message = msg;
			oldEmoteMsg = msg;
			message = msg;

			if (oldEmoteMsg != message) {
				emotes = true;
			}
		} else {
			message = format(src, html_escape(message));
		}

		if (!emotes) {
			if (lolmode) {
				message = lolmessage(message);
			}

			if (spacemode) {
				message = message.split("").join(" ");
			}

			if (capsmode) {
				message = message.toUpperCase();
			}

			if (reversemode) {
				message = message.split("").reverse().join("");
			}

			if (scramblemode) {
				message = message.scramble();
			}

			if (colormode) {
				message = colormodemessage(message);
			}
		}

		var sendStr = "<font color=" + namecolor(src) + "><timestamp/><b>" + html_escape(sys.name(src)) + ": </b></font>" + (hasEmotesToggled(src) ? emoteFormat(message) : message);
		if (sys.auth(src) > 0 && sys.auth(src) < 4) {
			sendStr = "<font color=" + namecolor(src) + "><timestamp/>+<i><b>" + html_escape(sys.name(src)) + ": </b></i></font>" + (hasEmotesToggled(src) ? emoteFormat(message) : message);
		}
		if (pewpewpew) {
			sendStr = pewpewpewmessage(message);
		}

		sys.stopEvent();

		sys.sendHtmlAll(sendStr, chan);

		watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + html_escape(sys.name(src)) + ": " + html_escape(oldmessage), watch);

		script.afterChatMessage(src, oldmessage, chan);
	},
	beforeLogOut: function (src) {
		lastToLogout = {
			'name': sys.name(src),
			'color': namecolor(src)
		}
	},
	afterLogOut: function (src) {
		var user = SESSION.users(src);
		var shown = true;
		if (lastToLogout.name === undefined || lastToLogout.color === undefined || typeof lastToLogout != 'object') shown = false;
		 if (sys.numPlayers() < 30 && shown && !user.autokick && sys.os(src) != "android") {
			logoutMessage(html_escape(lastToLogout.name), lastToLogout.color);
		}
		/* Due to some glitch with v2, we send the message in afterLogOut (beforeLogOut has a problem...) */
	},
	afterChangeTeam: function (src) {
		var myUser = SESSION.users(src);
		sys.callQuickly("SESSION.users(" + src + ").originalName = sys.name(" + src + ");", 10);
		script.megauserCheck(src);
		if (typeof myUser.teamChanges == 'undefined') {
			myUser.teamChanges = 0;
		}

		myUser.teamChanges++;

		var teamChanges = myUser.teamChanges;
		var ip = sys.ip(src);

		if (teamSpammers == undefined) {
			teamSpammers = {};
		}

		if (teamChanges > 2) {
			if (typeof teamSpammers[ip] == "undefined") {
				teamSpammers[ip] = 0;
				sys.callLater("if(typeof teamSpammers['" + ip + "'] != 'undefined') teamSpammers['" + ip + "']--; ", 60 * 3);
			} else if (teamSpammers[ip] == 0) {
				teamSpammers[ip] = 1;
				watchbot.sendAll("Alert: Possible spammer, ip " + ip + ", name " + html_escape(sys.name(src)) + ". Kicked for now.", watch);
				kick(src);
				sys.callLater("if(typeof teamSpammers['" + ip + "'] != 'undefined') teamSpammers['" + ip + "']--; ", 60 * 5);
				return;
			} else {
				watchbot.sendAll("Spammer: ip " + ip + ", name " + html_escape(sys.name(src)) + ". Banning.", watch);
				ban(sys.name(src));
				delete teamSpammers[ip];
				return;
			}
		}

		sys.callLater("if(SESSION.users(" + src + ") != undefined) SESSION.users(" + src + ").teamChanges--;", 5);

		watchbot.sendAll(sys.name(src) + " changed teams.", watch);
	},
	beforePlayerKick: function (src, bpl) {
		sys.stopEvent();
		if (getAuth(bpl) >= getAuth(src)) {
			bot.sendMessage(src, "You may not kick this person!");
			return;
		} else {
			watchbot.sendAll(sys.name(src) + " kicked " + html_escape(sys.name(bpl)) + " (IP: " + sys.ip(bpl) + ")", watch);
			var theirmessage = Kickmsgs[sys.name(src).toLowerCase()];
			var msg = (theirmessage !== undefined) ? theirmessage.message : "<font color=navy><timestamp/><b>" + sys.name(src) + " kicked " + html_escape(sys.name(bpl)) + "!</font></b>";
			if (theirmessage != undefined) msg = msg.replace(/{target}/, sys.name(bpl));
			sys.sendHtmlAll(msg);
			kick(bpl);
		}
	},

	beforePlayerBan: function (src, bpl) {
		sys.stopEvent();
		if (getAuth(bpl) >= getAuth(src)) {
			bot.sendMessage(src, "You may not ban this person!");
			return;
		}
		watchbot.sendAll(sys.name(src) + " banned " + html_escape(sys.name(bpl)) + " (IP: " + sys.ip(bpl) + ")", watch);
		var theirmessage = Banmsgs[sys.name(src).toLowerCase()];
		var msg = (theirmessage !== undefined) ? theirmessage.message : "<font color=blue><timestamp/><b>" + sys.name(src) + " banned " + html_escape(sys.name(bpl)) + "!</font></b>";
		if (theirmessage != undefined) msg = msg.replace(/{target}/, sys.name(bpl));
		sys.sendHtmlAll(msg);
		ban(sys.name(bpl));
	},

	beforeChallengeIssued: function (src, dest) {
		var tier = getTier(src, "Dream World");
		if (tier) {
			if (script.dreamAbilityCheck(src) || script.dreamAbilityCheck(dest)) {
				sys.stopEvent();
			}
		}
		if (tourmode == 2) {
			var name1 = sys.name(src);
			var name2 = sys.name(dest);
			if (script.isInTourney(name1)) {
				if (script.isInTourney(name2)) {
					if (script.tourOpponent(name1) != name2.toLowerCase()) {
						bot.sendMessage(src, "This guy isn't your opponent in the tourney.");
						sys.stopEvent();
						return;
					}
				} else {
					bot.sendMessage(src, "This guy isn't your opponent in the tourney.");
					sys.stopEvent();
					return;
				}
				if (!getTier(src, tourtier) || !getTier(sys.id(name2), tourtier)) {
					bot.sendMessage(src, "You must be both in the tier " + tourtier + " to battle in the tourney.");
					sys.stopEvent();
					return;
				}
			} else {
				if (script.isInTourney(name2)) {
					bot.sendMessage(src, "This guy is in the tournament and you are not, so you can't battle him/her.");
					sys.stopEvent();
					return;
				}
			}
		}
	},

	afterPlayerAway: function (src, mode) {
		var m = mode == 1 ? "idled" : "unidled and is ready to battle"
		watchbot.sendAll(sys.name(src) + " has " + m + ".", watch);
	},

	beforeBattleMatchup: function (src, dest) {
		var tier = getTier(src, tourtier),
			desttier = getTier(dest, tourtier);
		if (tier && desttier) {
			if (script.dreamAbilityCheck(src) || script.dreamAbilityCheck(dest)) {
				sys.stopEvent();
			}
		}
		if (tourmode == 2 && (script.isInTourney(sys.name(src)) || script.isInTourney(sys.name(dest)))) {
			sys.stopEvent();
			return;
		}
	},
	tourSpots: function () {
		return tournumber - tourmembers.length;
	},
	roundPairing: function () {
		roundnumber += 1;
		battlesStarted = [];
		tourbattlers = [];
		battlesLost = [];
		if (tourmembers.length == 1) {
			var chans = [0];
			for (x in chans) {
				var tchan = chans[x];
				sys.sendHtmlAll("<br/><center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>C</font>ongratulations, <i style='color:red; font-weight:bold;'>"+html_escape(tourplayers[tourmembers[0]])+"!</i></font><hr width=300/><br><b>You won the tournament! You win "+prize+"!</b><br/><br/></td></tr></table></center><br/>");
				/*sys.sendAll("", 0);
				sys.sendHtmlAll("<font color=blue><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»", 0);
				sys.sendHtmlAll("<font color=Green><timestamp/><b><font size=3>THE WINNER OF THE TOURNAMENT IS:</font></b><font color=black> " + html_escape(tourplayers[tourmembers[0]]), 0);
				sys.sendAll("", 0);
				sys.sendHtmlAll("<font color=red><timestamp/><b><font size=3>±±± Congratulations, " + tourplayers[tourmembers[0]] + ", you win " + prize + "! ±±±", 0);
				sys.sendHtmlAll("<font color=blue><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);*/
			}
			tourmode = 0;
			isFinals = false;
			return;
		}
		var str;
		var finals = tourmembers.length == 2;
		if (!finals) {
			str = "<br/><center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'>Round <i>1</i> of <i style='color:red; font-weight:bold;'>5th Gen OU</i> tournament!</font><hr width=300/><i>Current Matchups</i><br/><b>";
		} else {
			isFinals = true;
			str = "<br/><center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>F</font>inals of <i style='color:red; font-weight:bold;'>5th Gen OU</i> tournament!</font><hr width=300/><i>Matchup</i><br/><b>";
		}
		var i = 0;
		while (tourmembers.length >= 2) {
			i += 1;
			var x1 = sys.rand(0, tourmembers.length);
			tourbattlers.push(tourmembers[x1]);
			var name1 = tourplayers[tourmembers[x1]];
			tourmembers.splice(x1, 1);
			x1 = sys.rand(0, tourmembers.length);
			tourbattlers.push(tourmembers[x1]);
			var name2 = tourplayers[tourmembers[x1]];
			tourmembers.splice(x1, 1);
			battlesStarted.push(false);
			str += html_escape(script.padd(name1))+" vs "+html_escape(script.padd(name2))+"<br/>";
			/*if (!finals) sys.sendHtmlAll("<font color=black><timestamp/><b><font size=3> " + html_escape(script.padd(name1)) + " VS " + html_escape(name2), 0);
			else {
				sys.sendHtmlAll("<font color=Black><timestamp/><b><font size=3> " + html_escape(script.padd(name1)) + " VS " + html_escape(name2), 0);
			}*/
		}
		if (tourmembers.length > 0) {
			//sys.sendAll("", 0);
			str += "</b><br/><i>"+html_escape(tourplayers[tourmembers[0]])+" is randomly selected to go next round!<br/>";
			//sys.sendHtmlAll("<font color=Blue><timestamp/><b><font size=3>±±± " + html_escape(tourplayers[tourmembers[0]]) + " is randomly selected to go to next round! ±±±", 0);
		}
		str += "<br/></td></tr></table></center><br/>";
		sys.sendHtmlAll(str, 0);
		if (finals) {}
	},
	padd: function (name) {
		return name;
	},
	isInTourney: function (name) {
		var name2 = name.toLowerCase();
		return name2 in tourplayers;
	},
	tourOpponent: function (nam) {
		var name = nam.toLowerCase();
		var x = tourbattlers.indexOf(name);
		if (x != -1) {
			if (x % 2 == 0) {
				return tourbattlers[x + 1];
			} else {
				return tourbattlers[x - 1];
			}
		}
		return "";
	},
	isLCaps: function (letter) {
		return letter >= 'A' && letter <= 'Z';
	},
	areOpponentsForTourBattle: function (src, dest) {
		return script.isInTourney(sys.name(src)) && script.isInTourney(sys.name(dest)) && script.tourOpponent(sys.name(src)) == sys.name(dest).toLowerCase();
	},
	areOpponentsForTourBattle2: function (src, dest) {
		return script.isInTourney(src) && script.isInTourney(dest) && script.tourOpponent(src) == dest.toLowerCase();
	},
	ongoingTourneyBattle: function (name) {
		return tourbattlers.indexOf(name.toLowerCase()) != -1 && battlesStarted[Math.floor(tourbattlers.indexOf(name.toLowerCase()) / 2)] == true;
	},
	afterBattleStarted: function (src, dest, info, id, t1, t2) {
		if (tourmode == 2) {
			if (script.areOpponentsForTourBattle(src, dest)) {
				if (getTier(src, tourtier) && getTier(dest, tourtier)) battlesStarted[Math.floor(tourbattlers.indexOf(sys.name(src).toLowerCase()) / 2)] = true;
			}
		}
	},
	afterBattleEnded: function (src, dest, desc) {
		if (tourmode != 2 || desc == "tie") {
			return;
		}

		script.tourBattleEnd(sys.name(src), sys.name(dest));
	},
	afterChatMessage: function (src, message, chan) {
		if (!bots) return;
		var srcip = sys.ip(src);
		var poUser = SESSION.users(src),
			ignoreFlood = floodIgnoreCheck(src),
			auth = getAuth(src);
		if (auth < 1 && !ignoreFlood) {
			if (poUser.floodCount < 0 || isNaN(poUser.floodCount)) {
				poUser.floodCount = 0;
			}
			time = sys.time() * 1;
			poUser.floodCount += 1;
			sys.callLater("if (SESSION.users(" + src + ") !== undefined) { SESSION.users(" + src + ").floodCount--;  };", 8);
			if (poUser.floodCount > 5 && poUser.muted == false) {
				flbot.sendAll(sys.name(src) + " was kicked and muted for flooding.", 0);
				poUser.muted = true;
				Mutes[srcip] = {
					"by": flbot.name,
					"mutedname": sys.name(src),
					"reason": "Flooding.",
					"time": time + 300
					}
				kick(src, true); /* sys.kick instead of qC */
				return;
			}
		}
		var channel = chan,
			time = sys.time() * 1;
		if (script.isMCaps(message) && auth < 1 && !ignoreFlood) {
			poUser.caps += 1;
			if (poUser.caps >= 5 && poUser.muted == false) {
				if (Capsignore[sys.name(src).toLowerCase()] !== undefined) return;
				capsbot.sendAll(sys.name(src) + " was muted for 5 minutes for CAPS.", 0);
				poUser.muted = true;
				Mutes[srcip] = {
					"by": capsbot.name,
					"mutedname": sys.name(src),
					"reason": "Caps.",
					"time": time + 300
				}
				return;
			}
		} else if (poUser.caps > 0) {
			poUser.caps -= 1;
		}
	},
	isMCaps: function (message) {
		var count = 0;
		var i = 0;
		while (i < message.length) {
			c = message[i];
			if (script.isLCaps(c)) {
				count += 1;
				if (count == 5) {
					return true;
				}
			} else {
				count -= 2;
				if (count < 0) {
					count = 0;
				}
			}
			i += 1;
		}
		return false;
	},
	tourBattleEnd: function (src, dest) {
		if (!script.areOpponentsForTourBattle2(src, dest) || !script.ongoingTourneyBattle(src)) return;
		battlesLost.push(src);
		battlesLost.push(dest);
		var srcL = src.toLowerCase();
		var destL = dest.toLowerCase();
		battlesStarted.splice(Math.floor(tourbattlers.indexOf(srcL) / 2), 1);
		tourbattlers.splice(tourbattlers.indexOf(srcL), 1);
		tourbattlers.splice(tourbattlers.indexOf(destL), 1);
		tourmembers.push(srcL);
		delete tourplayers[destL];
		if (tourbattlers.length != 0 || tourmembers.length > 1) {
			sys.sendAll("", 0);
			sys.sendHtmlAll("<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
			sys.sendHtmlAll("<font color=Blue><timestamp/><b><font size=3>+WinBot:</font></b><font color=black> " + html_escape(src) + " won their battle and advance to the next round.", 0);
			sys.sendHtmlAll("<font color=Purple><timestamp/><b><font size=3>+LoseBot:</font></b><font color=black>  " + html_escape(dest) + " lost their battle and is out of the tournament.", 0);
		}
		if (tourbattlers.length > 0) {
			sys.sendAll("", 0);
			sys.sendHtmlAll("<font color=Black><timestamp/><b><font size=3>±±± " + tourbattlers.length / 2 + " battle(s) remaining ±±±", 0);
			sys.sendHtmlAll("<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
			return;
		} else {
			sys.sendHtmlAll("<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</font>", 0);
			sys.sendAll("", 0);
		}
		script.roundPairing();
	},
	dreamAbilityCheck: function (src) {
		var bannedAbilities = {
			'chandelure': ['shadow tag']
		};
		for (var i = 0; i < 6; ++i) {
			var ability = sys.ability(sys.teamPokeAbility(src, i, i));
			var lability = ability.toLowerCase();
			var poke = sys.pokemon(sys.teamPoke(src, i, i));
			var lpoke = poke.toLowerCase();
			if (lpoke in bannedAbilities && bannedAbilities[lpoke].indexOf(lability) != -1) {
				bot.sendMessage(src, poke + " is not allowed to have ability " + ability + " in 5th Gen x Tier. Please change it in Teambuilder. You are now in the Random Battle tier.")
				return true;
			}
		}

		return false;
	},

	loadRegHelper: function (reloadAnyway) {
		if (typeof Reg !== "undefined" && reloadAnyway == null) {
			return;
		}

		Reg = Plugins('reg.js')['Reg']();
	},

	loadBots: function () { /* Do not touch this section if you don't know what you are doing! */
		var Bot = Plugins('bot.js')['Bot'];
	
		/* END */

		bot = new Bot("Bot", "blue");
		guard = new Bot("Guard", "darkred");
		watchbot = new Bot("Watch", "green");
		topicbot = new Bot("Channel Topic", "red", "");
		capsbot = new Bot("CAPSBot", "mediumseagreen");
		flbot = new Bot("FloodBot", "mediumseagreen");
	},

	loadCommandLists: function () {
		Lists = Plugins('lists.js').lists(); /* Lists are stored in here. */
	}
})