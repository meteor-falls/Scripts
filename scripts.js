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
            sys.sendHtmlAll("<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAABvCAIAAADniJB2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjExR/NCNwAAHe5JREFUeF7tnHlU01e39+9f97336e3TVgVlhoSMZJ5JQiaSkISEKcwkQAIJUwJhCvM8CSgiIMogCIiAguA8z7XOs9YZrcPT9ra1T6u1rVbve5Cu1gFpb02sPrdZv+VaunLi2Z/z3fucs8/+nX/7n78+Twj8218cJgn8BeJnJbxWEI8fP777zXef3f7qzpffPnzw0xslxtcE4tGjR8vaR5USEw0dTkFGeFNN4dLafEP/ymUHrl/+AgD606G8JhAnj59HQ2Quc/gutnyonRgHCRPT8xWc2gDB/FBJU1fLrv8rIM6fuyzhhyRqDAG+QQvralURkX1dff6++vioOj4tPzJw/p8uCmsp4tLFS62Llizr7rl96zYY7evjVzoWNfjLJQ215SwWIyvTkG4yrlq5orFxXmd7Z/3cjn9NRVy8cJFO8REyU7wZRr5nbG11y5HDh9KSdWQyacHcMn9/3yWLGiJVEZcvnF7a2TbQ37Njx/Z/TRAVFTVidqqYlS5mZog9M4SMNG9PNZfNV/r58Xic3s6W/LysbVvWLWycl55uysvLvXnzxr8miFRjjoyTBUD4sDNEnukCaiqXmMDEqtBwUl1FycJ51b1dS+IT9E1NjekZprS0tM8///za+PWuzoHqyqbVw6MPHjx4/VysEiOKiyp9edmAgoSdKWZlCOhGDFThYot1tkG7O6Ei/cy5xgVMenBrS2dNdXVpcZk5o46CjSaitRSMnoTVpBrMrz92WgXEtm07hOwEH69MCRt4RzqIFDbv2TBc50R4YvxoGA6RzMLreaQiHqk4WFKtiSxnkhIYhBQ6LtWTkMml5lIJIZ9++ulrFoVVQPz00yN1lEHileHDNAEH4ZBj7d5/N5QEW2YM2zzXVJsY7sum0zAKPqWYTy7jU8oEtDI+tYQH/kor8WFXMmnhX3zxxb8CCGDDzZu3/eUaH3aamGniUXUuM9/TMNCD5ugPm/M/7p8/XJubHhXAJtDoGJWQXuHDrJWwa6VetXJevQ83r6xs7mumYN1N1xdffJljLufQ1QJGAsLezgcD0Qsoo4UJI4UJ/XnxBzurR2pzlGxScawmLWVukNys8DHFqnP7+4cePvwTtiFWcY2nx/Pq1fHl/UOpqjAewgnnYLursXAgI2ZxUsSHC3OujTRvLk6+PLYcfB9sRn766U+w/5euWh3E5P+0qrUxlooIxkE+bCy60t94dGHeP9Z2jK9qOtdRef+/J5aef/rnNYHYNNSnoqH4MKc1pWkbyk3NKsX44KKrgwvG9299guD/zO7z+IF9UgIMbmcbQUIUKLjhdOzmcsOB1qLDOzb/+OOPf7ocrBssnzbvyOGDCgbWFw+t8hccWFjclRa5vjShJj5A4yvoam3Zu3P3zRs3QJT4E4lY3TUePnxwaP/ukvys9kJ9gphSEMjd01w4TxeUE8RNV3onKLyiA/2MySmGFMOC+fP27dn99Vdf/Sk4rAviwoULB/ZsXVhXFhwkn5elGchWZsoZsTxCDAdrCvAqiFEUqKXRQf56TWxleWlZSVF35xKDIWXzho337t59zTisBWL86uU1I4ORkeF7tq5JTY7bt21sTW/r2grNWFHUQK66PS20Ny96rCpxy/yMga4la1Yul0plhfk5apWax4wTsfJjwisO7jv3OllYBcTtW/+tj84x6k3tixaCvWaqIWHe3NLC/OzR1qpji7PO91fcXN92ZXn5uWUFxzrLh5cvLSvMraosa29dWF1Z2raocUlLm1ycpo9sefDjw9fGwvIgzp66Guybw8TGs7EpLFxyXHj2muH+i2eP1dZWLOtsvbCxd3zVvEsrKi50FVzor9hZlzoy0NPd0WpKMwYpA0eGeuO0sQkJ8eGhGj9+zbGD428riNs3vwjxzeUQ4sWUdD9mkYSWFywxdrY1rx0duDl+fkXf0hP7d9ze2Hm5r+Jwc+qlFTU76gz7d2xobZqvVkclJupVatWy7raTRz9KTynxZVdkxPXd+ere62FhYUXMK+uXMIwiiknumefLyPPCxXy4c3tnxyKdXru0vfng/t0ZGan7R7qvjyzYv2LBubVdx9vzlne2bF43XFtdER2j2rB2JDMzfWjFMgE7zgtvDBYt2DB67O0DATZLGmWFlJEqIKYACgKSTubjt2Txwv6etqGBPnNu9kB/96ljB4ICFWe3rTyyb+uRfZv3Djbt2LCqvrp0w7qR/r6uWK22fUlzYmKiB0TJwCQLafklGateT5LGkor4ZPyzMHEBj6Dn4fQ8fAoZpmB5eu3YtLqoIHvLpjXnTh2pKC/ZtG4kTqu+fvnc3tU9u4bahxeXy6UiJtPTkJK0ZElLSXGBVC4PCdTCHX2pyHgeyRwha9m99cxrEIUlQezcfCyAm+WF0QgIKVy8Ee0kd7ah+HoHLaivSkrSZWWZerrbW1saMjNTt21e07V0yYk9G3b3zd+7ZfTogV2rhwd2bFlfVVNVXV1B8AiAzhHiIOEcvEnGLMtPXfHA+ueDlgTR175VSNHz8fE8gpHpkejhEmA/k0aABngSJEkJCXE6rTnbtG/35tGRgeLivNVDPduHl/W1VAf5S01pKaOrB/fv3X725BG9LgPlpnSa5QWzl9KQGj4pO4BX09e+19obM0uCqCnq5RG0QpKBhUnm4g0EaITdDCreLYAICYI7cXXa+G2bRo8e3H388L5lHS0b2+YfX9awe7RjbKj76qWzGVmmTHNGw/za5Nh6rHvY7A9obrP5WNdAlkeCkJoXJmncscG66ytLgjDE1oJIycWneOGSRZRMKjLWfiYJ66ogQJRYFwUZoSjOK/LzkwcG+pXmpK0r0IzUFbTWFJ/8aFtRcf7xoweGhgY02gQ/Xi0aopw9g2I3k42w9yG5AwcxypilccEdN8a/tF6wsBiIb/75XaQMLBzSgBb4uEQZPZ+BjrObhUM5ScDAYl39qfAwIiwoJc5oNuq21mYebimuLMgeKNSO9S3WxakvXTi9fu3qCKVZ6b0A4aqYPZNs+wHZ2YaDdpISYZEMjwQ6Rh8sK6gtW75n5/E9e/aAXYxloVgMxOGPLoQKCwSkZD4+QUhK4xHSqcgY2xkouIMQ7awgQgNJ7iFuc/gIJ75WLDrWmH5+WdX5nprL3dUHFpcb4tUH9u/KMRcHixrAk2VqlMn0rg5C59lcqJ0A5iBGOEqQTjIsBOR7Y5rn1mxaWLx1YcnRNf0Pvv/OUjgsBmJo2S5fkLDGxfHxSTSkDuiZhAqztyVA7bhwBzEAAbHju9mzMlJSDNrIffXG0x1F57qrLvXVn1pS3tNQ3tXRGhNcFiFtCZMu+PjM+OUr11AYnu0slIMNFWovcLf3BiDgjtI4adTmyrTxgZZTS8qurFxy/cDONw5EQ/kQj6ARkkCYNAnJWZ7ohJiIQiE3wnk2G+EoBpEC6sjLNGSlpuhrKwuP99WfW1p6pqP05KK8M82FB4aXluSUSZkFwcJ54bKGr+9M7MEPHTrlgfGFOAvc7LludiJ3e1G4V+BgYvC6stRzK5ccWpB7Y3XnrbHuH/9pmfyFhRTx+H9StfM5hFgCNBAHCaIiYhkeids3HV7Y0A2152NcZGysrji7dnFz3ehgV+O8yrqk0GPNOYebcg4vNJ9oKSzQRrBw4UJqlpRVFCGvefzo5xTmkSNnOaxIiLMQ4ihEOImLw1T9uqDRpY0ndq46umfTwQ39F7aNfH3OMmtwy4C4f/+HQFE6DR3h6RHLQMWyPHQsj3hfdqqEmUyFh1PgISSY0qjL53A8ywqzmhuqVjSUbKs2bC5P3FKWtL3cmBoQwfKI8cIlcojJkYrSp9X+zTd3h1dtNyTVMUiq9ED1hnTNuuaKtR3zDu5c+9GO1We3jXz32S2LeIdlQJz/+BqbGElDhVLgoQykyhOl9nzyJx0RCSaLCRDuQUG+uu72hds2DvcuXbSuvyM3SFwcIgthsqnunh7OEgb4Mjqa7qGOUORNadiXX97dvOHwWPPSxvjwJm1Qsy6sMydlZ2vto4eWOTq3DIg1I7u45BgyIpiOimIgIycfOjKShoigIgCdEKJ7UEFa/cUzh8dW9cSowhS+Yh49AOeqoMHVRGgoxtWPgggjwkPIiBBffuL0u6wj27YvTYurjQlrNiWtG5g4HLLIx0IghvcKqFoqMoSBiqSjwunIiMmHCgdHv0EgcAClKATxalWYUMgNCvBN1scoJXo2WsNAqKmwSLybPxkeincPJMAD2WT13bv3p7Ht8aNHxz/ad+HMqQsXLoLzMYtQsFg6f/+e02JWAgunYqAjGBMgwmlI4BHBJPdAEiwYGElFhkvZug0j/at62xbNr8szmRXcOAZCBUDQ4FE4twACNBgHVRLhwVyK9uOz16c37x+3Pvn0toWLbCyjiLvf3lcrC3mUWCY2koEOp6PDQbygIsETBhBQECF4dwXSxZuMESJdeDBHb7iDCOPsj3cLIUPDqbBwQIEAA34RTkGrhJ7Gwd7fKKk6eep0W5uF688sAwIMIEhVzqvpNSXWhSvMCr4xQGQyaGuqSzpQUIG9LXaODQruzKMgw8jwMCoiguQehoeEECAhFFg4iCYkWBgZGUVDxzDxeh+muaakd/q95o0bN2tq6y3lFJO/YzEQT3XrMSgUmQx4YFplU0IpyEBPjwgqKpQIV4LAQYEDEKFgxU2DRzBRKiY6mgIHuwkNE58goGWGSEq7OpbeuzddqvLbb7/NzSt680H82sNHjx5nJpeLWaFJ0WYvmr8uKivcT8+l+rPxIDpEsdDRXphYNkZLR8Ww8Il8agZYUAk9M/wDlR9//PE0dj58+NCUkf02gfj+++8Hezsa6yv27VhnzkwZ7Gtraqge7F3CxUdyMNE8rIaHi2dj4plYHZecLmEWyDll4Mk2Fe/du3u6iePx41RT1tsEYt++fY31letXL+9qa4zXRuzaMpqbmTzU2ykE+Rt8rIig4+P0XtgEL3yKN83s61Wq4FQAEDJeWm9P9/RTY3pWjgXnTivFiF+HatXKgeL8rK3rBkcHl4aFKEDauq25NlwZLCJqfMh6ETHBm5D4JMFpENJyAAg5p1zBKfdh5RfnNk0fLwuKyr77zmJ7cOuCAH5RXVGaYUz4aOe6rtb6usqC9SO9/grx3LJyCUUvJoEnSUxKERKNHJyBT836BYSCW54UvWh65dfOa/zs088s6B3WmDV+7h6YOHZv2yNkS7KT07OS0yP9w8tzitJ1qdqQJB5W5U2IE5ESRKRkb4KBhzeK6HlPXGNCEX68ykj5gq++nO5AvH1pN1hZvh0gQC87GleHCExyuk5K1cpoehkjRUzWczARLHQYBxPFx2uBa4hIqVKaWcYsknuVPQFR4cetVIrq9u+Zzs7h1WsOHDz01oCoyl2q5KfK6PESapyUqlcw0/yYGb70NCAHDkbF8VALCYkyWkYAu1DhVTJJQcGtBCCCvOf2LJlu4ti5a+/GTVveDhDANdJi6wK5BgktzoeiBSBktBS5p8mPle3PypYzMqTUNEBB4Wn2Z+VJPfPkXuUKLpBDBXCNAH51evyyac51Tp46s7x/8O0A8cP3P8b4Ffh7pUioWh+KBgRIX4ZRQgXRMV5MTpDSjICFn6dZ4ZnjyzCL6TlgygBamHiegIiQLTi078rLTL1x81ZTy+K3A8Tnn94JE2f5sZMABREpRkyKk9LA4bBJQjV4E+L5eA0fq+Hj4gSEBBE5VczIBQiAX0zGCH9eVaikobPppd7x7d27ZZWWrFS24qxx8dyNYO90OTPhVxDUFBk9TeGZBR4ZPV1MBkQSQfqfR0gWUDMlrGIJq8SXU+HPr5HzqgOEtYVpI99/P3UCCpTp5uYVvx2KOLDvbJAgXcZIAJHShxInoSbI6EagCCktVUYz+dIz5IwsX3q2hJIO6inAylLKLgWPNyNfyCjw5VQqxfP14V1nT0xdlwsCUEZWztsBYu3wvgBemg9NJyJrRSQQLJNApPRnmf2ZIC6A6rp0X880OXiJAR8Hsr5EZAQNG8+lZIqZJVJ2uYJXEyCsV/m19ncceJm1pswcC5ZvW9E1zpwc9xPqWdgQT5SShQ7lYCK5WFBXCNJzoThXIcaZE+6X1Nq0HOLAdHfkUdFqL1Iqn5ItZhT5ABasMjm3SunTkJey6mXF+ua8oruWq0K0IggwkvGqPAkjgYtTcbFqIVEnIqX4UDJkNLMPNZOECOpqW/3ll/+k4v1RLhI8LJiFT+KRs3iUHG96gdgTxItSBb9ao2y/MT71EU5ldd3Nm5bJ5Vt3rwF+3Zza4Ms0cHBqtgdYR+oFRIOAbBJRsqWeBTxS8pEDE0mHssIWDESGdpNTkGovAhBFDp+SJ6AViBhFUnZZiHTB7i3np/SOlta2U6dOWypMWFcRlYVtcjbYU6mZ6EguTscjGASkdG9Klg89X+yZeeP658CM06cuklCBKBcZDhpMQ8dzCOl8Sq43NV9IL/RhlfgLa7sXgSqRKT4rBoY2bZ4s7rfAx7ogWhoGFOw0Li6aiYrkgFhIMPABCHK2kGoOkZRPXhgAslhRwZkoVxnaRUGERTEwSRxiBhDFBAhmCfCO8pyxKQ3dvGVbT+8bdq7xshFZuXyLnJXKxcUAEGxsHCgp4hGBIszelOyKvP5fWq0a3OgBkSOdfT3cAslIjSfOwAWw6IUgUvhyK40xvT9OVYJ79NjxhsZmC4jhyU9YVxF7dx6TMQ18gpaJjmJh4njEND4pw5uSI6Llbhw7/IsNd7+9x6KEo1x8US5+WEgIDa1jE9L41BwwlUrYZdGBiz//9JsXDR6/dq2g6JmD0leBYl0Qly/ekLIMAmI8y0PFxsTyiSYBOUtIzfFh5J87/cnT/a6tbEO7KVCu/miXAJx7BB2b6AW+TM+TcioDxXXnTk2xrPr666+TDWmvYvzTba0L4t7d+wouKJfQMT1AvIzhE9MFZLOQmithFv7j1p2n+zF+9QYBEYiFBqNdgzzclASQ4McleZHSRcxiP+/a9SNTnP2DN6ejNfFvBwiwENaGlIkoiWxMNADBJZqAXwhpuQH8qnt3f3jOhhRdOc49GA+LwEBCsdAwAjgQxCVzyJm+3KrqoqnjpTo6zlIpXOsqApiaa1zkQ0v2wsYCEDyiCdQKimh5av8FYLJ4DsShA6cICHD8GUWAq/DgZBgeSUComXiDgJ4frWz97t7z4EBzXULK9EdBv18vVgdRV9onoRu4OC0DHQ2mDBGtAFyqkp3Y82IXgXwilJl4eDgJGUNERAMK4CEhY1nEVH/vmlPHnokpk82zzHm3b1vmbUmrg2idP+wDQODjAAjgGmJ6oZRZtKByw5RjNTayHeuuJCNjgP3EJ3+SURoaJp5PN68ZPvpik5q59adPW6ZS2+oguhevAy8uTILgEFJF9AJfdkl/x4dTgvj+/vdeVOAXERMIkBoSUkNEavAIFYtk7G6booCurX3pzl3TpTbfINdY0b0FgAB7bQZazSEYhbSJtP3G1Sdf1sW5Fe0YKJg1VCRELAmpxcHUGGgIk2hoqBl9scmq4dXDI1P8+++3/5dvWl0RIyt2STxTAQg6SuU1caKV58+rmCYZeerkBRw8CJRjE+DROHgsyi3EAxJCxyUXZXe/aN6OHbs6Orv+gNkvNrE6iLGV+3wmQMTTkCqwufSm5ipFNZcvvPSQCoRMEUfnAQnEw9RoSKS7oxzrHkVBxxt14BDw+c/xEyfr5zW8HSBWD+wV0w2TIDjENG9aTqR8/ldfTHeKlaitRLn5YaAqmFMg1EGKh8fiEdHRodUvGnzt+ieFFlplW10RK5Zt51MSuAQ99WcQufFhi0AlyTTDWGRuQ0MCEK4hbvZSmKMcD9d4QMOUsuIXq+3u3PnamJbxdiiic9F6Nk7LwesnFEEAJahFOSlTLCKeNqYweynKLQDqqHC1EyOdA7HuMQhnfx9O9ot70B9++FGnT3o7QCysXUVHq8EenIpUs3Ep4CyrIm9o+q5nGVsBCIi9BGLvg3INQ7tFQR18vSip45cnEjlPf8DyVKPVW+TtN6u7Rk1JNxXsGlDgHo1oT0xioHd1Xdnq6UFkGhYjXPwABXcHkMKLgDkr3ewknvjkjWuOv9gQKMIiuWyrg2iu76XAVTREDBURw0Drg4Vz51esnR6EOa0L6eoPdZC4O8iRrhFudnLXOT40TEJDzboXGxqNpvv3pytQ/Z2OY3UQuRnVZLiKCo8GIOioeAW3rL5kCnue7m5BRi/KzR+4hruDAuYc4mQrBiAoaL1ONcVhZ2ZmNrjY7HdaO83XrA6ieV4HUATlCQgaMk5AyZpb8BuKKDIvBzHCzc4H6uAHcfB3sPF2nSMho3RSr/Jvv3l+8Csrqy5duvQWgDCbSoEiyDD1JAgvfKo5qW/6fpfmrcBAQ13tfCD2CufZMrtZApc5EiIi3ptRfPzI1efaNjU1HTpkgYoR6yoChDGNCrwSrCLD1RQQJpBaFi5FG/obGdfK4kEcLBqAcJkjc5glsp8pcJktIcDjeNTCFT17ngPR09OzedOmN10RDx78mBxn+hkE8I4nIAK8Kx5Nu6CqrxzGAhBzfJxsJYCC/Sxv59kSHEzDIecXmZ9X09jY6MCKXxPif5iIdRVx/fon3twAElAETE2BA+/QsHEGsWfe3Rdc/WkDFtaPYdxjXOaIHWyEc2bwHGxEzrN9sO6xAESI/PmF9u5du1oXtfxh+39paF0Qn/7jllGfRYSpSDD1kzARCy5DEFCzb34y3Z187Ys2Yd01TrPFIDoAEGDWcLaVYKAxXqQ8Bt70XLw8eeJEZUX5mw7i5ifjPLY/0X0CBHFCFLFsvBEcZJ048tKaIGBSX9d2PFznZCuaM5NvN4PvbAt8xAcNUbEIORR0yomjz8TL69euZ6ab3nQQQ0OD6cl5gMIkCDIshoVN9iKkbVrz6+nOizaMDH5IQCQAIQA52M0UADk42oqRrpGeuCwSKmnVimeOQu/cuROnjXnTQfT396UmmCddg+g+wcLTI5GFM7Q3TZ2znLRn87pjAIQjUAQIEDO9gSIcbMRw5zAaJp2ITKoueaaYDlxsFhaifNNBtLYu0mtNZHg0CRYNHITgHkVH6Vg4Y3569zRd37P9DAGhfxIp+U42YiANEC/dnZQkZAoekRgXueDptmDHFRigePz4VV/usm6wbGla4CsNBhTI8BiCuwoPjaQgNEAREYqqaW6J/2jveQxUbT+L7wAmTluxo40QQIE4BGLc4/DwBG/PnOfu3VcG+b36hXfWBXFo/44FdQ14KHhrRwNcA4AAD5hBeeTMr796aZJq/56zcOdARxuBk40QhEyAw2GW0NXeD+4aiXHXUNDJ18ef2VxEqyK/vvPMAeIf8BQrggCjlJOdtqK3B+cWChRBhscC18BCwOUJ0VxSxsEPp66DATZs3XQQ6aJwthU62gBFiOxnCQALlzlyd5cwNCQaC9OOrXrmNMCUarg2/vzS+3/Lwoogvrt3d251WVCQEgcJBQECiIIEiwE3x2BcQ4mwGJC5ellfz58/72yHnjOD4jgLxAhv+5l88Dja+EAcg9ydQ1EQ1ZKmZ7ZtpSVFx49Ncfzzv2JhRRDnzp2TScUDfUtpHpEEaCSYOylwLWDh4RqKdg3TqadIxk52/eqVK/Z2du++8847//n3me+62c2gTwSL2VKoQwDMOdCLGbZ6dP1XX/3qC42N83dsf9UaIiuCuHrlYnFRHofrRUQEAEU8WVY9YeEei4eqVUEvXQ6CREvTwsagwEAKmRQcrCwrK6OQqH/7f+/+x7+/M/P9v6NhbhQCvrykZNeOndu3bFo7NtKzrGt41W+k/35THVYEMTw83NpUHxURQoDLwVJiYvqERhGgAEcsGaYJ8wXFLr/3htcffvihsqKCSMC///d33/nbf/zX3/7zg/fetZn5gQcaWV1VsWZstL3tVQvUrQji+rWra0eHR4YH2xcNmdPmuzuwIfZMh1nEOTNQth+4SUWyP5BrvH//u6tXrxw8cGDP7t0glIBbQ8FQ79u7p7am6jfHfPovWBHE0//xhfPnZ814n4JBvvfu+//1znsz3rcNCgw5dvjgK/Z+svnZs2dyzZmv+FOvCcQ333zj5uxkM/N9Gg7l7gqZY+sYoowYGRp4xd5PNr99+1aiPu4Vf+o1gQC93LRhvdibP9tmJszFAQOHwCDOibpX7f2k8ffu3Y1Whb81IEBHwdUPH587s3Jwxdqx1ceOHLpzxzL35IBfPnXiVW+aeX2KeMURs3bzv0D8TPgvEH+BeNbZ/j9plghIOzj03QAAAABJRU5ErkJggg==' width='222' height='280'>", 0);
                            
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
