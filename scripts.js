/*jslint continue: true, es5: true, evil: true, forin: true, sloppy: true, vars: true, regexp: true, newcap: true, nomen: true*/
/*global sys, SESSION, script: true, Qt, print, gc, version,
    global: false, Plugin: true, Config: true, module: true, exports: true,
    bot: true, Reg: true, Leaguemanager: true, Lists: true, CommandList: true, MathJS: true, format: true, JSESSION: true, emoteFormat: true, hasEmotesToggled: true, tourmode: true, tourmembers: true, getTier: true, tourtier: true, tourplayers: true, roundnumber: true, isFinals: true, battlesLost: true, tourbattlers: true, battlesStarted: true, hasEmotePerms: true, Emotetoggles: true, rouletteon: true, spinTypes: true, EmoteList: true, TableList: true, MegaUsers: true, FloodIgnore: true, Capsignore: true, Autoidle: true, Emoteperms: true, Feedmon: true, tournumber: true, prize: true, isTier: true, tournumber: true, Kickmsgs: true, Welmsgs: true, Banmsgs: true, Channeltopics: true, android: true, topicbot: true, Mutes: true, Rangebans: true, muteall: true, kick: true, tempBanTime: true, tempBan: true, pruneMutes: true, nightclub: true, supersilence: true, ev_name: true, getName: true, ban: true, Plugins: true, PluginHandler: true, reloadPlugin: true, htmlchatoff: true, bots: true, servername: true, isBanned: true, loginMessage: true, logoutMessage: true, floodIgnoreCheck: true, removeTag: true, randcolor: true, colormodemessage: true, lolmessage: true, pewpewpewmessage: true, hasBasicPermissions: true, hasDrizzleSwim: true, hasSandCloak: true, staffchannel: true, testchan: true, watch: true, aliasKick: true, nthNumber: true, ChannelLink: true, addChannelLinks: true, firstGen: true, Feedmons: true, addEmote: true, Bot: true, guard: true, watchbot: true, setbybot: true, lolmode: true, spacemode: true, reversemode: true, colormode: true, scramblemode: true, capsmode: true, pewpewpew: true, capsbot: true, poScript: true, flbot: true, Utils: true
*/

/* Meteor Falls v0.8 Scripts.
    By: [VP]Blade, TheUnknownOne, Ethan
    Credit to: Max, Lutra
*/

var Config = {
    // Configuration for the script.
    
     // Repo to load plugins from.
    repourl: "https://raw.github.com/meteor-falls/Scripts/master/plugins/",
     // Repo to load data (announcement/description + tiers) from.
    dataurl: "https://raw.github.com/meteor-falls/Server-Shit/master/",
    
    // Plugin directory.
    plugindir: "plugins/",

    // Do not touch unless you are adding a new plugin.
    // Plugins to load on script load.
    plugins: ['jsession', 'bot', 'reg', 'utils', 'emotes', 'feedmon', 'init', 'lists', 'commands', 'events', 'mathjs'],
    
    // Whether or not to load plugins from repourl. If set to false, they will load locally.
    load_from_web: true, 
    // If HTML should be stripped from channel messages outputted onto the server window.
    stripHtmlFromChannelMessages: true,
    // If emotes are enabled.
    emotesEnabled: true
};

var GLOBAL = this;

(function() {
    var PluginHandler = GLOBAL.PluginHandler = {};
    PluginHandler.plugins = {};
    dir = Config.plugindir;
    
    sys.makeDir(dir);
    
    PluginHandler.load = function PluginHandler_load(plugin_name, webcall) {
        var fileContent,
            resp;
        
        if (webcall) {
            resp = sys.synchronousWebCall(Config.repourl + plugin_name);
            sys.writeToFile(dir + plugin_name, resp);
        }
        
        fileContent = sys.getFileContent(dir + plugin_name);
        
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

    PluginHandler.unload = function PluginHandler_unload(plugin_name) {
        return (delete this.plugins[plugin_name]);
    };
    
    PluginHandler.callplugins = function PluginHandler_callplugins(event) {
        var args = [].slice.call(arguments, 1);
        var plugins = this.plugins,
            plugin;
        
        for (plugin in plugins) {
            if (plugins[plugin].hasOwnProperty(event)) {
                try {
                    plugins[plugin][event].apply(plugins[plugin], args);
                } catch (e) {}
            }
        }
    };

    var plugin,
        plugin_name,
        i;
    
    for (i = 0; i < Config.plugins.length; i += 1) {
        plugin = Config.plugins[i];
        plugin_name = (plugin.indexOf(".") === -1) ? plugin + ".js" : plugin;
        PluginHandler.load(plugin_name, Config.load_from_web);
    }
}());

function Plugins(plugin_name) {
    if (!PluginHandler.plugins.hasOwnProperty(plugin_name)) {
        return null;
    }
    
    return PluginHandler.plugins[plugin_name];
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
        mathjs = Plugins('mathjs.js')();
    }
}

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

