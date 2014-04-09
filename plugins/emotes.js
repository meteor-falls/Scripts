global.Emotes = {
    list: {},
    display: []
};

(function () {
    var emoteRegex = {};
    var nonAlpha = /\W/;
    var marxState = 0;

    var emojiRegex = /:([a-z0-9\+\-_]+):/g;
    var emojiFile = sys.getFileContent(Config.datadir + 'emoji.json') || "";
    var emojis = {};

    if (emojiFile.length) {
        emojis = JSON.parse(emojiFile);
    }

    Emotes.code = function (name) {
        return Emotes.list[name];
    };

    Emotes.add = function (alts, code) {
        var regex, alt, len, i;

        if (!Array.isArray(alts)) {
            alts = [alts];
        }

        len = alts.length;

        for (i = 0; i < len; i += 1) {
            alt = alts[i];
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

        if (src && uobj) {
            //perm = Utils.mod.hasBasicPermissions(src);
            //timeout = perm ? 4 : 7;
            if (uobj.lastEmoteTime && uobj.lastEmoteTime + timeout > time) {
                lastEmote = uobj.lastEmote || [];
            } else {
                uobj.lastEmote = [];
            }
        }

        if (src && RTD.hasEffect(src, 'bigger_emotes')) {
            size = " width='100' height='100'";
        }

        function assignEmote(emote, code) {
            return function ($1) {
                if (limit && (emotes.length > 4 || lastEmote.indexOf(emote) !== -1)) {
                    return Utils.escapeHtml($1);
                }

                emotes.push(emote);

                if (uobj && uobj.lastEmote) {
                    uobj.lastEmote.push(emote);
                }

                if (marxmode && emote !== "marx1" && emote !== "stalin1" && emote !== "lenin1") {
                    marxState += 1;
                    if (marxState === 1) {
                        code = Emotes.code("marx1");
                    } else if (marxState === 2) {
                        code = Emotes.code("stalin1");
                    } else {
                        code = Emotes.code("lenin1");
                        marxState = 0;
                    }
                } else if (georgemode) {
                    code = Emotes.code("george1");
                } else if (src) {
                    if (RTD.hasEffect(src, 'blank_emotes')) {
                        code = "invalid";
                        size = " width='50' height='50'";
                    } else if (RTD.hasEffect(src, 'nobody_cares')) {
                        code = "data:image/gif;base64,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"; // Sorry for the inline html!
                    }
                }

                return "<img src='" + code + "'" + size + ">";
            };
        }

        for (i in Emotes.list) {
            if (limit && emotes.length > 4) {
                break;
            }

            // Major speed up.
            if (message.indexOf(i) !== -1) {
                message = message.replace(emoteRegex[i], assignEmote(i, Emotes.list[i]));
            }
        }

        // Misc "emotes". Pokemons, icons, items, and avatars.
        // pokemon:subtitute also works.
        // pokemon:30&cropped=true
        message = message.replace(/((trainer|icon|item|pokemon):([(\d|\-)&=(gen|shiny|gender|back|cropped|num|substitute|true|false)]+))/g, "<img src='$1'>")
            .replace(/:\(/g, "<img src='item:177'>")
            .replace(/:charimang:/g, "<img src='pokemon:6&gen=2'>")
            .replace(/:mukmang:/g, "<img src='pokemon:89&gen=1'>")
            .replace(/:feralimang:/g, "<img src='pokemon:160&gen=2'>")
            .replace(/oprah1/g, "<img src='pokemon:124&gen=1'>")
            .replace(/oprah2/g, "<img src='pokemon:124&gen=2'>");


        // Emoji effects
        if (src && RTD.hasEffect(src, 'bigger_emotes')) {
            size = " width='44' height='44'";
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

        if (uobj && uobj.lastEmote && lastEmote.toString() !== uobj.lastEmote.toString()) {
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
        Emotes.display = [];

        for (emote in emoteSource) {
            Emotes.add(emote.split(','), emoteSource[emote]);
        }
    };

    Emotes.interpolate = function (src, msg, vars, checkEnabled) {
        var i;
        for (i in vars) {
            msg = msg.replace(new RegExp(RegExp.quote(i), "gi"), vars[i]);
        }

        if ((!checkEnabled) || (checkEnabled && Emotes.enabledFor(src))) {
            msg = Emotes.format(msg, Emotes.ratelimit, src);
        }

        return msg;
    };
    Emotes.always = false;
    Emotes.emoji = emojis;
}());

module.reload = function () {
    Emotes.load();
    require.reload('lists.js');
    return true;
};
