// NOTE: New functions should go in utils.js, old ones should slowly be ported over.
module.exports = {
    init: function init() {
        randcolor = function () {
            var nums = 5;
            var str = '';
            while (nums >= 0) {
                str += sys.rand(0, 16).toString(16);
                nums -= 1;
            }
            return "<font color='#" + str + "'>";
        };

        colormodemessage = function (message) {
            var msg = "";
            var len, i;
            for (i = 0, len = message.length; i < len; i += 1) {
                msg += randcolor() + message[i] + "</font>";
            }

            return msg;
        };

        lolmessage = function (message) {
            var msg = "";
            var len, i;
            for (i = 0, len = message.length; i < len; i += 1) {
                msg += "lol";
            }

            return msg;
        };

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

            message = Utils.escapeHtml(message);

            sendStr = "<font color=" + Utils.nameColor(randPlayer) + "><timestamp/><b>" + Utils.escapeHtml(name) + ": </b></font>" + (hasEmotesToggled(randPlayer) ? emoteFormat(message) : Utils.escapeHtml(message));
            if (sys.auth(randPlayer) > 0 && sys.auth(randPlayer) < 4) {
                sendStr = "<font color=" + Utils.nameColor(randPlayer) + "><timestamp/>+<i><b>" + Utils.escapeHtml(name) + ": </b></i></font>" + (hasEmotesToggled(randPlayer) ? emoteFormat(message) : message);
            }

            if (nightclub) {
                sendStr = Utils.nightclub.rainbowify("(" + Utils.escapeHtml(name) + "): " + message);
            }

            return sendStr;
        };

        // Global var name: reg val name
        var regVals = {
            "MegaUsers": "Megausers",
            "FloodIgnore": "FloodIgnore",
            "Mutes": "Mutes",
            "Rangebans": "Rangebans",
            "Kickmsgs": "Kickmsgs",
            "Banmsgs": "Banmsgs",
            "Welmsgs": "Welmsgs",
            "Emotetoggles": "Emotetoggles",
            "Emoteperms": "Emoteperms",
            "Feedmons": "Feedmon",
            "League": "League"
        };

        for (var i in regVals) {
            Reg.init(regVals[i], {});

            try {
                global[i] = Reg.get(regVals[i]);
            } catch (e) {
                global[i] = {};
            }
        }

        hasEmotePerms = function (name) {
            var id = sys.id(name),
                user = SESSION.users(id),
                hasEmotes,
                ip,
                aliases,
                len,
                i;

            if (id && user && user.originalName) {
                name = user.originalName;
            }

            ip = sys.dbIp(name);
            hasEmotes = sys.maxAuth(ip) > 0 || Emoteperms.hasOwnProperty(name.toLowerCase()) || Config.maintainers.indexOf(name) !== -1;

            if (!hasEmotes) {
                aliases = sys.aliases(ip);

                if (!aliases || (len = aliases.length) === 1) {
                    return false;
                }

                for (i = 0; i < len; i += 1) {
                    if (Emoteperms.hasOwnProperty(aliases[i].toLowerCase())) {
                        return true;
                    }
                }
            }

            return hasEmotes;
        };

        hasEmotesToggled = function (src) {
            var name = SESSION.users(src).originalName.toLowerCase();
            return (Utils.mod.hasBasicPermissions(src) || hasEmotePerms(name)) && Emotetoggles.hasOwnProperty(name);
        };

        var globalVars = {
            border: "<font color=green><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>",
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

        for (i in globalVars) {
            if (typeof global[i] === "undefined") {
                global[i] = globalVars[i];
            }
        }

        Reg.init('MOTD', '');
        Reg.init('maxPlayersOnline', 0);
        Reg.init('servername', Config.servername);
        Reg.init('League',
            {
                Gym1: "", Gym2: "", Gym3: "", Gym4: "", Gym5: "", Gym6: "", Gym7: "", Gym8: "",
                Elite1: "", Elite2: "", Elite3: "", Elite4: "", Champ: "", Managers: []
            }
        );

        var makeChan = function (cname) {
            sys.createChannel(cname);
            return sys.channelId(cname);
        };

        staffchannel = makeChan("Auth Party");
        testchan = makeChan("Ground Zero");
        watch = makeChan("Watch");

        RegExp.quote = function (str) {
            return str.replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1");
        };

        nthNumber = function (num) {
            var nthNum = {
                0: "th",
                1: "st",
                2: "nd",
                3: "rd"
            };

            return num + (nthNum[num] || "th");
        };

        ChannelLink = function (channel) {
            if (typeof channel === "number") {
                channel = sys.channel(channel);
            }

            return "<a href='po:join/" + channel + "'>#" + channel + "</a>";
        };

        addChannelLinks = function (line) {
            var index = line.indexOf('#');
            if (index === -1) {
                return line;
            }

            var str = '', fullChanName, chanName, chr, lastIndex = 0, pos, i;
            var channelNames = Utils.channelNames(true); // lower case names

            while (index !== -1) {
                str += line.substring(lastIndex, index);
                lastIndex = index + 1; // Skip over the '#'

                fullChanName = '';
                chanName = '';

                for (i = 0, pos = lastIndex; i < 20 && (chr = line[pos]); i += 1, pos += 1) {
                    fullChanName += chr;
                    if (channelNames.indexOf(fullChanName.toLowerCase()) !== -1) {
                        chanName = fullChanName;
                    }
                }

                if (chanName) {
                    str += "<a href='po:join/" + chanName + "'>#" + chanName + "</a>";
                    lastIndex += chanName.length;
                } else {
                    str += '#';
                }

                index = line.indexOf('#', lastIndex);
            }

            if (lastIndex < line.length) {
                str += line.substr(lastIndex);
            }

            return str;
        };

        /*function formatLinks(message) {
            return message.replace(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?\^=%&amp;:\/~\+#]*[\w\-\@?\^=%&amp;\/~\+#])?/gi, '$1');
        }*/
    }
};

module.reload = function reloadInit() {
    module.exports.init();
    return true;
};