function poChannel(chanId) {
    this.id = chanId;
    this.name = sys.channel(chanId);
    
    this.bots = true;
}

JSESSION = Plugins('jsession.js');
JSESSION.identifyScriptAs("Meteor Falls Script v0.8");
JSESSION.registerUserFactory(poUser);
JSESSION.registerChannelFactory(poChannel);
JSESSION.refill();

var poScript;

poScript = ({
    serverStartUp: function serverStartUp() {
        script.startUpTime = +sys.time();
        script.init();
    },
    init: function init() {
        Plugins('init.js').init();
        Plugins('emotes.js')();
    },
    warning: function warning(func, message, backtrace) {
        PluginHandler.callplugins("warning", func, message, backtrace);
    },
    beforeNewMessage: function beforeNewMessage(message) {
        PluginHandler.callplugins("beforeNewMessage", message);
    },
    
    afterNewMessage: function afterNewMessage(message) {
        PluginHandler.callplugins("afterNewMessage", message);
    },
    
    beforeServerMessage: function (message) {
        PluginHandler.callplugins("beforeServerMessage", message);
    },

    beforeChannelJoin: function beforeChannelJoin(src, channel) {
        PluginHandler.callplugins("beforeChannelJoin", src, channel);
    },

    beforeChannelDestroyed: function beforeChannelDestroyed(channel) {
        PluginHandler.callplugins("beforeChannelDestroyed", channel);
    },

    megauserCheck: function megauserCheck(src) {
        JSESSION.users(src).megauser = MegaUsers.hasOwnProperty(sys.name(src).toLowerCase());
    },

    afterChannelCreated: function afterChannelCreated(chan, name, src) {
        JSESSION.createChannel(chan);
    },

    afterChannelJoin: function afterChannelJoin(src, chan) {
        PluginHandler.callplugins("afterChannelJoin", src, chan);
    },

    beforeLogIn: function beforeLogIn(src) {
        PluginHandler.callplugins("beforeLogIn", src);
    },
    afterLogIn: function afterLogIn(src, defaultChan) {
        PluginHandler.callplugins("afterLogIn", src, defaultChan);
    },
    beforeChangeTier: function(src, team, oldtier, newtier) {
        PluginHandler.callplugins("beforeChangeTier", src, team, oldtier, newtier);
    },

    beforeChangeTeam: function beforeChangeTeam(src) {
        PluginHandler.callplugins("beforeChangeTeam", src);
    },

    beforeChatMessage: function beforeChatMessage(src, message, chan) {
        PluginHandler.callplugins("beforeChatMessage", src, message, chan);
    },
    
    beforeLogOut: function beforeLogOut(src) {
        PluginHandler.callplugins("beforeLogOut", src);
    },
    
    afterChangeTeam: function afterChangeTeam(src) {
        PluginHandler.callplugins("afterChangeTeam", src);
    },
    
    beforePlayerKick: function beforePlayerKick(src, bpl) {
        PluginHandler.callplugins("beforePlayerKick", src, bpl);
    },

    beforePlayerBan: function beforePlayerBan(src, bpl, time) {
        PluginHandler.callplugins("beforePlayerBan", src, bpl, time);
    },

    beforeChallengeIssued: function beforeChallengeIssued(src, dest) {
        PluginHandler.callplugins("beforeChallengeIssued", src, dest);
    },

    afterPlayerAway: function afterPlayerAway(src, mode) {
    },

    beforeBattleMatchup: function beforeBattleMatchup(src, dest, clauses, rated, mode, team1, team2) {
        PluginHandler.callplugins("beforeBattleMatchup", src, dest, clauses, rated, mode, team1, team2);
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
        PluginHandler.callplugins("afterChatMessage", src, message, chan);
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
            str += "<b><i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(Utils.toCorrectCase(src)) + "</i> won their battle and moves on to the next round.<br><br><i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(Utils.toCorrectCase(dest)) + "</i> lost their battle and is out of the tournament.</b>";
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
        watchbot = new Bot("Watch", "#00aa7f", "±");
        topicbot = new Bot("Channel Topic", "red", "±");
        setbybot = new Bot("Set By", "orange", "±");
        capsbot = new Bot("CAPSBot", "mediumseagreen");
        flbot = new Bot("FloodBot", "mediumseagreen");
    },
    
    loadCommandLists: function loadCommandLists() {
        Lists = Plugins('lists.js').lists();
    }
});
