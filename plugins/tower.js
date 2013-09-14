/*jslint continue: true, es5: true, evil: true, forin: true, sloppy: true, vars: true, regexp: true, newcap: true, nomen: true*/
/*global sys, SESSION, script: true, Qt, print, gc, version,
    global: false, Plugin: true, Config: true, module: true, exports: true,
    bot: true, Reg: true, Leaguemanager: true, Lists: true, CommandList: true, MathJS: true, format: true, JSESSION: true, emoteFormat: true, hasEmotesToggled: true, tourmode: true, tourmembers: true, getTier: true, tourtier: true, tourplayers: true, roundnumber: true, isFinals: true, battlesLost: true, tourbattlers: true, battlesStarted: true, hasEmotePerms: true, Emotetoggles: true, rouletteon: true, spinTypes: true, EmoteList: true, TableList: true, MegaUsers: true, FloodIgnore: true, Capsignore: true, Autoidle: true, Emoteperms: true, Feedmon: true, tournumber: true, prize: true, isTier: true, tournumber: true, Kickmsgs: true, Welmsgs: true, Banmsgs: true, Channeltopics: true, android: true, topicbot: true, Mutes: true, Rangebans: true, muteall: true, kick: true, tempBanTime: true, tempBan: true, pruneMutes: true, nightclub: true, supersilence: true, ev_name: true, getName: true, ban: true, Plugins: true, PHandler: true, reloadPlugin: true, htmlchatoff: true, bots: true, servername: true, isBanned: true, loginMessage: true, logoutMessage: true, floodIgnoreCheck: true, removeTag: true, randcolor: true, colormodemessage: true, lolmessage: true, pewpewpewmessage: true, hasBasicPermissions: true, hasDrizzleSwim: true, hasSandCloak: true, ChannelNames: true, staffchannel: true, testchan: true, watch: true, aliasKick: true, reconnectTrolls: true, nthNumber: true, ChannelLink: true, addChannelLinks: true, firstGen: true, teamSpammers: true, Feedmons: true, addEmote: true, Bot: true, guard: true, watchbot: true, setbybot: true, lolmode: true, spacemode: true, reversemode: true, colormode: true, scramblemode: true, capsmode: true, pewpewpew: true, capsbot: true, poScript: true, flbot: true, Utils: true
*/

(function () {
    // Modes: none, signup, playing
    var Tower = {
        signups: {},
        players: {},
        seekers: {},
        found: {},
        channels: {},
        mode: 'none',
        time: 0,
        MIN_PLAYERS: 5
    };
    
    var Bot = Plugins('bot.js').Bot,
        border = "<font color=orange><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>",
        tbot;
    Tower.bot = tbot = new Bot("Meteor Giant", "#0f4a4c", "+", true);
    
    Tower.checkChannel = function checkChannel(cid) {
        return !!Tower.channels[cid];
    };
    
    Tower.count = function (type) {
        return Object.keys(Tower[type]).length;
    };
    
    Tower.name = function (name) {
        return sys.name(sys.id(name));
    };
    
    Tower.find = function (name) {
        name = name.toLowerCase();
        
        if (Tower.players[name]) {
            delete Tower.players[name];
            Tower.found[name] = true;
        }
    };
    
    Tower.joinChannel = function (name, chan) {
        name = name.toLowerCase();
        
        if (Tower.checkChannel(chan)) {
            if (Tower.players[name] && Tower.mode === "playing") {
                Tower.players[name].channels.push(chan);
                return true;
            } else if (Tower.seekers[name]) {
                return true;
            } else {
                return false;
            }
        }
        
        return true;
    };
    
    Tower.tick = function () {
        if (Tower.mode !== 'none' && Tower.time) {
            Tower.time -= 1;
            
            if (Tower.time <= 0) {
                if (Tower.mode === 'playing') {
                    Tower.onGameEnd();
                } else {
                    Tower.onSignupsEnd();
                }
            }
        }
    };
    
    Tower.createChannels = function () {
        var chan,
            i;
        
        for (i = 1; i <= 100; i += 1) {
            chan = sys.createChannel("Floor " + i);
            
            if (chan) {
                Tower.channels[chan] = "Floor " + i;
            }
        }
    };
    
    Tower.clearVariables = function () {
        Tower.signups = {};
        Tower.players = {};
        Tower.seekers = {};
        Tower.found = {};
        Tower.mode = 'none';
        Tower.time = 0;
    };
    
    Tower.createPlayer = function (name) {
        var id = sys.id(name);
        
        Tower.players[name] = {
            channels: []
        };
        
        tbot.sendMessage(id, border, 0);
        tbot.line(id, 0);
        tbot.sendMessage(id, "You are a Hider. Go to one of the Floor (xxx) channels to hide yourself!");
    };
    
    Tower.onSignupsStart = function () {
    };
    
    Tower.onGameEnd = function () {
        Tower.mode = 'none';
        Tower.clearVariables();
    };
    
    Tower.onSignupsEnd = function () {
        var count = Tower.count('signups'),
            i;
        
        if (count < Tower.MIN_PLAYERS) {
            tbot.sendAll(
            tbot.lineAll(0);
            tbot.sendAll("Tough luck!", 0);
            tbot.lineAll(0);
            tbot.sendAll("Not enough players (" + count + " joined, " + Tower.MIN_PLAYERS + " required)");
            tbot.lineAll(0);
            
            Tower.mode = 'none';
            return;
        }
        
        for (i in Tower.signups) {
            if (i === count - 1) {
                Tower.createSeeker(i);
            } else {
                Tower.createPlayer(i);
            }
        }
    };
    
    module.exports = Tower;
}());