/*jslint continue: true, es5: true, evil: true, forin: true, sloppy: true, vars: true, regexp: true, newcap: true, nomen: true*/
/*global sys, SESSION, script: true, Qt, print, gc, version,
    global: false, Plugin: true, Config: true, module: true, exports: true,
    bot: true, Reg: true, Leaguemanager: true, Lists: true, CommandList: true, MathJS: true, format: true, JSESSION: true, emoteFormat: true, hasEmotesToggled: true, tourmode: true, tourmembers: true, getTier: true, tourtier: true, tourplayers: true, roundnumber: true, isFinals: true, battlesLost: true, tourbattlers: true, battlesStarted: true, hasEmotePerms: true, Emotetoggles: true, rouletteon: true, spinTypes: true, EmoteList: true, TableList: true, MegaUsers: true, FloodIgnore: true, Capsignore: true, Autoidle: true, Emoteperms: true, Feedmon: true, tournumber: true, prize: true, isTier: true, tournumber: true, Kickmsgs: true, Welmsgs: true, Banmsgs: true, Channeltopics: true, android: true, topicbot: true, Mutes: true, Rangebans: true, muteall: true, kick: true, tempBanTime: true, tempBan: true, pruneMutes: true, nightclub: true, supersilence: true, ev_name: true, getName: true, ban: true, Plugins: true, PHandler: true, reloadPlugin: true, htmlchatoff: true, bots: true, servername: true, isBanned: true, loginMessage: true, logoutMessage: true, floodIgnoreCheck: true, removeTag: true, randcolor: true, colormodemessage: true, lolmessage: true, pewpewpewmessage: true, hasBasicPermissions: true, hasDrizzleSwim: true, hasSandCloak: true, ChannelNames: true, staffchannel: true, testchan: true, watch: true, aliasKick: true, reconnectTrolls: true, nthNumber: true, ChannelLink: true, addChannelLinks: true, firstGen: true, teamSpammers: true, Feedmons: true, addEmote: true, Bot: true, guard: true, watchbot: true, setbybot: true, lolmode: true, spacemode: true, reversemode: true, colormode: true, scramblemode: true, capsmode: true, pewpewpew: true, capsbot: true, poScript: true, flbot: true, Utils: true
*/

/* Meteor Falls v0.7 Scripts.
    By: HHT, TheUnknownOne, Ethan
    Credit to: Max, Lutra
*/

var Config = {
    // Configuration for the script.
    repourl: "https://raw.github.com/meteor-falls/Scripts/master/plugins/", // Repo to load plugins from.
    dataurl: "https://raw.github.com/meteor-falls/Server-Shit/master/", // Repo to load data (announcement/description + tiers) from.
    
    plugindir: "plugins/", // Plugin directory.
    
    serverowner: "HHT", // The server owner.
   
    permissions: {
        update: ["theunknownone"], // People who can update scripts/tiers.
        feedmon: ["theunknownone"], // People with special Feedmon permissions.
        
        // Gives users access to all commands of that level.
        auth_permissions: {
            mod: [],
            admin: [],
            owner: ["ethan"]
        }
    },
    
    pushStaffChannel: ['theunknownone'],

    // Do not touch unless you are adding a new plugin.
    plugins: ['jsession', 'bot', 'reg', 'utils', 'emotes', 'feedmon', 'init', 'item-cup', 'lists', 'mathjs', 'commands'], // Plugins to load on script load.
    
    load_from_web: true, // Whether or not to load plugins from repourl. If set to false, they will load locally.
    stripHtmlFromChannelMessages: true, // If HTML should be stripped from channel messages outputted onto the server window.
    emotesEnabled: true, // If emotes are enabled
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
    sys.makeDir(this.dir);
    
    this.plugins = {};
}

