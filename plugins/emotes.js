global.Emotes = {
    list: {},
    names: [],
    display: []
};

(function () {
    var emoteRegex = {};
    var nonAlpha = /\W/;
    var marxState = 0;
    var marxmotes = ["marx1", "lenin1", "stalin1"];

    var emojiRegex = /:([a-z0-9\+\-_]+):/g;
    var emojiFile = sys.getFileContent(Config.datadir + 'emoji.json') || "";
    var emojis = {};

    if (emojiFile.length) {
        emojis = JSON.parse(emojiFile);
    }

    Emotes.code = function (name) {
        return Emotes.list[name];
    };

    Emotes.random = function () {
        return Emotes.names[sys.rand(0, Emotes.names.length)];
    };

    Emotes.add = function (alts, code) {
        var regex, alt, len, i;

        if (!Array.isArray(alts)) {
            alts = [alts];
        }

        len = alts.length;

        for (i = 0; i < len; i += 1) {
            alt = alts[i];
            Emotes.names.push(alt);
            Emotes.list[alt] = code;

            regex = RegExp.quote(alt);
            if (!nonAlpha.test(alt)) {
                regex = "\\b" + regex + "\\b";
            }
            emoteRegex[alt] = new RegExp(regex, "g");
        }

        Emotes.display.push(alts.join(" | "));
    };

    Emotes.format = function (message, limit, src) {
        if (!Config.emotesEnabled) {
            return message;
        }

        var emotes = [],
            emojiCount = 0,
            uobj = SESSION.users(src),
            timeout = 3,
            lastEmote = [],
            time = +sys.time(),
            size = "",
            perm, i;

        if (limit && src && uobj) {
            //perm = Utils.mod.hasBasicPermissions(src);
            //timeout = perm ? 4 : 7;
            if (uobj.lastEmoteTime && uobj.lastEmoteTime + timeout > time) {
                lastEmote = uobj.lastEmote || [];
            } else {
                uobj.lastEmote = [];
            }
        }

        if (src) {
            if (RTD.hasEffect(src, 'bigger_emotes')) {
                size = " width='100' height='100'";
            } else if (RTD.hasEffect(src, 'smaller_emotes')) {
                size = " width='25' height='25'";
            }
        }

        function assignEmote(emote) {
            return function ($1) {
                var code;

                if (emotes.length > 4 || (limit && lastEmote.indexOf(emote) !== -1)) {
                    return Utils.escapeHtml($1);
                }

                emotes.push(emote);

                if (limit && uobj && uobj.lastEmote) {
                    uobj.lastEmote.push(emote);
                }

                if (marxmode && marxmotes.indexOf(emote) === -1) {
                    marxState += 1;
                    if (marxState === 1) {
                        emote = "marx1";
                    } else if (marxState === 2) {
                        emote = "stalin1";
                        code = Emotes.code("stalin1");
                    } else {
                        emote = "lenin1";
                        marxState = 0;
                    }
                    code = Emotes.code(emote);
                } else if (georgemode) {
                    emote = "george1";
                    code = Emotes.code("george1");
                } else if (src) {
                    if (RTD.hasEffect(src, 'blank_emotes')) {
                        code = emote = "invalid";
                        size = " width='50' height='50'";
                    } else if (RTD.hasEffect(src, 'nobody_cares')) { // Sorry for the inline html!
                        emote = "nc";
                        code = "data:image/gif;base64,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";
                    } else if (RTD.hasEffect(src, 'im_blue')) {
                        emote = "blu2";
                        code = "data:image/png;base64,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";
                    } else if (RTD.hasEffect(src, 'random_emotes')) {
                        emote = Emotes.random();
                        code = Emotes.code(emote);
                    }
                }

                if (!code) {
                    code = Emotes.code(emote);
                }

                return "<a href='po:appendmsg/ " + emote + "' title='" + emote + "'><img src='" + code + "'" + size + "></a>";
            };
        }

        for (i in Emotes.list) {
            if (emotes.length > 4) {
                break;
            }

            // Major speed up.
            if (message.indexOf(i) !== -1) {
                message = message.replace(emoteRegex[i], assignEmote(i));
            }
        }

        // Misc "emotes". Pokemons, icons, items, and avatars.
        // pokemon:subtitute also works.
        // pokemon:30&cropped=true
        message = message.replace(/((trainer|icon|item|pokemon):([(\d|\-)&=(gen|shiny|gender|back|cropped|num|substitute|true|false)]+))/g, "<a href='po:appendmsg/ $1' title='$1'><img src='$1'></a>");

        // Emoji effects
        if (src) {
            if (RTD.hasEffect(src, 'bigger_emotes')) {
                size = " width='44' height='44'";
            } else if (RTD.hasEffect(src, 'smaller_emotes')) {
                size = " width='11' height='11'";
            }
        }

        message = message.replace(emojiRegex, function (name) {
            var emoji = name.substr(1, name.length - 2),
                code;

            if ((emotes.length + emojiCount) > 5) {
                return name;
            }

            if (emojis.hasOwnProperty(emoji)) {
                code = emojis[emoji];

                if (src && RTD.hasEffect(src, 'blank_emotes')) {
                    code = "invalid";
                    size = " width='22' height='22'";
                }

                emojiCount += 1;
                return "<img src='" + code + "'" + size + ">";
            }

            return name;
        });

        if (limit && uobj && uobj.lastEmote && lastEmote.toString() !== uobj.lastEmote.toString()) {
            uobj.lastEmoteTime = time;
        }

        return message;
    };

    // Enum for Emotes.format, not literally rate limiting all the time
    Emotes.ratelimit = true;

    // Accepts either a name (the player must be online) or id
    Emotes.hasPermission = function (name) {
        var id = sys.id(name) || name,
            user = SESSION.users(id),
            ip, aliases,
            len, i;

        if (id && user && user.originalName) {
            name = user.originalName;
        }

        ip = sys.dbIp(name);
        if (sys.maxAuth(ip) > 0 || Emoteperms.hasOwnProperty(name.toLowerCase()) || Config.maintainers.indexOf(name) !== -1) {
            return true;
        }

        aliases = sys.aliases(ip);

        if (!aliases || (len = aliases.length) === 1) {
            return false;
        }

        for (i = 0; i < len; i += 1) {
            if (Emoteperms.hasOwnProperty(aliases[i].toLowerCase())) {
                return true;
            }
        }

        return false;
    };

    // Accepts either a name (the player must be online) or id
    Emotes.enabledFor = function (src) {
        var id = sys.id(src) || src,
            name = SESSION.users(id).originalName.toLowerCase();
        return (Utils.mod.hasBasicPermissions(id) || Emotes.hasPermission(id)) && Emotetoggles.hasOwnProperty(name);
    };

    Emotes.load = function () {
        var emoteSource = JSON.parse(sys.synchronousWebCall(Config.emotesurl)),
            emote;
        delete emoteSource["@NOTICE"];

        Emotes.list = {};
        Emotes.names = [];
        Emotes.display = [];

        for (emote in emoteSource) {
            Emotes.add(emote.split(','), emoteSource[emote]);
        }
    };

    Emotes.interpolate = function (src, msg, vars, checkEnabled, rateLimit) {
        var i;
        for (i in vars) {
            msg = msg.replace(new RegExp(RegExp.quote(i), "gi"), vars[i]);
        }

        if (rateLimit !== false) {
            rateLimit = Emotes.ratelimit;
        }

        if ((!checkEnabled) || (checkEnabled && Emotes.enabledFor(src))) {
            msg = Emotes.format(msg, rateLimit, src);
        }

        return msg;
    };
    Emotes.always = false;
    Emotes.emoji = emojis;

    // Misc emotes
    Emotes.add(":(", "item:177");
    Emotes.add(":charimang:", "pokemon:6&gen=2");
    Emotes.add(":mukmang:", "pokemon:89&gen=1");
    Emotes.add(":feralimang:", "pokemon:160&gen=2");
    Emotes.add("oprah1", "pokemon:124&gen=1");
    Emotes.add("oprah2", "pokemon:124&gen=2");
}());

module.reload = function () {
    Emotes.load();
    require.reload('lists.js');
    return true;
};
