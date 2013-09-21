/*jslint continue: true, es5: true, evil: true, forin: true, sloppy: true, vars: true, regexp: true, newcap: true, nomen: true*/
/*global sys, SESSION, script: true, Qt, print, gc, version,
    global: false, Plugin: true, Config: true, module: true, exports: true,
    bot: true, Reg: true, Leaguemanager: true, Lists: true, CommandList: true, MathJS: true, format: true, JSESSION: true, emoteFormat: true, hasEmotesToggled: true, tourmode: true, tourmembers: true, getTier: true, tourtier: true, tourplayers: true, roundnumber: true, isFinals: true, battlesLost: true, tourbattlers: true, battlesStarted: true, hasEmotePerms: true, Emotetoggles: true, rouletteon: true, spinTypes: true, EmoteList: true, TableList: true, MegaUsers: true, FloodIgnore: true, Capsignore: true, Autoidle: true, Emoteperms: true, Feedmon: true, tournumber: true, prize: true, isTier: true, tournumber: true, Kickmsgs: true, Welmsgs: true, Banmsgs: true, Channeltopics: true, android: true, topicbot: true, Mutes: true, Rangebans: true, muteall: true, kick: true, tempBanTime: true, tempBan: true, pruneMutes: true, nightclub: true, supersilence: true, ev_name: true, getName: true, ban: true, Plugins: true, PHandler: true, reloadPlugin: true, htmlchatoff: true, bots: true, servername: true, isBanned: true, loginMessage: true, logoutMessage: true, floodIgnoreCheck: true, removeTag: true, randcolor: true, colormodemessage: true, lolmessage: true, pewpewpewmessage: true, hasBasicPermissions: true, hasDrizzleSwim: true, hasSandCloak: true, ChannelNames: true, staffchannel: true, testchan: true, watch: true, aliasKick: true, nthNumber: true, ChannelLink: true, addChannelLinks: true, firstGen: true, Feedmons: true, addEmote: true, Bot: true, guard: true, watchbot: true, setbybot: true, lolmode: true, spacemode: true, reversemode: true, colormode: true, scramblemode: true, capsmode: true, pewpewpew: true, capsbot: true, poScript: true, flbot: true, Utils: true
*/

/* Meteor Falls v0.7 Scripts.
    By: HHT, TheUnknownOne, Ethan
    Credit to: Max, Lutra
*/

var Config = {
    // Configuration for the script.
    repourl: "https://raw.github.com/meteor-falls/Scripts/master/plugins/", // Repo to load plugins from.
    dataurl: "https://raw.github.com/meteor-falls/Server-Shit/master/", // Repo to load data (announcement/description + tiers) from.
    
    // Plugin directory.
    plugindir: "plugins/",
    
    // The server owner.
    serverowner: "HHT",
   
    permissions: {
        // People who can update scripts/tiers.
        update: ["ethan"],
         // People with special Feedmon permissions.
        feedmon: ["theunknownone"]
    },

    // Do not touch unless you are adding a new plugin.
    // Plugins to load on script load.
    plugins: ['jsession', 'bot', 'reg', 'utils', 'emotes', 'feedmon', 'init', 'lists', 'commands'],
    
    // Whether or not to load plugins from repourl. If set to false, they will load locally.
    load_from_web: true, 
    // If HTML should be stripped from channel messages outputted onto the server window.
    stripHtmlFromChannelMessages: true,
    // If emotes are enabled.
    emotesEnabled: true,
    catchTimeout: 5,
    feedTimeout: 2
};

if (typeof JSESSION === "undefined") {
    JSESSION = null;
}

if (typeof Utils === "undefined") {
    Utils = null;
}

function PluginHandler(dir) {
    this.dir = dir;
    this.plugins = {};
    
    sys.makeDir(this.dir);
}

PluginHandler.prototype.load = function PluginHandler_load(plugin_name, webcall) {
    var fileContent,
        resp;
    
    if (webcall) {
        resp = sys.synchronousWebCall(Config.repourl + plugin_name);
        sys.writeToFile(this.dir + plugin_name, resp);
    }
    
    fileContent = sys.getFileContent(this.dir + plugin_name);
    
    if (!fileContent) {
        return false;
    }
    
    var module = {
        exports: {}
    };
    
    var exports = module.exports;
    try {
        eval(fileContent);
    } catch (e) {
        sys.sendAll("Error loading plugin " + plugin_name + ": " + e + " on line " + e.lineNumber);
        return false;
    }
    
    print("Loaded module " + plugin_name);
    
    this.plugins[plugin_name] = module.exports;
    
    if (module.callExports) {
        module.exports();
    }
    
    return module.exports;
};

