/* Meteor Falls Version 0.4 Scripts.
By: HHT, TheUnknownOne, Ethan
Credit to: Max, Lutra
*/
var Config = {
    // Configuration for the script. Edit as you please.
    repourl: "https://raw.github.com/meteor-falls/Scripts/master/plugins/", // Repo to load plugins from.
    dataurl: "https://raw.github.com/meteor-falls/Server-Shit/master/", // Repo to load data (announcement/description + tiers) from.
    
    plugindir: "scripts/", // Plugin directory.
    
    serverowner: "HHT", // The server owner.
    
    updateperms: ['hht', 'ethan', 'ian', 'theunknownone'], // People who can update scripts/tiers.
    itemperms: ['hht', 'ethan', 'theunknownone'], // People who can use /toggleitems [name]
    evalperms: ['hht', 'ethan'], // People who can use eval.

    // Do not touch unless you are adding a new plugin.
    plugins: ['jsession.js', 'init.js', 'emotes.js', 'commands.js', 'lists.js', 'bot.js', 'reg.js'], // Plugins to load on script load.
    
    load_from_web: true, // Whether or not to load plugins from repourl. If set to false, they will load locally.
    stripHtmlFromChannelMessages: true // If HTML should be stripped from channel messages outputted onto the server window.
};

if (typeof JSESSION === "undefined") {
    JSESSION = null;
}

function PluginHandler(dir) {
    this.dir = dir;
    if (sys.filesForDirectory(this.dir) == undefined) {
        sys.makeDir(this.dir);
    }
    this.plugins = {};
}
PluginHandler.prototype.load = function (plugin_name, webcall) {
    var fileContent;
    if (webcall) {
        sys.writeToFile(this.dir + plugin_name, sys.synchronousWebCall(Config.repourl + plugin_name));
    }
    fileContent = sys.getFileContent(this.dir + plugin_name);
    if (fileContent == undefined) return false;
    var module = {
        exports: {}
    };
    try {
        eval(fileContent);
    } catch (e) {
        sys.sendAll("Error loading plugin " + plugin_name + ": " + e + " on line " + e.lineNumber);
        return false;
    }
    this.plugins[plugin_name] = module.exports;
    return module.exports;
}
PluginHandler.prototype.unload = function (plugin_name) {
    if (!this.plugins.hasOwnProperty(plugin_name)) return false;
    delete this.plugins[plugin_name];
    return true;
}
PluginHandler.prototype.callplugins = function (event) {
    var args = Array.prototype.slice.call(arguments, 1);
    var ret = true;
    for (var plugin in plugins) {
        if (plugins[plugin].hasOwnProperty(event)) {
            try {
                if (plugins[plugin][event].apply(plugins[plugin], args)) ret = false;
            } catch (e) {;
            }
        }
    }
    return ret;
}
var PHandler = new PluginHandler(Config.plugindir);
for (var i = 0; i < Config.plugins.length; i++) {
    PHandler.load(Config.plugins[i], Config.load_from_web);
}

function Plugins(plugin_name) {
    if (!PHandler.plugins.hasOwnProperty(plugin_name)) return null;
    return PHandler.plugins[plugin_name];
}
function reloadPlugin(plugin_name) {
    if (plugin_name === "init.js") {
        script.init();
    } else if (plugin_name == "lists.js") {
        script.loadCommandLists();
    } else if (plugin_name == "bot.js") {
        script.loadBots();
    } else if (plugin_name == "reg.js") {
        script.loadRegHelper();
    } else if (plugin_name === "emotes.js") {
        Plugins('emotes.js')();
    }
}

var global = this;
var ignoreNextChanMsg = false,
    // Lookups are slow. Cache this as NewMessage is called many, many times.
    stripHtmlFromChannelMessages = Config.stripHtmlFromChannelMessages;

function poUser(id) {
    this.id = id;
    this.ip = sys.ip(id);
    this.floodCount = 0;
    this.caps = 0;
    this.muted = false;

    this.originalName = sys.name(id);
    this.megauser = false;
}

JSESSION.identifyScriptAs("MF Script 0.3 Beta");
JSESSION.registerUserFactory(poUser);
JSESSION.refill();

