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
        // Various importable stuff.
        var natureNames = {
            24: "Quirky</b> Nature",
            23: "Careful</b> Nature (+SDef, -SAtk)",
            22: "Sassy</b> Nature (+SDef, -Spd)",
            21: "Gentle</b> Nature (+SDef, -Def)",
            20: "Calm</b> Nature (+SDef, -Atk)",
            19: "Rash</b> Nature (+SAtk, -SDef)",
            18: "Bashful</b> Nature",
            17: "Quiet</b> Nature (+SAtk, -Spd)",
            16: "Mild</b> Nature (+SAtk, -Def)",
            15: "Modest</b> Nature (+SAtk, -Atk)",
            14: "Naive</b> Nature (+Spd, -SDef)",
            13: "Jolly</b> Nature (+Spd, -SAtk)",
            12: "Serious</b> Nature",
            11: "Hasty</b> Nature (+Spd, -Def)",
            10: "Timid</b> Nature (+Spd, -Atk)",
            9: "Lax</b> Nature (+Def, -SDef)",
            8: "Impish</b> Nature (+Def, -SAtk)",
            7: "Relaxed</b> Nature (+Def, -Spd)",
            6: "Docile</b> Nature",
            5: "Bold</b> Nature (+Def, -Atk)",
            4: "Naughty</b> Nature (+Atk, -SDef)",
            3: "Adamant</b> Nature (+Atk, -SAtk)",
            2: "Brave</b> Nature (+Atk, -Spd)",
            1: "Lonely</b> Nature (+Atk, -Def)",
            0: "Hardy</b> Nature"
        };
        var typeColorNames = {
            0: "#a8a878",
            1: "#c03028",
            2: "#a890f0",
            3: "#a040a0",
            4: "#e0c068",
            5: "#b8a038",
            6: "#a8b820",
            7: "#705898",
            8: "#b8b8d0",
            9: "#f08030",
            10: "#6890f0",
            11: "#78c850",
            12: "#f8d030",
            13: "#f85888",
            14: "#98d8d8",
            15: "#7038f8",
            16: "#705848"
        };

        var genderToImportable = {
            incompatible: {
                "male": "<img src='Themes/Classic/genders/gender1.png'> (M)",
                "female": "<img src='Themes/Classic/genders/gender2.png'> (F)",
                "genderless": "<img src='Themes/Classic/genders/gender0.png'>"
            },

            "male": "(M)",
            "female": "(F)",
            "genderless": ""
        };

        var statNames = {
            0: "HP",
            1: "Atk",
            2: "Def",
            3: "SAtk",
            4: "SDef",
            5: "Spd"
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

        util.getAuth = function (src) {
            var auth = 0;
            if (typeof src === "string") {
                id = sys.name(src);
                auth = (id !== undefined) ? sys.auth(id) : sys.dbAuth(src);
            } else {
                auth = sys.auth(src);
            }
            return auth;
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
            var name = src, id;
            if (typeof src === "number") {
                name = sys.name(src);
            } else if ((id = sys.id(name))) {
                src = id;
                name = sys.name(src);
            }

            return "<b style='color: " + Utils.nameColor(src) + "' title='" + (typeof src === "number" ? sys.ip(src) : sys.dbIp(name)) + "'>" + Utils.escapeHtml(name) + (suffix || "") + "</b>";
        };

        util.beautifyName = function (src, suffix) {
            var id;
            if (typeof src === 'string' && (id = sys.id(src))) {
                src = id;
            }

            var name = typeof src === 'number' ? sys.name(src) : src;
            return "<b style='color: " + Utils.nameColor(src) + "'>" + Utils.escapeHtml(name) + (suffix || "") + "</b>";
        };

        util.beautifyNames = function (names) {
            return names.map(function(name) {
                return util.beautifyName(sys.id(name) || name);
            });
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

        // Creates an importable [array] for src's team, teamId.
        // Importables will have some goodies that will break them for use with PO, disable this with a third argument that is true.
        util.teamImportable = function (src, teamId, compatible) {
            var importable = [],
                maxTeamPokemon = 6,
                pokemonStatsCount = 6,
                maxPokemonMoves = 4,
                pokemonMaxLevel = 100,
                pokemon_MissingNo = 0,
                itemname_NoItem = "(No Item)",
                move_NoMove = 0,
                move_HiddenPower = 237;

            var gen = sys.gen(src, teamId),
                fullGen = sys.generation(gen, sys.subgen(src, teamId)),
                pokemon,
                move,
                ev,
                iv,
                pokemonId,
                pokemonName,
                pokemonLevel,
                pokemonItem,
                pokemonAbility,
                pokemonColor,
                pokemonGender,
                pokemonNature,
                pokemonShiny,
                pokemonNickname,
                pokemonEV,
                pokemonEVs = [],
                pokemonIV,
                pokemonIVs = [],
                moveId,
                moveName,
                moveType,
                movePart,
                nicknamePart,
                itemPart,
                genderPart;

            if (!compatible) {
                importable.push("Team #" + (teamId + 1) + ": Gen " + gen + " (" + fullGen + ")");
            }

            // Loop over their Pokémon.
            for (pokemon = 0; pokemon < maxTeamPokemon; pokemon += 1) {
                pokemonId = sys.teamPoke(src, teamId, pokemon);

                // Don't handle MissingNo
                if (pokemonId === pokemon_MissingNo) {
                    continue;
                }

                pokemonName = sys.pokemon(pokemonId);
                pokemonLevel = sys.teamPokeLevel(src, teamId, pokemon);
                pokemonItem = sys.teamPokeItem(src, teamId, pokemon);
                pokemonAbility = sys.teamPokeAbility(src, teamId, pokemon);
                pokemonColor = typeColorNames[sys.pokeType1(pokemonId)];
                pokemonGender = sys.teamPokeGender(src, teamId, pokemon);
                pokemonNature = sys.teamPokeNature(src, teamId, pokemon);
                pokemonShiny = sys.teamPokeShine(src, teamId, pokemon);
                pokemonNickname = sys.teamPokeNick(src, teamId, pokemon);

                if (!compatible) {
                    importable.push(
                        "<img src='pokemon:num=" + pokemonId + "&gen=" + gen + "&back=false&shiny=" + pokemonShiny + "&gender=" + pokemonGender + "'> <img src='pokemon:num=" + pokemonId + "&gen=" + gen + "&back=true&shiny=" + pokemonShiny + "&gender=" + pokemonGender + "'>"
                    );
                }

                nicknamePart = pokemonNickname + "</b></font>";

                if (pokemonName !== pokemonNickname) {
                    nicknamePart += " (<b style='color:" + pokemonColor + "'>" + pokemonName + "</b>)";
                }

                itemPart = sys.item(pokemonItem);

                if (itemPart === itemname_NoItem) {
                    itemPart = "";
                } else if (!compatible) { // If the item isn't (No Item), and compatible is off, display an image instead.
                    itemPart = itemPart + " <img src='item:" + pokemonItem + "'>";
                }

                genderPart = compatible ? genderToImportable[sys.gender(pokemonGender)] : genderToImportable.incompatible[sys.gender(pokemonGender)];

                importable.push(
                    // <b> tag is closed by nicknamePart
                    "<b style='color: " + pokemonColor + "'>" + nicknamePart + " " + genderPart + " @ " + itemPart
                );

                // In Generation 1 and 2, there were no abilities.
                if (gen > 2) {
                    importable.push(
                        "<b style='color: " + pokemonColor + "'>Trait:</b> " + sys.ability(pokemonAbility)
                    );
                }

                // Only add the level header if the Pokémon's level isn't maximum.
                if (pokemonMaxLevel > pokemonLevel) {
                    importable.push(
                        "<b style='color: " + pokemonColor + "'>Level:</b> " + pokemonLevel
                    );
                }

                // No EVs or IVs in Generation 1.
                if (gen > 1) {
                    // EVs
                    for (ev = 0; ev < pokemonStatsCount; ev += 1) {
                        pokemonEV = sys.teamPokeEV(src, teamId, pokemon, ev);

                        // 255 is the default in Generation 2.
                        if (pokemonEV === 0 || (gen === 2 && pokemonEV === 255)) {
                            continue;
                        }

                        pokemonEVs.push(pokemonEV + " " + statNames[ev]);
                    }

                    // If there are custom EVs, add the header. EVs are separated with a forward slash, one space before it, and one after.
                    if (pokemonEVs.length) {
                        importable.push(
                            "<b style='color: " + pokemonColor + "'>EVs:</b> " + pokemonEVs.join(" / ")
                        );
                    }

                    // IVs - DVs in Pokémon Online
                    for (iv = 0; iv < pokemonStatsCount; iv += 1) {
                        pokemonIV = sys.teamPokeDV(src, teamId, pokemon, iv);

                        // 15 is the default in Generation 2, 31 otherwise.
                        if (pokemonIV === 31 || (gen === 2 && pokemonIV === 15)) {
                            continue;
                        }

                        pokemonEVs.push(pokemonIV + " " + statNames[iv]);
                    }

                    // If there are custom IVs, add the header. IVs are separated with a forward slash, one space before it, and one after.
                    if (pokemonIVs.length) {
                        importable.push(
                            "<b style='color: " + pokemonColor + "'>IVs:</b> " + pokemonIVs.join(" / ")
                        );
                    }
                }

                // There are no natures in Generation 2 either.
                if (gen > 2) {
                    // natureNames contains all the info we need. <b> is once again closed in this aswell.
                    importable.push(
                        "<b style='color: " + pokemonColor + "'>" + natureNames[pokemonNature]
                    );
                }

                // Now handle the moves. Oh boy.
                for (move = 0; move < maxPokemonMoves; move += 1) {
                    moveId = sys.teamPokeMove(src, teamId, pokemon, move);
                    moveName = sys.move(moveId);
                    moveType = sys.moveType(moveId);
                    movePart = "<b style='color: " + typeColorNames[moveType] + "'>" + moveName + "</b>";

                    // Skip empty move slots.
                    if (moveId === move_NoMove) {
                        continue;
                    }

                    // Special stuff for Hidden Power.
                    if (moveId === move_HiddenPower) {
                        // Redo the IVs, this time include every one.
                        pokemonIVs = [];

                        for (iv = 0; iv < pokemonStatsCount; iv += 1) {
                            pokemonIV = sys.teamPokeDV(src, teamId, pokemon, iv);
                            pokemonIVs.push(pokemonIV);
                        }

                        // Combine the gen with the pokemon's complete IV list to get the type of hidden power via hiddenPowerType.
                        moveType = sys.hiddenPowerType.apply(sys, [gen].concat(pokemonIVs));
                        movePart = "<b style='color: " + typeColorNames[moveType] + "'>" + moveName + "</b>";
                    }

                    importable.push(
                        "-" + movePart
                    );
                }
            }

            return importable;
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
            return sys.banned(sys.dbIp(playerName));
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
            util.mod.kickIp(sys.ip(sys.id(name)));
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
            return util.getAuth(src) > 0;
        };

        util.channel = {};
        util.channel.channelAuth = function (src, chan) {
            if (typeof src === 'number') {
                src = sys.name(src);
            }

            var sess = SESSION.channels(chan),
                name = src.toLowerCase();
            var auth = util.getAuth(src);
            var cauth = (sess.creator.toLowerCase() === name) ? 3 : (sess.auth[name] || 0);
            return auth > cauth ? auth : cauth;
        };

        util.channel.hasChannelAuth = function (src, chan) {
            return util.channel.channelAuth(src, chan) > 0;
        };

        util.channel.isChannelMod = function (src, chan) {
            return util.channel.channelAuth(src, chan) >= 1;
        };

        util.channel.isChannelAdmin = function (src, chan) {
            return util.channel.channelAuth(src, chan) >= 2;
        };

        util.channel.isChannelOwner = function (src, chan) {
            return util.channel.channelAuth(src, chan) >= 3;
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

        util.tier.dreamAbilityCheck = function dreamAbilityCheck(src) {
            var bannedAbilities = {
                'chandelure': ['shadow tag']
            };

            var i;
            for (i = 0; i < sys.teamCount(src); i += 1) {
                var ability = sys.ability(sys.teamPokeAbility(src, i, i));
                var lability = ability.toLowerCase();
                var poke = sys.pokemon(sys.teamPoke(src, i, i));
                var lpoke = poke.toLowerCase();
                if (bannedAbilities.hasOwnProperty(lpoke) && bannedAbilities[lpoke].indexOf(lability) !== -1) {
                    bot.sendMessage(src, poke + " is not allowed to have ability " + ability + " in 5th Gen x Tier. Please change it in Teambuilder. You are now in the Random Battle tier.");
                    return true;
                }
            }

            return false;
        };

        return util;
    };

    module.reload = function () {
        Utils = module.exports();
        return true;
    };
}());
