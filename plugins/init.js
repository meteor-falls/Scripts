module.exports = {
    init: function () {
        if (!sys.os) {
            sys.os = function (id) {
                if (sys.info(id) === "Android player." && sys.avatar(id) === 72) {
                    return "android";
                }
                return "windows";
            };
        }
        html_escape = function (str) {
            return str.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
        };

        html_strip = function (str) {
            return str.replace(/<\/?[^>]*>/g, "");
        };

        String.prototype.format = function () {
            var str = this;
            var exp, i, args = arguments.length,
                icontainer = 0;

            for (i = 0; i < args; i++) {
                icontainer++;
                exp = new RegExp("%" + icontainer, "");
                str = str.replace(exp, arguments[i]);
            }
            return str;
        };

        String.prototype.midRef = function (position, n) { // QStringRef QString::midRef
            if (n == null || typeof n != "number") {
                n = -1;
            }

            var str = this;
            var strlen = str.length - 1;
            if (position > strlen) {
                return "";
            }

            var substri = str.substr(position);
            if (n > strlen || n == -1) {
                return substri;
            }
            return substri.substr(0, n);
        }

        String.prototype.replaceBetween = function (pos1, pos2, replace) {
            var str = this,
                returnStr = str,
                sub = str.substr(pos1, pos2);

            returnStr = returnStr.replace(sub, replace);

            return returnStr;
        };

        String.prototype.scramble = function () {
            var thisString = this.split("");
            for (var i = thisString.length, j, k; i; j = parseInt(Math.random() * i), k = thisString[--i], thisString[i] = thisString[j], thisString[j] = k) {}
            return thisString.join("");
        };

        sys.appendToFile("Reg.json", "");
        if (sys.getFileContent("Reg.json") == "") {
            sys.writeToFile("Reg.json", "{}");
        }

        script.loadRegHelper();
        script.loadBots();
        print("Registry has been loaded.");

        var configFile = sys.getFileContent("config").split("\n"),
            x, c_conf, serv = /server_name=/,
            desc = /server_description=/,
            ann = /server_announcement=/;
        servername = "";
        for (x in configFile) {
            c_conf = configFile[x];
            if (serv.test(c_conf) && !ann.test(c_conf) && !desc.test(c_conf)) {
                servername = c_conf.substring(12, c_conf.length).replace(/\\xe9/i, "é").replace(/\\xa2/i, "¢").trim();
                break;
            }
        }

        namecolor = function (src) {
            var getColor = sys.getColor(src);
            if (getColor == '#000000') {
                var clist = ['#5811b1', '#399bcd', '#0474bb', '#f8760d', '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d', '#d0990f', '#1b1390', '#028678', '#0324b1'];
                return clist[src % clist.length];
            }
            return getColor;
        }

        loginMessage = function (name, color) {
            sys.sendHtmlAll("<font color='#0c5959'><timestamp/>±<b>WelcomeBot:</b></font> <b><font color=" + color + ">" + name + "</font></b> joined <b>" + Reg.get('servername') + "</b>!", 0);
        }

        logoutMessage = function (name, color) {
            sys.sendHtmlAll("<font color='#0c5959'><timestamp/>±<b>GoodbyeBot:</b></font> <b><font color=" + color + ">" + name + "</font></b> left <b>" + Reg.get('servername') + "</b>!", 0);
        }

        cmp = function (a, b) {
            return a.toLowerCase() == b.toLowerCase();
        }

        cut = function (array, entry, join) {
            if (!join) join = "";
            return array.splice(entry).join(join);
        }

        stringToTime = function (str, time) {
            if (typeof str != 'string') {
                return 0;
            }

            str = str.toLowerCase();
            time = time * 1;

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

            if (unit2 != undefined) {
                return unit2 * time;
            }

            if (unit1 != undefined) {
                return unit1 * time;
            }

            return units.m * time;
        }

        getAuth = function (id) {
            if (typeof (id) == "number") return sys.auth(id);
            else return (sys.id(id) !== undefined) ? sys.auth(sys.id(id)) : 0;
        }

        floodIgnoreCheck = function (src) {
            var myNameToLower = sys.name(src).toLowerCase();
            return myNameToLower in FloodIgnore;
        }

        removeTag = function (name) {
            return name.replace(/\[[^\]]*\]/gi, '').replace(/\{[^\]]*\}/gi, '');
        }
        randcolor = function () {
            var nums = 5;
            var str = '';
            while (nums >= 0) {
                str += sys.rand(0, 16).toString(16);
                nums--;
            }
            return "<font color='#" + str + "'>";
        }

        colormodemessage = function (message) {
            var x, retmsg = "";
            for (x in message) {
                if (x == "format") {
                    break;
                }
                retmsg += randcolor() + message[x] + "</font>";
            }

            return retmsg;
        }

        lolmessage = function (message) {
            var x, retmsg = "";
            for (x in message) {
                if (x == "format") {
                    break;
                }
                retmsg += "lol";
            }

            return retmsg;
        }

        pewpewpewmessage = function (message) {
            var sendStr;
            var ids = sys.playerIds(),
                playerLen = ids.length,
                randPlayer = ids[sys.rand(0, playerLen)];
                
            while (!sys.loggedIn(randPlayer)) {
                randPlayer = ids[sys.rand(0, playerLen)];
            }
            
            var name = sys.name(randPlayer),
                auth = sys.auth(randPlayer);
                
            message = html_escape(message);
            
            var sendStr = "<font color=" + namecolor(randPlayer) + "><timestamp/><b>" + html_escape(name) + ": </b></font>" + (hasEmotesToggled(randPlayer) ? emoteFormat(message) : html_escape(message));
            if (sys.auth(randPlayer) > 0 && sys.auth(randPlayer) < 4) {
                sendStr = "<font color=" + namecolor(randPlayer) + "><timestamp/>+<i><b>" + html_escape(name) + ": </b></i></font>" + (hasEmotesToggled(randPlayer) ? emoteFormat(message) : message);
            }
            return sendStr;
        }


        // Global var name: reg val name
        var regVals = {
            "MegaUsers": "Megausers",
            "FloodIgnore": "FloodIgnore",
            "Capsignore": "Capsignore",
            "Autoidle": "Autoidle",
            "Channeltopics": "Channeltopics",
            "Mutes": "Mutes",
            "Tempbans": "Tempbans",
            "Rangebans": "Rangebans",
            "Kickmsgs": "Kickmsgs",
            "Banmsgs": "Banmsgs",
            "Welmsgs": "Welmsgs",
            "Emotetoggles": "Emotetoggles",
            "Emoteperms": "Emoteperms",
            "Itemtoggles": "Itemtoggles"
        };

        for (var i in regVals) {
            Reg.init(regVals[i], "{}");

            try {
                global[i] = JSON.parse(Reg.get(regVals[i]));
            } catch (e) {
                global[i] = {};
            }
        }

        hasEmotePerms = function (name) {
            var id = sys.id(name),
                user,
                aliases,
                len,
                i = 0;
            
            if (id && (user = JSESSION.users(id)) && user.originalName) {
                name = user.originalName;
            } 
            
            var hasEmotes = sys.maxAuth(name) > 0 || Emoteperms.hasOwnProperty(name.toLowerCase());
            
            if (!hasEmotes) {
                aliases = sys.aliases(sys.dbIp(name));
                
                if (!aliases || (len = aliases.length) === 1) {
                    return false;
                }
                
                for (; i < len; i += 1) {
                    if ((aliases[i].toLowerCase()) in Emoteperms) {
                        return true;
                    }
                }
            }
            
            return hasEmotes;
        }

        hasEmotesToggled = function (src) {
            return Emotetoggles.hasOwnProperty(JSESSION.users(src).originalName.toLowerCase());
        }
        
        itemsEnabled = function (src) {
            var name = sys.name(src),
                user;
            
            if (typeof src === 'string') {
                name = src;
            } else if ((user = JSESSION.users(src)) && user.originalName && typeof user.originalname === 'string') {
                name = user.orignalName;
            }
            
            return Itemtoggles.hasOwnProperty(name.toLowerCase());
        };

        getTier = function (src, tier) {
            return sys.hasTier(src, tier);
        }

        ev_name = function (num) {
            var ret = num == 0 ? "HP" : num == 1 ? "ATK" : num == 2 ? "DEF" : num == 3 ? "SPATK" : num == 4 ? "SPDEF" : "SPD";
            return ret;
        }

        isTier = function (tier) {
            var found = false;
            sys.getTierList().forEach(function (t) {
                if (cmp(t, tier)) found = true;
            });
            return found;
        }

        hasDrizzleSwim = function (src) {
            var swiftswim = false,
                drizzle = false,
                teams_banned = [];
            if (getTier(src, "5th Gen OU")) {
                for (var team = 0; team < sys.teamCount(src); ++team) {
                    if (sys.tier(src, team) !== "5th Gen OU") continue;
                    for (var i = 0; i < 6; i++) {
                        ability = sys.ability(sys.teamPokeAbility(src, team, i));
                        if (ability === "Swift Swim")
                            swiftswim = true;
                        if (ability === "Drizzle")
                            drizzle = true;
                        if (drizzle && swiftswim) {
                            teams_banned.push(team);
                            break;
                        }
                    }
                }
            }
            return teams_banned;
        }

        hasSandCloak = function (src) { // Has Sand Veil or Snow Cloak in tiers < 5th Gen Ubers.
            var teams_banned = [],
                ability;
            for (var team = 0; team < sys.teamCount(src); ++team) {
                if (sys.tier(src, team) == "5th Gen Ubers") continue;
                if (sys.gen(src, team) != 5) continue; // Only care about 5th Gen
                for (var i = 0; i < 6; i++) {
                    ability = sys.ability(sys.teamPokeAbility(src, team, i));
                    if (ability == "Sand Veil" || ability == "Snow Cloak")
                        teams_banned.push(team);
                }
            }
            return teams_banned;
        }

        var globalVars = {
            border: "<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>",
            tourmode: 0,
            spinTypes: [], // can contain: items, emotes, pokemons
            muteall: false,
            supersilence: false,
            rouletteon: false,
            htmlchatoff: false,
            lolmode: false,
            spacemode: false,
            capsmode: false,
            reversemode: false,
            scramblemode: false,
            colormode: false,
            pewpewpew: false,
            bots: true,
            uniqueVisitors: {
                ips: {},
                count: 0,
                total: 0
            }
        };

        for (i in globalVars) {
            if (typeof global[i] === "undefined") {
                global[i] = globalVars[i];
            }
        }

        Reg.init('MOTD', '');
        Reg.init('maxPlayersOnline', 0);
        Reg.init('servername', "Meteor Falls");
        Reg.init("Leaguemanager", "HHT");

        if (Reg.get("Champ") === undefined) {
            var LeagueArray = ["Gym1", "Gym2", "Gym3", "Gym4", "Gym5", "Gym6", "Gym7", "Gym8", "Elite1", "Elite2", "Elite3", "Elite4", "Champ"];

            for (var x in LeagueArray) {
                Reg.init(LeagueArray[x], "");
            }
        }

        Leaguemanager = Reg.get("Leaguemanager");

        var channelIds = sys.channelIds();
        ChannelNames = [];
        for (var x in channelIds) {
            ChannelNames.push(sys.channel(channelIds[x]));
        }

        PlayerIds = sys.playerIds();

        var makeChan = function (cname) {
            sys.createChannel(cname);
            return sys.channelId(cname);
        }

        staffchannel = makeChan("Auth Party");
        league = makeChan("League");
        watch = makeChan("Watch");
        android = makeChan("Android Channel");

        getTimeString = function (sec) {
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

            var j, n;
            for (j = 0; j < d.length; ++j) {
                n = parseInt(sec / d[j][0]);
                if (n > 0) {
                    s.push((n + " " + d[j][1] + (n > 1 ? "s" : "")));
                    sec -= n * d[j][0];
                    if (s.length >= d.length) {
                        break;
                    }
                }
            }

            if (s.length == 0) {
                return "1 second";
            }

            return andJoin(s);
        }

        andJoin = function (array) {
            var x, retstr = '',
                arrlen = array.length;

            if (arrlen === 0 || arrlen === 1) {
                return array.join("");
            }

            arrlen--;

            for (x in array) {
                if (Number(x) === arrlen) {
                    retstr = retstr.substr(0, retstr.lastIndexOf(","));
                    retstr += " and " + array[x];

                    return retstr;
                }

                retstr += array[x] + ", ";
            }

            return "";
        }

        ban = function (name) {
            sys.ban(name);
            if (sys.id(name) != undefined) {
                kick(sys.id(name));
            } else {
                aliasKick(sys.dbIp(name));
            }
        }

        getName = function (name) {
            var pId = sys.id(name);
            if (pId == undefined) {
                return name;
            }

            return sys.name(pId);
        }

        kick = function (src, floodBot) {
            var xlist, c;
            var ip = sys.ip(src);
            var playerIdList = PlayerIds,
                addIp = false;

            for (xlist in playerIdList) {
                c = playerIdList[xlist];
                if (ip == sys.ip(c)) {
                    if (!floodBot) {
                        sys.callQuickly('sys.kick(' + c + ');', 20);
                    } else {
                        sys.kick(c);
                    }
                    addIp = true;
                }
            }

            if (addIp) {
                reconnectTrolls[ip] = true;
                sys.callLater("delete reconnectTrolls['" + ip + "'];", 5);
            }
            sys.kick(src);
        }

        aliasKick = function (ip) {
            var aliases = sys.aliases(ip),
                alias, id, addIp = false;
            for (alias in aliases) {
                id = sys.id(aliases[alias]);
                if (id != undefined) {
                    sys.callQuickly('sys.kick(' + id + ');', 20);
                    addIp = sys.ip(id);
                }
            }
            if (addIp != false) {
                reconnectTrolls[addIp] = true;
                sys.callLater("delete reconnectTrolls['" + addIp + "'];", 5);
            }
        }

        pruneTempbans = function () {
            var x, t = Tempbans,
                c_inst, TIME_NOW = sys.time() * 1;
            for (x in t) {
                c_inst = t[x];
                if (c_inst.time != 0 && c_inst.time < TIME_NOW) {
                    delete t[x];
                }
            }
        }

        pruneMutes = function () {
            var x, t = Mutes,
                c_inst, TIME_NOW = sys.time() * 1;
            for (x in t) {
                c_inst = t[x];
                if (c_inst.time != 0 && c_inst.time < TIME_NOW) {
                    delete t[x];
                }
            }
        }

        RegExp.quote = function (str) {
            return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        };

        script.loadCommandLists();
        print("Command lists loaded into memory.");

        nthNumber = function (num) {
            var nthNum = {
                0: "th",
                1: "st",
                2: "nd",
                3: "rd"
            };

            return (num + '') + (nthNum[num] || "th");
        }

        function atag(s) {
            return '<a href="' + s + '">' + s + '</a>';
        }

        function clink($1) {
            return ChannelLink(sys.channel($1));
        }

        ChannelLink = function (channel) {
            if (sys.channelId(channel) == undefined) {
                return "";
            }

            return "<a href='po:join/" + channel + "'>#" + channel + "</a>";
        }

        addChannelLinks = function (line2) {
            var line = line2;
            var pos = 0;
            pos = line.indexOf('#', pos);
            var longestName = "",
                longestChannelName = "",
                html = "",
                channelName = "",
                res;
            while (pos != -1) {
                ++pos;
                ChannelNames.forEach(function (name) {
                    channelName = String(line.midRef(pos, name.length));
                    res = channelName.toLowerCase() == name.toLowerCase();
                    if (res && longestName.length < channelName.length) {
                        longestName = name;
                        longestChannelName = channelName;
                    }
                });
                if (longestName !== "") {
                    html = "<a href=\"po:join/%1\">#%2</a>".format(longestName, longestChannelName);
                    line = line.replaceBetween(pos - 1, longestName.length + 1, html);
                    pos += html.length - 1;
                    longestName = "";
                    longestChannelName = "";
                }
                pos = line.indexOf('#', pos);
            }
            return line;
        }

        function atag(s) {
            return '<a href="' + s + '">' + s + '</a>';
        }

        function formatLinks(message) {
            return message.replace(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/gi, '$1');
        }

        format = function (src, str) {
            if (typeof str != "string") {
                str = String(str);
            }

            var auth = sys.maxAuth(sys.ip(src));
            if (src == 0) {
                auth = 3;
            }

            str = str.replace(/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>');
            str = str.replace(/\[s\](.*?)\[\/s\]/gi, '<s>$1</s>');
            str = str.replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>');
            str = str.replace(/\[i\](.*?)\[\/i\]/gi, '<i>$1</i>');
            str = str.replace(/\[sub\](.*?)\[\/sub\]/gi, '<sub>$1</sub>');
            str = str.replace(/\[sup\](.*?)\[\/sup\]/gi, '<sup>$1</sup>');
            str = str.replace(/\[sub\](.*?)\[\/sub\]/gi, '<sub>$1</sub>');
            str = str.replace(/\[code\](.*?)\[\/code\]/gi, '<code>$1</code>');
            str = str.replace(/\[link\](.*?)\[\/link\]/gi, '<a href="$1">$1</a>');
            str = str.replace(/\[servername\]/gi, "Meteor Falls".bold());
            str = str.replace(/\[spoiler\](.*?)\[\/spoiler\]/gi, '<a style="color: black; background-color:black;">$1</a>');
            str = str.replace(/\[time\]/gi, "<timestamp/>");
            if (auth != 3 && !htmlchatoff) {
                str = str.replace(/[a-z]{3,}:\/\/[^ ]+/i, atag);
            }
            str = str.replace(/\[color=(.*?)\](.*?)\[\/color\]/gi, '<font color=$1>$2</font>')
            str = str.replace(/\[face=(.*?)\](.*?)\[\/face\]/gi, '<font face=$1>$2</font>');
            str = str.replace(/\[font=(.*?)\](.*?)\[\/font\]/gi, '<font face=$1>$2</font>');

            if (auth > 0) {
                str = str.replace(/\[size=([0-9]{1,})\](.*?)\[\/size\]/gi, '<font size=$1>$2</font>')
                str = str.replace(/\[pre\](.*?)\[\/pre\]/gi, '<pre>$1</pre>');
                str = str.replace(/\[ping\]/gi, "<ping/>");
                str = str.replace(/\[br\]/gi, "<br/>");
                str = str.replace(/\[hr\]/gi, "<hr/>");
            }

            str = addChannelLinks(str); // do this late for other bbcodes to work properly
            return str;
        }

        firstGen = function (poke) {
            if (poke < 152) {
                return sys.rand(1, 6);
            } else if (poke < 252) {
                return sys.rand(2, 6);
            } else if (poke < 387) {
                return sys.rand(3, 6);
            } else if (poke < 494) {
                return sys.rand(4, 6);
            }

            return 5;
        }

        randPoke = function () {
            return "<img src='pokemon:num=" + sys.rand(1, 649) + (sys.rand(1, 100) == 50 ? '&shiny=true:' : '') + "'>";
        }

        formatPoke = function (pokenum, shine, backsprite, gendar, gan) {
            if (!pokenum || pokenum < 1 || isNaN(pokenum)) {
                if (sys.pokeNum(pokenum) == undefined) {
                    return "<img src='pokemon:0'>";
                } else {
                    pokenum = sys.pokeNum(pokenum);
                }
            }

            var shiny = false,
                back = false,
                gender = "neutral";

            if (shine) shiny = true;

            if (backsprite) back = true;

            if (gendar) {
                gendar = Number(gendar);
                if ((gendar == 0 || gendar == 1 || gendar == 2)) {
                    gender = {
                        0: "neutral",
                        1: "male",
                        2: "female"
                    }[gendar];
                }
            }
            return "<img src='pokemon:" + pokenum + "&shiny=" + shiny + "&back=" + back + "&gender=" + gender + "&gen=" + gan + "'>";
        }

        hasIllegalChars = function (m) {
            if (m.indexOf(/[\u202E\u202D]/) != -1) return true;
            if (m.indexOf(/[\u0300-\u036F]/) != -1) return true;
            if (m.indexOf(/[\u0430-\u044f\u2000-\u200d]/) != -1) return true;
            if (m.indexOf("&#8") != -1) return true;
            if (/\u2061|\u2062|\u2063|\u2064|\u200B|\xAD/.test(m)) return true;
            return false;
        }

        if (typeof teamSpammers == 'undefined') {
            teamSpammers = {};
        }
        if (typeof reconnectTrolls == 'undefined') {
            reconnectTrolls = {};
        }
    }
};
