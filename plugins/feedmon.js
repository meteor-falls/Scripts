/*jslint continue: true, es5: true, evil: true, forin: true, sloppy: true, vars: true, regexp: true, newcap: true, nomen: true*/
/*global sys, SESSION, script: true, Qt, print, gc, version,
    global: false, Plugin: true, Config: true, module: true, exports: true,
    bot: true, Reg: true, Leaguemanager: true, Lists: true, CommandList: true, MathJS: true, format: true, JSESSION: true, emoteFormat: true, hasEmotesToggled: true, tourmode: true, tourmembers: true, getTier: true, tourtier: true, tourplayers: true, roundnumber: true, isFinals: true, battlesLost: true, tourbattlers: true, battlesStarted: true, hasEmotePerms: true, Emotetoggles: true, rouletteon: true, spinTypes: true, EmoteList: true, TableList: true, MegaUsers: true, FloodIgnore: true, Capsignore: true, Autoidle: true, Emoteperms: true, Feedmon: true, tournumber: true, prize: true, isTier: true, tournumber: true, Kickmsgs: true, Welmsgs: true, Banmsgs: true, Channeltopics: true, android: true, topicbot: true, Mutes: true, Rangebans: true, muteall: true, kick: true, tempBanTime: true, tempBan: true, pruneMutes: true, nightclub: true, supersilence: true, ev_name: true, getName: true, ban: true, Plugins: true, PHandler: true, reloadPlugin: true, htmlchatoff: true, bots: true, servername: true, isBanned: true, loginMessage: true, logoutMessage: true, floodIgnoreCheck: true, removeTag: true, randcolor: true, colormodemessage: true, lolmessage: true, pewpewpewmessage: true, hasBasicPermissions: true, hasDrizzleSwim: true, hasSandCloak: true, ChannelNames: true, staffchannel: true, testchan: true, watch: true, aliasKick: true, reconnectTrolls: true, nthNumber: true, ChannelLink: true, addChannelLinks: true, firstGen: true, randPoke: true, formatPoke: true, teamSpammers: true, Feedmons: true, addEmote: true, Bot: true, guard: true, watchbot: true, setbybot: true, lolmode: true, spacemode: true, reversemode: true, colormode: true, scramblemode: true, capsmode: true, pewpewpew: true, capsbot: true, poScript: true, flbot: true, Utils: true
*/

module.exports = function () {
    var FEEDMON_VERSION = 2.3,
        FEEDMON_TABLE = 'Feedmon_v' + FEEDMON_VERSION;
    
    var _table;
    
    // Algorithm:
    /* var array = [25], last; while(array.length < 100) { last = array[array.length - 1]; array.push(Math.floor(last * 1.13) + last % 100); } array;
    */
    var exp = [25, 53, 112, 138, 193, 311, 362, 471, 603, 684, 856, 1023, 1178, 1409, 1601, 1810, 2055, 2377, 2763, 3185, 3684, 4246, 4843, 5515, 6246, 7103, 8029, 9101, 10285, 11707, 13235, 14990, 17028, 19269, 21842, 24723, 27959, 31652, 35818, 40492, 45847, 51854, 58649, 66322, 74965, 84775, 95870, 108403, 122498, 138520, 156547, 176945, 199992, 226082, 255554, 288830, 326407, 368846, 416841, 471071, 532381, 601671, 679959, 768412, 868317, 981215, 1108787, 1253016, 1415924, 1600018, 1808038, 2043120, 2308745, 2608926, 2948112, 3331378, 3764535, 4253959, 4807032, 5431978, 6138213, 6936193, 7837991, 8857020, 10008452, 11309602, 12779852, 14441284, 16318734, 18440203, 20837432, 23546330, 26607382, 30066423, 33975080, 38391920, 43382889, 49022753, 55395763, 62597275];
    
    function getPlayer(name) {
        return Feedmons[name.toLowerCase()];
    }
    
    function ensurePlayer(name) {
        name = name.toLowerCase();
            
        if (!Feedmons[name]) {
            Feedmons[name] = {
                'timeout': 0,
                'feedtimeout': 0,
                'pokemon': false
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
    
    function save() {
        Reg.save(FEEDMON_TABLE, JSON.stringify(Feedmons));
    }
    
    function generatePokemon(name) {
        var player = getPlayer(name);
        
        player.pokemon = {
            name: randomPokemon(),
            nickname: '',
            attacks: [],
            level: 1,
            fed: 0,
            exp: exp[0]
        };
        
        save();
    }
    
    function getPokemonName(name) {
        var player = getPlayer(name),
            pname = "<b>" + player.pokemon.name + "</b>";
        
        if (player.pokemon.nickname) {
            pname = "<b>" + player.pokemon.nickname + "</b> (" + player.pokemon.name + ")";
        }
        
        return pname;
    }
    
    function getPokemon(name) {
        var player;
        
        if (!has(name)) {
            return null;
        }
        
        return getPlayer(name).pokemon;
    }
    
    function giveExp(name) {
        var player = getPlayer(name),
            feedmon = getPokemon(name),
            lvl = feedmon.level,
            lvlGain = 0,
            looplvl,
            lvlexp,
            len,
            i,
            gain = 0;
        
        var bonusRange = Math.round(lvl / 10),
            bonus = [0, 0];
        
        if (bonusRange > 0) {
            bonus = [bonusRange * (Math.round(lvl / 2)), bonusRange * lvl];
        }
        
        gain = sys.rand((10 * lvl) + bonus[0], (24 * lvl) + bonus[1] + 1);
        feedmon.exp += gain;
        
        if (lvl < 100) {
            for (i = lvl - 2, len = exp.length; i < len; i += 1) {
                lvlexp = exp[i];
                looplvl = i + 1;
                
                if (lvl >= looplvl) {
                    continue;
                }
                
                if (feedmon.exp >= lvlexp) {
                    lvlGain += 1;
                } else {
                    break;
                }
            }
        }
        
        if (lvlGain) {
            feedmon.level += lvlGain;
        }
        
        return {
            gain: gain,
            levelGain: lvlGain,
            now: feedmon.exp,
            bonus: bonus
        };
    }
    
    // Lazy generation.
    function expTableList() {
        if (_table) {
            return _table;
        }
        
        var generateLevel = [],
            list = [],
            i;
        
        for (i = 1; generateLevel.length !== 100; i += 1) {
            generateLevel.push(i);
        }
        
        for (i = 0; list.length !== 200; i += 1) {
            list.push(generateLevel[i], exp[i]);
        }
        
        _table = new TableList("EXP", "stripe", 1, 2, "navy");
        _table.add(["Level", "EXP"], true);
        _table.addEvery(list, 10);
        
        return _table;
    }
            
    Feedmon = {
        getPlayer: getPlayer,
        ensurePlayer: ensurePlayer,
        checkTimeout: checkTimeout,
        randomPokemon: randomPokemon,
        has: has,
        getPokemon: getPokemon,
        generatePokemon: generatePokemon,
        getPokemonName: getPokemonName,
        giveExp: giveExp,
        save: save,
        exp: exp,
        expTableList: expTableList,
        TABLE: FEEDMON_TABLE,
        VERSION: FEEDMON_VERSION
    };
    
    return Feedmon;
};

module.callExports = true;