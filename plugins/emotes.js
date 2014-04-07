var Emotes = {
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

        // data:, icon:, item:
        if (code.charAt(4) === ":") {
            code = "<img src='" + code + "'>";
        }

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
                }

                return code;
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

        message = message.replace(emojiRegex, function (name) {
            var emoji = name.substr(1, name.length - 2);

            if ((emotes.length + emojiCount) > 5) {
                return name;
            }

            if (emojis.hasOwnProperty(emoji)) {
                emojiCount += 1;
                return "<img src='" + emojis[emoji] + "'>";
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

    Emotes.emoji = emojis;
}());

module.reload = function () {
    Emotes.load();
    require.reload('lists.js');
    return true;
};