PluginHandler.prototype.unload = function PluginHandler_unload(plugin_name) {
    return (delete this.plugins[plugin_name]);
};

// Never used
/*PluginHandler.prototype.callplugins = function PluginHandler_callplugins(event) {
    var args = [].slice.call(arguments, 1);
    var ret = true;
    var plugins = this.plugins,
        plugin;
    
    for (plugin in plugins) {
        if (plugins[plugin].hasOwnProperty(event)) {
            try {
                if (plugins[plugin][event].apply(plugins[plugin], args)) {
                    ret = false;
                }
            } catch (e) {
            }
        }
    }
    return ret;
};*/

var PHandler = new PluginHandler(Config.plugindir);

(function () {
    var plugin,
        plugin_name,
        i;
    
    for (i = 0; i < Config.plugins.length; i += 1) {
        plugin = Config.plugins[i];
        plugin_name = (plugin.indexOf(".") === -1) ? plugin + ".js" : plugin;
        PHandler.load(plugin_name, Config.load_from_web);
    }
}());

function Plugins(plugin_name) {
    if (!PHandler.plugins.hasOwnProperty(plugin_name)) {
        return null;
    }
    
    return PHandler.plugins[plugin_name];
}
function reloadPlugin(plugin_name) {
    if (plugin_name === "init.js") {
        script.init();
    } else if (plugin_name === "lists.js") {
        script.loadCommandLists();
    } else if (plugin_name === "bot.js") {
        script.loadBots();
    } else if (plugin_name === "reg.js") {
        script.loadRegHelper();
    } else if (plugin_name === "emotes.js") {
        Plugins('emotes.js')();
        
        // We also have to reload the command lists,
        // otherwise /emotes won't be updated
        script.loadCommandLists();
    } else if (plugin_name === "mathjs.js") {
        MathJS = Plugins('mathjs.js');
    }
}

var global = this;
var ignoreNextChanMsg = false,
    // Lookups are slow. Cache this as NewMessage is called many, many times.
    stripHtmlFromChannelMessages = Config.stripHtmlFromChannelMessages;

function poUser(id) {
    var ip = sys.ip(id);
    
    this.id = id;
    this.ip = ip;
    this.floodCount = 0;
    this.caps = 0;
    this.muted = false;

    this.originalName = sys.name(id);
    this.megauser = false;
    
    // This is an array so we can track multiple emotes in their last message.
    this.lastEmote = [];
}

JSESSION.identifyScriptAs("MF Script 0.7 Beta");
JSESSION.registerUserFactory(poUser);
JSESSION.refill();

var poScript;

