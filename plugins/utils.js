(function () {
    module.exports = function () {
        var util = {};
        var clist = ['#5811b1', '#399bcd', '#0474bb', '#f8760d', '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d', '#d0990f', '#1b1390', '#028678', '#0324b1'];
        var CCTiers = ["CC 1v1", "Wifi CC 1v1", "Challenge Cup"];
        var formatRegex = {
            bold: /\[b\](.*?)\[\/b\]/gi,
            strike: /\[s\](.*?)\[\/s\]/gi,
            under: /\[u\](.*?)\[\/u\]/gi,
            italic: /\[i\](.*?)\[\/i\]/gi,
            sub: /\[sub\](.*?)\[\/sub\]/gi,
            sup: /\[sup\](.*?)\[\/sup\]/gi,
            code: /\[code\](.*?)\[\/code\]/gi,
            spoiler: /\[spoiler\](.*?)\[\/spoiler\]/gi,
            color: /\[color=(.*?)\](.*?)\[\/color\]/gi,
            face: /\[face=(.*?)\](.*?)\[\/face\]/gi,
            font: /\[font=(.*?)\](.*?)\[\/font\]/gi,
            size: /\[size=([0-9]{1,})\](.*?)\[\/size\]/gi,
            pre: /\[pre\](.*?)\[\/pre\]/gi,
            ping: /\[ping\]/gi,
            br: /\[br\]/gi,
            hr: /\[hr\]/gi,
            atag: /[a-z]{3,}:\/\/[^ ]+/gi
        };
        var autoCorrectRegex = {
            im: /\bim\b/g,
            i: /\bi\b/g,
            cant: /\bcant\b/g,
            wont: /\bwont\b/g,
            dont: /\bdont\b/g,
            iam: /\biam\b/g
        };

        util.escapeHtml = function (str, noAmp) {
            if (!noAmp) {
                str = str.replace(/\&/g, "&amp;");
            }

            return str.replace(/</g, "&lt;").replace(/\>/g, "&gt;");
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

        util.loginMessage = function (name, color) {
            sys.sendHtmlAll("<font color='#0c5959'><timestamp/>±<b>WelcomeBot:</b></font> <b><font color=" + color + ">" + name + "</font></b> joined <b>" + Reg.get('servername') + "</b>!", 0);
        };

        util.logoutMessage = function (name, color) {
            sys.sendHtmlAll("<font color='#0c5959'><timestamp/>±<b>GoodbyeBot:</b></font> <b><font color=" + color + ">" + name + "</font></b> left <b>" + Reg.get('servername') + "</b>!", 0);
        };

        util.channelNames = function (lowercase) {
            var cids = sys.channelIds(), len, i;
            var names = [], cname;

            for (i = 0, len = cids.length; i < len; i += 1) {
                cname = sys.channel(cids[i]);
                if (lowercase) {
                    cname = cname.toLowerCase();
                }

                names.push(cname);
            }

            return names;
        };

        util.isTier = function (tier) {
            var list = sys.getTierList(),
                len, i;

            tier = tier.toLowerCase();

            for (i = 0, len = list.length; i < len; i += 1) {
                if (list[i].toLowerCase() === tier) {
                    return true;
                }
            }

            return false;
        };

        util.autoCorrect = function (message) {
            return message
                .replace(autoCorrectRegex.im, "I'm")
                .replace(autoCorrectRegex.i, "I")
                .replace(autoCorrectRegex.cant, "can't")
                .replace(autoCorrectRegex.wont, "won't")
                .replace(autoCorrectRegex.dont, "don't")
                .replace(autoCorrectRegex.iam, "I am");
        };

        util.nameColor = function (src) {
            if (typeof src !== 'number') { // Random colors
                src = Math.round(Math.random() * (Math.random() * 1000));
            }

            var getColor = sys.getColor(src);
            if (getColor === '#000000' || !getColor) {
                return clist[src % clist.length];
            }
            return getColor;
        };

        util.hasIllegalChars = function (m) {
            if (/[\u202E\u202D]/.test(m))
                return true;
            if (/[\u0300-\u036F]/.test(m))
                return true;
            if (/[\u0430-\u044f\u2000-\u200d]/.test(m))
                return true;
            if (/[\u0458\u0489\u202a-\u202e\u0300-\u036F\u1dc8\u1dc9\u1dc4-\u1dc7\u20d0\u20d1\u0415\u0421\u20f0\u0783\uFE22\u0E47\u0E01\u0E49]/.test(m))
                return true;

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
            } else if (len === 2) {
                return array[0] + " " + separator + " " + array[1];
            }

            // The last element.
            array[len - 1] = separator + " " + array[len - 1];
            return array.join(", ");
        };

        // For use in map
        util.boldKeys = function (val) {
            return "<b>" + val + "</b>";
        };

        util.lowerKeys = function (val) {
            return ('' + val).toLowerCase();
        };

        // For use in filter
        util.stripEmpty = function (val) {
            return !!val;
        };

        util.nameIp = function (src, suffix) {
            return "<b style='color: " + Utils.nameColor(src) + ";' title='" + sys.ip(src) + "'>" + Utils.escapeHtml(sys.name(src)) + (suffix || "") + "</b>";
        };

        util.beautifyName = function (src, suffix) {
            var id;
            if (typeof src === 'string' && (id = sys.id(src))) {
                src = id;
            }

            var name = typeof src === 'number' ? sys.name(src) : src;
            return "<b style='color: " + Utils.nameColor(src) + ";'>" + Utils.escapeHtml(name) + (suffix || "") + "</b>";
        };

        // TODO: Remove these unused functions.
        util.randPoke = function () {
            return "<img src='pokemon:num=" + sys.rand(1, 649) + (sys.rand(1, 100) === 50 ? '&shiny=true:' : '') + "'>";
        };

        util.formatPoke = function (pokenum, shiny, back, genderId, gan) {
            if (!pokenum || pokenum < 1 || isNaN(pokenum)) {
                if (!sys.pokeNum(pokenum)) {
                    return "<img src='pokemon:0'>";
                } else {
                    pokenum = sys.pokeNum(pokenum);
                }
            }

            var gender = "neutral";

            if (genderId) {
                genderId = Number(genderId);
                if ((genderId === 0 || genderId === 1 || genderId === 2)) {
                    gender = {
                        0: "neutral",
                        1: "male",
                        2: "female"
                    }[genderId];
                }
            }
            return "<img src='pokemon:" + pokenum + "&shiny=" + shiny + "&back=" + back + "&gender=" + gender + "&gen=" + gan + "'>";
        };

        util.isLCaps = function isLCaps(letter) {
            return letter >= 'A' && letter <= 'Z';
        };

        util.isMCaps = function(message) {
            var count = 0;
            var i = 0;
            var c;
            while (i < message.length) {
                c = message[i];
                if (this.isLCaps(c)) {
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
        };

        util.removeTag = function (name) {
            return name.replace(/\[[^\]]*\]/gi, '').replace(/\{[^\]]*\}/gi, '');
        };

        util.toCorrectCase = function (name) {
            if (typeof name === 'number') {
                return sys.name(name);
            }

            var id = sys.id(name);
            if (id !== undefined) {
                return sys.name(id);
            }
            return name;
        };

        util.EVName = function (num) {
            return {
                0: "HP",
                1: "ATK",
                2: "DEF",
                3: "SPATK",
                4: "SPDEF",
                5: "SPD"
            }[num];
        };

        util.checkFor = function (obj, key) {
            return obj.hasOwnProperty((('' + key).toLowerCase()));
        };

        // Keys are automatically lowercase.
        util.regToggle = function (container, key, field, addCheck) {
            var added;
            key = key.toLowerCase();

            addCheck = addCheck || function () { return true; };
            if ((key in container)) {
                delete container[key];
                added = false;
            } else if (addCheck(container, key, field)) {
                container[key] = true;
                added = true;
            } else {
                added = 'fail';
            }

            Reg.save(field, container);
            return added;
        };

        function atag(link) {
            return "<a href='" + link + "'>" + link + "</a>";
        }

        util.format = function format(src, str) {
            var auth = src === 0 ? 3 : sys.maxAuth(sys.ip(src));
            str = '' + str;

            str = str
                    .replace(formatRegex.bold, '<b>$1</b>')
                    .replace(formatRegex.strike, '<s>$1</s>')
                    .replace(formatRegex.under, '<u>$1</u>')
                    .replace(formatRegex.italic, '<i>$1</i>')
                    .replace(formatRegex.sub, '<sub>$1</sub>')
                    .replace(formatRegex.sup, '<sup>$1</sup>')
                    .replace(formatRegex.code, '<code>$1</code>')
                    .replace(formatRegex.spoiler, '<a style="color: black; background-color:black;">$1</a>')
                    .replace(formatRegex.color, '<font color=$1>$2</font>')
                    .replace(formatRegex.face, '<font face=$1>$2</font>');

            // Potential security risk (not going into detail).
            //str = str.replace(/\[link\](.*?)\[\/link\]/gi, '<a href="$1">$1</a>');

            if ((auth === 3 && !htmlchat) || (auth !== 3)) {
                str = str.replace(formatRegex.atag, atag);
            }

            if (!src || Utils.mod.hasBasicPermissions(src)) {
                str = str
                    .replace(formatRegex.size, '<font size=$1>$2</font>')
                    .replace(formatRegex.pre, '<pre>$1</pre>')
                    .replace(formatRegex.ping, "<ping/>")
                    .replace(formatRegex.br, "<br/>")
                    .replace(formatRegex.hr, "<hr/>");
            }

            return addChannelLinks(str); // Do this last to prevent collisions.
        };

        util.placeCommas = function (number) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };

        util.realName = function (src) {
            return SESSION.users(src).originalName || sys.name(src);
        };

        util.uptime = function () {
            var diff = parseInt(sys.time(), 10) - startUpTime,
                days = parseInt(diff / (60*60*24), 10),
                hours = parseInt((diff % (60*60*24)) / (60*60), 10),
                minutes = parseInt((diff % (60*60)) / 60, 10),
                seconds = (diff % 60);

            var formatTime = function(num, type) {
                return (num > 0 && num !== 1) ? (num + " " + type + "s") : (num === 1) ? (num + " " + type) : "";
            };

            return [formatTime(days, "day"), formatTime(hours, "hour"), formatTime(minutes, "minute"), formatTime(seconds, "second")].filter(this.stripEmpty);
        };

        util.watch = {};
        util.watch.message = function (src, type, message, chan) {
            watchbot.sendAll("[" + ChannelLink(chan) + "] " + type + " » " + Utils.nameIp(src, ":") + " " + Utils.escapeHtml(message), watch);
        };

        util.watch.notify = function (message) {
            watchbot.sendAll(message, watch);
        };

        util.mod = {};
        util.mod.kick = function (src) {
            var pids = sys.playerIds(), len, i;
            var id, found = false,
                ip = sys.ip(src);

            for (i = 0, len = pids.length; i < len; i += 1) {
                id = pids[i];
                if (sys.ip(id) === ip && sys.loggedIn(id)) {
                    sys.kick(id);
                    found = true;
                }
            }

            if (found) {
                reconnectTrolls[ip] = true;
                sys.setTimer(function () {
                    delete reconnectTrolls[ip];
                }, 3000, false);
            }

            return found;
        };

        // If a player is banned.
        util.mod.isBanned = function (playerName) {
            // Return their name. This allows us to accept ids as well.
            var trueName = (sys.name(playerName) || playerName).toLowerCase(),
                bans = sys.banList();

            return bans.indexOf(trueName) !== -1;
        };

        // Returns the amount of seconds name is temporary banned for.
        // This > sys.dbTempBanTime.
        // NOTE: Unlike sys.dbTempBanTime, this returns 0 if the player isn't banned.
        util.mod.tempBanTime = function (playerName) {
            // Return their name. This allows us to accept ids as well.
            var trueName = (sys.name(playerName) || playerName).toLowerCase();

            // If they aren't banned, return 0.
            if (!Utils.mod.isBanned(trueName)) {
                return 0;
            }

            // Otherwise, return for how long they are banned.
            return sys.dbTempBanTime(trueName);
        };

        // Temporarly bans a player.
        // NOTE: Time is in minutes.
        // NOTE: This is done quietly.
        util.mod.tempBan = function (name, time) {
            // Since there is basically nothing to customise atm (kick is done automatically), this is simply a small wrapper (though it does kick players under the same alt.)
            // Ensure time is an integer.
            time = Math.round(time);

            sys.tempBan(name, time);
            util.mod.kickIp(sys.ip(name));
        };

        util.mod.kickIp = function (ip) {
            var aliases = sys.aliases(ip), found = false;
            var id, len, i;

            for (i = 0, len = aliases.length; i < len; i += 1) {
                id = sys.id(aliases[i]);
                if (id) {
                    sys.kick(id);
                    found = true;
                }
            }

            if (found) {
                reconnectTrolls[ip] = true;

                sys.setTimer(function () {
                    delete reconnectTrolls[ip];
                }, 3000, false);
            }
        };

        util.mod.ban = function (name) {
            sys.ban(name);
            if (sys.id(name)) {
                util.mod.kick(sys.id(name));
            } else {
                util.mod.kickIp(sys.dbIp(name));
            }
        };

        util.mod.pruneMutes = function () {
            var now = +sys.time();
            var mute, meta;
            for (mute in Mutes) {
                meta = Mutes[mute];
                if (meta.time !== 0 && meta.time < now) {
                    delete Mutes[mute];
                }
            }
        };

        util.mod.hasBasicPermissions = function (src) {
            return Utils.getAuth(src) > 0;
        };

        util.tier = {};
        util.tier.isCCTier = function(tier) {
            return CCTiers.indexOf(tier) > -1;
        };

        util.tier.hasOneUsablePoke = function(src, team) {
            var fine = false;
            var j, i;
            for (i = 0; i < 6; i += 1) {
                if (sys.teamPoke(src, team, i) !== 0) {
                    for (j = 0; j < 4; j += 1) {
                        if (sys.teamPokeMove(src, team, i, j) !== 0) {
                            fine = true;
                            break;
                        }
                    }
                }
            }

            return fine;
        };

        util.tier.hasDrizzleSwim = function hasDrizzleSwim(src) {
            var swiftswim,
                drizzle,
                teamCount = sys.teamCount(src),
                teams_banned = [];
            var ability, team, i;

            if (sys.hasTier(src, "5th Gen OU")) {
                for (team = 0; team < teamCount; team += 1) {
                    if (sys.tier(src, team) !== "5th Gen OU") {
                        continue;
                    }
                    swiftswim = false;
                    drizzle = false;
                    for (i = 0; i < 6; i += 1) {
                        ability = sys.ability(sys.teamPokeAbility(src, team, i));
                        if (ability === "Swift Swim") {
                            swiftswim = true;
                        } else if (ability === "Drizzle") {
                            drizzle = true;
                        }

                        if (drizzle && swiftswim) {
                            teams_banned.push(team);
                            break;
                        }
                    }
                }
            }

            return teams_banned;
        };

        util.tier.hasSandCloak = function hasSandCloak(src) { // Has Sand Veil or Snow Cloak in tiers < 5th Gen Ubers.
            var teams_banned = [],
                teamCount = sys.teamCount(src);
            var ability, team, i;

            for (team = 0; team < teamCount; team += 1) {
                if (sys.tier(src, team) === "5th Gen Ubers" || sys.gen(src, team) !== 5) {
                    continue; // Only care about 5th Gen
                }
                for (i = 0; i < 6; i += 1) {
                    ability = sys.ability(sys.teamPokeAbility(src, team, i));
                    if (ability === "Sand Veil" || ability === "Snow Cloak") {
                        teams_banned.push(team);
                        break;
                    }
                }
            }

            return teams_banned;
        };

        return util;
    };

    module.reload = function () {
        Utils = module.exports();
        return true;
    };
}());
