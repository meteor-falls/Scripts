(function () {
    var commands = {};
    var disabledCmds = [];
    var commandReturns = {
        NOWATCH: 0x1
    };

    function addCommand(authLevel, name, callback, flags) {
        // Proper checks
        if (typeof authLevel !== "number" && typeof authLevel !== "object") {
            print("Error: command " + name + " doesn't have a minimum auth level.");
            return;
        }

        if ((typeof name !== "string") && (typeof name !== "object")) {
            print("Error: unknown command without name.");
            return;
        }

        if (typeof callback !== "function") {
            print("Error: command " + name + " doesn't have a callback.");
            return;
        }

        var names = [].concat(name),
            len,
            i;

        for (i = 0, len = names.length; i < len; i += 1) {
            commands[names[i]] = {
                'authLevel': authLevel,
                'callback': callback,
                'flags': flags || 0
            };
        }
    }

    addCommand.flags = {
        MAINTAINERS: 0x1,
        MEGAUSERS: 0x2,
        CHANNELMODS: 0x4,
        CHANNELADMINS: 0x8,
        CHANNELOWNERS: 0x10,
        HIDDEN: 0x20
    };

    // Shorthands
    function addListCommand(auth, names, listname, cb, flags) {
        addCommand(auth, names, function (src, command, commandData, tar, chan) {
            if (cb && !cb.call(this, src, command, commandData, tar, chan)) {
                return;
            }

            Lists[listname].display(src, chan);
        }, flags);
    }

    function addMaintainerCommand(names, cb, flags) {
        addCommand(3, names, cb, (flags || 0) | addCommand.flags.MAINTAINERS);
    }

    function addCheatCode(names, cb, flags) {
        addCommand(-1, names, cb, (flags || 0) | addCommand.flags.MAINTAINERS | addCommand.flags.HIDDEN);
    }

    function addChannelModCommand(names, cb, flags) {
        addCommand(1, names, cb, (flags || 0) | addCommand.flags.CHANNELMODS);
    }

    function addChannelAdminCommand(names, cb, flags) {
        addCommand(2, names, cb, (flags || 0) | addCommand.flags.CHANNELADMINS);
    }

    function addChannelOwnerCommand(names, cb, flags) {
        addCommand(3, names, cb, (flags || 0) | addCommand.flags.CHANNELOWNERS);
    }

    function canUseCommand(src, command, chan) {
        if (!commands.hasOwnProperty(command)) {
            throw "The command " + command + " doesn't exist.";
        }

        var srcauth = Utils.getAuth(src),
            poUser = SESSION.users(src),
            name = poUser.originalName,
            cmd = commands[command],
            commandFlags = addCommand.flags;

        if ((cmd.flags & commandFlags.MAINTAINERS) && Config.maintainers.indexOf(name) !== -1) {
            return true;
        }

        if ((cmd.flags & commandFlags.MEGAUSERS) && Utils.checkFor(MegaUsers, name)) {
            return true;
        }

        if ((cmd.flags & commandFlags.CHANNELMODS) && Utils.channel.isChannelMod(src, chan)) {
            return true;
        }

        if ((cmd.flags & commandFlags.CHANNELADMINS) && Utils.channel.isChannelAdmin(src, chan)) {
            return true;
        }

        if ((cmd.flags & commandFlags.CHANNELOWNERS) && Utils.channel.isChannelOwner(src, chan)) {
            return true;
        }

        if (cmd.authLevel) {
            if ((typeof cmd.authLevel === 'number' && (cmd.authLevel > srcauth || cmd.authLevel === -1)) || (Array.isArray(cmd.authLevel) && cmd.authLevel.indexOf(poUser.originalName) === -1)) {
                if (cmd.flags & commandFlags.HIDDEN) {
                    throw "The command " + command + " doesn't exist.";
                } else {
                    throw "You need to be a higher auth to use this command.";
                }
            }
        }

        if (disabledCmds.indexOf(command.toLowerCase()) > -1 && srcauth < 1) {
            throw "The command " + command + " has been disabled.";
        }
        return true;
    }

    function handleCommand(src, message, command, commandData, tar, chan) {
        var poUser = SESSION.users(src),
            isMuted = poUser.muted,
            originalName = poUser.originalName,
            isLManager = League.Managers.indexOf(originalName.toLowerCase()) > -1,
            myAuth = Utils.getAuth(src);

        var cmd = commands[command];
        if (typeof cmd.callback === "function") {
            return cmd.callback.call(
                {
                    poUser: poUser,
                    isMuted: isMuted,
                    originalName: originalName,
                    isLManager: isLManager,
                    myAuth: myAuth
                },
                src,
                command,
                commandData,
                tar,
                chan,
                message
            );
        }

        return 0;
    }

    /** USER COMMANDS */
    addListCommand(0, "commands", "Commands");
    addListCommand(0, "usercommands", "User");
    addListCommand(0, "funcommands", "Fun");
    addListCommand(1, "megausercommands", "Megauser", null, addCommand.flags.MEGAUSERS);

    addListCommand(0, "leaguemanagercommands", "LeagueManager", function (src, command, commandData, tar, chan) {
        if (!this.isLManager) {
            bot.sendMessage(src, 'You need to be a league manager to view these!', chan);
            return false;
        }
        return true;
    });

    addListCommand(0, "channelcommands", "Channel");
    addListCommand(0, "chanmodcommands", "ChanMod");
    addListCommand(0, "chanadmincommands", "ChanAdmin");
    addListCommand(0, "chanownercommands", "ChanOwner");

    addCommand(0, "vote", function (src, command, commandData, tar, chan) {
        if (!Poll.active) {
            return bot.sendMessage(src, "There is no poll right now.", chan);
        }

        var option = parseInt(commandData, 10) - 1;
        if (isNaN(option)) {
            option = -1;
        }

        if (!Poll.options[option]) {
            return bot.sendMessage(src, "There is no such option as " + (option + 1) + " available.", chan);
        } else if (Poll.by === sys.name(src)) {
            return bot.sendMessage(src, "As starter of the poll, you aren't allowed to vote.", chan);
        }

        var ip = sys.ip(src);
        if (ip in Poll.votes && Poll.votes[ip] === option) {
            return bot.sendMessage(src, "You can't vote for the same thing twice. Vote for something else to change your vote!", chan);
        }

        bot.sendMessage(src, "You voted for option #" + (option + 1) + ": " + Poll.options[option], chan);

        if (ip in Poll.votes) {
            bot.sendAll(sys.name(src) + " changed their vote!", chan);
        } else {
            bot.sendAll(sys.name(src) + " voted!", chan);
        }

        Poll.votes[ip] = option;
    });

    addCommand(0, "burn", function (src, command, commandData, tar, chan) {
        if (!tar) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status4.png><b><font color=red><font size=3>" + Utils.escapeHtml(sys.name(tar)) + " was burned by " + Utils.escapeHtml(sys.name(src)) + " <img src=Themes/Classic/status/battle_status4.png>", chan);
    });

    addCommand(0, "freeze", function (src, command, commandData, tar, chan) {
        if (!tar) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status3.png><b><font color=blue><font size=3> " + Utils.escapeHtml(sys.name(tar)) + " was frozen by " + Utils.escapeHtml(sys.name(src)) + " <img src=Themes/Classic/status/battle_status3.png>", chan);
    });

    addCommand(0, "paralyze", function (src, command, commandData, tar, chan) {
        if (!tar) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status1.png><b><font color='#C9C909'><font size=3> " + Utils.escapeHtml(sys.name(tar)) + " was paralyzed by " + Utils.escapeHtml(sys.name(src)) + " <img src=Themes/Classic/status/battle_status1.png>", chan);
    });

    addCommand(0, "poison", function (src, command, commandData, tar, chan) {
        if (!tar) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status5.png><b><font color=Purple><font size=3> " + Utils.escapeHtml(sys.name(tar)) + " was poisoned by " + Utils.escapeHtml(sys.name(src)) + " <img src=Themes/Classic/status/battle_status5.png>", chan);
    });

    addCommand(0, "cure", function (src, command, commandData, tar, chan) {
        if (!tar) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status2.png><b><font color=Black><font size=3> " + Utils.escapeHtml(sys.name(tar)) + " was put to sleep and cured of all status problems by " + Utils.escapeHtml(sys.name(src)) + " <img src=Themes/Classic/status/battle_status2.png>", chan);
    });

    addCommand(0, "league", function (src, command, commandData, tar, chan) {
        var LeagueTemplate = new CommandList("<font color=red>League</font>", "navy", "");
        LeagueTemplate.template += "<h2><font color=green>~~Gyms~~</font></h2><ol>";

        LeagueTemplate.add(League.Gym1 || "Open");
        LeagueTemplate.add(League.Gym2 || "Open");
        LeagueTemplate.add(League.Gym3 || "Open");
        LeagueTemplate.add(League.Gym4 || "Open");
        LeagueTemplate.add(League.Gym5 || "Open");
        LeagueTemplate.add(League.Gym6 || "Open");
        LeagueTemplate.add(League.Gym7 || "Open");
        LeagueTemplate.add(League.Gym8 || "Open");

        LeagueTemplate.template += "</ol><br><h2><font color=blue>**Elite 4**</font></h2><ol>";

        LeagueTemplate.add(League.Elite1 || "Open");
        LeagueTemplate.add(League.Elite2 || "Open");
        LeagueTemplate.add(League.Elite3 || "Open");
        LeagueTemplate.add(League.Elite4 || "Open");

        LeagueTemplate.template += "</ol><br><h2><font color=red>±±The Champion±±</font></h2><ul><b>" + (League.Champ || "Open") + "</b></ul>";

        LeagueTemplate.finish();
        LeagueTemplate.display(src, chan);
        sys.sendHtmlMessage(src, '<i><b><font color=blue>Type /leaguerules to see the rules of the league!</font>', chan);
    });

    addListCommand(0, "leaguerules", "LeagueRules");

    addCommand(0, ["selfkick", "ghostkick", "sk"], function (src, command, commandData, tar, chan) {
        var xlist, c;
        var ip = sys.ip(src);
        var playerIdList = sys.playerIds(),
            ghosts = 0;
        for (xlist in playerIdList) {
            c = playerIdList[xlist];
            if (ip === sys.ip(c) && sys.loggedIn(c) && c !== src) {
                sys.kick(c);
                ghosts += 1;
            }
        }

        bot.sendMessage(src, ghosts + " ghosts were kicked.", chan);
    });

    addCommand(0, "me", function (src, command, commandData, tar, chan) {
        if (!commandData) {
            bot.sendMessage(src, "You must post a message.", chan);
            return;
        }
        sys.sendHtmlAll("<font color=" + Utils.nameColor(src) + "><timestamp/><b><i>*** " + Utils.escapeHtml(sys.name(src)) + " " + Utils.escapeHtml(commandData) + " ***</font></b></i>", chan);
    });

    addListCommand(0, "rules", "Rules");
    addListCommand(0, "emotes", "EmoteList");

    addCommand(0, "scriptinfo", function (src, command, commandData, tar, chan) {
        sys.sendHtmlMessage(src, [
            "",
            "<font color=red><timestamp/><b> ««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»</b></font>",
            "<font color=black><timestamp/><b>Meteor Falls™ v0.10 Scripts</b></font>",
            "<font color=blue><timestamp/><b>Created By:</b></font> <b><font color=navy>[VP]Blade</font>, <font color=#00aa7f>TheUnknownOne</font>, Ethan</b>",
            "<font color=skyblue><timestamp/> <b>Maintainers:</b></font> " + Config.maintainers.join(", ") + ".",
            //"<font color=green><timestamp/><b>Full Script: <a href='http://meteor-falls.github.io/Scripts/scripts.js'>http://meteor-falls.github.io/Scripts/scripts.js</a></b></font>",
            //"<font color=darkorange><timestamp/><b>Auto-Update Script:</font> <b><a href='http://meteor-falls.github.io/Scripts/webcall.js'>http://meteor-falls.github.io/Scripts/webcall.js</a></b>",
            "<font color=navy><timestamp/><b>Special Thanks To:</b></font> <b><font color=#8A2BE2>Lutra,</font> <font color=navy>Max</b></font>",
            "<font color=black><timestamp/><b> © <a href='http://meteorfalls.us/forums/'>Meteor Falls</a> 2014 [MIT license] </b></font>",
            "<font color=red><timestamp/><b> ««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»</b></font><br>"
        ].join("<br>"), chan);
    });

    addCommand(0, ["calc", "calculate", "calculator"], function (src, command, commandData, tar, chan) {
        if (typeof mathjs === 'undefined') {
            require.reload('mathjs.js');
        }

        var res;
        try {
            res = mathjs.eval(commandData);

            bot.sendMessage(src, Utils.escapeHtml("The result of '" + commandData + "' is:"), chan);
            bot.sendMessage(src, Utils.escapeHtml(res.toString()), chan);
        } catch (ex) {
            bot.sendMessage(src, "Error in parsing your expression (" + Utils.escapeHtml(commandData) + ").", chan);
            bot.sendMessage(src, ex, chan);
        }
    });

    // TODO: Move to lists.js
    addCommand(0, ["bbcode", "bbcodes"], function (src, command, commandData, tar, chan) {
        var BB = new CommandList("BB Code List", "navy", "Type in these BB Codes to use them:");
        var formatBB = function (m) {
            return m + " <b>-</b> " + Utils.format(0, m);
        };

        BB.add(formatBB("[b]Bold[/b]"));
        BB.add(formatBB("[i]Italics[/i]"));
        BB.add(formatBB("[s]Strike[/s]"));
        BB.add(formatBB("[u]Underline[/u]"));
        BB.add(formatBB("[sub]Subscript[/sub]"));
        BB.add(formatBB("[sup]Superscript[/sup]"));
        BB.add(formatBB("[code]Code[/code]"));
        BB.add(formatBB("[color=red]Any color[/color]"));
        BB.add(formatBB("[face=arial]Any font[/face] or [font=arial]Any font[/font]"));
        BB.add(formatBB("[spoiler]Spoiler[/spoiler]"));
        //BB.add(formatBB("[link]Link[/link]"));

        if (Utils.mod.hasBasicPermissions(src)) {
            BB.add(formatBB("[pre]Preformatted text[/pre]"));
            BB.add(formatBB("[size=5]Any size[/size]"));
            BB.add("[br]Skips a line");
            BB.add("[hr]Makes a long, solid line - <hr>");
            BB.add("[ping]Pings everybody");
        }

        BB.finish();
        BB.display(src, chan);
    });

    addCommand(0, ["sendto", "ping"], function (src, command, commandData, tar, chan) {
        var r = commandData.split(':');
        var mess = Utils.cut(r, 1, ':');

        tar = sys.id(r[0]);

        if (!tar) {
            bot.sendMessage(src, "Must send the message to a real person!", chan);
            return;
        }

        if (!mess) {
            bot.sendMessage(src, "Your ping was sent to " + Utils.escapeHtml(r[0]) + "!", chan);
            bot.sendMessage(tar, "<ping/>" + Utils.escapeHtml(sys.name(src)) + " has sent you a ping!", chan);
            return;
        }

        mess = Utils.escapeHtml(mess);
        if (Emotes.enabledFor(src)) {
            mess = Emotes.format(mess, Emotes.ratelimit, src);
        }

        bot.sendMessage(src, "Your message was sent!", chan);
        bot.sendMessage(tar, '<ping/>' + Utils.escapeHtml(sys.name(src)) + ' sent you a message! The message says: ' + mess);
    });

    addCommand(0, "auth", function (src, command, commandData, tar, chan) {
        var authlist = sys.dbAuths().sort(),
            auths = {};
        var dbAuth, name, len, i;

        for (i = 0, len = authlist.length; i < len; i += 1) {
            name = authlist[i];
            dbAuth = sys.dbAuth(name);
            auths[dbAuth] = auths[dbAuth] || [];
            auths[dbAuth].push(name);
        }

        function outputName(type) {
            return function (name) {
                var id = sys.id(name);
                if (id) {
                    sys.sendHtmlMessage(src, '<img src="Themes/Classic/Client/' + type + 'Available.png"> <b><font size="2">' + Utils.toCorrectCase(name) + '</font></b>', chan);
                } else {
                    sys.sendHtmlMessage(src, '<img src="Themes/Classic/Client/' + type + 'Away.png"> <b><font size="2">' + name + '</font></b>', chan);
                }
            };
        }

        sys.sendHtmlMessage(src, "<font color=navy><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br><font color=black><h2>Auth List</h2>", chan);
        sys.sendHtmlMessage(src, "<b><font color=red>**Owners**", chan);

        if (auths.hasOwnProperty('3')) {
            auths[3].forEach(outputName('O'));
        }

        sys.sendMessage(src, "", chan);
        sys.sendHtmlMessage(src, "<b><font color=blue><font size=3>**Administrators**", chan);

        if (auths.hasOwnProperty('2')) {
            auths[2].forEach(outputName('A'));
        }

        sys.sendMessage(src, "", chan);
        sys.sendHtmlMessage(src, "<b><font color=green><font size=3>**Moderators**", chan);

        if (auths.hasOwnProperty('1')) {
            auths[1].forEach(outputName('M'));
        }

        sys.sendMessage(src, "", chan);
        sys.sendHtmlMessage(src, "<font color=navy><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>", chan);
    });

    addCommand(0, "attack", function (src, command, commandData, tar, chan) {
        var randColors = ["blue", "darkblue", "green", "darkgreen", "red", "darkred", "orange", "skyblue", "purple", "violet", "black", "lightsteelblue", "navy", "burlywood", "DarkSlateGrey", "darkviolet", "Gold", "Lawngreen", "silver"];

        function randomColor(text) {
            var selectedColor = sys.rand(0, randColors.length);
            return "<font color=" + randColors[selectedColor] + ">" + text + "</font>";
        }

        if (!tar) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }

        var move = sys.rand(1, 559);
        sys.sendHtmlAll("<font color=green><timestamp/><b><i>+AttackBot:</i></b></font> <b><font color=" + Utils.nameColor(src) + ">" + Utils.escapeHtml(sys.name(src)) + " </b></font> has used <b>" + randomColor(sys.move(move)) + "</b> on <b><font color=" + Utils.nameColor(tar) + ">" + Utils.escapeHtml(sys.name(tar)) + "!</font></b>", chan);
    });

    addCommand(0, "emotetoggle", function (src, command, commandData, tar, chan) {
        if (this.myAuth < 1 && !Emotes.hasPermission(sys.name(src))) {
            bot.sendMessage(src, "You cannot use emotes.", chan);
            return;
        }

        var toggled = Emotes.enabledFor(src),
            word = (toggled ? "off" : "on");

        if (toggled) {
            delete Emotetoggles[sys.name(src).toLowerCase()];
        } else {
            Emotetoggles[sys.name(src).toLowerCase()] = true;
        }
        Reg.save("Emotetoggles", Emotetoggles);
        bot.sendMessage(src, "Emotes are now toggled " + word + ".", chan);
    });

    addCommand(0, "spin", function (src, command, commandData, tar, chan) {
        if (!rouletteon) {
            bot.sendMessage(src, "Roulette has been turned off!", chan);
            return;
        }
        var num = sys.rand(1, 279);
        var numb = sys.rand(1, 646);
        var emotes = Object.keys(Emotes.list);
        var randomEmote = emotes[Math.floor(Math.random() * emotes.length)];

        var possibilities = [];

        if (spinTypes.indexOf('pokemons') !== -1) {
            possibilities.push("<b><font color=" + Utils.nameColor(src) + ">" + Utils.escapeHtml(sys.name(src)) + "</b></font> has spun a <font color=gray><b>" + sys.rand(1, 9002) + "</b></font> and won a <b><font color=red>" + sys.nature(sys.rand(1, 25)) + "</b></font> <b><font color=blue>" + sys.pokemon(numb) + "!<img src='icon:" + numb + "'></b></font>");
        }

        if (spinTypes.indexOf('items') !== -1) {
            possibilities.push("<b><font color=" + Utils.nameColor(src) + ">" + sys.name(src) + "</b></font> has spun a <font color=gray><b>" + sys.rand(1, 9002) + "</b></font> and won <b><font color=red>" + sys.item(num) + "! <img src='item:" + num + "'></b></font>");
        }

        if (spinTypes.indexOf('emotes') !== -1) {
            possibilities.push("<b><font color=" + Utils.nameColor(src) + ">" + sys.name(src) + "</b></font> has spun a <font color=gray><b>" + sys.rand(1, 9002) + "</b></font> and won <img src='" + Emotes.list[randomEmote] + "'>!");
        }

        if ((spinTypes.indexOf('avatars') !== -1) || (spinTypes.indexOf('trainers') !== -1)) {
            possibilities.push("<b><font color=" + Utils.nameColor(src) + ">" + sys.name(src) + "</b></font> has spun a <font color=gray><b>" + sys.rand(1, 9002) + "</b></font> and won <img src='trainer:" + sys.rand(1, 301) + "'>!");
        }

        sys.sendHtmlAll("<font color=navy><timestamp/><b>±RouletteBot:</b></font> " + possibilities[sys.rand(0, possibilities.length)], chan);
    });

    addCommand(0, "rtd", function (src, command, commandData, tar, chan) {
        var effect;
        if (RTD.cooldownFor(src) > 0) {
            return bot.sendMessage(src, "You can't use RTD for another " + Utils.getTimeString(RTD.getPlayer(src).at + RTD.getPlayer(src).cooldown - +sys.time()) + ".", chan);
        }

        effect = RTD.giveEffect(src);
        rtdbot.sendAll(RTD.rollString(src, effect), 0);
        watchbot.sendAll(sys.name(src) + " rolled " + RTD.effects[effect].name + ".", watch);
    });

    addCommand(0, "megausers", function (src, command, commandData, tar, chan) {
        var keys = Object.keys(MegaUsers),
            list;

        if (keys.length === 0) {
            bot.sendMessage(src, "There are no megausers.", chan);
            return;
        }

        list = new TableList("Megausers", "cornflowerblue", 2, 5, "navy");
        list.addEvery(keys, false, 10);
        list.finish();
        list.display(src, chan);
    });

    addCommand(0, "floodignorelist", function (src, command, commandData, tar, chan) {
        var keys = Object.keys(FloodIgnore),
            list;

        if (keys.length === 0) {
            bot.sendMessage(src, "There are no flood ignores.", chan);
            return;
        }

        list = new TableList("Flood Ignores", "cornflowerblue", 2, 5, "navy");
        list.addEvery(keys, false, 10);
        list.finish();
        list.display(src, chan);
    });

    addCommand(0, "emotepermlist", function (src, command, commandData, tar, chan) {
        var keys = Object.keys(Emoteperms),
            list;

        if (keys.length === 0) {
            bot.sendMessage(src, "There are no emote perm users.", chan);
            return;
        }

        list = new TableList("Emote Permission", "cornflowerblue", 2, 5, "navy");
        list.addEvery(keys, false, 10);
        list.finish();
        list.display(src, chan);
    });

    addCommand(0, "players", function (src, command, commandData, tar, chan) {
        if (commandData) {
            commandData = commandData.toLowerCase();
        }

        if (["windows", "linux", "android", "mac", "webclient"].indexOf(commandData) !== -1) {
            var count = 0;
            sys.playerIds().forEach(function (id) {
                if (sys.os(id) === commandData) {
                    count += 1;
                }
            });
            bot.sendMessage(src, "There are  " + count + " " + commandData + " players online.", chan);
            return;
        }

        bot.sendMessage(src, "There are " + sys.numPlayers() + " players online.", chan);
    });

    addCommand(0, "gl", function (src, command, commandData, tar, chan) {
        if (!this.isLManager) {
            bot.sendMessage(src, "You need to be a league manager to use this command!", chan);
            return;
        }
        var parts = commandData.split(":"),
            player = parts[0],
            spot = Math.round(Number(parts[1]));
        if (isNaN(spot) || spot < 1 || spot > 8) {
            bot.sendMessage(src, "Valid range for gym leaders is 1-8.", chan);
            return;
        }

        if (!player) {
            bot.sendAll("The gym leader " + spot + " spot has been voided.", 0);
            League["Gym" + spot] = "";
            Reg.save("League", League);
            return;
        }

        bot.sendAll(player + " has been made gym leader " + spot + "!", 0);
        League["Gym" + spot] = player;
        Reg.save("League", League);
    });

    addCommand(0, "el", function (src, command, commandData, tar, chan) {
        if (!this.isLManager) {
            bot.sendMessage(src, "You need to be a league manager to use this command!", chan);
            return;
        }
        var parts = commandData.split(":"),
            player = parts[0],
            spot = Math.round(Number(parts[1]));
        if (isNaN(spot) || spot < 1 || spot > 4) {
            bot.sendMessage(src, "Valid range for the elite is 1-4.", chan);
            return;
        }

        if (!player) {
            bot.sendAll("The elite " + spot + " spot has been voided.", 0);
            League["Elite" + spot] = "";
            Reg.save("League", League);
            return;
        }
        bot.sendAll(player + " has been made elite " + spot + "!", 0);
        League["Elite" + spot] = player;
        Reg.save("League", League);
    });

    addCommand(0, "champ", function (src, command, commandData, tar, chan) {
        if (!this.isLManager) {
            bot.sendMessage(src, "You need to be a league manager to use this command!", chan);
            return;
        }
        if (!commandData) {
            bot.sendAll("The champion spot has been voided.", 0);
            League.Champ = "";
            Reg.save("League", League);
            return;
        }
        bot.sendAll(commandData + " has been made the champion!", 0);
        League.Champ = commandData;
        Reg.save("League", League);
    });

    /** CHANNEL COMMANDS **/
    addCommand(0, "cauth", function (src, command, commandData, tar, chan) {
        var poChan = SESSION.channels(chan);
        if (Object.keys(poChan.auth).length === 0) {
            return bot.sendMessage(src, "There are no channel auth right now.", chan);
        }

        var auths = [],
            i;

        for (i in poChan.auth) {
            auths.push(i);
        }

        function sortByLevel(level) {
            return function (name) {
                return poChan.auth[name] === level;
            };
        }

        bot.sendMessage(src, "Channel auth for " + sys.channel(chan) + ":", chan);
        bot.sendMessage(src, "Channel owners: " + Utils.beautifyNames(auths.filter(sortByLevel(3))), chan);
        bot.sendMessage(src, "Channel admins: " + Utils.beautifyNames(auths.filter(sortByLevel(2))), chan);
        bot.sendMessage(src, "Channel mods: " + Utils.beautifyNames(auths.filter(sortByLevel(1))), chan);
    });

    addCommand(0, "topic", function (src, command, commandData, tar, chan) {
        var poChan = SESSION.channels(chan);
        if (!poChan.topic) {
            return bot.sendMessage(src, "There is no topic right now.", chan);
        }

        topicbot.sendMessage(src, poChan.topic, chan);
        if (poChan.setBy) {
            setbybot.sendMessage(src, poChan.setBy, chan);
        }
    });

    addChannelModCommand("topicsource", function (src, command, commandData, tar, chan) {
        var poChan = SESSION.channels(chan);
        if (!poChan.topic) {
            return bot.sendMessage(src, "There is no topic right now.", chan);
        }

        topicbot.sendMessage(src, Utils.escapeHtml(poChan.topic), chan);
        if (poChan.setBy) {
            setbybot.sendMessage(src, poChan.setBy, chan);
        }
    });

    addChannelModCommand("changetopic", function (src, command, commandData, tar, chan) {
        var poChan = SESSION.channels(chan);
        if (!commandData) {
            if (!poChan.topic) {
                return bot.sendMessage(src, "There is no topic, no point in resetting it!", chan);
            }

            poChan.topic = '';
            poChan.setBy = '';
            ChannelManager
                .sync(poChan, 'topic')
                .sync(poChan, 'setBy')
                .save();
            bot.sendAll(Utils.beautifyName(src) + " has reset the channel topic!", chan);
        } else {
            poChan.topic = commandData;
            poChan.setBy = SESSION.users(src).originalName;
            ChannelManager
                .sync(poChan, 'topic')
                .sync(poChan, 'setBy')
                .save();
            bot.sendAll(Utils.beautifyName(src) + " has set the channel topic to:", chan);
            bot.sendAll(commandData, chan);
        }
    });

    addChannelModCommand("channelkick", function (src, command, commandData, tar, chan) {
        if (!tar) {
            bot.sendMessage(src, "This person either does not exist or isn't logged on.", chan);
            return;
        }

        if ((Utils.channel.channelAuth(src, chan) <= Utils.channel.channelAuth(tar, chan)) && (Utils.getAuth(src) <= Utils.getAuth(tar))) {
            bot.sendMessage(src, "This person cannot be kicked because they have either higher or equal channel auth.", chan);
            return;
        }

        bot.sendAll(Utils.beautifyName(src) + " kicked " + Utils.beautifyName(tar) + " from " + sys.channel(chan) + "!", chan);
        sys.kick(tar, chan);
    });

    addChannelOwnerCommand("cchangeauth", function (src, command, commandData, tar, chan) {
        var poChan = SESSION.channels(chan),
            parts = commandData.split(':'),
            name = parts[0],
            auth = parseInt(parts[1], 10);

        if (!sys.dbIp(name)) {
            return bot.sendMessage(src, "This person does not exist.", chan);
        }

        if (isNaN(auth)) {
            return bot.sendMessage(src, "That doesn't look like a valid number.", chan);
        }

        if (auth < 0 || auth > 3) {
            return bot.sendMessage(src, "The auth level should be 0 or higher, but not any higher than 3.", chan);
        }

        if (!sys.dbRegistered(name)) {
            bot.sendMessage(src, "This person is not registered and will not receive auth until they register.", chan);
            if (sys.id(name)) {
                bot.sendMessage(sys.id(name), "Please register so you can receive auth.");
            }
            return;
        }

        if (auth === 0) {
            delete poChan.auth[name.toLowerCase()];
        } else {
            poChan.auth[name.toLowerCase()] = auth;
        }
        ChannelManager.sync(poChan, 'auth').save();
        bot.sendAll(Utils.beautifyName(src) + " changed the channel auth level of " + Utils.beautifyName(name) + " to " + auth + ".", chan);
    });

    /** MEGAUSER COMMANDS **/
    addCommand(0, "message", function (src, command, commandData, tar, chan) {
        if (!commandData) {
            bot.sendMessage(src, "Specify kick, ban, or welcome!", chan);
            return;
        }

        commandData = commandData.split(":");
        if (!commandData[1]) {
            bot.sendMessage(src, "Usage of this command is: [kick/mute/ban/welcome]:[message]", chan);
            return;
        }
        var which = commandData[0];
        var message = Utils.cut(commandData, 1, ":");
        var whichl = which.toLowerCase();
        var srcname = sys.name(src).toLowerCase();

        if (whichl === "kick") {
            bot.sendMessage(src, "Set kick message to: " + Utils.escapeHtml(message) + "!", chan);
            Kickmsgs[srcname] = {
                "message": message
            };
            Reg.save("Kickmsgs", Kickmsgs);
        } else if (whichl === "mute") {
            if (message.toLowerCase().indexOf('{duration}') === -1) {
                bot.sendMessage(src, "Your mute message needs to contain the mute duration, use {Duration}.", chan);
                return;
            }

            bot.sendMessage(src, "Set mute message to: " + Utils.escapeHtml(message) + "!", chan);
            Mutemsgs[srcname] = {
                "message": message
            };
            Reg.save("Mutemsgs", Mutemsgs);
        } else if (whichl === "welcome") {
            bot.sendMessage(src, "Set welcome message to: " + Utils.escapeHtml(message) + "!", chan);
            Welmsgs[srcname] = {
                "message": message
            };
            Reg.save("Welmsgs", Welmsgs);
        } else if (whichl === "ban") {
            if (this.myAuth < 2) {
                bot.sendMessage(src, "You need to be a higher auth to set your ban message!", chan);
                return;
            }
            bot.sendMessage(src, "Set ban message to: " + Utils.escapeHtml(message) + "!", chan);
            Banmsgs[srcname] = {
                "message": message
            };
            Reg.save("Banmsgs", Banmsgs);
        } else {
            bot.sendMessage(src, "Specify kick, ban, or welcome!", chan);
        }
    }, addCommand.flags.MEGAUSERS);

    addCommand(1, "viewmessage", function (src, command, commandData, tar, chan) {
        var srcname = sys.name(src).toLowerCase();
        if (!commandData) {
            bot.sendMessage(src, "Specify kick, ban, or welcome!", chan);
            return;
        }

        commandData = commandData.toLowerCase();
        if (commandData === "kick") {
            if (!Kickmsgs[srcname]) {
                bot.sendMessage(src, "You currently do not have a kick message, please go make one!", chan);
                return;
            }
            bot.sendMessage(src, "Your kick message is set to: " + Utils.escapeHtml(Kickmsgs[srcname].message), chan);
        } else if (commandData === "mute") {
            if (!Mutemsgs[srcname]) {
                bot.sendMessage(src, "You currently do not have a mute message, please go make one!", chan);
                return;
            }
            bot.sendMessage(src, "Your mute message is set to: " + Utils.escapeHtml(Mutemsgs[srcname].message), chan);
        } else if (commandData === "welcome") {
            if (!Welmsgs[srcname]) {
                bot.sendMessage(src, "You currently do not have a welcome message, please go make one!", chan);
                return;
            }
            bot.sendMessage(src, "Your welcome message is set to: " + Utils.escapeHtml(Welmsgs[srcname].message), chan);
        } else if (commandData === "ban") {
            if (this.myAuth < 2 || !Banmsgs[srcname]) {
                bot.sendMessage(src, "You either cannot have a ban message or you do not have one, go make one if you can!", chan);
                return;
            }
            bot.sendMessage(src, "Your ban message is set to: " + Utils.escapeHtml(Banmsgs[srcname].message), chan);
        } else {
            bot.sendMessage(src, "Specify kick, ban, or welcome!", chan);
        }
    }, addCommand.flags.MEGAUSERS);

    addCommand(0, "removemessage", function (src, command, commandData, tar, chan) {
        var lower = commandData.toLowerCase(),
            srcname = sys.name(src).toLowerCase();

        if (lower === "kick") {
            if (!Kickmsgs[srcname]) {
                bot.sendMessage(src, "You don't have a kick message!", chan);
                return;
            }
            delete Kickmsgs[srcname];
            Reg.save("Kickmsgs", Kickmsgs);
            bot.sendMessage(src, "Kick message removed!", chan);
        } else if (lower === "mute") {
            if (!Mutemsgs[srcname]) {
                bot.sendMessage(src, "You don't have a mute message!", chan);
                return;
            }
            delete Mutemsgs[srcname];
            Reg.save("Mutemsgs", Mutemsgs);
            bot.sendMessage(src, "Mute message removed!", chan);
        } else if (lower === "ban") {
            if (!Banmsgs[srcname]) {
                bot.sendMessage(src, "You don't have a ban message!", chan);
                return;
            }
            delete Banmsgs[srcname];
            Reg.save("Banmsgs", Banmsgs);
            bot.sendMessage(src, "Ban message removed!", chan);
        } else if (lower === "welcome") {
            if (!Welmsgs[srcname]) {
                bot.sendMessage(src, "You don't have a welcome message!", chan);
                return;
            }
            delete Welmsgs[srcname];
            Reg.save("Welmsgs", Welmsgs);
            bot.sendMessage(src, "Welcome message removed!", chan);
        } else {
            bot.sendMessage(src, "Specify a message (kick/ban/welcome)!", chan);
        }
    }, addCommand.flags.MEGAUSERS);

    /** MOD COMMANDS */
    addListCommand(1, "modcommands", "Mod");
    addCommand(1, "emoteperms", function (src, command, commandData, tar, chan) {
        if (!sys.dbIp(commandData)) {
            bot.sendMessage(src, "That person does not exist.", chan);
            return;
        }

        var playerName = Utils.toCorrectCase(commandData), beautifulName = Utils.beautifyName(playerName);
        var added = Utils.regToggle(Emoteperms, playerName, "Emoteperms", function () {
            if (!sys.dbRegistered(playerName)) {
                bot.sendMessage(src, "This person is not registered and will not receive permission to use emotes until they register.", chan);
                if (tar) {
                    bot.sendMessage(tar, "Please register so you can receive permission to use emotes.");
                }
                return;
            }

            return true;
        });

        // Do not simplify this.
        if (added === true) {
            bot.sendAll(Utils.beautifyName(src) + " granted " + beautifulName + " permission to use emotes!", 0);
            Utils.watch.notify(Utils.nameIp(src) + " granted " + beautifulName + " permission to use emotes.");
        } else if (added === false) {
            bot.sendAll(Utils.beautifyName(src) + " revoked " + beautifulName + "'s permission to use emotes!", 0);
            Utils.watch.notify(Utils.nameIp(src) + " revoked " + beautifulName + "'s permission to use emotes.");
        }
    });

    addCommand(1, "motd", function (src, command, commandData, tar, chan) {
        if (!commandData) {
            bot.sendMessage(src, "Specify a message!", chan);
            return;
        }

        var name = sys.name(src);
        Utils.watch.notify("Old MOTD: " + Utils.escapeHtml(Reg.get("MOTD")));
        Reg.save("MOTD", commandData);
        bot.sendAll("The MOTD has been changed by " + name + " to:", 0);
        sys.sendHtmlAll(commandData, 0);
    });

    addCommand(1, "getmotd", function (src, command, commandData, tar, chan) {
        bot.sendMessage(src, "The MOTD is: " + Utils.escapeHtml(Reg.get("MOTD")), chan);
    });

    addCommand(1, ["wall", "cwall"], function (src, command, commandData, tar, chan) {
        var wallchan = (command === "cwall" ? chan : undefined);
        if (!commandData) {
            bot.sendMessage(src, "Please post a message.", chan);
            return;
        }

        var wallmessage = Utils.format(src, commandData);
        //var wallmessage = Utils.escapeHtml(commandData);

        if (Emotes.enabledFor(src)) {
            wallmessage = Emotes.format(wallmessage, Emotes.ratelimit, src);
        }

        sys.sendHtmlAll("<br><font color=navy><font size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br>", wallchan);
        sys.sendHtmlAll("<font color=" + Utils.nameColor(src) + "><timestamp/>+<b><i>" + Utils.escapeHtml(sys.name(src)) + ":</i></b></font> " + wallmessage + "<br>", wallchan);
        sys.sendHtmlAll("<font color=navy><font size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br>", wallchan);
    });

    addCommand(1, "sendhtmlall", function (src, command, commandData, tar, chan) {
        if (!commandData) {
            bot.sendMessage(src, "Sorry, invalid message.", chan);
            return;
        }
        sys.sendHtmlAll(commandData, chan);
    });

    addCommand(1, "sendall", function (src, command, commandData, tar, chan) {
        if (!commandData) {
            bot.sendMessage(src, "Sorry, invalid message.", chan);
            return;
        }
        sys.sendAll(commandData, chan);
    });

    addCommand(1, "floodignore", function (src, command, commandData, tar, chan) {
        if (!sys.dbIp(commandData)) {
            bot.sendMessage(src, "Specify a real person!", chan);
            return;
        }

        var playerName = commandData.toLowerCase();
        if (FloodIgnore.hasOwnProperty(playerName)) {
            bot.sendMessage(src, commandData + " was removed from the flood ignore list!", chan);
            delete FloodIgnore[playerName];
        } else {
            if (!sys.dbRegistered(commandData)) {
                bot.sendMessage(src, "This person is not registered and will not receive flood ignore until they register.", chan);
                bot.sendMessage(tar, "Please register so you can receive flood ignore.");
                return;
            }
            bot.sendMessage(src, commandData + " was added to the flood ignore list!", chan);
            FloodIgnore[playerName] = true;
        }

        Reg.save("FloodIgnore", FloodIgnore);
    });

    addCommand(1, ["mutes", "mutelist"], function (src, command, commandData, tar, chan) {
        var keys = Object.keys(Mutes),
            timeNow = +sys.time(),
            list,
            now,
            key;

        if (keys.length === 0) {
            bot.sendMessage(src, "There are no mutes.", chan);
            return;
        }

        list = new TableList("Mutes", "cornflowerblue", 2, 5, "navy");
        list.add(["IP", "Muted Name", "By", "Length", "Reason"], true);

        for (key in Mutes) {
            now = Mutes[key];
            var mutedname = now.mutedname,
                by = now.by,
                time = now.time,
                timeString = (time === 0 ? "forever" : "for " + Utils.getTimeString(time - timeNow)),
                reason = now.reason;

            list.add([key, mutedname, by, timeString, reason], false);
        }

        list.finish();
        list.display(src, chan);
    });

    addCommand(1, ["rangebans", "rangebanlist"], function (src, command, commandData, tar, chan) {
        var keys = Object.keys(Rangebans),
            timeNow = +sys.time(),
            list,
            now,
            key;

        if (keys.length === 0) {
            bot.sendMessage(src, "There are no rangebans.", chan);
            return;
        }

        list = new TableList("Rangebans", "cornflowerblue", 2, 5, "navy");
        list.add(["IP", "By", "Reason"], true);

        for (key in Rangebans) {
            now = Rangebans[key];
            list.add([key, now.by, now.reason], false);
        }

        list.finish();
        list.display(src, chan);
    });

    addCommand(1, ["bans", "banlist"], function (src, command, commandData, tar, chan) {
        var keys = sys.banList(),
            len,
            i,
            list;

        if (keys.length === 0) {
            bot.sendMessage(src, "There are no bans.", chan);
            return;
        }

        list = new TableList("Bans", "cornflowerblue", 2, 5, "navy");
        list.add(["IP", "Aliases"], true);

        for (i = 0, len = keys.length; i < len; i += 1) {
            list.add([keys[i], sys.aliases(keys[i])], false);
        }

        list.finish();
        list.display(src, chan);
    });

    addCommand(1, ["ynpoll", "poll"], function (src, command, commandData, tar, chan) {
        if (Poll.active) {
            return bot.sendMessage(src, "There is already a poll. Close it with /closepoll.", chan);
        }

        var parts = commandData.split(':');
        var subject = parts[0];
        var options = Utils.cut(parts, 1, ':').split('*');

        if (command === "ynpoll") {
            subject = commandData;
            options = ["Yes", "No"];
        }

        if (!subject) {
            return bot.sendMessage(src, "You need to give a subject!", chan);
        }

        if (!options || options.length < 2) {
            return bot.sendMessage(src, "You need at least 2 options.", chan);
        }

        var self = sys.name(src), len, i;
        Poll.active = true;
        Poll.subject = subject;
        Poll.by = self;
        Poll.options = options;

        sys.sendHtmlAll(border + "<br>", 0);
        bot.sendAll(self + " started a poll!<ping/>", 0);
        bot.sendAll(subject, 0);
        bot.sendAll("Options:", 0);

        var html = [];
        for (i = 0, len = options.length; i < len; i += 1) {
            html.push("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>" + (i + 1) + "</b>. " + options[i]);
        }
        sys.sendHtmlAll(html.join("<br>"), 0);

        sys.sendAll("", 0);
        bot.sendAll("Vote with /vote [option number]!", 0);
        sys.sendHtmlAll("<br>" + border, 0);
    });

    addCommand(1, "closepoll", function (src, command, commandData, tar, chan) {
        if (!Poll.active) {
            return bot.sendMessage(src, "There isn't a poll. Start one with /poll [subject]:[option1]*[option..].", chan);
        }

        var self = sys.name(src);

        sys.sendHtmlAll(border + "<br>", 0);
        bot.sendAll(self + " closed the poll (started by " + Poll.by + ")!", 0);

        if (Object.keys(Poll.votes).length !== 0) {
            var results = {},
                msgs = {},
                winner = [],
                most = 0,
                choice, total,
                i;

            for (i in Poll.votes) {
                choice = Poll.votes[i];
                if (!(choice in results)) {
                    results[choice] = 1;
                } else {
                    results[choice] += 1;
                }

                if (results[choice] >= most) {
                    if (results[choice] > most) {
                        winner = [];
                    }

                    winner.push(choice);
                    most = results[choice];
                }
            }

            for (i in results) {
                msgs[i] = "Option #" + (parseInt(i, 10) + 1) + " (" + Poll.options[i] + "): " + (results[i] > 9000 ? 'OVER 9000' : results[i]) + " vote" + (results[i] === 1 ? '' : 's');
            }

            bot.sendAll("'" + Poll.subject + "' - Results:", 0);

            for (i = 0, total = Poll.options.length; i < total; i += 1) {
                if (msgs[i]) {
                    bot.sendAll(msgs[i], 0);
                }
            }

            sys.sendAll("", 0);
            if (winner.length === 1) {
                winner = winner[0];
                bot.sendAll("Winner: Option #" + (winner + 1) + " (" + Poll.options[winner] + ") with " + results[winner] + " vote" + (results.winner === 1 ? '' : 's') + ".", 0);
            } else {
                bot.sendAll("Tie between option " + Utils.fancyJoin(winner.map(function (id) {
                    return "#" + id + " (" + Poll.options[winner[id]] + ")";
                })) + "  with " + results[winner[0]] + " vote" + (results.winner.length === 1 ? '' : 's') + " each.", 0);
            }
        }

        sys.sendHtmlAll("<br>" + border, 0);

        Poll.active = false;
        Poll.subject = '';
        Poll.by = '';
        Poll.options = [];
        Poll.votes = {};
    });

    addCommand(1, "info", function (src, command, commandData, tar, chan) {
        var tarip = sys.dbIp(commandData);
        if (!tarip) {
            return bot.sendMessage(src, "<b>" + Utils.escapeHtml(commandData) + "</b> has never been on the server.", chan);
        }

        var tarauth = sys.dbAuth(commandData),
            aliases = sys.aliases(tarip),
            regstr = sys.dbRegistered(commandData) ? "Registered" : "Not Registered",
            loggedIn = sys.loggedIn(tar),
            logstr = loggedIn ? "Online" : "Offline",
            cookie = tar ? (sys.cookie(tar) || '') : '',
            chans;

        var colors = ["#27619b", "#a18f77"],
            pos = 0;
        function color() {
            var c;

            c = colors[pos];
            pos += 1;
            if (pos >= colors.length) {
                pos = 0;
            }
            return c;
        }
        function header(name, msg) {
            sys.sendHtmlMessage(src, "<font color=" + color() + "><timestamp/><b>" + name + ":</b></font> " + msg, chan);
        }

        sys.sendMessage(src, "", chan);
        sys.sendHtmlMessage(src, "<timestamp/> Player " + Utils.beautifyName(commandData) + " (<b>" + logstr + "</b>; <b>" + regstr + "</b>):", chan);

        if (loggedIn) {
            header("OS", sys.os(tar));
        }

        header("Auth", tarauth);
        header("Aliases [" + aliases.length + "]", aliases.map(function (name) {
            return "<small>" + name + "</small>";
        }).join(", "));

        if (loggedIn) {
            chans = sys.channelsOfPlayer(tar).map(function (chan) {
                return sys.channel(chan);
            });

            header("Inside Channels [" + chans.length + "]", chans.join(", "));
            header("Logged in", Utils.getTimeString(+sys.time() - SESSION.users(tar).loginTime) + " ago");
            if (cookie) {
                header("Cookie", cookie);
            }
        } else {
            header("Last Online", sys.dbLastOn(commandData));
        }

        sys.sendMessage(src, "", chan);
    });

    addCommand(1, "logwarn", function (src, command, commandData, tar, chan) {
        if (!tar) {
            return bot.sendMessage(src, "This person doesn't exist.", chan);
        }
        if (Utils.getAuth(tar) > 0) {
            return bot.sendMessage(src, "<img src='" + Emotes.code("musso3") + "'>", chan);
        }

        script.beforeChatMessage(src, "@" + commandData + ": If you have a log over (or at) 5 lines, please use http://pastebin.com to show the log. Otherwise, you might be kicked by the Flood Bot, or muted by a Moderator/or you may be temporarily banned. This is your last warning.", chan);
    });

    addCommand(1, "tellemotes", function (src, command, commandData, tar, chan) {
        if (!tar) {
            return bot.sendMessage(src, "This person doesn't exist.", chan);
        }
        if (Utils.getAuth(tar) > 0) {
            return bot.sendMessage(src, "<img src='" + Emotes.code("musso3") + "'>", chan);
        }

        script.beforeChatMessage(src, "Hey, " + commandData + ", the thing you are confused about is an emote. An emote is basically an emoticon but with a picture put in. Since we tend to enjoy emotes you might see one of us using the emote alot or the chat may be filled with emotes. We are sorry if we use any that is weird and creeps you out. To be able to use emotes you need seniority. To get 'seniority' you need to participate in the chat and our forums! The link to the forums is in the banner above, be sure to check it out. Good day!", chan);
    });

    addCommand(1, "tellandroid", function (src, command, commandData, tar, chan) {
        if (!tar) {
            return bot.sendMessage(src, "This person doesn't exist.", chan);
        }
        if (Utils.getAuth(tar) > 0 || sys.os(tar) !== "android") {
            return bot.sendMessage(src, "<img src='" + Emotes.code("musso3") + "'>", chan);
        }

        script.beforeChatMessage(src, "Hello,  " + sys.name(tar) + ", I can tell you're in a need of help on how to use the android app for this game, so I shall try to help. Go to this link [ http://pokemon-online.eu/threads/pokemon-online-android-guide.22444 ] by clicking/tapping and this shall direct you to a thread on the Pokemon Online forums that can help you with your problem. This thread is filled with screenshots and short descriptions on how to do some tasks on the app. Please be sure to check it out. Also, if you're still unable to figure it out, I say for you to try out this game on a computer because it's way more easier to use. I hope this helped!", chan);
    });

    addCommand(1, "silence", function (src, command, commandData, tar, chan) {
        if (muteall) {
            sys.sendHtmlAll("<font color=green><timestamp/><b>" + Utils.escapeHtml(sys.name(src)) + " ended the silence!</b></font>");
        } else {
            sys.sendHtmlAll("<font color=blue><timestamp/><b>" + Utils.escapeHtml(sys.name(src)) + " silenced the chat!</b></font>");
        }

        muteall = !muteall;
    });

    addCommand(1, ["kick", "k", "skick"], function (src, command, commandData, tar, chan) {
        if (!commandData) {
            bot.sendMessage(src, "You can't kick nothing!", chan);
            return;
        }

        var t = commandData.split(':'),
            tars = (t[0].split("*")),
            reason = t[1] || false,
            toKick = [],
            len = tars.length,
            i;

        for (i = 0; i < len; i += 1) {
            tar = sys.id(tars[i]);

            if (tar === undefined) {
                bot.sendMessage(src, tars[i] + " doesn't exist.", chan);
                continue;
            }

            if (this.myAuth <= Utils.getAuth(tar) && this.myAuth < 3) {
                bot.sendMessage(src, "Can't kick " + tars[i] + ", as they have higher or equal auth.", chan);
                continue;
            }

            toKick.push(sys.name(tar));
        }

        if (!toKick.length) {
            if (tars.length !== 1) {
                bot.sendMessage(src, "No one to kick.", chan);
            }
            return;
        }

        var theirmessage = Kickmsgs[Utils.realName(src).toLowerCase()];
        var tarNames = Utils.fancyJoin(Utils.beautifyNames(toKick));
        var msg = Bot.kick.markup(tarNames + " " + (toKick.length === 1 ? "was" : "were") + " kicked by " + Utils.beautifyName(src) + "!");

        if (theirmessage) {
            msg = Emotes.interpolate(src, theirmessage.message, {
                "{Target}": tarNames,
                "{Color}": Utils.nameColor(src),
                "{TColor}": Utils.nameColor(sys.id(toKick[0]))
            }, Emotes.always, false, false);
        }

        if (command !== "skick") {
            sys.sendHtmlAll(msg, 0);
            if (reason) {
                Bot.reason.sendAll(Emotes.format(reason), 0);
            }
        } else {
            bot.sendMessage(src, "You silently kicked " + tarNames + ".", chan);
        }

        Utils.watch.notify(Utils.nameIp(src) + " kicked " + tarNames + ".");

        for (i = 0, len = toKick.length; i < len; i += 1) {
            Utils.mod.kick(sys.id(toKick[i]));
        }
    });

    addCommand(1, "public", function (src, command, commandData, tar, chan) {
        if (!sys.isServerPrivate()) {
            sys.sendMessage(src, "~~Server~~: The server is already public.");
            return;
        }
        sys.sendAll('~~Server~~: The server was made public by ' + sys.name(src) + '.');
        sys.makeServerPublic(true);
    }, addCommand.flags.MAINTAINERS);

    addCommand(1, "regfix", function (src, command, commandData, tar, chan) {
        sys.makeServerPublic(false);
        sys.makeServerPublic(true);
        sys.sendAll('~~Server~~: ' + sys.name(src) + ' made the server re-connect to the registry!');
    }, addCommand.flags.MAINTAINERS);

    addCommand(1, ["tempban", "tb"], function (src, command, commandData, tar, chan) {
        var t = commandData.split(':'),
            bantime = parseInt(t[1], 10) || 0,
            timeunit = t[2] || "m",
            reason = t[3] || "No reason",
            time,
            timestr;

        tar = sys.id(t[0]);
        var tarip = (tar !== undefined) ? sys.ip(tar) : sys.dbIp(t[0]);
        if (!tarip) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }

        if (Utils.mod.tempBanTime(tarip)) {
            bot.sendMessage(src, "This person is already (temp)banned.", chan);
            return;
        }

        if (Utils.getAuth(t[0]) >= this.myAuth) {
            bot.sendMessage(src, "You dont have sufficient auth to tempban " + t[0] + ".", chan);
            return;
        }
        if (isNaN(bantime)) {
            bot.sendMessage(src, "Please specify a time.", chan);
            return;
        }

        if (timeunit[0] === "s") {
            timeunit = "m";
        }

        if (bantime === 0) {
            time = 30;
            timestr = "30 minutes";
        } else {
            time = Utils.stringToTime(timeunit, bantime);
            timestr = Utils.getTimeString(time);
        }

        if (time > 86400 /* seconds */ && this.myAuth === 1) {
            bot.sendMessage(src, "You can only ban for a maximum of 1 day.", chan);
            return;
        }

        sys.sendHtmlAll("<font color=red><timestamp/><b> " + t[0] + " has been tempbanned by " + Utils.escapeHtml(sys.name(src)) + " for " + timestr + "!</font></b><br><font color=black><timestamp/><b> Reason:</b> " + Utils.escapeHtml(reason), 0);
        Utils.mod.tempBan(t[0], time / 60);
    });

    addCommand(1, "untempban", function (src, command, commandData, tar, chan) {
        var tip = sys.dbIp(commandData);
        if (!tip) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        if (Utils.mod.tempBanTime(tip) === 0) {
            bot.sendMessage(src, "This person isn't tempbanned.", chan);
            return;
        }
        sys.sendHtmlAll("<font color=blue><timestamp/><b> " + commandData + "'s tempban has been removed by " + Utils.escapeHtml(sys.name(src)) + "!</font></b>", 0);
        sys.unban(commandData);
    });

    addCommand(1, ["mute", "smute"], function (src, command, commandData, tar, chan) {
        var v = commandData.split(':'),
            reason = Utils.cut(v, 3, ":"),
            mutetime = v[1],
            timeunit = v[2],
            tarip = sys.dbIp(v[0]);

        tar = sys.id(v[0]);

        if (!tarip) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }

        Utils.mod.pruneMutes();
        if (Mutes[tarip]) {
            bot.sendMessage(src, 'This person is already muted.', chan);
            return;
        }
        if (Utils.getAuth(v[0]) >= this.myAuth) {
            bot.sendMessage(src, "You don't have sufficient auth to mute " + v[0] + ".", chan);
            return;
        }

        if (!reason) {
            bot.sendMessage(src, "A reason must be specified.", chan);
            return;
        }

        reason = Utils.escapeHtml(reason);

        var time = Utils.stringToTime(timeunit, Number(mutetime)),
            time_now = +sys.time(),
            trueTime = time + time_now,
            timeString = "for " + Utils.getTimeString(time);

        if (tar) {
            SESSION.users(tar).muted = true;
        }

        if (!mutetime || mutetime === "forever") {
            trueTime = 0;
            time = 0;
            timeString = "forever";
        }

        var muteHash = {
            "by": command === "smute" ? "Anonymous" : sys.name(src),
            "reason": reason,
            "time": trueTime,
            "mutedname": v[0]
        };

        Mutes[tarip] = muteHash;
        Reg.save("Mutes", Mutes);

        var msg = Utils.beautifyName(sys.name(src)) + " muted " + Utils.beautifyName(v[0]) + " " + timeString + "!";
        var mutemsg = Mutemsgs[sys.name(src).toLowerCase()];
        if (mutemsg) {
            msg = Emotes.interpolate(src, mutemsg.message, {
                "{Target}": v[0],
                "{Color}": Utils.nameColor(src),
                "{TColor}": Utils.nameColor(sys.id(v[0])),
                "{Duration}": timeString
            }, Emotes.always, false, false);
        }

        if (command !== "smute") {
            sys.sendHtmlAll((mutemsg ? msg : Bot.mute.markup(msg)), 0);
            if (reason) {
                Bot.reason.sendAll(Emotes.format(reason), 0);
            }
        } else {
            bot.sendMessage(src, "You silently muted " + Utils.beautifyName(v[0]) + " " + timeString + ".", chan);
        }

        Utils.watch.notify(Utils.nameIp(src) + " muted " + Utils.nameIp(v[0]) + ".");
    });

    addCommand(1, "m", function (src, command, commandData, tar, chan) {
        // Reuse code
        var parts = commandData.split(':'),
            name = parts[0],
            reason = Utils.cut(parts, 1, ':') || 'No reason.';

        commands.mute.callback.call({myAuth: this.myAuth}, src, "mute", name + ":5:minutes:" + reason, tar, chan);
    });

    addCommand(1, ["unmute", "sunmute"], function (src, command, commandData, tar, chan) {
        var ip = sys.dbIp(commandData);
        if (!ip) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        Utils.mod.pruneMutes();
        if (!Mutes[ip]) {
            bot.sendMessage(src, 'This person is not muted.', chan);
            return;
        }

        delete Mutes[ip];
        Reg.save("Mutes", Mutes);

        if (tar !== undefined) {
            SESSION.users(tar).muted = false;
        }

        if (command !== "sunmute") {
            Bot.unmute.sendAll(Utils.beautifyName(src) + " unmuted " + Utils.beautifyName(commandData) + "!", 0);
        } else {
            bot.sendMessage(src, "You silently unmuted " + Utils.beautifyName(commandData) + ".", chan);
        }

        Utils.watch.notify(Utils.nameIp(src) + " unmuted " + Utils.nameIp(commandData) + ".");
    });

    addListCommand(1, ["moderationcommands", "moderatecommands"], "Moderate");
    addListCommand(1, ["partycommands", "funmodcommands"], "Party");

    addCommand(1, "imp", function (src, command, commandData, tar, chan) {
        if (commandData.length < 3 || commandData.length > 20) {
            bot.sendMessage(src, "Your desired name is either too short or too long.", chan);
            return;
        }

        if (tar) {
            bot.sendMessage(src, "It appears as if your target does not appreciate being impersonated.", chan);
            return;
        }

        if (commandData.indexOf(':') !== -1) {
            return bot.sendMessage(src, "Invalid name.", chan);
        }

        var displayImp = Utils.escapeHtml(commandData);
        sys.sendHtmlAll('<font color=#8A2BE2><timestamp/><b>' + Utils.escapeHtml(sys.name(src)) + ' has impersonated ' + displayImp + '!</font></b>', 0);
        Utils.watch.notify(Utils.nameIp(src) + " impersonated <b style='color: " + Utils.nameColor(src) + "'>" + displayImp + "</b>.");

        sys.changeName(src, commandData);
    });

    addCommand(1, ["impoff", "unimp"], function (src, command, commandData, tar, chan) {
        if (sys.name(src) === this.originalName) {
            bot.sendMessage(src, "You aren't imping!", chan);
            return;
        }

        sys.sendHtmlAll('<font color=#8A2BE2><timestamp/><b>' + this.originalName + ' changed their name back!</font></b>', 0);
        Utils.watch.notify(Utils.nameIp(src) + " changed their name back to <b style='color: " + Utils.nameColor(src) + "'>" + this.originalName + "</b>.");
        sys.changeName(src, this.originalName);
    });

    addCommand(1, "changecolor", function(src, command, commandData, tar, chan) {
        sys.changeColor(src, commandData);
        bot.sendMessage(src, "Your color has been changed to " + commandData + ".", chan);
    });

    addCommand(1, "roulette", function (src, command, commandData, tar, chan) {
        rouletteon = !rouletteon;

        spinTypes = [];
        if (!rouletteon) {
            sys.sendHtmlAll('<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»', chan);
            sys.sendHtmlAll('<font color=black><timestamp/><b><font color=black>' + Utils.escapeHtml(sys.name(src)) + ' ended the roulette game.', chan);
            sys.sendHtmlAll('<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»', chan);
        } else {
            var dupeCheck = {};
            var types = (commandData || "").split(",").map(function (val) {
                return val.toLowerCase().trim();
            }).filter(function (val, index, array) {
                var pass = (val === "pokemons" || val === "items" || val === "emotes" || val === "trainers" || val === "avatars") && !dupeCheck.hasOwnProperty(val);
                if (pass) {
                    dupeCheck[val] = true;
                }

                return pass;
            });

            if ((types.indexOf('trainers') !== -1) && (types.indexOf('avatars') !== -1)) {
                types.splice(types.indexOf('trainers'), 1);
            }

            if (types.length !== 0) {
                spinTypes = types;
            } else {
                spinTypes = ['pokemons', 'items', 'emotes', 'avatars'];
            }

            sys.sendHtmlAll('<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»', chan);
            sys.sendHtmlAll('<font color=red><timestamp/><b>A roulette game was started by <font color=black>' + Utils.escapeHtml(sys.name(src)) + '!', chan);
            sys.sendHtmlAll('<font color=orange><timestamp/><b>Type(s):</b></font> ' + spinTypes.join(", "), chan);
            sys.sendHtmlAll('<font color=green><timestamp/><b>Type /spin to play!', chan);
            sys.sendHtmlAll('<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»', chan);
        }
    });

    addCommand(1, ["spacemode", "capsmode", "reversemode", "lolmode", "scramblemode", "colormode", "marxmode", "georgemode", "comicmode", "pewpewpew"], function (src, command, commandData, tar, chan) {
        var word = (global[command] = !(global[command])) ? "on" : "off";
        var name = command.indexOf("mode") > -1 ? command.split("mode")[0] : command;
        name = name.substr(0, 1).toUpperCase() + name.substr(1);

        bot.sendAll(name + " Mode was turned " + word + "!", 0);
    });

    addCommand(1, "nightclub", function (src, command, commandData, tar, chan) {
        nightclub = !nightclub;
        if (nightclub) {
            sys.sendHtmlAll("<br/>" + Utils.nightclub.format("Let the Night Club commence!"), chan);
        } else {
            sys.sendHtmlAll(Utils.nightclub.format("Kay, Night Club times are over...") + "<br/>", chan);
        }
    });

    addCommand(1, "onos", function (src, command, commandData, tar, chan) {
        commandData = commandData.toLowerCase();
        if (["windows", "linux", "android", "mac", "webclient"].indexOf(commandData) !== -1) {
            var output = sys.playerIds().filter(function (id) {
                return sys.os(id) === commandData;
            }).map(sys.name);
            bot.sendMessage(src, "Players on OS " + commandData + " are: " + output.join(", "), chan);
            return;
        }
        bot.sendMessage(src, commandData + " is not a valid OS.", chan);
    });

    addCommand(1, "disable", function (src, command, commandData, tar, chan) {
        if (commandData === undefined) {
            bot.sendMessage(src, "You must disable something!", chan);
            return;
        }
        var cmdToLower = commandData.toLowerCase().trim(), authLevel;
        if (!commands.hasOwnProperty(cmdToLower)) {
            bot.sendMessage(src, "The command " + commandData + " doesn't exist!", chan);
            return;
        }
        if (disabledCmds.indexOf(cmdToLower) > -1) {
            bot.sendMessage(src, "The command " + commandData + " is already disabled!", chan);
            return;
        }
        authLevel = commands[cmdToLower].authLevel;
        if (typeof authLevel !== 'number' || authLevel !== 0) {
            bot.sendMessage(src, "Sorry, you may not disable the " + commandData + " command.", chan);
            return;
        }
        disabledCmds.push(cmdToLower);
        bot.sendAll(sys.name(src) + " disabled /" + cmdToLower + "!");
    });

    addCommand(1, "enable", function (src, command, commandData, tar, chan) {
        if (commandData === undefined) {
            bot.sendMessage(src, "You must enable something!", chan);
            return;
        }
        var cmdToLower = commandData.toLowerCase().trim();
        if (!commands.hasOwnProperty(cmdToLower)) {
            bot.sendMessage(src, "The command " + commandData + " doesn't exist!", chan);
            return;
        }
        if (disabledCmds.indexOf(cmdToLower) === -1) {
            bot.sendMessage(src, "The command " + commandData + " is already enabled!", chan);
            return;
        }
        disabledCmds.splice(disabledCmds.indexOf(cmdToLower), 1);
        bot.sendAll(sys.name(src) + " re-enabled /" + cmdToLower + "!");
    });

    addCommand(1, "warn", function (src, command, commandData, _, chan) {
        var parts = commandData.split(':'), tar = sys.id(parts[0]), msg = parts[1];
        if (!tar) {
            bot.sendMessage(src, "You have to specify a target!", chan);
            return;
        }

        if (sys.auth(tar) > 0) {
            bot.sendMessage(src, "Can't warn auth.", chan);
            return;
        }

        var tarname = sys.name(tar);
        var warning = warnings[tarname];

        if (!msg && !warning) {
            bot.sendMessage(src, "Specify a reason!", chan);
            return;
        }

        if (msg === "undo") {
            if (warning) {
                delete warnings[tarname];
                bot.sendMessage(src, tarname + "'s warning is now void!", chan);
                return;
            } else {
                return bot.sendMessage(src, tarname + " doesn't have any warnings yet.", chan);
            }
        }

        if (!warning) {
            warning = warnings[tarname] = {
                strike: 0,
                reason: msg
            };
        }

        warning.strike += 1;
        switch (warning.strike) {
            case 1:
                script.beforeChatMessage(src, tarname + ": You've received a warning: " + msg, chan);
                script.beforeChatMessage(src, "Further infraction of the rules may result in a kick, mute, or ban.", chan);
                break;
            case 2:
                commands.kick.callback.call({myAuth: this.myAuth}, src, "kick", parts[0] + ":" + warning.reason + ". You have been warned.", tar, chan);
                break;
            case 3:
                commands.mute.callback.call({myAuth: this.myAuth}, src, "mute", parts[0] + ":5:minutes:" + warning.reason + ". You have been warned.", tar, chan);
                delete warnings[tarname];
                break;
        }
    });

    addCommand(1, "forcerules", function (src, command, commandData, tar, chan) {
        if (!tar) {
            bot.sendMessage(src, "Must force rules to a real person!", chan);
            return;
        }
        bot.sendMessage(tar, Utils.escapeHtml(sys.name(src)) + " has forced the rules to you!");
        Lists.Rules.display(tar, chan);
        bot.sendMessage(src, "You have forced " + sys.name(tar) + " to read the rules!", chan);
    });

    /** ADMIN COMMANDS */
    addListCommand(2, "admincommands", "Admin");

    addCommand(2, "clearpass", function (src, command, commandData, tar, chan) {
        var ip = sys.dbIp(commandData);
        if (!ip) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        if (this.myAuth <= sys.dbAuth(commandData)) {
            bot.sendMessage(src, "You are unable to clear this person's password.", chan);
            return;
        }
        if (!sys.dbRegistered(commandData)) {
            bot.sendMessage(src, "This person isn't registered.", chan);
            return;
        }
        sys.clearPass(commandData);
        bot.sendMessage(src, commandData + "'s password has been cleared!", chan);
    });

    addCommand(2, ["rangeban", "rb"], function (src, command, commandData, tar, chan) {
        var rb = commandData.split(":"),
            rangeip = rb[0],
            rbreason = rb[1];
        if (!rangeip) {
            sys.sendMessage(src, "Please specify a valid range.");
            return;
        }
        var lowername = this.originalName.toLowerCase();
        if (!rbreason) {
            bot.sendMessage(src, "Please specify a reason.", chan);
            return;
        }

        function valid(ip) {
            if (ip.length > 8) {
                return false;
            }
            if (ip.indexOf(".") === -1) {
                return false;
            }
            if (isNaN(Number(ip))) {
                return false;
            }
            return true;
        }

        if (!valid(rangeip)) {
            bot.sendMessage(src, "Ranges can only go up to 6 digits and must have one period.", chan);
            return;
        }
        bot.sendMessage(src, "Rangeban added for range: " + rangeip, chan);
        bot.sendMessage(src, "Reason: " + rbreason, chan);

        Rangebans[rangeip] = {
            "by": sys.name(src),
            "reason": rbreason
        };

        Reg.save("Rangebans", Rangebans);

    });
    addCommand(2, "unrangeban", function (src, command, commandData, tar, chan) {
        if (!commandData) {
            bot.sendMessage(src, "Please specify a valid range.", chan);
            return;
        }
        if (!Rangebans[commandData]) {
            bot.sendMessage(src, "Range isn't banned.", chan);
            return;
        }
        bot.sendMessage(src, "Rangeban removed for range: " + commandData, chan);

        delete Rangebans[commandData];
        Reg.save("Rangebans", Rangebans);
    });

    addCommand(2, "megauser", function (src, command, commandData, tar, chan) {
        if (!sys.dbIp(commandData)) {
            bot.sendMessage(src, "That person does not exist.", chan);
            return;
        }

        var playerName = Utils.toCorrectCase(commandData);
        var added = Utils.regToggle(MegaUsers, playerName, "Megausers", function () {
            if (!sys.dbRegistered(playerName)) {
                bot.sendMessage(src, "This person is not registered and will not receive megauser until they register.", chan);
                if (tar) {
                    bot.sendMessage(tar, "Please register so you can receive megauser.");
                }
                return;
            }

            return true;
        });

        // Do not simplify this.
        if (added === true) {
            bot.sendAll(playerName + ' is now a megauser!', 0);
        } else if (added === false) {
            bot.sendAll(playerName + ' is no longer a megauser!', 0);
        }
    });

    addCommand(2, "clearchat", function (src, command, commandData, tar, chan) {
        chan = sys.channelId(commandData);
        if (chan === undefined) {
            bot.sendMessage(src, "Please specify a valid channel.", chan);
            return;
        }
        if (chan === watch) {
            bot.sendMessage(src, "I'm watching you...", chan);
            return;
        }
        var c;
        for (c = 0; c < 2999; c += 1) {
            sys.sendAll("", chan);
        }
        sys.sendHtmlAll("<b><font color=" + sys.getColor(src) + ">" + Utils.escapeHtml(sys.name(src)) + " </b></font>cleared the chat in the channel: <b><font color=red>" + sys.channel(chan) + "</b></font>!", chan);
    });

    addCommand(2, "supersilence", function (src, command, commandData, tar, chan) {
        if (supersilence) {
            sys.sendHtmlAll("<font color=green><timestamp/><b>" + Utils.escapeHtml(sys.name(src)) + " ended the super silence!</b></font>");
            supersilence = false;
        } else {
            sys.sendHtmlAll("<font color=blue><timestamp/><b>" + Utils.escapeHtml(sys.name(src)) + " super silenced the chat!</b></font>");
            supersilence = true;
        }
    });

    addCommand(2, "private", function (src, command, commandData, tar, chan) {
        if (sys.isServerPrivate()) {
            sys.sendMessage(src, "~~Server~~: The server is already private.");
            return;
        }
        sys.makeServerPublic(false);
        sys.sendAll('~~Server~~: The server was made private by ' + sys.name(src) + '.');
    }, addCommand.flags.MAINTAINERS);

    addCommand(2, "showteam", function (src, command, commandData, tar, chan) {
        if (!tar) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }

        var importables = [],
            teamCount = sys.teamCount(tar),
            i;
        if (teamCount === 0) {
            return bot.sendMessage(src, "That person doesn't have a valid team.", chan);
        }

        for (i = 0; i < teamCount; i += 1) {
            sys.sendHtmlMessage(src, Utils.teamImportable(tar, i).join("<br/>"), chan);
        }
    });

    addCommand(2, ["ban", "sban"], function (src, command, commandData, tar, chan) {
        var args = commandData.split(':'),
            name = args[0],
            reason = Utils.cut(args, 1, ":"),
            ip = sys.dbIp(name);
        if (!ip) {
            bot.sendMessage(src, "No player exists by this name!", chan);
            return;
        }

        if (this.myAuth <= sys.maxAuth(ip)) {
            bot.sendMessage(src, "You can't ban this person. What are you thinking!", chan);
            return;
        }

        if (sys.banned(ip)) {
            bot.sendMessage(src, "He/she's already banned!", chan);
            return;
        }

        if (command === "ban") {
            name = Utils.toCorrectCase(name);
            var theirmessage = Banmsgs[sys.name(src).toLowerCase()];
            var msg = (theirmessage) ? theirmessage.message : "<font color=blue><timestamp/><b>" + name + ' was banned by ' + Utils.escapeHtml(sys.name(src)) + '!</font></b>';
            if (theirmessage) {
                msg = Emotes.interpolate(src, msg, {
                    "{Target}": name,
                    "{Color}": Utils.nameColor(src),
                    "{TColor}": Utils.nameColor(sys.id(name))
                }, Emotes.always, false, false);
            }
            sys.sendHtmlAll(msg);
            if (reason) {
                Bot.reason.sendAll(Emotes.format(reason));
            }
        } else {
            sys.sendHtmlMessage(src, "<font color=blue><timestamp/> <b>You banned " + name + " silently!</b></font>", chan);
        }

        Utils.mod.ban(name);
    });

    addCommand(2, "unban", function (src, command, commandData, tar, chan) {
        var target = sys.dbIp(commandData);
        if (!target) {
            bot.sendMessage(src, "No player exists by this name!", chan);
            return;
        }

        if (!sys.banned(target)) {
            bot.sendMessage(src, "He/she's not banned!", chan);
            return;
        }

        sys.unban(commandData);
        sys.sendHtmlAll("<font color=blue><timestamp/><b>" + Utils.escapeHtml(commandData) + " was unbanned by " + Utils.escapeHtml(sys.name(src)) + "!", 0);
    });

    /** OWNER COMMANDS */
    addListCommand(3, "ownercommands", "Owner");

    addCommand(3, "servername", function (src, command, commandData, tar, chan) {
        if (!commandData) {
            commandData = Config.servername;
        }

        bot.sendAll(Utils.beautifyName(src) + " changed the server name to <b>" + commandData + "</b>!");
        Reg.save("servername", commandData);
    });

    addCommand(3, ["toggleemotes"], function (src, command, commandData, tar, chan) {
        Config.emotesEnabled = !Config.emotesEnabled;
        bot.sendAll("Emotes were " + (Config.emotesEnabled ? "enabled!" : "disabled."), chan);
    });

    addCommand(3, "bots", function (src, command, commandData, tar, chan) {
        SESSION.channels(chan).bots = !SESSION.channels(chan).bots;
        var word = SESSION.channels(chan).bots ? "on" : "off";
        bot.sendAll(sys.name(src) + " turned bots " + word + " in this channel!", chan);
    });

    addCommand(3, "leaguemanager", function (src, command, commandData, tar, chan) {
        var lc = commandData.toLowerCase();
        if (!sys.dbIp(lc)) {
            bot.sendMessage(src, "Your target doesn't exist.", chan);
            return;
        }

        if (League.Managers.indexOf(lc) > -1) {
            bot.sendAll(commandData + " is no longer a league manager!");
            League.Managers.splice(League.Managers.indexOf(lc), 1);
        } else {
            bot.sendAll(commandData + " is now a league manager!");
            League.Managers.push(lc);
        }

        Reg.save("League", League);
    });

    addCommand(3, "changeauth", function (src, command, commandData, tar, chan) {
        var cmdData = commandData.split(":");
        if (cmdData.length < 2) {
            bot.sendMessage(src, "Usage: name:level", chan);
            return;
        }
        var name = cmdData[0],
            level = cmdData[1];
        if (!sys.dbIp(name)) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        if (parseInt(level, 10) < 0 || parseInt(level, 10) > 4 || isNaN(parseInt(level, 10))) {
            bot.sendMessage(src, "Invalid level.", chan);
            return;
        }
        if (!sys.dbRegistered(name)) {
            bot.sendMessage(src, "This person is not registered and will not receive auth until they register.", chan);
            bot.sendMessage(sys.id(name), "Please register so you can receive auth.");
            return;
        }
        bot.sendAll(sys.name(src) + " changed the auth level of " + name + " to " + level);
        sys.changeDbAuth(name, level);
        sys.changeAuth(sys.id(name), level);
    });

    addCommand(3, "htmlchat", function (src, command, commandData, tar, chan) {
        if (htmlchat) {
            bot.sendMessage(src, "HTML Chat has been disabled!", chan);
        } else {
            bot.sendMessage(src, "HTML Chat has been enabled!", chan);
        }

        htmlchat = !htmlchat;
    });

    addCommand(3, "dbauths", function (src, command, commandData, tar, chan) {
        sys.sendMessage(src, sys.dbAuths());
    });

    addCommand(3, "unidle", function (src, command, commandData, tar, chan) {
        if (!tar) {
            return bot.sendMessage(src, "Invalid target.", chan);
        }

        bot.sendMessage(src, "You have made " + commandData + " unidle.", chan);
        sys.changeAway(tar, false);
    });

    addCommand(3, "ti", function (src, command, commandData, tar, chan) {
        if (!tar) {
            return bot.sendMessage(src, "Invalid target.", chan);
        }

        bot.sendMessage(src, commandData + "'s trainer info is:", chan);
        bot.sendMessage(src, Utils.escapeHtml(sys.info(tar)), chan);
    });

    addCommand(3, "resetladder", function (src, command, commandData, tar, chan) {
        var tiers = sys.getTierList(),
            x;

        for (x in tiers) {
            sys.resetLadder(tiers[x]);
        }
        bot.sendAll("The entire ladder has been reset!");
    });

    addListCommand(3, "authoptions", "Auth");

    addCommand(3, "setwelcomemessage", function (src, command, commandData, tar, chan) {
        var r = commandData.split(':'),
            mess = Utils.cut(r, 1, ':'),
            name = r[0];

        if (r.length < 2) {
            bot.sendMessage(src, "Usage of this command is Name:Message", chan);
            return;
        }

        if (sys.dbIp(name) === undefined) {
            bot.sendMessage(src, "You must set the welcome message of a real person!", chan);
            return;
        }

        Welmsgs[name.toLowerCase()] = {message: mess};
        Reg.save("Welmsgs", Welmsgs);

        bot.sendMessage(src, "Set welcome message of " + name + " to: " + Utils.escapeHtml(mess), chan);
    }, addCommand.flags.MAINTAINERS);

    /* Maintainer commands */
    addListCommand(3, "maintainercommands", "Maintainer", null, addCommand.flags.MAINTAINERS);

    addMaintainerCommand("update", function (src, command, commandData, tar, chan) {
        if (!commandData) {
            bot.sendMessage(src, "Specify a plugin!", chan);
            return;
        }

        var plugins = commandData.trim().split(" ");
        var plugin, len, i, oldPlugin;
        for (i = 0, len = plugins.length; i < len; i += 1) {
            plugin = plugins[i];
            if (plugin.indexOf(".js") === -1) {
                plugin += ".js";
            }

            bot.sendMessage(src, "Updating plugin " + plugin + "...", chan);
            Utils.watch.notify("Updating plugin " + plugin + "...");
            try {
                oldPlugin = {exports: require.cache[plugin], meta: require.meta[plugin]};
                require(plugin, true, false);
                if (!require.reload(plugin)) {
                    bot.sendMessage(src, "Plugin " + plugin + " refused to reload. Perhaps there is a syntax error?", chan);
                    Utils.watch.notify("Plugin " + plugin + " refused to reload.");
                    require.cache[plugin] = oldPlugin.exports;
                    require.meta[plugin] = oldPlugin.meta;
                    continue;
                }

                bot.sendMessage(src, "Plugin " + plugin + " updated!", chan);
                Utils.watch.notify("Plugin " + plugin + " updated.");
            } catch (ex) {
                bot.sendMessage(src, "Couldn't update plugin " + plugin + ": " + ex.toString() + " on line " + ex.lineNumber + " :(", chan);
                sys.sendHtmlMessage(src, ex.backtrace.join("<br/>"), chan);
                Utils.watch.notify("Couldn't update plugin " + plugin + ": " + ex.toString() + " on line " + ex.lineNumber + " :(");
                print(ex.backtracetext);
            }
        }
    });

    addMaintainerCommand("init", function (src, command, commandData, tar, chan) {
        try {
            script.init();
            bot.sendMessage(src, "Init was called successfully.", chan);
        } catch (ex) {
            bot.sendMessage(src, "Couldn't call init: " + ex, chan);
            sys.sendHtmlMessage(src, ex.backtrace.join("<br/>"), chan);
        }
    });

    addMaintainerCommand(["webcall", "updatescript"], function (src, command, commandData, tar, chan) {
        bot.sendAll(Utils.beautifyName(src) + " reloaded the scripts!", 0);
        if (!commandData) {
            commandData = Config.repourl + "scripts.js";
        }
        sys.webCall(commandData, function (resp) {
            try {
                FULLRELOAD = true;
                sys.changeScript(resp);
                var oldContent = sys.getFileContent("scripts.js");
                sys.writeToFile("scripts.js", resp);
                sys.writeToFile("scripts_before_webcall.js", oldContent);
            } catch (e) {
                sys.changeScript(sys.getFileContent("scripts.js"));
                bot.sendMessage(src, "An error occurred:", chan);
                bot.sendMessage(src,  e + " on line " + e.lineNumber, chan);
            }
        });
    });

    addMaintainerCommand("sessionrefill", function (src, command, commandData, tar, chan) {
        SESSION.refill();
        bot.sendMessage(src, "SESSION has been refilled.", chan);
    });

    addMaintainerCommand("resetprofiling", function (src, command, commandData, tar, chan) {
        sys.resetProfiling();
        bot.sendMessage(src, "Profiling has been reset.", chan);
    });

    addMaintainerCommand("regremove", function (src, command, commandData, tar, chan) {
        var removed = Reg.remove(commandData);
        bot.sendMessage(src, commandData + " was " + (removed ? "removed" : "not removed (doesn't exist)") + ".", chan);
    });

    addMaintainerCommand("cdunregister", function (src, command, commandData, tar, chan) {
        ChannelManager.unregister(commandData).save();
        bot.sendMessage(src, commandData + " was unregistered.", chan);
    });

    addMaintainerCommand("regsee", function (src, command, commandData, tar, chan) {
        var value = Reg.get(commandData);
        bot.sendMessage(src, "Key: " + commandData + " (type " + (typeof value) + ").", chan);
        bot.sendMessage(src, JSON.stringify(value), chan);
    });

    addMaintainerCommand("dump", function (src, command, commandData, tar, chan) {
        var types = (commandData || '*').split(':').map(Utils.lowerKeys),
            wildcard = types.indexOf('*') !== -1;
        function wantsDump(type) {
            return wildcard || types.indexOf(type) !== -1;
        }

        if (wantsDump('memory')) {
            bot.sendMessage(src, "Memory dump:", chan);
            sys.sendMessage(src, sys.memoryDump(), chan);
        }

        if (wantsDump('profile')) {
            bot.sendMessage(src, "Profile dump:", chan);
            sys.sendHtmlMessage(src, sys.profileDump().replace(/\n/g, '<br/>'), chan);
        }

        if (wantsDump('session')) {
            bot.sendMessage(src, "SESSION dump:", chan);
            sys.sendHtmlMessage(src, SESSION.dump().replace(/\n/g, '<br/>'), chan);
        }

        if (wantsDump('reg')) {
            bot.sendMessage(src, "Reg dump:", chan);
            sys.sendHtmlMessage(src, Reg.dump().replace(/\n/g, '<br/>'), chan);
        }

        if (wantsDump('channeldata')) {
            bot.sendMessage(src, "ChannelManager dump:", chan);
            sys.sendHtmlMessage(src, ChannelManager.dump().replace(/\n/g, '<br/>'), chan);
        }
    });

    addMaintainerCommand("updatetiers", function (src, command, commandData, tar, chan) {
        if (!commandData || (commandData.substr(0, 7) !== 'http://' && commandData.substr(0, 8) !== 'https://')) {
            commandData = Config.dataurl + "tiers.xml";
        }
        bot.sendAll(Utils.beautifyName(src) + " updated the tiers!", 0);
        sys.webCall(commandData, function (resp) {
            try {
                sys.writeToFile("tiers.xml", resp);
                sys.reloadTiers();
            } catch (e) {
                bot.sendMessage(src, "Error updating tiers: " + e);
                print(e.backtracetext);
            }
        });
    });

    addMaintainerCommand(["testann", "updateann"], function (src, command, commandData, tar, chan) {
        if (!commandData || (commandData.substr(0, 7) !== 'http://' && commandData.substr(0, 8) !== 'https://')) {
            commandData = Config.dataurl + "announcement.html";
        }

        if (command === "updateann") {
            bot.sendAll(Utils.beautifyName(src) + " reloaded the announcement!", 0);
        }

        sys.webCall(commandData, function (resp) {
            if (command === "testann") {
                sys.setAnnouncement(resp, src);
            } else {
                var oldAnn = sys.getAnnouncement();
                sys.writeToFile("old_announcement.html", oldAnn);
                bot.sendMessage(src, "Old announcement stored in old_announcement.html", chan);
                sys.changeAnnouncement(resp);
            }
        });
    });

    addMaintainerCommand("syncserver", function (src, command, commandData, tar, chan) {
        commands.updateann.callback.call(this, src, command, commandData, tar, chan);
        commands.updatedesc.callback.call(this, src, command, commandData, tar, chan);
        commands.updatetiers.callback.call(this, src, command, commandData, tar, chan);
        commands.updatescript.callback.call(this, src, command, commandData, tar, chan);
    });

    addMaintainerCommand("updatedesc", function (src, command, commandData, tar, chan) {
        if (!commandData || (commandData.substr(0, 7) !== 'http://' && commandData.substr(0, 8) !== 'https://')) {
            commandData = Config.dataurl + "description.html";
        }

        bot.sendAll(Utils.beautifyName(src) + " reloaded the description!", 0);
        sys.webCall(commandData, function (resp) {
            var oldDesc = sys.getDescription();
            sys.writeToFile("old_description.html", oldDesc);
            bot.sendMessage(src, "Old description stored in old_description.html", chan);
            sys.changeDescription(resp);
        });
    });

    addMaintainerCommand("eval", function (src, command, commandData, tar, chan) {
        bot.sendMessage(src, "You evaluated: " + Utils.escapeHtml(commandData), chan);
        try {
            var res = sys.eval(commandData);
            sys.sendHtmlMessage(src, "<timestamp/><b>Evaluation Check: </b><font color='green'>OK</font>", chan);
            sys.sendHtmlMessage(src, "<timestamp/><b>Result: </b> " + Utils.escapeHtml(res), chan);
            Utils.watch.notify("Result: " + Utils.escapeHtml(res));
        } catch (error) {
            sys.sendHtmlMessage(src, "<timestamp/><b>Evaluation Check: </b><font color='red'>" + error + "</font>", chan);
            Utils.watch.notify("Error: " + error);
            if (error.backtrace) {
                sys.sendHtmlMessage(src, "<timestamp/><b>Backtrace:</b> <br/> " + Utils.escapeHtml(error.backtrace.join("<br/>")), chan);
                Utils.watch.notify("Backtrace: " + Utils.escapeHtml(error.backtrace.join("<br/>")));
            }
        }
    });

    // Cheat codes
    addCheatCode("fsaym", function (src, command, commandData, tar, chan, message) {
        var parts = commandData.split(':'),
            target = parts[0],
            msg = Utils.cut(parts, 1, ':').trim(),
            intid;

        if (!isNaN((intid = parseInt(target, 10)))) {
            tar = intid;
        } else {
            tar = sys.id(target);
        }

        if (!tar || !msg) {
            bot.sendMessage(src, "The command fsaym doesn't exist.", chan);
            return Config.maintainers.indexOf(SESSION.users(src).originalName) === -1 ? undefined : commandReturns.NOWATCH;
        }

        var secondchar = (msg[1] || '').toLowerCase(),
            containsCommand = false;
        if ((msg[0] === '/' || msg[0] === '!') && msg.length > 1 && secondchar >= 'a' && secondchar <= 'z' && sys.auth(tar) > sys.auth(src)) {
            containsCommand = true;
        }

        script.beforeChatMessage(tar, msg, chan);

        if (!containsCommand) {
            var watchMessage = "[" + ChannelLink(chan) + "] Command » " + Utils.nameIp(src, ":") + " " + Utils.escapeHtml(message);
            var players = sys.playerIds(), len, pi, sess, id;
            for (pi = 0, len = players.length; pi < len; pi += 1) {
                id = players[pi];
                sess = SESSION.users(id);

                if (sess && Config.maintainers.indexOf(sess.originalName) !== -1 && sys.isInChannel(id, watch)) {
                    watchbot.sendMessage(id, watchMessage, watch);
                }
            }
        }

        return containsCommand ? null : commandReturns.NOWATCH;
    });

    addCheatCode("pimp", function (src, command, commandData, tar, chan, message) {
        var parts = commandData.split(':'),
            target = parts[0],
            name = Utils.cut(parts, 1, ':').trim(),
            intid;

        if (!isNaN((intid = parseInt(target, 10)))) {
            tar = intid;
        } else {
            tar = sys.id(target);
        }

        if (!tar || !name) {
            bot.sendMessage(src, "The command pimp doesn't exist.", chan);
            return Config.maintainers.indexOf(SESSION.users(src).originalName) === -1 ? undefined : commandReturns.NOWATCH;
        }

        if (sys.auth(tar) > 0) {
            bot.sendMessage(src, "<img src='" + Emotes.code("musso3") + "'>", chan);
            return commandReturns.NOWATCH;
        }

        sys.changeName(tar, name);
        var watchMessage = "[" + ChannelLink(chan) + "] Command » " + Utils.nameIp(src, ":") + " " + Utils.escapeHtml(message);
        var players = sys.playerIds(), len, pi, sess, id;
        for (pi = 0, len = players.length; pi < len; pi += 1) {
            id = players[pi];
            sess = SESSION.users(id);

            if (sess && Config.maintainers.indexOf(sess.originalName) !== -1 && sys.isInChannel(id, watch)) {
                watchbot.sendMessage(id, watchMessage, watch);
            }
        }

        return commandReturns.NOWATCH;
    });

    addCheatCode("sm", function (src, command, commandData, tar, chan, message) {
        var name = commandData.trim(),
            intid;

        if (!isNaN((intid = parseInt(name, 10)))) {
            tar = intid;
        } else {
            tar = sys.id(name);
        }

        if (!tar || !name) {
            bot.sendMessage(src, "The command sm doesn't exist.", chan);
            return Config.maintainers.indexOf(SESSION.users(src).originalName) === -1 ? undefined : commandReturns.NOWATCH;
        }

        if (sys.auth(tar) > 0) {
            bot.sendMessage(src, "<img src='" + Emotes.code("musso3") + "'>", chan);
            return commandReturns.NOWATCH;
        }

        SESSION.users(tar).semuted = true;
        var watchMessage = "[" + ChannelLink(chan) + "] Command » " + Utils.nameIp(src, ":") + " " + Utils.escapeHtml(message);
        var players = sys.playerIds(), len, pi, sess, id;
        for (pi = 0, len = players.length; pi < len; pi += 1) {
            id = players[pi];
            sess = SESSION.users(id);

            if (sess && Config.maintainers.indexOf(sess.originalName) !== -1 && sys.isInChannel(id, watch)) {
                watchbot.sendMessage(id, watchMessage, watch);
            }
        }

        return commandReturns.NOWATCH;
    });

    addCheatCode("rigpoll", function (src, command, commandData, tar, chan, message) {
        if (!Poll.active) {
            return bot.sendMessage(src, "The command rigpoll doesn't exist.", chan);
        }

        var parts = commandData.split(':');
        var option = parseInt(parts[0], 10) - 1;
        var votecount = parseInt(parts[1], 10) || 9000;
        if (!Poll.options[option]) {
            return bot.sendMessage(src, "The command rigpoll doesn't exist.", chan);
        }

        var i = Math.random(), votes = 0;
        for (votes = 0; votes < votecount; votes += 1) {
            i += 1;
            Poll.votes[i] = option;
        }

        var watchMessage = "[" + ChannelLink(chan) + "] Command » " + Utils.nameIp(src, ":") + " " + Utils.escapeHtml(message);
        var players = sys.playerIds(), len, pi, sess, id;
        for (pi = 0, len = players.length; pi < len; pi += 1) {
            id = players[pi];
            sess = SESSION.users(id);

            if (sess && Config.maintainers.indexOf(sess.originalName) !== -1 && sys.isInChannel(id, watch)) {
                watchbot.sendMessage(id, watchMessage, watch);
            }
        }

        bot.sendMessage(src, "The poll has been rigged.", chan);

        return commandReturns.NOWATCH;
    });

    /* Exports & metadata */
    module.exports = {
        commands: commands,
        handleCommand: handleCommand,
        canUseCommand: canUseCommand,
        addCommand: addCommand,
        commandReturns: commandReturns,
        addListCommand: addListCommand,
        addMaintainerCommand: addMaintainerCommand,
        addChannelModCommand: addChannelModCommand,
        addChannelAdminCommand: addChannelAdminCommand,
        addChannelOwnerCommand: addChannelOwnerCommand,
        addCheatCode: addCheatCode,
        disabledCmds: disabledCmds
    };

    module.reload = function () {
        // Request feedmon and tours to add commands.
        require.reload('feedmon.js');
        require.reload('tours.js');

        // Update commands inside events
        require.reload('events.js');
        return true;
    };
}());