poScript = ({
    serverStartUp: function serverStartUp() {
        script.init();
    },
    init: function init() {
        Plugins('init.js').init();
        Plugins('emotes.js')();
    },
    warning: function warning(func, message, backtrace) {
        var toSend = ['theunknownone', 'ethan'],
            len = toSend.length,
            id,
            i;
            
        for (i = 0; i < len; i += 1) {
            id = sys.id(toSend[i]);
            
            if (!id) {
                continue;
            }
            
            sys.sendMessage(id, "Script warning in function " + func + ": " + message);
            sys.sendMessage(id, backtrace);
        }
    },
    beforeNewMessage: function beforeNewMessage(message) {
        if (ignoreNextChanMsg) {
            // Don't call sys.stopEvent here
            ignoreNextChanMsg = false;
            return;
        }
        
        // Strip HTML. :]
        if (stripHtmlFromChannelMessages && message.substring(0, 2) === "[#") {
            sys.stopEvent();
            ignoreNextChanMsg = true;
            print(Utils.stripHtml(message));
            return;
        }
    },
    
    afterNewMessage: function afterNewMessage(message) {
        if (message.substr(0, 33) === "The name of the server changed to") {
            servername = message.substring(34, message.lastIndexOf("."));
            return;
        }
        if (message === "Script Check: OK") {
            sys.sendHtmlAll("<b><i><font color=Blue><font size=4>±ScriptBot:</font></b><b><i><font color=Black><font size=4> Server Owner " + Config.serverowner + " has updated the scripts!</font></b></i>");
            script.init();
            return;
        }
        
        if (message.substr(0, 17) === "Script Error line" && sys.id('theunknownone')) {
            sys.sendMessage(sys.id('theunknownone'), message);
        }
    },
    
    beforeServerMessage: function (message) {
        var isEval = message.substr(0, 2) === ">>",
            evalCode;
        
        if (isEval) {
            sys.stopEvent();
            
            evalCode = message.substr(2);
            print(message);
            try {
                print(eval(evalCode));
            } catch (ex) {
                print(ex);
                print(ex.backtracetext);
            }
        }
    },

    beforeChannelJoin: function beforeChannelJoin(src, channel) {
        var user = JSESSION.users(src);
        
        if ((channel === staffchannel && !user.megauser && !hasBasicPermissions(src)) || (channel === watch && !hasBasicPermissions(src))) {
            guard.sendMessage(src, "HEY! GET AWAY FROM THERE!", 0);
            watchbot.sendAll(sys.name(src) + "(IP: " + sys.ip(src) + ") tried to join " + sys.channel(channel) + "!", watch);
            sys.stopEvent();
            return;
        }
        
        if (channel !== android && sys.os(src) === "android" && !hasBasicPermissions(src)) {
            if (sys.isInChannel(src, android)) {
                guard.sendMessage(src, "Sorry, you cannot go to a channel other than Android Channel.", android);
                watchbot.sendAll(sys.name(src) + "(IP: " + sys.ip(src) + ") tried to join " + sys.channel(channel) + " with an android phone!", watch);
            }
            sys.stopEvent();
        }
    },

    beforeChannelDestroyed: function beforeChannelDestroyed(channel) {
        if (channel === staffchannel || channel === testchan || channel === watch || channel === android) {
            sys.stopEvent();
            return;
        }
        
        var cname = sys.channel(channel);
        ChannelNames.splice(ChannelNames.indexOf(cname), 1);

        JSESSION.destroyChannel(channel);
    },

    megauserCheck: function megauserCheck(src) {
        JSESSION.users(src).megauser = MegaUsers.hasOwnProperty(sys.name(src).toLowerCase());
    },

    afterChannelCreated: function afterChannelCreated(chan, name, src) {
        ChannelNames.push(name);
        JSESSION.createChannel(chan);
    },

    afterChannelJoin: function afterChannelJoin(src, chan) {
        var channelToLower = sys.channel(chan).toLowerCase();
        
        var topic = Channeltopics[channelToLower] || {topic: "No channel topic has been set.", by: null};
        
        if (chan !== 0 && chan !== android) {
            topicbot.sendMessage(src, topic.topic, chan);
            
            if (topic.by) {
                setbybot.sendMessage(src, topic.by, chan);
            }
        }
        
        if (chan === android) {
            topicbot.sendMessage(src, "This is the Android user channel. Feel free to chat and battle with other android users. Click <a href='http://code.google.com/p/pokemon-online-android/wiki/TeamLoadTutorial'>here</a> to learn how to import a team.", chan);
        }
        if (chan !== 0 && chan !== android) {
            watchbot.sendAll(sys.name(src) + "(IP: " + sys.ip(src) + ") has joined " + sys.channel(chan) + "!", watch);
        }
    },

    beforeLogIn: function beforeLogIn(src) {
        var srcip = sys.ip(src);
        
        var poUser = JSESSION.users(src),
            cu_rb,
            t_n = +sys.time(),
            x;
            
        if (sys.auth(src) < 3) {
            for (x in Rangebans) {
                if (x === srcip.substr(0, x.length)) {
                    sys.stopEvent();
                    watchbot.sendAll("Rangebanned IP [" + sys.ip(src) + "] tried to log in.", watch);
                    return;
                }
            }
        }

        if (sys.name(src) === "HHT") {
            var ip = sys.ip(src);
            var sip = ip.substr(0, 9);
            if (sip !== "74.77.226" && ip !== "127.0.0.1") {
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
    afterLogIn: function afterLogIn(src, defaultChan) {
        var poUser = JSESSION.users(src),
            myName = sys.name(src),
            ip = sys.ip(src),
            myAuth = Utils.getAuth(src),
            numPlayers = sys.numPlayers(),
            newRecord = false;

        poUser.originalName = sys.name(src);

        if (Autoidle[myName.toLowerCase()]) {
            sys.changeAway(src, true);
        }

        if (hasBasicPermissions(src)) {
            if (!sys.isInChannel(src, watch)) {
                sys.putInChannel(src, watch);
            }
            
            if (!sys.isInChannel(src, staffchannel)) {
                sys.putInChannel(src, staffchannel);
            }
        }
        
        if (numPlayers > Reg.get("maxPlayersOnline")) {
            Reg.save("maxPlayersOnline", numPlayers);
            newRecord = true;
        }
        
        if (sys.os(src) === "android") {
            defaultChan = android;
        }
        
        if (!sys.isInChannel(src, defaultChan)) {
            sys.putInChannel(src, defaultChan);
        }
        
        function displayBot(name, message, color) {
            sys.sendHtmlMessage(src, "<font color='" + color + "'><timestamp/> ±<b>" + name + ":</b></font> " + message, defaultChan);
        }

        displayBot("ServerBot", "Hey, <b><font color='" + Utils.nameColor(src) + "'>" + sys.name(src) + "</font></b>!", "purple");
        displayBot("CommandBot", "Type <b>/commands</b> for a list of commands, <b>/rules</b> for a list of rules, and <b>/league</b> for the league.", "green");
        displayBot("ForumBot", "Get in touch with the community by joining the <b><a href='http://meteorfalls.icyboards.net/'>Meteor Falls Forums</a></b>!", "blue");
        displayBot("StatsBot", "There are <b>" + numPlayers + "</b> players online. You are the <b>" + nthNumber(src) + "</b> player to join. At most, there were <b>" + Reg.get("maxPlayersOnline") + "</b> players online" + (newRecord ? " (new record!)" : "") + ".", "goldenrod");

        var MOTD = Reg.get("MOTD");
        if (MOTD !== "") {
            displayBot("Message of the Day", MOTD, "red");
        }

        sys.sendMessage(src, '');
        if (sys.numPlayers() < 30 && sys.os(src) !== "android" && !Welmsgs[sys.name(src).toLowerCase()]) {
            loginMessage(sys.name(src), Utils.nameColor(src));
        }

        if (Welmsgs[sys.name(src).toLowerCase()]) {
            var theirmessage = Welmsgs[sys.name(src).toLowerCase()];
            var msg = (theirmessage) ? theirmessage.message : loginMessage(sys.name(src), Utils.nameColor(src));
            if (theirmessage) {
                msg = msg.replace(/\{Server\}/gi, Reg.get("servername"));
                msg = msg.replace(/\{Color\}/gi, Utils.nameColor(src));
                msg = emoteFormat(msg);
            }
            sys.sendHtmlAll(msg, 0);
        }

        pruneMutes();
        if (Mutes[ip]) {
            var myMute = Mutes[ip],
                muteStr = myMute.time !== 0 ? Utils.getTimeString(myMute.time - +sys.time()) : "forever";
            poUser.muted = true;
            bot.sendMessage(src, "You are muted for " + muteStr + ". By: " + myMute.by + ". Reason: " + myMute.reason, defaultChan);
        }

        var i;
        var drizzleSwim = hasDrizzleSwim(src);
        if (drizzleSwim.length > 0) {
            for (i = 0; i < drizzleSwim.length; i += 1) {
                bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.", defaultChan);
                sys.changeTier(src, drizzleSwim[i], "5th Gen Ubers");
            }
        }
        var sandCloak = hasSandCloak(src);
        if (sandCloak.length > 0) {
            for (i = 0; i < sandCloak.length; i += 1) {
                bot.sendMessage(src, "Sorry, Sand Veil & Snow Cloak are only usable in 5th Gen Ubers.", defaultChan);
                sys.changeTier(src, sandCloak[i], "5th Gen Ubers");
            }
        }

        script.megauserCheck(src);

        if (tourmode === 1) {
            sys.sendHtmlMessage(src, "<br/><center><table width=30% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:11px; font-weight:bold;'>A <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament is in sign-up phase</font><hr width=200/><br><b><i style='color:red; font-weight:bold;'>" + script.tourSpots() + "</i> space(s) are remaining!<br><br>Type <i style='color:red; font-weight:bold;'>/join</i> to join!</b><br/><br/></td></tr></table></center><br/>", defaultChan);
        } else if (tourmode === 2) {
            sys.sendHtmlMessage(src, "<br/><center><table width=35% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:11px; font-weight:bold;'>A <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament is currently running.</font><hr width=210/><br><b>Type <i style='color:red; font-weight:bold;'>/viewround</i> to check the status of the tournament!</b><br/><br/></td></tr></table></center><br/>", defaultChan);
        }

        var tier = getTier(src, "5th Gen OU");
        if (tier) {
            script.dreamAbilityCheck(src);
        }
    },

    beforeChangeTier: function beforeChangeTier(src, oldtier, newtier) {
        var drizzleSwim = hasDrizzleSwim(src),
            i;
        
        if (drizzleSwim.length > 0) {
            for (i = 0; i < drizzleSwim.length; i += 1) {
                bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.");
                sys.changeTier(src, drizzleSwim[i], "5th Gen Ubers");
                sys.stopEvent();
            }
        }
        var sandCloak = hasSandCloak(src);
        if (sandCloak.length > 0) {
            for (i = 0; i < sandCloak.length; i += 1) {
                bot.sendMessage(src, "Sorry, Sand Veil & Snow Cloak are only usable in 5th Gen Ubers.");
                sys.changeTier(src, sandCloak[i], "5th Gen Ubers");
                sys.stopEvent();
            }
        }
        if (newtier === "5th Gen OU") {
            if (script.dreamAbilityCheck(src)) {
                sys.stopEvent();
            }
        }
    },

    beforeChangeTeam: function beforeChangeTeam(src) {
        var drizzleSwim = hasDrizzleSwim(src),
            i;
        
        if (drizzleSwim.length > 0) {
            for (i = 0; i < drizzleSwim.length; i += 1) {
                bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.");
                sys.changeTier(src, drizzleSwim[i], "5th Gen Ubers");
            }
        }
        var sandCloak = hasSandCloak(src);
        if (sandCloak.length > 0) {
            for (i = 0; i < sandCloak.length; i += 1) {
                bot.sendMessage(src, "Sorry, Sand Veil & Snow Cloak are only usable in 5th Gen Ubers.");
                sys.changeTier(src, sandCloak[i], "5th Gen Ubers");
            }
        }
    },

    beforeChatMessage: function beforeChatMessage(src, message, chan) {
        if (!hasBasicPermissions(src) && message.length > 600) {
            sys.stopEvent();
            bot.sendMessage(src, "Sorry, your message has exceeded the 600 character limit.", chan);
            watchbot.sendAll(" User, " + sys.name(src) + ", has tried to post a message that exceeds the 600 character limit. Take action if need be. <ping/>", watch);
            return;
        }
        if (message === "<3") {
            sys.stopEvent();
            sys.sendAll(sys.name(src) + ": <3", chan);
            watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + Utils.escapeHtml(sys.name(src)) + ": " + Utils.escapeHtml(message), watch);
            return;
        }
        if (message === ">_<") {
            sys.stopEvent();
            sys.sendAll(sys.name(src) + ": >_<", chan);
            watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + Utils.escapeHtml(sys.name(src)) + ": " + Utils.escapeHtml(message), watch);
            return;
        }

        var poUser = JSESSION.users(src),
            isMuted = poUser.muted,
            originalName = poUser.originalName,
            isLManager = Leaguemanager === originalName.toLowerCase(),
            messageToLowerCase = message.toLowerCase(),
            myAuth = Utils.getAuth(src);
        
        if (Utils.hasIllegalChars(message) && myAuth < 3) {
            bot.sendMessage(src, 'WHY DID YOU TRY TO POST THAT, YOU NOOB?!', chan);
            watchbot.sendAll(Utils.escapeHtml(sys.name(src)) + ' TRIED TO POST A BAD CODE! KILL IT! <ping/>', watch);
            sys.stopEvent();
            script.afterChatMessage(src, message, chan);
            return;
        }

        if (myAuth < 2 && isMuted) {
            pruneMutes();
            if (!Mutes[sys.ip(src)]) {
                poUser.muted = false;
            } else {
                sys.stopEvent();
                var myMute = Mutes[sys.ip(src)],
                    muteStr = myMute.time !== 0 ? Utils.getTimeString(myMute.time - +sys.time()) : "forever";
                bot.sendMessage(src, "Shut up! You are muted for " + muteStr + "! By: " + myMute.by + ". Reason: " + myMute.reason, chan);
                watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Muted Message -- " + Utils.escapeHtml(sys.name(src)) + ": " + Utils.escapeHtml(message), watch);
                script.afterChatMessage(src, message, chan);
                return;
            }
        }
        
        if (myAuth < 1 && muteall || myAuth < 2 && supersilence) {
            sys.stopEvent();
            bot.sendMessage(src, "Shut up! Silence is on!", chan);
            watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Silence Message -- " + Utils.escapeHtml(sys.name(src)) + ": " + Utils.escapeHtml(message), watch);
            script.afterChatMessage(src, message, chan);
            return;
        }

        if ((message[0] === '/' || message[0] === '!') && message.length > 1) {
            print("[#" + sys.channel(chan) + "] Command -- " + sys.name(src) + ": " + message);
            watchbot.sendAll("[Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Command -- " + Utils.escapeHtml(sys.name(src)) + ": " + Utils.escapeHtml(message), watch);
            sys.stopEvent();
            var command = "";
            var commandData = "";
            var pos = message.indexOf(' ');
            if (pos !== -1) {
                command = message.substring(1, pos).toLowerCase();
                commandData = message.substr(pos + 1);
            } else {
                command = message.substr(1).toLowerCase();
            }
            var tar = sys.id(commandData);
            
            try {
                if (Plugins('commands.js').can_use_command(src, command)) {
                    Plugins('commands.js').handle_command(src, message, command, commandData, tar, chan);
                    return;
                }
            } catch (err) {
                bot.sendMessage(src, err, chan);
                return;
            }
        }
        
        var originalMessage = message;
        var simpleMessage = message;
        var emoteMessage = message;

        var emotes = false;
        simpleMessage = format(src, Utils.escapeHtml(simpleMessage).replace(/&lt;_&lt;/g, "<_<").replace(/&gt;_&gt;/g, ">_>").replace(/&gt;_&lt;/g, ">_<"));
        
        if (myAuth === 3 && !htmlchatoff) {
            simpleMessage = format(src, originalMessage);
        }
            
        if (hasEmotesToggled(src)) {
            emoteMessage = emoteFormat(simpleMessage, src);
            
            if (simpleMessage !== emoteMessage) {
                emotes = true;
            }
            
            simpleMessage = emoteMessage;
        }
        
        message = simpleMessage;
        
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

        var sendStr = "<font color=" + Utils.nameColor(src) + "><timestamp/><b>" + Utils.escapeHtml(sys.name(src)) + ": </b></font>" + message;
        if (sys.auth(src) > 0 && sys.auth(src) < 4) {
            sendStr = "<font color=" + Utils.nameColor(src) + "><timestamp/>+<i><b>" + Utils.escapeHtml(sys.name(src)) + ": </b></i></font>" + message;
        }
        
        if (pewpewpew) {
            sendStr = pewpewpewmessage(originalMessage);
        } else if (nightclub) {
            sendStr = "<" + src + ">" + Utils.nightclub.rainbowify("(" + sys.name(src) + "): " + originalMessage);
        }
        
        sys.stopEvent();
        sys.sendHtmlAll(sendStr, chan);

        watchbot.sendAll("[Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + Utils.escapeHtml(sys.name(src)) + ": " + Utils.escapeHtml(originalMessage), watch);

        script.afterChatMessage(src, originalMessage, chan);
    },
    beforeLogOut: function beforeLogOut(src) {
        var user = JSESSION.users(src);
        
        if (sys.numPlayers() < 30 && !user.autokick && sys.os(src) !== "android") {
            logoutMessage(Utils.escapeHtml(sys.name(src)), Utils.nameColor(src));
        }

        JSESSION.destroyUser(src);
    },
    afterChangeTeam: function afterChangeTeam(src) {
        var myUser = JSESSION.users(src);

        myUser.originalName = sys.name(src);

        script.megauserCheck(src);
        
        watchbot.sendAll(sys.name(src) + " changed teams.", watch);
    },
    beforePlayerKick: function beforePlayerKick(src, bpl) {
        sys.stopEvent();
        if (Utils.getAuth(bpl) >= Utils.getAuth(src)) {
            bot.sendMessage(src, "You may not kick this person!");
            return;
        } else {
            watchbot.sendAll(sys.name(src) + " kicked " + Utils.escapeHtml(sys.name(bpl)) + " (IP: " + sys.ip(bpl) + ")", watch);
            var theirmessage = Kickmsgs[sys.name(src).toLowerCase()];
            var msg = (theirmessage) ? theirmessage.message : "<font color=navy><timestamp/><b>" + sys.name(src) + " kicked " + Utils.escapeHtml(sys.name(bpl)) + "!</font></b>";
            if (theirmessage) {
                msg = msg.replace(/\{Target\}/gi, sys.name(bpl));
            }
            sys.sendHtmlAll(msg);
            kick(bpl);
        }
    },

    beforePlayerBan: function beforePlayerBan(src, bpl, time) {
        sys.stopEvent();
        
        if (Utils.getAuth(bpl) >= Utils.getAuth(src)) {
            bot.sendMessage(src, "You may not ban this person!");
            return;
        }
        
        var targetName = sys.name(bpl);
                
        var banMessage = Banmsgs[sys.name(src).toLowerCase()];
        
        if (banMessage) {
            banMessage = banMessage.replace(/\{Target\}/gi, targetName);
        }
        
        watchbot.sendAll(sys.name(src) + " banned " + Utils.escapeHtml(targetName) + " (IP: " + sys.ip(bpl) + ")", watch);

        if (time) {
            // Temporary ban.
            // Time is in minutes, and getTimeString expects seconds.
            if (banMessage) {
                sys.sendHtmlAll(banMessage);
            } else {
                sys.sendHtmlAll("<font color=blue><timestamp/><b>" + sys.name(src) + " banned " + Utils.escapeHtml(targetName) + " for " + Utils.getTimeString(time * 60) + "!</font></b>");
            }
            
            tempBan(targetName, time);
        } else {
            // Permanent ban.
            
            if (banMessage) {
                sys.sendHtmlAll(banMessage);
            } else {
                sys.sendHtmlAll("<font color=blue><timestamp/><b>" + sys.name(src) + " banned " + Utils.escapeHtml(targetName) + "!</font></b>");
            }
            
            ban(targetName);
        }
    },

    beforeChallengeIssued: function beforeChallengeIssued(src, dest) {
        var tier = getTier(src, "Dream World");
        if (tier) {
            if (script.dreamAbilityCheck(src) || script.dreamAbilityCheck(dest)) {
                sys.stopEvent();
            }
        }
        if (tourmode === 2) {
            var name1 = sys.name(src);
            var name2 = sys.name(dest);
            if (script.isInTourney(name1)) {
                if (script.isInTourney(name2)) {
                    if (script.tourOpponent(name1) !== name2.toLowerCase()) {
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

    afterPlayerAway: function afterPlayerAway(src, mode) {
        var m = mode === 1 ? "idled" : "unidled and is ready to battle";
        watchbot.sendAll(sys.name(src) + " has " + m + ".", watch);
    },

    beforeBattleMatchup: function beforeBattleMatchup(src, dest, clauses, rated, mode, team1, team2) {
        var tier = getTier(src, sys.tier(team1)),
            desttier = getTier(dest, sys.tier(team2));
        if (tier && desttier) {
            if (script.dreamAbilityCheck(src) || script.dreamAbilityCheck(dest)) {
                sys.stopEvent();
            }
        }
        if (tourmode === 2 && (script.isInTourney(sys.name(src)) || script.isInTourney(sys.name(dest)))) {
            sys.stopEvent();
            return;
        }
    },
    tourSpots: function tourSpots() {
        return tournumber - tourmembers.length;
    },
    roundPairing: function roundPairing() {
        roundnumber += 1;
        battlesStarted = [];
        tourbattlers = [];
        battlesLost = [];
        if (tourmembers.length === 1) {
            sys.sendHtmlAll("<br/><center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>C</font>ongratulations, <i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(tourplayers[tourmembers[0]]) + "!</i></font><hr width=300/><br><b>You won the tournament! You win " + prize + "!</b><br/><br/></td></tr></table></center><br/>", 0);
            tourmode = 0;
            isFinals = false;
            return;
        }
        var str;
        var finals = tourmembers.length === 2;
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
            str += Utils.escapeHtml(name1) + " vs " + Utils.escapeHtml(name2) + "<br/>";
        }
        if (tourmembers.length > 0) {
            str += "</b><br/><i>" + Utils.escapeHtml(tourplayers[tourmembers[0]]) + " is randomly selected to go next round!<br/>";
        }
        str += "<br/></td></tr></table></center><br/>";
        sys.sendHtmlAll(str, 0);
    },
    isInTourney: function isInTourney(name) {
        return tourplayers.hasOwnProperty(name.toLowerCase());
    },
    tourOpponent: function tourOpponent(nam) {
        var name = nam.toLowerCase();
        var x = tourbattlers.indexOf(name);
        if (x !== -1) {
            if (x % 2 === 0) {
                return tourbattlers[x + 1];
            } else {
                return tourbattlers[x - 1];
            }
        }
        return "";
    },
    isLCaps: function isLCaps(letter) {
        return letter >= 'A' && letter <= 'Z';
    },
    areOpponentsForTourBattle: function areOpponentsForTourBattle(src, dest) {
        return script.isInTourney(sys.name(src)) && script.isInTourney(sys.name(dest)) && script.tourOpponent(sys.name(src)) === sys.name(dest).toLowerCase();
    },
    areOpponentsForTourBattle2: function areOpponentsForTourBattle2(src, dest) {
        return script.isInTourney(src) && script.isInTourney(dest) && script.tourOpponent(src) === dest.toLowerCase();
    },
    ongoingTourneyBattle: function ongoingTourneyBattle(name) {
        return tourbattlers.indexOf(name.toLowerCase()) !== -1 && battlesStarted[Math.floor(tourbattlers.indexOf(name.toLowerCase()) / 2)] === true;
    },
    afterBattleStarted: function afterBattleStarted(src, dest, info, id, t1, t2) {
        if (tourmode === 2) {
            if (script.areOpponentsForTourBattle(src, dest)) {
                if (getTier(src, tourtier) && getTier(dest, tourtier)) {
                    battlesStarted[Math.floor(tourbattlers.indexOf(sys.name(src).toLowerCase()) / 2)] = true;
                }
            }
        }
    },
    afterBattleEnded: function afterBattleEnded(src, dest, desc) {
        if (tourmode !== 2 || desc === "tie") {
            return;
        }

        script.tourBattleEnd(sys.name(src), sys.name(dest));
    },
    afterChatMessage: function afterChatMessage(src, message, chan) {
        if (!bots) {
            return;
        }
        
        if (!JSESSION.hasUser(src)) {
            JSESSION.createUser(src);
        }
        
        var time = +sys.time();
        var srcip = sys.ip(src);
        var poUser = JSESSION.users(src),
            limit,
            ignoreFlood = floodIgnoreCheck(src),
            auth = Utils.getAuth(src);
            
        if (auth < 1 && !ignoreFlood) {
            if (poUser.floodCount < 0) {
                poUser.floodCount = 0;
            }
            
            poUser.floodCount += 1;
            
            sys.setTimer(function () {
                var user = JSESSION.users(src);
                
                if (user) {
                    user.floodCount -= 1;
                }
                
            }, 8 * 1000, false);
            
            limit = (chan === testchan ? 18 : 7);
            
            if (poUser.floodCount > limit && !poUser.muted) {
                flbot.sendAll(sys.name(src) + " was kicked and muted for flooding.", 0);
                poUser.muted = true;
                Mutes[srcip] = {
                    "by": flbot.name,
                    "mutedname": sys.name(src),
                    "reason": "Flooding.",
                    "time": time + 300
                };
                kick(src, true);
                return;
            }
        }
        
        if (script.isMCaps(message) && auth < 1 && !ignoreFlood) {
            poUser.caps += 1;
            
            limit = (chan === testchan ? 15 : 6);
            
            if (poUser.caps >= limit && !poUser.muted) {
                if (Capsignore[sys.name(src).toLowerCase()] !== undefined) {
                    return;
                }
                
                capsbot.sendAll(sys.name(src) + " was muted for 5 minutes for CAPS.", 0);
                poUser.muted = true;
                Mutes[srcip] = {
                    "by": capsbot.name,
                    "mutedname": sys.name(src),
                    "reason": "Caps.",
                    "time": time + 300
                };
            }
        } else if (poUser.caps > 0) {
            poUser.caps -= 1;
        }
    },
    isMCaps: function isMCaps(message) {
        var count = 0;
        var i = 0;
        var c;
        while (i < message.length) {
            c = message[i];
            if (script.isLCaps(c)) {
                count += 1;
                if (count === 5) {
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
    toCorrectCase: function toCorrectCase(name) {
        if (sys.id(name) !== undefined) {
            return sys.name(sys.id(name));
        }
        return name;
    },
    tourBattleEnd: function tourBattleEnd(src, dest) {
        if (!script.areOpponentsForTourBattle2(src, dest) || !script.ongoingTourneyBattle(src)) {
            return;
        }
        
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
        if (tourbattlers.length !== 0 || tourmembers.length > 1) {
            str = "<br/><center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>B</font>attle <font style='font-size:25px;'>C</font>ompleted!</font><hr width=300/><br>";
            str += "<b><i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(script.toCorrectCase(src)) + "</i> won their battle and moves on to the next round.<br><br><i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(script.toCorrectCase(dest)) + "</i> lost their battle and is out of the tournament.</b>";
        }
        if (tourbattlers.length > 0) {
            str += "<br><hr width=300/><br><i style='color:red; font-weight:bold;'>" + tourbattlers.length / 2 + "</i>  battle(s) remaining!";
            str += "<br/><br/></td></tr></table></center><br/>";
            sys.sendHtmlAll(str, 0);
            return;
        }
        
        if (str.length > 0) {
            sys.sendHtmlAll(str + "<br/><br/></td></tr></table></center><br/>", 0);
        }
        
        script.roundPairing();
    },
    dreamAbilityCheck: function dreamAbilityCheck(src) {
        var bannedAbilities = {
            'chandelure': ['shadow tag']
        };
        var i;
        
        for (i = 0; i < sys.teamCount(src); i += 1) {
            var ability = sys.ability(sys.teamPokeAbility(src, i, i));
            var lability = ability.toLowerCase();
            var poke = sys.pokemon(sys.teamPoke(src, i, i));
            var lpoke = poke.toLowerCase();
            if (bannedAbilities.hasOwnProperty(lpoke) && bannedAbilities[lpoke].indexOf(lability) !== -1) {
                bot.sendMessage(src, poke + " is not allowed to have ability " + ability + " in 5th Gen x Tier. Please change it in Teambuilder. You are now in the Random Battle tier.");
                return true;
            }
        }

        return false;
    },

    loadRegHelper: function loadRegHelper(reloadAnyway) {
        if (typeof Reg !== "undefined" && !reloadAnyway) {
            return;
        }

        Reg = Plugins('reg.js').Reg();
    },
    
    loadBots: function loadBots() {
        var Bot = Plugins('bot.js').Bot;

        bot = new Bot("Bot", "blue", "±");
        guard = new Bot("Guard", "darkred", "±");
        watchbot = new Bot("Watch", "green", "±");
        topicbot = new Bot("Channel Topic", "red", "±");
        setbybot = new Bot("Set By", "orange", "±");
        capsbot = new Bot("CAPSBot", "mediumseagreen");
        flbot = new Bot("FloodBot", "mediumseagreen");
    },
    
    loadCommandLists: function loadCommandLists() {
        Lists = Plugins('lists.js').lists();
    }
});