PluginHandler.prototype.load = function PluginHandler_load(plugin_name, webcall) {
    var fileContent;
    
    if (webcall) {
        sys.writeToFile(this.dir + plugin_name, sys.synchronousWebCall(Config.repourl + plugin_name));
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

PluginHandler.prototype.callplugins = function PluginHandler_callplugins(event) {
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
};

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
    //Mutes.hasOwnProperty(ip);

    this.originalName = sys.name(id);
    this.megauser = false;
    //MegaUsers.hasOwnProperty(this.originalName.toLowerCase());
    
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
        
        if (Config.pushStaffChannel.indexOf(sys.name(src).toLowerCase()) !== -1) {
            return;
        }
        
        if ((channel === staffchannel && !user.megauser && Utils.getAuth(src) < 1) || (channel === watch && Utils.getAuth(src) < 1)) {
            guard.sendMessage(src, "HEY! GET AWAY FROM THERE!", 0);
            watchbot.sendAll(sys.name(src) + "(IP: " + sys.ip(src) + ") tried to join " + sys.channel(channel) + "!", watch);
            sys.stopEvent();
            return;
        }
        if (channel !== android && sys.os(src) === "android") {
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
        if (reconnectTrolls[srcip]) {
            sys.stopEvent();
            return;
        }
        
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

        if (myAuth > 0 || Config.pushStaffChannel.indexOf(poUser.originalName.toLowerCase()) !== -1) {
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

        function displayBot(name, message, color) {
            var chan = defaultChan;
            
            if (sys.os(src) === "android") {
                if (!sys.isInChannel(src, android)) {
                    sys.putInChannel(src, android);
                }
                
                chan = android;
            }
            
            if (!sys.isInChannel(src, chan)) {
                sys.putInChannel(src, chan);
            }
            
            sys.sendHtmlMessage(src, "<font color='" + color + "'><timestamp/> ±<b>" + name + ":</b></font> " + message, chan);
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

        if (sys.name(src) === "Ian") {
            sys.sendHtmlAll("<img src='data:image/png;base64,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' width='222' height='280'>", 0);
        } else if (sys.name(src) === "TheUnknownOne") {
            sys.sendHtmlAll("<img src='data:image/jpeg;base64,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' width='222' height='280'>", 0);
        } else if (Welmsgs[sys.name(src).toLowerCase()]) {
            var theirmessage = Welmsgs[sys.name(src).toLowerCase()];
            var msg = (theirmessage) ? theirmessage.message : loginMessage(sys.name(src), Utils.nameColor(src));
            if (theirmessage) {
                msg = msg.replace(/\{Server\}/gi, Reg.get("servername"));
                msg = emoteFormat(msg);
            }
            sys.sendHtmlAll(msg, 0);
        }

        pruneMutes();
        if (Mutes[ip]) {
            var myMute = Mutes[ip],
                muteStr = myMute.time !== 0 ? Utils.getTimeString(myMute.time - +sys.time()) : "forever";
            poUser.muted = true;
            bot.sendMessage(src, "You are muted for " + muteStr + ". By: " + myMute.by + ". Reason: " + myMute.reason, 0);
        }

        var i;
        var drizzleSwim = hasDrizzleSwim(src);
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

        script.megauserCheck(src);

        if (tourmode === 1) {
            sys.sendHtmlMessage(src, "<br/><center><table width=30% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:11px; font-weight:bold;'>A <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament is in sign-up phase</font><hr width=200/><br><b><i style='color:red; font-weight:bold;'>" + script.tourSpots() + "</i> space(s) are remaining!<br><br>Type <i style='color:red; font-weight:bold;'>/join</i> to join!</b><br/><br/></td></tr></table></center><br/>", 0);
        } else if (tourmode === 2) {
            sys.sendHtmlMessage(src, "<br/><center><table width=35% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:11px; font-weight:bold;'>A <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament is currently running.</font><hr width=210/><br><b>Type <i style='color:red; font-weight:bold;'>/viewround</i> to check the status of the tournament!</b><br/><br/></td></tr></table></center><br/>", 0);
        }

        var tier = getTier(src, "5th Gen OU");
        if (tier) {
            script.dreamAbilityCheck(src);
        }
    },

    beforeChangeTier: function beforeChangeTier(src, oldtier, newtier) {
        var drizzleSwim = hasDrizzleSwim(src);
        var i;
        
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
        var drizzleSwim = hasDrizzleSwim(src);
        var i;
        
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
        if (Utils.getAuth(src) < 1 && message.length > 600) {
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

        if (originalName === "Ian" && (messageToLowerCase === "ok" || messageToLowerCase === "ok!")) {
            sys.stopEvent();
            sys.sendHtmlAll("<timestamp/> <b>Ian Check:</b> <font color='green'>OK!</font>", chan);
            return;
        }
        
        if (Utils.hasIllegalChars(message)) {
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
        
        if (myAuth < 1 && muteall) {
            sys.stopEvent();
            bot.sendMessage(src, "Shut up! Silence is on!", chan);
            watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Silence Message -- " + Utils.escapeHtml(sys.name(src)) + ": " + Utils.escapeHtml(message), watch);
            script.afterChatMessage(src, message, chan);
            return;
        }
        if (myAuth < 2 && supersilence) {
            sys.stopEvent();
            bot.sendMessage(src, "Shut up! Super Silence is on!", chan);
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
            
            if (!Plugins('commands.js').can_use_command(src, command)) {
                bot.sendMessage(src, "The command " + command + " doesn't exist.", chan);
                return;
            }
            Plugins('commands.js').handle_command(src, message, command, commandData, tar, chan);
            return;
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

        watchbot.sendAll(" [Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Message -- " + Utils.escapeHtml(sys.name(src)) + ": " + Utils.escapeHtml(originalMessage), watch);

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
        if (typeof myUser.teamChanges === 'undefined') {
            myUser.teamChanges = 0;
        }

        myUser.teamChanges += 1;

        var teamChanges = myUser.teamChanges;
        var ip = sys.ip(src);

        if (!teamSpammers) {
            teamSpammers = {};
        }

        if (teamChanges > 2) {
            if (typeof teamSpammers[ip] === "undefined") {
                teamSpammers[ip] = 0;
                
                sys.setTimer(function () {
                    if (typeof teamSpammers[ip] !== "undefined") {
                        teamSpammers[ip] -= 1;
                        
                        if (teamSpammers[ip] <= 0) {
                            delete teamSpammers[ip];
                        }
                    }
                }, 40 * 1000, false);
                
            } else if (teamSpammers[ip] === 0) {
                teamSpammers[ip] = 1;
                watchbot.sendAll("Alert: Possible spammer, ip " + ip + ", name " + Utils.escapeHtml(sys.name(src)) + ". Kicked for now.", watch);
                kick(src);
                
                sys.setTimer(function () {
                    if (typeof teamSpammers[ip] !== "undefined") {
                        teamSpammers[ip] -= 1;
                        
                        if (teamSpammers[ip] <= 0) {
                            delete teamSpammers[ip];
                        }
                    }
                }, 180 * 1000, false);
                
                return;
            } else {
                watchbot.sendAll("Spammer: ip " + ip + ", name " + Utils.escapeHtml(sys.name(src)) + ". Banning.", watch);
                ban(sys.name(src));
                delete teamSpammers[ip];
                return;
            }
        }

        sys.setTimer(function () {
            var user = JSESSION.users(src);
            
            if (user) {
                user.teamChanges -= 1;
            }
        }, 5 * 1000, false);
        
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

    beforeBattleMatchup: function beforeBattleMatchup(src, dest) {
        var tier = getTier(src, tourtier),
            desttier = getTier(dest, tourtier);
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
