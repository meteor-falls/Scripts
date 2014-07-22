(function () {
    var commands = require('commands');
    var sendWarningsTo = "TheUnknownOne cares".split(" "),
        sendErrorsTo = "TheUnknownOne cares".split(" "),
        ignoreNextChanMsg = false,
        ignoreNext = false;

    module.exports = {
        warning: function (func, message, backtrace) {
            var len = sendWarningsTo.length,
                id, i;

            for (i = 0; i < len; i += 1) {
                id = sys.id(sendWarningsTo[i]);

                if (id && sys.isInChannel(id, 0)) {
                    sys.sendMessage(id, "Script warning in function " + func + ": " + message, 0);
                    sys.sendHtmlMessage(id, backtrace.split("\n").join("<br>"), 0);
                }
            }
        },
        beforeNewMessage: function (message) {
            if (ignoreNext) {
                ignoreNext = false;
                return sys.stopEvent();
            } else if (ignoreNextChanMsg) {
                // Don't call sys.stopEvent here
                ignoreNextChanMsg = false;
                return;
            }

            if (message.substr(0, 8) === "[#Watch]") {
                return sys.stopEvent();
            }

            // Strip HTML. :]
            if (Config.stripHtmlFromChannelMessages && message.substring(0, 2) === "[#") {
                sys.stopEvent();
                ignoreNextChanMsg = true;
                print(Utils.stripHtml(message));
                return;
            }
        },
        afterNewMessage: function (message) {
            if (message === "Script Check: OK") {
                sys.sendHtmlAll("<font size=4><b><font color=blue>±Scripts:</font></b> Scripts were updated!</font>");
                script.init();
                return;
            }

            if (message.substr(0, 17) === "Script Error line") {
                var len = sendErrorsTo.length,
                    id, i;

                for (i = 0; i < len; i += 1) {
                    id = sys.id(sendErrorsTo[i]);

                    if (id && sys.isInChannel(id, 0)) {
                        sys.sendMessage(id, message, 0);
                        sys.sendHtmlMessage(id, sys.backtrace().split("\n").join("<br>"), 0);
                    }
                }
            }

            ignoreNext = true;
            /*if (typeof watch !== 'undefined' && typeof watchbot !== 'undefined' && message.substr(0, 2) !== '[#' && message.substr(0, 2) !== '<f') {
                Utils.watch.notify(message.split("\n").join("<br>"));
            }*/
        },
        beforeServerMessage: function (message) {
            var isEval = message.substr(0, 2) === ">>",
                evalCode;

            if (isEval) {
                sys.stopEvent();

                evalCode = message.substr(2);
                print(message);
                try {
                    print(eval(evalCode));
                } catch (ex) {
                    print(ex);
                    print(ex.backtracetext);
                }
            }
        },
        beforeChannelJoin: function (src, channel) {
            var user = SESSION.users(src);

            // Allow always
            if (SESSION.channels(channel) && (Utils.channel.isChannelMember(src, channel) || Utils.channel.hasChannelAuth(src, channel))) {
                return;
            } else if (Utils.mod.hasBasicPermissions(src)) {
                return;
            }

            if (sys.os(src) === "android" && !Ranks.plus.hasMember(src) && channel !== androidchannel) {
                if (sys.isInChannel(src, androidchannel)) {
                    Bot.guard.sendMessage(src, "Android users are not permitted to go outside the android channel.", androidchannel);
                    if (!user.semuted) {
                        Utils.watch.notify("Android " + Utils.nameIp(src) + " tried to join " + Utils.clink(sys.channel(channel)) + "!");
                    }
                }
                return sys.stopEvent();
            }

            // TODO: Auto kick
            if ((channel === staffchannel && !Ranks.plusplus.hasMember(src)) || channel === watch || (channel === pluschannel && !Ranks.plus.hasMember(src))) {
                if (sys.isInChannel(src, 0)) {
                    Bot.guard.sendMessage(src, "HEY! GET AWAY FROM THERE!", 0);
                }
                // TODO: Remove this when autokick is implemented
                if (!user.semuted) {
                    Utils.watch.notify(Utils.nameIp(src) + " tried to join " + Utils.clink(sys.channel(channel)) + "!");
                }
                return sys.stopEvent();
            }
        },
        afterChannelCreated: function (channel, cname, src) {
            var chan = SESSION.channels(channel);

            ChannelManager.populate(chan);
            if (src) {
                Utils.watch.notify(Utils.nameIp(src) + " created channel " + Utils.clink(cname) + ".");
                if (!chan.creator) {
                    chan.creator = sys.name(src);
                    ChannelManager.sync(chan, 'creator').save();
                }
            }
        },
        beforeChannelDestroyed: function (channel) {
            var hlr = require('highlanders');

            if ([staffchannel, testchan, watch, androidchannel, pluschannel, hlr.chan].indexOf(channel) !== -1) {
                sys.stopEvent();
                return;
            }

            ChannelManager.absorb(SESSION.channels(channel)).save();
            Utils.watch.notify("Channel " + Utils.clink(channel) + " was destroyed.");
        },
        afterChannelJoin: function (src, chan) {
            var poChan = SESSION.channels(chan),
                topic = poChan.topic;

            if (topic) {
                Bot.topic.sendMessage(src, topic, chan);

                if (poChan.setBy) {
                    Bot.setby.sendMessage(src, poChan.setBy, chan);
                }
            }

            if (chan !== 0) {
                Utils.watch.notify(Utils.nameIp(src) + " joined " + Utils.clink(sys.channel(chan)) + "!");
            }
        },
        beforeLogIn: function (src) {
            var srcip = sys.ip(src),
                auth = sys.auth(src),
                ip;

            if (auth < 3) {
                if (Utils.hasIllegalChars(sys.name(src))) {
                    Utils.watch.notify("Blocked login for bad characters from IP " + srcip + ".");
                    return sys.stopEvent();
                }
            }

            if (auth < 1) {
                for (ip in Rangebans) {
                    if (ip === srcip.substr(0, ip.length)) {
                        Utils.watch.notify("Rangebanned IP [" + srcip + "] tried to log in as " + sys.name(src) + ".");
                        return sys.stopEvent();
                    }
                }
                if (reconnectTrolls.hasOwnProperty(ip)) {
                    Utils.watch.notify("Blocked auto-reconnect from IP " + srcip + " (" + sys.name(src) + ").");
                    return sys.stopEvent();
                }
            }
        },
        afterLogIn: function (src, defaultChan) {
            var poUser = SESSION.users(src),
                ip = sys.ip(src),
                numPlayers = sys.numPlayers(),
                os = sys.os(src),
                newRecord = false,
                srcname = sys.name(src),
                cookie = (Utils.getCookie(src) || '').split(';');

            if (cookie.indexOf('cockblocked') > -1 && !uncockblocks[srcname]) {
                Utils.watch.notify("Cockblocked " + Utils.nameIp(src) + ".");
                poUser.autokick = true;
                return sys.kick(src);
            } else if (uncockblocks[srcname]) {
                Utils.setCookie(src, '');
                cookie = [];
                delete uncockblocks[srcname];

                bot.sendMessage(src, "<h1>Please relog to finish the unbanning process</h1>");
            }

            if (cookie.indexOf('blackbagged') > -1) {
                Utils.watch.notify("Blackbagged " + Utils.nameIp(src) + ".");
                poUser.semuted = true;
            }

            poUser.originalName = srcname;

            if (Utils.mod.hasBasicPermissions(src)) {
                if (!sys.isInChannel(src, watch)) {
                    sys.putInChannel(src, watch);
                }

                if (!sys.isInChannel(src, staffchannel)) {
                    sys.putInChannel(src, staffchannel);
                }
            }

            if (numPlayers > Reg.get("maxPlayersOnline")) {
                Reg.save("maxPlayersOnline", numPlayers);
                newRecord = true;
            }

            if (os === "android" && !Ranks.plus.hasMember(src)) {
                if (!sys.isInChannel(src, androidchannel)) {
                    sys.putInChannel(src, androidchannel);
                }

                if (sys.isInChannel(src, 0)) {
                    sys.kick(src, 0);
                }
                defaultChan = androidchannel;
            } else {
                if (typeof defaultChan === 'string') {
                    defaultChan = sys.channelId(defaultChan) || 0;
                }

                if (!sys.isInChannel(src, defaultChan)) {
                    sys.putInChannel(src, defaultChan);
                }
            }

            function displayBot(name, message, color) {
                sys.sendHtmlMessage(src, "<font color='" + color + "'><timestamp/> ±<b>" + name + ":</b></font> " + message, defaultChan);
            }

            displayBot("ServerBot", "Hey, <b><font color='" + Utils.nameColor(src) + "'>" + srcname + "</font></b>!", "purple");
            displayBot("CommandBot", "Type <b>/commands</b> for a list of commands, <b>/rules</b> for a list of rules, and <b>/league</b> for the league.", "green");
            if (Reg.get("forumbotEnabled") !== false) {
                displayBot("ForumBot", "Get in touch with the community by joining the <b><a href='http://meteorfalls.us/'>Meteor Falls Forums</a></b>!", "blue");
            }
            displayBot("StatsBot", "There are <b>" + numPlayers + "</b> players online. You are the <b>" + Utils.ordinal(Utils.placeCommas(src)) + "</b> player to join. At most, there were <b>" + Reg.get("maxPlayersOnline") + "</b> players online" + (newRecord ? " (new record!)" : "") + ".", "goldenrod");
            if (typeof startUpTime === "number" && startUpTime < sys.time()) {
                displayBot("UptimeBot", "The server has been up for " + Utils.fancyJoin(Utils.uptime()) + ".", "orange");
            }

            var motd = Reg.get("MOTD");
            if (motd) {
                displayBot("Message of the Day", motd, "red");
            }

            sys.sendMessage(src, '');

            Utils.mod.pruneMutes();
            if (Mutes.hasOwnProperty(ip)) {
                var myMute = Mutes[ip],
                    muteStr = myMute.time !== 0 ? Utils.getTimeString(myMute.time - sys.time()) : "forever";
                poUser.muted = true;
                bot.sendMessage(src, "You are muted for " + muteStr + ". By: " + myMute.by + ". Reason: " + myMute.reason, defaultChan);
            }

            if (!poUser.muted) {
                var hasWelcomeMessage = Welmsgs.hasOwnProperty(sys.name(src).toLowerCase()) && Ranks.plus.hasMember(src);
                if (!hasWelcomeMessage) {
                    if (sys.numPlayers() < 30 && os !== "android") {
                        Utils.loginMessage(sys.name(src), Utils.nameColor(src));
                    }
                } else {
                    var theirmessage = Welmsgs[sys.name(src).toLowerCase()];
                    var msg = (theirmessage) ? theirmessage.message : Utils.loginMessage(sys.name(src), Utils.nameColor(src));
                    if (theirmessage) {
                        msg = Emotes.interpolate(src, msg, {
                            "{Color}": Utils.nameColor(src)
                        }, Emotes.always);
                    }
                    sys.sendHtmlAll(msg, 0);
                }
            }

            var i;
            var drizzleSwim = Utils.tier.hasDrizzleSwim(src);
            if (drizzleSwim.length > 0) {
                for (i = 0; i < drizzleSwim.length; i += 1) {
                    bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.", defaultChan);
                    sys.changeTier(src, drizzleSwim[i], "5th Gen Ubers");
                }
            }

            var sandCloak = Utils.tier.hasSandCloak(src);
            if (sandCloak.length > 0) {
                for (i = 0; i < sandCloak.length; i += 1) {
                    bot.sendMessage(src, "Sorry, Sand Veil & Snow Cloak are only usable in 5th Gen Ubers.", defaultChan);
                    sys.changeTier(src, sandCloak[i], "5th Gen Ubers");
                }
            }

            for (var team = 0; team < sys.teamCount(src); team += 1) {
                if (!Utils.tier.hasOneUsablePoke(src, team) && !Utils.tier.isCCTier(sys.tier(src, team))) {
                    bot.sendMessage(src, "Sorry, you do not have a valid team for the " + sys.tier(src, team) + " tier.", defaultChan);
                    bot.sendMessage(src, "You have been placed into 'Challenge Cup'.", defaultChan);
                    sys.changeTier(src, team, "Challenge Cup");
                }
            }

            if (sys.hasTier(src, "5th Gen OU")) {
                Utils.tier.dreamAbilityCheck(src);
            }

            var tour = require('tours');

            if (tourmode === 1) {
                sys.sendHtmlMessage(src, "<br/><center><table width=30% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:11px; font-weight:bold;'>A <i style='color:red; font-weight:bold;'>" + tour.tier + "</i> tournament is in sign-up phase</font><hr width=200/><br><b><i style='color:red; font-weight:bold;'>" + tour.tourSpots() + "</i> space(s) are remaining!<br><br>Type <i style='color:red; font-weight:bold;'>/join</i> to join!</b><br/><br/></td></tr></table></center><br/>", defaultChan);
            } else if (tourmode === 2) {
                sys.sendHtmlMessage(src, "<br/><center><table width=35% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:11px; font-weight:bold;'>A <i style='color:red; font-weight:bold;'>" + tour.tier + "</i> tournament is currently running.</font><hr width=210/><br><b>Type <i style='color:red; font-weight:bold;'>/viewround</i> to check the status of the tournament!</b><br/><br/></td></tr></table></center><br/>", defaultChan);
            }

            Utils.fixupTI(src);
            Utils.watch.notify(Utils.nameIp(src) + " logged in (" + os + " pv" + (sys.protocolVersion ? sys.protocolVersion(src) : "?.?") + ").");
        },

        beforeChangeTier: function (src, team, oldtier, newtier) {
            if (!Utils.tier.hasOneUsablePoke(src, team) && !Utils.tier.isCCTier(newtier)) {
                sys.stopEvent();
                bot.sendMessage(src, "Sorry, you do not have a valid team for the " + newtier + " tier.");
                bot.sendMessage(src, "You have been placed into 'Challenge Cup'.");
                sys.changeTier(src, team, "Challenge Cup");
            }

            var drizzleSwim = Utils.tier.hasDrizzleSwim(src),
                i;

            if (drizzleSwim.length > 0) {
                for (i = 0; i < drizzleSwim.length; i += 1) {
                    bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.");
                    sys.changeTier(src, drizzleSwim[i], "5th Gen Ubers");
                    sys.stopEvent();
                }
            }
            var sandCloak = Utils.tier.hasSandCloak(src);
            if (sandCloak.length > 0) {
                for (i = 0; i < sandCloak.length; i += 1) {
                    bot.sendMessage(src, "Sorry, Sand Veil & Snow Cloak are only usable in 5th Gen Ubers.");
                    sys.changeTier(src, sandCloak[i], "5th Gen Ubers");
                    sys.stopEvent();
                }
            }
            if (newtier === "5th Gen OU") {
                if (Utils.tier.dreamAbilityCheck(src)) {
                    sys.stopEvent();
                }
            }
        },
        beforeChatMessage: function (src, message, chan) {
            var poUser = SESSION.users(src),
                //poChan = SESSION.channels(chan),
                isMuted = poUser.muted,
                myAuth = Utils.getAuth(src);

            if (!Utils.mod.hasBasicPermissions(src) && message.length > Config.characterLimit) {
                sys.stopEvent();
                bot.sendMessage(src, "Sorry, your message has exceeded the " + Config.characterLimit + " character limit.", chan);
                //Utils.watch.notify("User, " + Utils.nameIp(src) + ", has tried to post a message that exceeds the " + charLimit + " character limit. Take action if need be.");
                script.afterChatMessage(src, message, chan);
                return;
            }

            if (Utils.hasIllegalChars(message) && myAuth < 1) {
                bot.sendMessage(src, "WHY DID YOU TRY TO POST THAT, YOU NOOB?!", chan);
                Utils.watch.notify(Utils.nameIp(src) + " TRIED TO POST A BAD CODE! KILL IT!");
                sys.stopEvent();
                script.afterChatMessage(src, message, chan);
                return;
            }

            if (myAuth < 2 && isMuted) {
                Utils.mod.pruneMutes();
                if (!Mutes.hasOwnProperty(sys.ip(src))) {
                    poUser.muted = false;
                } else {
                    sys.stopEvent();
                    var myMute = Mutes[sys.ip(src)],
                        muteStr = myMute.time !== 0 ? Utils.getTimeString(myMute.time - sys.time()) : "forever";
                    bot.sendMessage(src, "Shut up, you are muted for " + muteStr + ", by " + myMute.by + "! Reason: " + myMute.reason, chan);
                    Utils.watch.message(src, "Muted Message", message, chan);
                    script.afterChatMessage(src, message, chan);
                    return;
                }
            }

            if (myAuth < 1 && muteall || myAuth < 2 && supersilence) {
                sys.stopEvent();
                bot.sendMessage(src, "Shut up! Silence is on!", chan);
                Utils.watch.message(src, "Silence Message", message, chan);
                script.afterChatMessage(src, message, chan);
                return;
            }

            // Strip empty character
            message = message.replace(/\ufffc/gi, "");

            if (message.length === 0) {
                //Utils.watch.notify(Utils.nameIp(src) + " posted an empty message but failed.");
                return sys.stopEvent();
            }

            var secondchar = (message[1] || '').toLowerCase();
            if ((message[0] === '/' || message[0] === '!') && message.length > 1 && secondchar >= 'a' && secondchar <= 'z') {
                print("[#" + sys.channel(chan) + "] Command -- " + sys.name(src) + ": " + message);
                sys.stopEvent();
                var command = "";
                var commandData = "";
                var pos = message.indexOf(' ');
                var commandResult;

                if (pos !== -1) {
                    command = message.substring(1, pos).toLowerCase();
                    commandData = message.substr(pos + 1);
                } else {
                    command = message.substr(1).toLowerCase();
                }

                var tar = sys.id(commandData);
                try {
                    var hlr = require('highlanders');
                    if (!poUser.semuted && chan === hlr.chan && hlr.canUseCommand(src, command, chan)) {
                        Utils.watch.message(src, "Command", message, chan);
                        hlr.handleCommand(src, message, command, commandData, tar, chan);
                    } else if (commands.canUseCommand(src, command, chan)) {
                        if (!(commands.commands[command].flags & commands.addCommand.flags.NOWATCH)) {
                            Utils.watch.message(src, (poUser.semuted ? "Secommand" : "Command"), message, chan);
                        }

                        commandResult = commands.handleCommand(src, message, command, commandData, tar, chan) || 0;
                    }
                } catch (err) {
                    if (typeof err === "string") {
                        bot.sendMessage(src, err, chan);
                    } else {
                        bot.sendMessage(src, "An error occured.", chan);
                        Utils.watch.notify("Error: " + err + (err.lineNumber ? " on line " + err.lineNumber : "") + err.backtracetext);
                    }
                }

                script.afterChatMessage(src, message, chan);
                return;
            }

            var player = src,
                sendStr = "",
                visibleAuth, ids, name;

            if (pewpewpew || RTD.hasEffect(src, 'pew')) {
                ids = sys.playerIds().filter(function (id) {
                    return sys.loggedIn(id) && id !== src;
                });
                player = ids[sys.rand(0, ids.length)] || src;
            }

            var sentMessage = ((myAuth === 3 && htmlchat) ? message : Utils.escapeHtml(message, true).replace(/&lt;_&lt;/g, "<_<").replace(/&gt;_&gt;/g, ">_>")); // no amp
            var isCapsMode = capsmode || RTD.hasEffect(player, 'rage'),
                isScrambleMode = scramblemode || RTD.hasEffect(player, 'screech'),
                isColormode = colormode,
                isYeoldeMode = yeoldemode || RTD.hasEffect(player, 'ye_olde');

            if (Emotes.enabledFor(player) && !pewpewpew && !nightclub && !isCapsMode && !isScrambleMode && !isColormode && !isYeoldeMode) {
                sentMessage = Emotes.format(sentMessage, Emotes.ratelimit, src);
            }

            sentMessage = Utils.format(player, sentMessage);
            sentMessage = sentMessage.replace(/<_</g, "&lt;_&lt;").replace(/>_</g, "&gt;_&lt;");

            if (isCapsMode) {
                sentMessage = sentMessage.toUpperCase();
            }

            if (isScrambleMode) {
                sentMessage = Utils.fisheryates(sentMessage.split("")).join("");
            }

            if (isColormode) {
                sentMessage = "<b>" + Utils.nightclub.rainbowify(sentMessage, 200) + "</b>";
            }

            if (isYeoldeMode) {
                sentMessage = require('yeolde').yeolde(sentMessage);
            }

            if (nightclub) {
                sendStr = Utils.nightclub.format("(" + sys.name(player) + "): " + message);
            } else {
                visibleAuth = sys.auth(player) > 0 && sys.auth(player) < 4;

                if (comicmode) {
                    sendStr += "<font face='comic sans'>";
                }

                sendStr += "<font color=" + Utils.nameColor(player) + "><timestamp/>";
                if (visibleAuth) {
                    sendStr += "+<i>";
                }

                name = Utils.escapeHtml(sys.name(player));
                if (RTD.hasEffect(player, 'emote_infection')) {
                    name = "<img src='" + Emotes.code(Emotes.random()) + "'>";
                }

                sendStr += "<b>" + name + ":</b>";
                if (visibleAuth) {
                    sendStr += "</i>";
                }

                sendStr += "</font> ";
                if (RTD.hasEffect(player, 'big_text')) {
                    sendStr += "<font size=6>";
                } else if (RTD.hasEffect(player, 'small_text')) {
                    sendStr += "<font size=2>";
                }

                sendStr += sentMessage;

                if (RTD.hasEffect(player, 'big_text') || RTD.hasEffect(player, 'small_text')) {
                    sendStr += "</font>";
                }

                if (comicmode) {
                    sendStr += "</font>";
                }
            }

            sys.stopEvent();
            if (poUser.semuted) {
                Utils.sendHtmlSemuted(sendStr, chan);
                Utils.watch.message(src, "Sessage", message, chan);
            } else {
                sys.sendHtmlAll(sendStr, chan);
                if (chan !== watch) {
                    Utils.watch.message(src, "Message", message, chan);
                }
            }

            script.afterChatMessage(src, message, chan);
        },

        beforeLogOut: function (src) {
            var user = SESSION.users(src),
                os = sys.os(src);

            if (sys.numPlayers() < 30 && !user.autokick && !user.muted) {
                if (os !== "android") {
                    Utils.logoutMessage(Utils.escapeHtml(sys.name(src)), Utils.nameColor(src));
                }
                Utils.watch.notify(Utils.nameIp(src) + " logged out.");
            }
        },
        afterChangeTeam: function (src) {
            var teamCount = sys.teamCount(src),
                myUser = SESSION.users(src),
                ip = sys.ip(src),
                team, i;

            if (Utils.hasIllegalChars(sys.name(src))) {
                Utils.mod.kickIp(sys.ip(src));
                return;
            }

            for (team = 0; team < teamCount; team += 1) {
                if (!Utils.tier.hasOneUsablePoke(src, team) && !Utils.tier.isCCTier(sys.tier(src, team))) {
                    bot.sendMessage(src, "Sorry, you do not have a valid team for the " + sys.tier(src, team) + " tier.");
                    bot.sendMessage(src, "You have been placed into 'Challenge Cup'.");
                    sys.changeTier(src, team, "Challenge Cup");
                }
            }

            var drizzleSwim = Utils.tier.hasDrizzleSwim(src);
            if (drizzleSwim.length > 0) {
                for (i = 0; i < drizzleSwim.length; i += 1) {
                    bot.sendMessage(src, "Sorry, DrizzleSwim is banned from 5th Gen OU.");
                    sys.changeTier(src, drizzleSwim[i], "5th Gen Ubers");
                }
            }
            var sandCloak = Utils.tier.hasSandCloak(src);
            if (sandCloak.length > 0) {
                for (i = 0; i < sandCloak.length; i += 1) {
                    bot.sendMessage(src, "Sorry, Sand Veil & Snow Cloak are only usable in 5th Gen Ubers.");
                    sys.changeTier(src, sandCloak[i], "5th Gen Ubers");
                }
            }

            myUser.originalName = sys.name(src);
            myUser.teamChanges += 1;

            if (myUser.teamChanges > 2) {
                if (!teamSpammers.hasOwnProperty(ip)) {
                    teamSpammers[ip] = true;
                } else {
                    bot.sendMessage(src, "You are being kicked for changing your name too often.");
                    Utils.watch.notify("Kicked " + Utils.nameIp(src) + " for change name spamming.");
                    Utils.mod.kick(src);
                    return;
                }

                sys.setTimer(function () {
                    delete teamSpammers[ip];
                }, 10000, false);
            }

            sys.setTimer(function () {
                if (myUser) {
                    myUser.teamChanges -= 1;
                }
            }, 1000, false);

            Utils.fixupTI(src);
            Utils.watch.notify(Utils.nameIp(src) + " changed teams.");
        },
        beforePlayerKick: function (src, bpl) {
            sys.stopEvent();
            if (Utils.getAuth(bpl) >= Utils.getAuth(src)) {
                bot.sendMessage(src, "You may not kick this person!");
                return;
            }

            var theirmessage = Kickmsgs[Utils.realName(src).toLowerCase()];
            var msg = Bot.kick.markup(Utils.beautifyName(src) + " kicked " + Utils.beautifyName(bpl) + "!");
            if (theirmessage) {
                msg = Emotes.interpolate(src, theirmessage.message, {
                    "{Target}": sys.name(bpl),
                    "{Color}": Utils.nameColor(src),
                    "{TColor}": Utils.nameColor(bpl)
                }, Emotes.always, false, false);
            }

            sys.sendHtmlAll(msg, 0);
            Utils.watch.notify(Utils.nameIp(src) + " kicked " + Utils.nameIp(bpl) + ".");
            Utils.mod.kick(bpl);
        },
        beforePlayerBan: function (src, bpl, time) {
            sys.stopEvent();

            if (Utils.getAuth(bpl) >= Utils.getAuth(src)) {
                bot.sendMessage(src, "You may not ban this person!");
                return;
            }

            var targetName = sys.name(bpl), timeString;
            var banMessage = (Banmsgs[Utils.realName(src).toLowerCase()] || {message: ""}).message;

            if (banMessage) {
                banMessage = Emotes.interpolate(src, banMessage, {
                    "{Target}": targetName,
                    "{Color}": Utils.nameColor(src),
                    "{TColor}": Utils.nameColor(bpl)
                }, Emotes.always, false, false);
            }

            if (time) {
                // Temporary ban.
                // Time is in minutes, and getTimeString expects seconds.
                timeString = Utils.getTimeString(time * 60);
                if (banMessage) {
                    sys.sendHtmlAll(banMessage, 0);
                } else {
                    sys.sendHtmlAll("<font color=blue><timestamp/><b>" + sys.name(src) + " banned " + Utils.escapeHtml(targetName) + " for " + timeString + "!</font></b>", 0);
                }

                Utils.watch.notify(Utils.nameIp(src) + " banned " + Utils.nameIp(bpl) + " for " + timeString + ".");
                Utils.mod.tempBan(targetName, time);
            } else {
                // Permanent ban.
                if (banMessage) {
                    sys.sendHtmlAll(banMessage, 0);
                } else {
                    sys.sendHtmlAll("<font color=blue><timestamp/><b>" + sys.name(src) + " banned " + Utils.escapeHtml(targetName) + "!</font></b>", 0);
                }

                Utils.watch.notify(Utils.nameIp(src) + " banned " + Utils.nameIp(bpl) + ".");
                Utils.mod.ban(targetName);
            }
        },
        afterChatMessage: function (src, message, chan) {
            if (!SESSION.channels(chan).bots) {
                return;
            }

            var time = sys.time(),
                srcip = sys.ip(src),
                poUser = SESSION.users(src),
                name = sys.name(src),
                ignoreFlood = Ranks.plusplus.hasMember(src),
                auth = Utils.getAuth(src),
                floodAdd = 1,
                isCommand = ["/", "!"].indexOf(message[0]) !== -1,
                limit = (chan === testchan ? 18 : 7);

            if (ignoreFlood || auth > 0) {
                return;
            }

            if (poUser.lastMessage.message === message && poUser.lastMessage.time + 20 >= time && !isCommand) {
                floodAdd = 2;
            } else if (isCommand) {
                floodAdd = 0.5;
            }

            poUser.floodCount += floodAdd;

            sys.setTimer(function () {
                if (poUser) {
                    poUser.floodCount -= 1;
                }
            }, 7 * 1000, false);

            if (poUser.floodCount > limit && !poUser.muted) {
                Utils.watch.notify(Utils.nameIp(src) + " was kicked and muted for flooding in " + Utils.clink(sys.channel(chan)) + ".");
                Bot.flood.sendMainAll(name + " was kicked and muted for flooding.", chan);
                poUser.muted = true;
                Mutes[srcip] = {
                    by: Bot.flood.name,
                    mutedname: name,
                    reason: "Flooding",
                    time: time + (5 * 60)
                };
                Utils.mod.kick(src);
                return;
            }

            if (Utils.isMCaps(message)) {
                poUser.caps += 1;

                limit = (chan === testchan ? 15 : 6);

                if (poUser.caps >= limit && !poUser.muted) {
                    Bot.caps.sendMainAll(name + " was muted for 5 minutes for CAPS.", chan);
                    poUser.muted = true;
                    poUser.caps = 0;
                    Mutes[srcip] = {
                        by: Bot.caps.name,
                        mutedname: name,
                        reason: "Caps",
                        time: time + (5 * 60)
                    };
                }
            } else if (poUser.caps > 0) {
                poUser.caps -= 1;
            }

            poUser.lastMessage = {message: message, time: time};
        },

        beforeChallengeIssued: function (src, dest) {
            Utils.watch.notify(Utils.nameIp(src) + " challenged " + Utils.nameIp(dest) + ".");
        },

        beforeBattleMatchup: function (src, dest) {
            Utils.watch.notify(Utils.nameIp(src) + " got matched up via Find Battle with " + Utils.nameIp(dest));
        }
    };

    module.reload = function () {
        commands = require('commands');
        return true;
    };
}());
