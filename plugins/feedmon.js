/*jslint continue: true, es5: true, evil: true, forin: true, sloppy: true, vars: true, regexp: true, newcap: true, nomen: true*/
/*global sys, SESSION, script: true, Qt, print, gc, version,
    global: false, Plugin: true, Config: true, module: true, exports: true,
    bot: true, Reg: true, Leaguemanager: true, Lists: true, CommandList: true, MathJS: true, format: true, JSESSION: true, emoteFormat: true, hasEmotesToggled: true, tourmode: true, tourmembers: true, getTier: true, tourtier: true, tourplayers: true, roundnumber: true, isFinals: true, battlesLost: true, tourbattlers: true, battlesStarted: true, hasEmotePerms: true, Emotetoggles: true, rouletteon: true, spinTypes: true, EmoteList: true, TableList: true, MegaUsers: true, FloodIgnore: true, Capsignore: true, Autoidle: true, Emoteperms: true, Feedmon: true, tournumber: true, prize: true, isTier: true, tournumber: true, Kickmsgs: true, Welmsgs: true, Banmsgs: true, Channeltopics: true, android: true, topicbot: true, Mutes: true, Rangebans: true, muteall: true, kick: true, tempBanTime: true, tempBan: true, pruneMutes: true, nightclub: true, supersilence: true, ev_name: true, getName: true, ban: true, Plugins: true, PHandler: true, reloadPlugin: true, htmlchatoff: true, bots: true, servername: true, isBanned: true, loginMessage: true, logoutMessage: true, floodIgnoreCheck: true, removeTag: true, randcolor: true, colormodemessage: true, lolmessage: true, pewpewpewmessage: true, hasBasicPermissions: true, hasDrizzleSwim: true, hasSandCloak: true, ChannelNames: true, staffchannel: true, testchan: true, watch: true, aliasKick: true, reconnectTrolls: true, nthNumber: true, ChannelLink: true, addChannelLinks: true, firstGen: true, randPoke: true, formatPoke: true, teamSpammers: true, Feedmons: true, addEmote: true, Bot: true, guard: true, watchbot: true, setbybot: true, lolmode: true, spacemode: true, reversemode: true, colormode: true, scramblemode: true, capsmode: true, pewpewpew: true, capsbot: true, poScript: true, flbot: true, Utils: true
*/

module.exports = function () {
    function getPlayer(name) {
        return Feedmons[name.toLowerCase()];
    }
    
    function ensurePlayer(name) {
        name = name.toLowerCase();
            
        if (!Feedmons[name]) {
            Feedmons[name] = {
                'timeout': 0,
                'feedtimeout': 0,
                'total': 0
            };
        }
        
        return Feedmons[name];
    }
    
    function has(name) {
        return !!getPlayer(name);
    }
    
    function checkTimeout(name, timeout) {
        var player = ensurePlayer(name);
        
        timeout = timeout || 'timeout';
        return player[timeout] !== 0 && player[timeout] > (+sys.time());
    }
    
    function randomPokemon() {
        return sys.pokemon(sys.rand(1, 650));
    }
    
    // Algorithm:
    /* var array = [50]; while(array.length < 100) { array.push(Math.ceil(array[array.length - 1] * 1.16)); } array
    */
    var exp = [50, 58, 68, 79, 92, 107, 125, 145, 169, 197, 229, 266, 309, 359, 417, 484, 562, 652, 757, 879, 1020, 1184, 1374, 1594, 1850, 2146, 2490, 2889, 3352, 3889, 4512, 5234, 6072, 7044, 8172, 9480, 10997, 12757, 14799, 17167, 19914, 23101, 26798, 31086, 36060, 41830, 48523, 56287, 65293, 75740, 87859, 101917, 118224, 137140, 159083, 184537, 214063, 248314, 288045, 334133, 387595, 449611, 521549, 604997, 701797, 814085, 944339, 1095434, 1270704, 1474017, 1709860, 1983438, 2300789, 2668916, 3095943, 3591294, 4165902, 4832447, 5605639, 6502542, 7542949, 8749821, 10149793, 11773760, 13657562, 15842772, 18377616, 21318035, 24728921, 28685549, 33275237, 38599275, 44775159, 51939185, 60249455, 69889368, 81071667, 94043134, 109090036, 126544442];
            
    Feedmon = {
        getPlayer: getPlayer,
        ensurePlayer: ensurePlayer,
        checkTimeout: checkTimeout,
        randomPokemon: randomPokemon,
        has: has,
        exp: exp
    };
    return Feedmon;
};

module.callExports = true;