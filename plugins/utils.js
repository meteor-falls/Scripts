/*jslint continue: true, es5: true, evil: true, forin: true, sloppy: true, vars: true, regexp: true, newcap: true, nomen: true*/
/*global sys, SESSION, script: true, Qt, print, gc, version,
    global: false, Plugin: true, Config: true, module: true, exports: true,
    bot: true, Reg: true, Leaguemanager: true, Lists: true, CommandList: true, MathJS: true, format: true, JSESSION: true, emoteFormat: true, hasEmotesToggled: true, tourmode: true, tourmembers: true, getTier: true, tourtier: true, tourplayers: true, roundnumber: true, isFinals: true, battlesLost: true, tourbattlers: true, battlesStarted: true, hasEmotePerms: true, Emotetoggles: true, rouletteon: true, spinTypes: true, EmoteList: true, TableList: true, MegaUsers: true, FloodIgnore: true, Capsignore: true, Autoidle: true, Emoteperms: true, Feedmon: true, tournumber: true, prize: true, isTier: true, tournumber: true, Kickmsgs: true, Welmsgs: true, Banmsgs: true, Channeltopics: true, android: true, topicbot: true, Mutes: true, Rangebans: true, muteall: true, kick: true, tempBanTime: true, tempBan: true, pruneMutes: true, nightclub: true, supersilence: true, ev_name: true, getName: true, ban: true, Plugins: true, PHandler: true, reloadPlugin: true, htmlchatoff: true, bots: true, servername: true, isBanned: true, loginMessage: true, logoutMessage: true, floodIgnoreCheck: true, removeTag: true, randcolor: true, colormodemessage: true, lolmessage: true, pewpewpewmessage: true, hasBasicPermissions: true, hasDrizzleSwim: true, hasSandCloak: true, ChannelNames: true, staffchannel: true, testchan: true, watch: true, aliasKick: true, reconnectTrolls: true, nthNumber: true, ChannelLink: true, addChannelLinks: true, firstGen: true, randPoke: true, formatPoke: true, teamSpammers: true, Feedmons: true, addEmote: true, Bot: true, guard: true, watchbot: true, setbybot: true, lolmode: true, spacemode: true, reversemode: true, colormode: true, scramblemode: true, capsmode: true, pewpewpew: true, capsbot: true, poScript: true, flbot: true, Utils: true
*/

