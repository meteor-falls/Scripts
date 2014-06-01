/* Meteor Falls v0.11 Scripts.
 *
 * By:
 *
 * [VP]Blade
 * TheUnknownOne
 * Ethan
 * Max
 *
 * for the Meteor Falls server!
 */

Config = {
    // Configuration for the script.
    servername: "Meteor Falls",
    maintainers: ['TheUnknownOne', '[ᴠᴘ]ʙʟᴀᴅᴇ'],

    // Repo to load plugins from.
    repourl: "http://meteor-falls.github.io/Scripts/",
    moduleurl: "http://meteor-falls.github.io/Scripts/mf_modules/",

    // Repo to load data (announcement/description + tiers) from.
    dataurl: "http://meteor-falls.github.io/Server-Shit/",
    emotesurl: 'http://meteor-falls.github.io/Emotes/emotes.json',

    // Module directory.
    moduledir: "mf_modules/",
    datadir: "data/",

    // JSON data files loaded from the repository (dataurl)
    data: ['emoji'],

    // Whether or not to load plugins from repourl. If set to false, they will load locally.
    load_from_web: true,
    // If HTML should be stripped from channel messages outputted onto the server window.
    stripHtmlFromChannelMessages: true,
    // If emotes are enabled.
    emotesEnabled: true,
    // Character limit in messages.
    characterLimit: 600
};

// Script state
Server = {
    border: "<font color=blue><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>",
    tourmode: 0,
    spinTypes: [], // can contain: items, emotes, pokemons
    muteall: false,
    supersilence: false,
    rouletteon: false,
    htmlchat: false,
    lolmode: false,
    spacemode: false,
    capsmode: false,
    reversemode: false,
    marxmode: false,
    georgemode: false,
    comicmode: false,
    scramblemode: false,
    colormode: false,
    pewpewpew: false,
    nightclub: false,
    warnings: {},
    teamSpammers: {},
    reconnectTrolls: {},
    uniqueVisitors: {
        ips: {},
        count: 0,
        total: 0
    },
    Poll: {
        active: false,
        subject: '',
        by: '',
        options: [],
        votes: {}
    }
};

require = function require(name, webcall) {
    if (webcall == null) {
        webcall = Config.load_from_web;
    }

    if ((name in require.cache) && !webcall) {
        return require.cache[name];
    }

    var __dirname = require.dir,
        module,
        __modulesrc;

    if (webcall) {
        require.download(name, __dirname);
    }

    if (!sys.fileExists(__dirname + name)) {
        throw {name: "NoFileError", toString: function () { return "Couldn't find file " + (__dirname + name) + "."; }};
    }

    __modulesrc = sys.getFileContent(__dirname + name + ".js");

    module = {
        exports: {},
        name: name
    };

    try {
        sys.eval("(function (module, exports) { " + __modulesrc + " }(module, module.exports));", __dirname + name);
    } catch (e) {
        sys.sendAll("Error loading module " + name + ": " + e + " on line " + e.lineNumber);
        print(e.backtracetext);
        throw e;
    }

    print("Loaded module " + name);
    require.cache[name] = module.exports;
    require.modules[name] = module;
    return module.exports;
};

require.download = function (name, dir) {
    var src = sys.synchronousWebCall(Config.moduleurl + name + ".js");
    sys.writeToFile(dir + name, src);
};

require.purge = function (name) {
    delete require.cache[name];
    delete require.modules[name];
};

require.callHooks = function callHooks(event) {
    var args = Array.prototype.slice.call(arguments, 1),
        modules = this.modules,
        exports, mod;

    for (mod in modules) {
        exports = modules[mod].exports;
        if (!(exports = exports.hooks)) {
            continue;
        }

        if (event in exports) {
            try {
                exports[event].apply(exports, args);
            } catch (e) {
                print("Module error (" + modules[mod].name + ") on line " + e.lineNumber + ": " + e);
                print(e.backtracetext);
            }
        }
    }
};

require.hookEvent = function hookEvent(name) {
    return function () {
        require.callHooks.apply(null, [name].concat(Array.prototype.slice.call(arguments)));
    };
};

require.dir = Config.moduledir;
sys.makeDir(require.dir);

if (!require.cache || (typeof FULLRELOAD === 'boolean' && FULLRELOAD === true)) {
    require.cache = {};
    require.modules = {};
}

FULLRELOAD = false;

(function() {
    var datadir = Config.datadir;
    sys.makeDir(datadir);

    var data, resp, i;

    for (i = 0; i < Config.data.length; i += 1) {
        data = Config.data[i] + ".json";

        if (!sys.fileExists(datadir + data)) {
            resp = sys.synchronousWebCall(Config.repourl + "data/" + data);
            sys.writeToFile(datadir + data, resp);
        }
    }
}());

// Load entry point
require('bootstrap');
var ignoreNextChanMsg = false;

var poScript;
poScript = ({
    serverStartUp: function serverStartUp() {
        startUpTime = +sys.time();
        script.init();
    },
    init: function init() {
        sys.resetProfiling();
    },
    beforePlayerRegister: function (src) {
        Utils.watch.notify(Utils.nameIp(src) + " registered.");
    },
    battleConnectionLost: function() {
        Utils.watch.notify("Connection to the battle server has been lost.");
    }
});

(function () {
    var events = "warning beforeNewMessage afterNewMessage beforeServerMessage beforeChannelJoin beforeChannelDestroyed afterChannelCreated afterChannelJoin beforeLogIn afterLogIn beforeChangeTier beforeChangeTeam beforeChatMessage beforeLogOut afterChangeTeam beforePlayerKick beforePlayerBan beforeChallengeIssued beforeBattleMatchup afterBattleStarted afterBattleEnded afterChatMessage beforePlayerRegister".split(" "),
        event, len, i;

    for (i = 0, len = events.length; i < len; i += 1) {
        event = events[i];
        poScript[event] = require.hookEvent(event);
    }

    // Yield the events to the PO script engine
    return poScript;
});