({
    serverStartUp: function () {
        script.init();
    },
    init: function () {
        Plugins('init.js')['init']();
        Plugins('emotes.js')();
    },
    beforeNewMessage: function (message) {
        if (ignoreNextChanMsg) {
            // Don't call sys.stopEvent here
            ignoreNextChanMsg = false;
            return;
        }
        
        // Strip HTML. :]
        if (stripHtmlFromChannelMessages && message.substring(0, 2) === "[#") {
            sys.stopEvent();
            ignoreNextChanMsg = true;
            print(html_strip(message));
            return;
        }
    },
    
    afterNewMessage: function (message) {
        if (message.substr(0, 33) == "The name of the server changed to") {
            servername = message.substring(34, message.lastIndexOf("."));
            return;
        }
        if (message == "Script Check: OK") {
            sys.sendHtmlAll("<b><i><font color=Blue><font size=4>±ScriptBot:</font></b><b><i><font color=Black><font size=4> Server Owner " + Config.serverowner + " has updated the scripts!</font></b></i>");
            script.init();
            return;
        }
    },

    beforeChannelJoin: function (src, channel) {
        var user = JSESSION.users(src);
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

        JSESSION.destroyChannel(channel);
    },

    megauserCheck: function (src) {
        JSESSION.users(src).megauser = sys.name(src).toLowerCase() in MegaUsers;
    },

    afterChannelCreated: function (chan, name, src) {
        ChannelNames.push(name);
        JSESSION.createChannel(chan);
    },

    afterChannelJoin: function (src, chan) {
        var channelToLower = sys.channel(chan).toLowerCase();
        var topic = (Channeltopics[channelToLower] !== undefined) ? Channeltopics[channelToLower] : "No channel topic has been set.";
        if (chan !== 0 && chan !== android) {
            topicbot.sendMessage(src, topic.topic, chan);
            setbybot.sendMessage(src, topic.by, chan);
        }
        if (chan == android) {
            topicbot.sendMessage(src, "This is the Android user channel. Feel free to chat and battle with other android users. Click <a href='http://code.google.com/p/pokemon-online-android/wiki/TeamLoadTutorial'>here</a> to learn how to import a team.", chan);
        }
        if (chan != 0 && chan !== android) {
            watchbot.sendAll(sys.name(src) + "(IP: " + sys.ip(src) + ") has joined " + sys.channel(chan) + "!", watch);
        }
    },

    beforeLogIn: function (src) {
        var srcip = sys.ip(src);
        if (reconnectTrolls[srcip] != undefined) {
            sys.stopEvent();
            return;
        }

        pruneTempbans();

        var poUser = JSESSION.users(src),
            cu_rb, t_n = sys.time() * 1;
            
        if (sys.auth(src) < 3) {
            if (typeof Tempbans[srcip] !== "undefined") {
                bot.sendMessage(src, "You are tempbanned! Remaining time: " + getTimeString(Tempbans[srcip].time - t_n), 0);
                sys.stopEvent();
                watchbot.sendAll("Tempbanned IP [" + sys.ip(src) + "] tried to log in.", watch);
                return;
            }
            for (var x in Rangebans) {
                if (x == srcip.substr(0, x.length)) {
                    sys.stopEvent();
                    watchbot.sendAll("Rangebanned IP [" + sys.ip(src) + "] tried to log in.", watch);
                    return;
                }
            }
        }

        if (sys.name(src) == "HHT") {
            var ip = sys.ip(src);
            var sip = ip.substr(0, 9);
            if (sip != "74.77.226" && ip != "127.0.0.1") {
                sys.stopEvent();
                return;
            }
        }

        if (sys.os(src) === "android") {
            sys.kick(src, 0);
            sys.putInChannel(src, android);
            watchbot.sendAll("Android user, " + sys.name(src) + ", was kicked out of " + sys.channel(0) + " and placed in the Android Channel.", watch);
        }

        JSESSION.createUser(src);
    },
    afterLogIn: function (src) {
        var poUser = JSESSION.users(src),
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
        if (drizzleSwim.length > 0) {
            for (var i = 0; i < drizzleSwim.length; i++) {
                bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.");
                sys.changeTier(src, drizzleSwim[i], "5th Gen Ubers");
            }
        }
        var sandCloak = hasSandCloak(src);
        if (sandCloak.length > 0) {
            for (var i = 0; i < sandCloak.length; i++) {
                bot.sendMessage(src, "Sorry, Sand Veil & Snow Cloak are only usable in 5th Gen Ubers.");
                sys.changeTier(src, sandCloak[i], "5th Gen Ubers");
            }
        }

        script.megauserCheck(src);

        if (tourmode == 1) {
            sys.sendHtmlMessage(src, "<br/><center><table width=30% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:11px; font-weight:bold;'>A <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament is in sign-up phase</font><hr width=200/><br><b><i style='color:red; font-weight:bold;'>" + script.tourSpots() + "</i> space(s) are remaining!<br><br>Type <i style='color:red; font-weight:bold;'>/join</i> to join!</b><br/><br/></td></tr></table></center><br/>", 0);
        } else if (tourmode == 2) {
            sys.sendHtmlMessage(src, "<br/><center><table width=35% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:11px; font-weight:bold;'>A <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament is currently running.</font><hr width=210/><br><b>Type <i style='color:red; font-weight:bold;'>/viewround</i> to check the status of the tournament!</b><br/><br/></td></tr></table></center><br/>", 0);
        }

        var tier = getTier(src, "5th Gen OU");
        if (tier) {
            script.dreamAbilityCheck(src);
        }
    },

    beforeChangeTier: function (src, oldtier, newtier) {
        var drizzleSwim = hasDrizzleSwim(src);
        if (drizzleSwim.length > 0) {
            for (var i = 0; i < drizzleSwim.length; i++) {
                bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.");
                sys.changeTier(src, drizzleSwim[i], "5th Gen Ubers");
                sys.stopEvent();
            }
        }
        var sandCloak = hasSandCloak(src);
        if (sandCloak.length > 0) {
            for (var i = 0; i < sandCloak.length; i++) {
                bot.sendMessage(src, "Sorry, Sand Veil & Snow Cloak are only usable in 5th Gen Ubers.");
                sys.changeTier(src, sandCloak[i], "5th Gen Ubers");
                sys.stopEvent();
            }
        }
        if (newtier == "5th Gen OU") {
            if (script.dreamAbilityCheck(src)) {
                sys.stopEvent();
            }
        }
    },

    beforeChangeTeam: function (src) {
        var drizzleSwim = hasDrizzleSwim(src);
        if (drizzleSwim.length > 0) {
            for (var i = 0; i < drizzleSwim.length; i++) {
                bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.");
                sys.changeTier(src, drizzleSwim[i], "5th Gen Ubers");
                sys.stopEvent();
            }
        }
        var sandCloak = hasSandCloak(src);
        if (sandCloak.length > 0) {
            for (var i = 0; i < sandCloak.length; i++) {
                bot.sendMessage(src, "Sorry, Sand Veil & Snow Cloak are only usable in 5th Gen Ubers.");
                sys.changeTier(src, sandCloak[i], "5th Gen Ubers");
                sys.stopEvent();
            }
        }
    },

    beforeChatMessage: function (src, message, chan) {
        if (getAuth(src) < 1 && message.length > 600) {
            sys.stopEvent();
            bot.sendMessage(src, "Sorry, your message has exceeded the 600 character limit.", chan);
            watchbot.sendAll(" User, " + sys.name(src) + ", has tried to post a message that exceeds the 600 character limit. Take action if need be. <ping/>", watch);
            return;
        }
        if (message == "<3") {
            sys.stopEvent();
            sys.sendAll(sys.name(src) + ": <3", chan);
            watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);
            return;
        }
        if (message == ">_<") {
            sys.stopEvent();
            sys.sendAll(sys.name(src) + ": >_<", chan);
            watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);
            return;
        }

        var poUser = JSESSION.users(src),
            isMuted = poUser.muted,
            originalName = poUser.originalName,
            isLManager = Leaguemanager == originalName.toLowerCase(),
            messageToLowerCase = message.toLowerCase(),
            myAuth = getAuth(src);

        if (originalName === "Ian" && (messageToLowerCase === "ok" || messageToLowerCase === "ok!")) {
            sys.stopEvent();
            sys.sendHtmlAll("<timestamp/> <b>Ian Check:</b> <font color='green'>OK!</font>", chan);
            return;
        }
        
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
            var command = "";
            var commandData = "";
            var pos = message.indexOf(' ');
            if (pos != -1) {
                command = message.substring(1, pos).toLowerCase();
                commandData = message.substr(pos + 1);
            } else {
                command = message.substr(1).toLowerCase();
            }
            var tar = sys.id(commandData);

            if (myAuth >= 3 || ~Config.updateperms.indexOf(sys.name(src).toLowerCase())) {
                if (command == "update") {
                    if (!commandData) {
                        // ???
                        Plugins('commands.js').handle(src, "/update", "updatescript", commandData, tar, chan);
                        return;
                    }
                    if (Plugins(commandData) == null) {
                        bot.sendMessage(src, "Plugin "+commandData+" not found.", chan);
                        return;
                    }
                    bot.sendMessage(src, "Updating plugin "+commandData+"...", chan);
                    sys.webCall(Config.repourl + commandData, function(resp) {
                        sys.writeToFile(Config.plugindir + commandData, resp);
                        PHandler.load(commandData, false);
                        reloadPlugin(commandData);
                        bot.sendMessage(src, "Plugin "+commandData+" updated!", chan);
                    });
                    return;
                }
            }

            Plugins('commands.js').handle(src, message, command, commandData, tar, chan);
            return;
        }

        var oldmessage = message;

        var emotes = false,
            oldEmoteMsg;
        if (myAuth > 0) {
            var msg = format(src, html_escape(message).replace(/&lt;_&lt;/g, "<_<").replace(/&gt;_&gt;/g, ">_>").replace(/&gt;_&lt;/g, ">_<"));
            if (!htmlchatoff && sys.auth(src) == 3) {
                msg = format(src, message);
            }

            message = oldEmoteMsg = msg;

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
        sys.stopEvent();
        sys.sendHtmlAll(pewpewpew ? pewpewpewmessage(oldmessage) : sendStr, chan);

        watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + html_escape(sys.name(src)) + ": " + html_escape(oldmessage), watch);

        script.afterChatMessage(src, oldmessage, chan);
    },
    beforeLogOut: function (src) {
        lastToLogout = {
            'name': sys.name(src),
            'color': namecolor(src)
        };
    },
    /* Due to some glitch with v2, we send the message in afterLogOut (beforeLogOut has a problem...) */
    afterLogOut: function (src) {
        var user = JSESSION.users(src);
        var shown = true;

        if (lastToLogout.name === undefined || lastToLogout.color === undefined || typeof lastToLogout != 'object') {
            shown = false;
        }

        if (sys.numPlayers() < 30 && shown && !user.autokick && sys.os(src) != "android") {
            logoutMessage(html_escape(lastToLogout.name), lastToLogout.color);
        }

        JSESSION.destroyUser(src);
    },
    afterChangeTeam: function (src) {
        var myUser = JSESSION.users(src);

        sys.setTimer(function () {
            JSESSION.users(src).originalName = sys.name(src);
        });

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

        sys.callLater("if(JSESSION.users(" + src + ") != undefined) JSESSION.users(" + src + ").teamChanges--;", 5);

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
            if (theirmessage != undefined) {
                msg = msg.replace(/\{Target\}/gi, sys.name(bpl));
            }
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
        if (theirmessage != undefined) {
            msg = msg.replace(/\{Target\}/gi, sys.name(bpl));
        }
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
                sys.sendHtmlAll("<br/><center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>C</font>ongratulations, <i style='color:red; font-weight:bold;'>" + html_escape(tourplayers[tourmembers[0]]) + "!</i></font><hr width=300/><br><b>You won the tournament! You win " + prize + "!</b><br/><br/></td></tr></table></center><br/>", tchan);
            }
            tourmode = 0;
            isFinals = false;
            return;
        }
        var str;
        var finals = tourmembers.length == 2;
        if (!finals) {
            str = "<br/><center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'>Round <i>" + roundnumber + "</i> of <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament!</font><hr width=300/><i>Current Matchups</i><br/><b>";
        } else {
            isFinals = true;
            str = "<br/><center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>F</font>inals of <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament!</font><hr width=300/><i>Matchup</i><br/><b>";
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
            str += html_escape(script.padd(name1)) + " vs " + html_escape(script.padd(name2)) + "<br/>";
        }
        if (tourmembers.length > 0) {
            str += "</b><br/><i>" + html_escape(tourplayers[tourmembers[0]]) + " is randomly selected to go next round!<br/>";
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
        if (!JSESSION.hasUser(src)) {
            JSESSION.createUser(src);
        }

        var srcip = sys.ip(src);
        var poUser = JSESSION.users(src),
            ignoreFlood = floodIgnoreCheck(src),
            auth = getAuth(src);
        if (auth < 1 && !ignoreFlood) {
            if (poUser.floodCount < 0 || isNaN(poUser.floodCount)) {
                poUser.floodCount = 0;
            }
            time = sys.time() * 1;
            poUser.floodCount += 1;
            sys.callLater("if (JSESSION.users(" + src + ") !== undefined) { JSESSION.users(" + src + ").floodCount--;  };", 8);
            if (poUser.floodCount > 7 && poUser.muted == false) {
                flbot.sendAll(sys.name(src) + " was kicked and muted for flooding.", 0);
                poUser.muted = true;
                Mutes[srcip] = {
                    "by": flbot.name,
                    "mutedname": sys.name(src),
                    "reason": "Flooding.",
                    "time": time + 300
                }
                kick(src, true);
                return;
            }
        }
        var channel = chan,
            time = sys.time() * 1;
        if (script.isMCaps(message) && auth < 1 && !ignoreFlood) {
            poUser.caps += 1;
            if (poUser.caps >= 6 && poUser.muted == false) {
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
    battleSetup: function (src, tar, bid) {
        var items = {
            // 10 Full Heals
            "74": 10,
            // 10 Full Restores
            "75": 10,
            // 10 Max Elixirs
            "96": 10,
            // 10 Max Potions
            "98": 10,
            // 7 Max Revives
            "100": 7,
            // 10 Revives
            "123": 10,
            // 5 Sacred Ash
            "124": 5,
            // 10 X Speed 6, X Special 6, X Sp. Def 6, X Defend 6, X Attack 6, X Accuracy 6, Dire Hit 3
            "293": 10,
            "294": 10,
            "295": 10,
            "296": 10,
            "297": 10,
            "298": 10,
            "303": 10
        };
        
        if (itemsEnabled(src)) {
            sys.prepareItems(bid, 0, items);
        }
        
        if (itemsEnabled(tar)) {
            sys.prepareItems(bid, 1, items);
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
    toCorrectCase: function (name) {
        if (sys.id(name) !== undefined) {
            return sys.name(sys.id(name));
        }
        return name;
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
        var str = "";
        if (tourbattlers.length != 0 || tourmembers.length > 1) {
            str = "<br/><center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>B</font>attle <font style='font-size:25px;'>C</font>ompleted!</font><hr width=300/><br>";
            str += "<b><i style='color:red; font-weight:bold;'>" + html_escape(script.toCorrectCase(src)) + "</i> won their battle and moves on to the next round.<br><br><i style='color:red; font-weight:bold;'>" + html_escape(script.toCorrectCase(dest)) + "</i> lost their battle and is out of the tournament.</b>";
        }
        if (tourbattlers.length > 0) {
            str += "<br><hr width=300/><br><i style='color:red; font-weight:bold;'>" + tourbattlers.length / 2 + "</i>  battle(s) remaining!";
            str += "<br/><br/></td></tr></table></center><br/>";
            sys.sendHtmlAll(str, 0);
            return;
        } else {}
        if (str.length > 0)
            sys.sendHtmlAll(str + "<br/><br/></td></tr></table></center><br/>", 0);
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
        topicbot = new Bot("Channel Topic", "red", "±");
        setbybot = new Bot("Set By", "orange", "±");
        capsbot = new Bot("CAPSBot", "mediumseagreen");
        flbot = new Bot("FloodBot", "mediumseagreen");
    },

    loadCommandLists: function () {
        Lists = Plugins('lists.js').lists(); /* Lists are stored in here. */
    }
})