(function () {
    var util = {};
    
    util.escapeHtml = function (str) {
        return str.replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/\>/g, "&gt;");
    };

    util.stripHtml = function (str) {
        return str.replace(/<\/?[^>]*>/g, "");
    };
    
    // http://bost.ocks.org/mike/shuffle/
    util.fisheryates = function fisheryates(array) {
        var m = array.length, t, i;
        
        // While there remain elements to shuffle…
        while (m) {
            
            // Pick a remaining element…
            i = Math.floor(Math.random() * m);
            m -= 1;
            
            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        
        return array;
    };
    
    util.nightclub = {};

    util.nightclub.hsv2rgb = function (h, s, v) {
        var r, g, b;
        var RGB = [];
        var var_r,
            var_g,
            var_b;
        var i;
        
        if (s === 0) {
            RGB[0] = RGB[1] = RGB[2] = Math.round(v * 255);
        } else {
            // h must be < 1
            var var_h = h * 6;
            if (var_h === 6) {
                var_h = 0;
            }
            
            //Or ... var_i = floor( var_h )
            var var_i = Math.floor(var_h);
            var var_1 = v * (1 - s);
            var var_2 = v * (1 - s * (var_h - var_i));
            var var_3 = v * (1 - s * (1 - (var_h - var_i)));
            if (var_i === 0) {
                var_r = v;
                var_g = var_3;
                var_b = var_1;
            } else if (var_i === 1) {
                var_r = var_2;
                var_g = v;
                var_b = var_1;
            } else if (var_i === 2) {
                var_r = var_1;
                var_g = v;
                var_b = var_3;
            } else if (var_i === 3) {
                var_r = var_1;
                var_g = var_2;
                var_b = v;
            } else if (var_i === 4) {
                var_r = var_3;
                var_g = var_1;
                var_b = v;
            } else {
                var_r = v;
                var_g = var_1;
                var_b = var_2;
            }
            //rgb results = 0 ÷ 255  
            RGB[0] = Math.round(var_r * 255);
            RGB[1] = Math.round(var_g * 255);
            RGB[2] = Math.round(var_b * 255);
        }
        for (i = 0; i < RGB.length; i += 1) {
            RGB[i] = Math.round(RGB[i]).toString(16);
            if (RGB[i].length !== 2) {
                RGB[i] = "0" + RGB[i];
            }
        }
        return "#" + RGB.join("");
    };

    util.nightclub.rainbowify = (function () {
        var numcolors = 360,
            colors = [],
            base = sys.rand(0, numcolors),
            i;
        
        for (i = 0; i < numcolors; i += 1) {
            colors.push(util.nightclub.hsv2rgb((i % 360) / 360, 1, 1));
        }
 
        return function (text) {
            var html = "";
            var step = sys.rand(0, 30);
            for (i = 0; i < text.length; i += 1) {
                base += 1;
                html += "<font color='" + colors[(base + step) % numcolors] + "'>" + util.escapeHtml(text[i]) + "</font>";
            }
            return "<table cellpadding='12' cellspacing='0' width='100%' " +
                   "bgcolor='black' style='margin: -12'><tr><td><b>" + html +
                   "</b></td></tr></table>";
        };
    }());

    util.nameColor = function (src) {
        var getColor = sys.getColor(src);
        if (getColor === '#000000') {
            var clist = ['#5811b1', '#399bcd', '#0474bb', '#f8760d', '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d', '#d0990f', '#1b1390', '#028678', '#0324b1'];
            return clist[src % clist.length];
        }
        return getColor;
    };
    
    util.hasIllegalChars = function (m) {
        if (m.indexOf(/[\u202E\u202D]/) !== -1) {
            return true;
        } else if (m.indexOf(/[\u0300-\u036F]/) !== -1) {
            return true;
        } else if (m.indexOf(/[\u0430-\u044f\u2000-\u200d]/) !== -1) {
            return true;
        } else if (m.indexOf("&#8") !== -1) {
            return true;
        }
            
        //if (/\u2061|\u2062|\u2063|\u2064|\u200B|\xAD/.test(m)) return true;
        return false;
    };

    util.cut = function (array, entry, join) {
        join = join || "";
        return [].concat(array).splice(entry).join(join);
    };

    util.stringToTime = function (str, time) {
        if (typeof str !== 'string') {
            return 0;
        }

        str = str.toLowerCase();
        time = +time;

        var unitString = str[0],
            unitString2 = str.substr(0, 2);

        var units = {
            's': 1,
            'm': 60,
            'h': 3600,
            'd': 86400,
            'w': 604800,
            'y': 31536000
        },
            units2 = {
                'mo': 2592000,
                'de': 315360000
            };

        var unit1 = units[unitString],
            unit2 = units2[unitString2];

        if (unit2 !== undefined) {
            return unit2 * time;
        }

        if (unit1 !== undefined) {
            return unit1 * time;
        }

        return units.m * time;
    };

    util.getAuth = function (id) {
        if (typeof id === "number") {
            return sys.auth(id);
        } else {
            return (sys.id(id) !== undefined) ? sys.auth(sys.id(id)) : 0;
        }
    };
    
    util.getTimeString = function (sec) {
        var s = [];
        var n;
        var d = [
            [315360000, "decade"],
            [31536000, "year"],

            [2592000, "month"],
            [604800, "week"],
            [86400, "day"],
            [3600, "hour"],
            [60, "minute"],
            [1, "second"]
        ];

        var j;
        
        for (j = 0; j < d.length; j += 1) {
            n = parseInt(sec / d[j][0], 10);
            if (n > 0) {
                s.push((n + " " + d[j][1] + (n > 1 ? "s" : "")));
                sec -= n * d[j][0];
                if (s.length >= d.length) {
                    break;
                }
            }
        }

        if (s.length === 0) {
            return "1 second";
        }

        return util.fancyJoin(s);
    };

    util.fancyJoin = function (array, separator) {
        var len = array.length;
        
        separator = separator || "and";
        
        if (len <= 1) {
            return array;
        } else if (len) {
            return array[0] + " " + separator + " " + array[1];
        }
        
        // The last element.
        array[len] = separator + " " + array[len];
        
        return array.join(", ");
    };
    
    Utils = module.exports = util;
}());