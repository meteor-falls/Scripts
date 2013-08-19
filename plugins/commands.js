function handleCommand(src, message, command, commandData, tar, chan) {
    var poUser = JSESSION.users(src),
        isMuted = poUser.muted,
        originalName = poUser.originalName,
        isLManager = Leaguemanager == originalName.toLowerCase(),
        myAuth = getAuth(src);

    if (CommandsOff.indexOf(command) > -1) {
        bot.sendMessage(src, '/' + command + ' is off.', chan);
        return;
    }

    watchbot.sendAll("[Channel: #" + sys.channel(chan) + " | IP: " + sys.ip(src) + "] Command -- " + html_escape(sys.name(src)) + ": " + html_escape(message), watch);

    if (command == "webcall" || command == "scriptchange" || command == "loadscript" || command == "updatescript") {
        var allowed = Config.updateperms;
        if (allowed.indexOf(originalName.toLowerCase()) == -1) {
            bot.sendMessage(src, 'You may not use /' + command + ', noob.', chan);
            return;
        }
        sys.sendHtmlAll('<font color=blue><timestamp/><b>±ScriptBot: </b></font>The scripts were webcalled by ' + sys.name(src) + '!', 0);
        if (commandData == undefined || commandData == "") {
            commandData = "https://raw.github.com/meteor-falls/Scripts/master/scripts.js";
        }

        sys.webCall(commandData, function (resp) {
            try {
                sys.changeScript(resp);
                var oldContent = sys.getFileContent("scripts.js");
                sys.writeToFile("scripts.js", resp);
                sys.writeToFile("scripts_before_webcall.js", oldContent);
            } catch (e) {
                sys.changeScript(sys.getFileContent("scripts.js"));
                bot.sendAll("Oops! " + sys.name(src) + " made a script error! Thankfully, the script recovered itself!", 0);
                bot.sendMessage(src, "The error was " + e + " on line " + e.lineNumber, chan);
            }
        });
        return;
    }
    if (command == "forcejsessionrefill") {
        var allowed = Config.updateperms;
        if (allowed.indexOf(originalName.toLowerCase()) == -1) {
            bot.sendMessage(src, 'You may not use /' + command + ', noob.', chan);
            return;
        }

        var data = JSESSION.getUserData(),
            i;

        for (i in data) {
            delete data[i];
        }

        JSESSION.refill();
        sys.sendHtmlAll('<font color=blue><timestamp/><b>±ScriptBot: </b></font>' + sys.name(src) + ' forced a JSESSION refill!', 0);
        return;
    }
    
    if (command == "togglesacredash") {
        var allowed = Config.updateperms;
        if (allowed.indexOf(originalName.toLowerCase()) == -1) {
            bot.sendMessage(src, 'You may not use /' + command + ', noob.', chan);
            return;
        }

        var toggled = '';
        
        if (SacredAsh[sys.name(src).toLowerCase()]) {
            delete SacredAsh[sys.name(src).toLowerCase()];
            toggled = 'off';
        } else {
            SacredAsh[sys.name(src).toLowerCase()] = true;
            toggled = 'on';
        }
        
        sys.sendHtmlMessage(src, '<font color=blue><timestamp/><b>±Ho-Oh: </b></font> Turned Sacred Ash ' + toggled + '.', 0);
        return;
    }
    if (command == "updatetiers" || command == "loadtiers") {
        var allowed = Config.updateperms;
        if (allowed.indexOf(originalName.toLowerCase()) == -1) {
            bot.sendMessage(src, 'You may not use /' + command + ', noob.', chan);
            return;
        }
        if (commandData == undefined || commandData == "" || (commandData.substr(0, 7) != 'http://' && commandData.substr(0, 8) != 'https://')) {
            commandData = "https://raw.github.com/meteor-falls/Server-Shit/master/tiers.xml";
        }
        sys.sendHtmlAll('<font color=blue><timestamp/><b>±TierBot: </b></font>The tiers were webcalled by ' + sys.name(src) + '!', 0);
        sys.webCall(commandData, function (resp) {
            try {
                sys.writeToFile("tiers.xml", resp);
                sys.reloadTiers();
            } catch (e) {
                bot.sendMessage(src, "Error updating tiers: " + e);
                return;
            }
        });
        return;
    }
    if (command == "leaguemanager") {
        if (originalName != 'HHT') {
            bot.sendMessage(src, 'You may not do this!', chan);
            return;
        }
        bot.sendAll(sys.name(tar) + " is now the league manager!");
        Reg.save("Leaguemanager", sys.name(tar).toLowerCase());
        Leaguemanager = sys.name(tar).toLowerCase();
        return;
    }
    if (command == "commands") {
        Lists.Commands.display(src, chan);
        return;
    }
    if (command == "usercommands") {
        Lists.User.display(src, chan);
        return;
    }
    if (command == "funcommands") {
        Lists.Fun.display(src, chan);
        return;
    }
    if (command == 'tourusercommands') {
        Lists.Tour.display(src, chan);
        return;
    }
    if (command == "megausercommands") {
        if (!poUser.megauser && myAuth < 1) {
            bot.sendMessage(src, "You need to be a megauser to view these.", chan);
            return;
        }
        Lists.Megauser.display(src, chan);
        return;
    }
    if (command == "leaguemanagercommands") {
        if (!isLManager) {
            bot.sendMessage(src, 'You need to be a league manager to view these!', chan);
            return;
        }
        Lists.LeagueManager.display(src, chan);
        return;
    }
    if (command == "modcommands") {
        if (myAuth < 1) {
            bot.sendMessage(src, "You need to be a moderator to view these!", chan);
            return;
        }
        Lists.Mod.display(src, chan);
        return;
    }
    if (command == "admincommands") {
        if (myAuth < 2) {
            bot.sendMessage(src, "You need to be an administrator to view these!", chan);
            return;
        }
        Lists.Admin.display(src, chan);
        return;
    }
    if (command == "ownercommands") {
        if (myAuth < 3) {
            bot.sendMessage(src, "You need to be an owner to view these!", chan);
            return;
        }
        Lists.Owner.display(src, chan);
        return;
    }
    if (command == "burn") {
        if (tar == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status4.png><b><font color=red><font size=3>" + html_escape(sys.name(tar)) + " was burned by " + html_escape(sys.name(src)) + " <img src=Themes/Classic/status/battle_status4.png>", chan);
        return;
    }
    if (command == "freeze") {
        if (tar == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status3.png><b><font color=blue><font size=3> " + html_escape(sys.name(tar)) + " was frozen by " + html_escape(sys.name(src)) + " <img src=Themes/Classic/status/battle_status3.png>", chan);
        return;
    }
    if (command == "paralyze") {
        if (tar == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status1.png><b><font color='#C9C909'><font size=3> " + html_escape(sys.name(tar)) + " was paralyzed by " + html_escape(sys.name(src)) + " <img src=Themes/Classic/status/battle_status1.png>", chan);
        return;
    }
    if (command == "poison") {
        if (tar == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status5.png><b><font color=Purple><font size=3> " + html_escape(sys.name(tar)) + " was poisoned by " + html_escape(sys.name(src)) + " <img src=Themes/Classic/status/battle_status5.png>", chan);
        return;
    }
    if (command == "cure") {
        if (tar == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        sys.sendHtmlAll("<img src=Themes/Classic/status/battle_status2.png><b><font color=Black><font size=3> " + html_escape(sys.name(tar)) + " was put to sleep and cured of all status problems by " + html_escape(sys.name(src)) + " <img src=Themes/Classic/status/battle_status2.png>", chan);
        return;
    }
    if (command == "facepalm") {
        sys.sendHtmlAll("<font color=blue><timestamp/><b>+FacePalmBot:</font><b><font color=" + namecolor(src) + "> " + html_escape(sys.name(src)) + "</font></b> facepalmed!", chan);
        return;
    }
    if (command == 'league') {
        var League = new CommandList("<font color=red>League</font>", "navy", "");
        League.template += "<h2><font color=green>~~Gyms~~</font></h2><ol>";

        var Gym1 = Reg.get("Gym1"),
            Gym2 = Reg.get("Gym2"),
            Gym3 = Reg.get("Gym3"),
            Gym4 = Reg.get("Gym4"),
            Gym5 = Reg.get("Gym5"),
            Gym6 = Reg.get("Gym6"),
            Gym7 = Reg.get("Gym7"),
            Gym8 = Reg.get("Gym8"),
            Elite1 = Reg.get("Elite1"),
            Elite2 = Reg.get("Elite2"),
            Elite3 = Reg.get("Elite3"),
            Elite4 = Reg.get("Elite4"),
            Champ = Reg.get("Champ");

        var isEmpty = function (varn) {
            return varn == undefined || varn == "";
        }

        if (isEmpty(Gym1)) Gym1 = "Open";
        if (isEmpty(Gym2)) Gym2 = "Open";
        if (isEmpty(Gym3)) Gym3 = "Open";
        if (isEmpty(Gym4)) Gym4 = "Open";
        if (isEmpty(Gym5)) Gym5 = "Open";
        if (isEmpty(Gym6)) Gym6 = "Open";
        if (isEmpty(Gym7)) Gym7 = "Open";
        if (isEmpty(Gym8)) Gym8 = "Open";
        if (isEmpty(Elite1)) Elite1 = "Open";
        if (isEmpty(Elite2)) Elite2 = "Open";
        if (isEmpty(Elite3)) Elite3 = "Open";
        if (isEmpty(Elite4)) Elite4 = "Open";
        if (isEmpty(Champ)) Champ = "Open";

        League.add(Gym1);
        League.add(Gym2);
        League.add(Gym3);
        League.add(Gym4);
        League.add(Gym5);
        League.add(Gym6);
        League.add(Gym7);
        League.add(Gym8);

        League.template += "</ol><br><h2><font color=blue>**Elite 4**</font></h2><ol>";

        League.add(Elite1);
        League.add(Elite2);
        League.add(Elite3);
        League.add(Elite4);
        League.template += "</ol><br><h2><font color=red>±±The Champion±±</font></h2><ul><b>" + Champ + "</b></ul>";
        League.finish();
        League.display(src, chan);
        sys.sendHtmlMessage(src, '<i><b><font color=blue>Type /leaguerules to see the rules of the league!</font>', chan);
        return;
    }
    if (command == "leaguerules") {
        Lists.LeagueRules.display(src, chan);
        return;
    }
    if (command == "superimp") {
        if (commandData == "Server") {
            bot.sendMessage(src, "You may not superimp Server!", chan);
            return;
        }
        if (commandData.length > 20) {
            bot.sendMessage(src, "The name is " + Number(commandData.length - 20) + " characters too long.", chan);
            return;
        }

        sys.sendHtmlAll('<font color=#8A2BE2><timestamp/><b>' + html_escape(sys.name(src)) + ' has super-impersonated ' + html_escape(commandData) + '!</font></b>');
        sys.changeName(src, '~~' + commandData + '~~');
        return;
    }
    if (command == "impoff") {
        if (sys.name(src) === originalName) {
            bot.sendMessage(src, "You aren't imping!", chan);
            return;
        }

        sys.sendHtmlAll('<font color=#8A2BE2><timestamp/><b>' + originalName + ' changed their name back!</font></b>', chan);
        sys.changeName(src, originalName);
        return;
    }

    if (command == "selfkick" || command == "ghostkick" || command == "sk") {
        var xlist, c;
        var ip = sys.ip(src);
        var playerIdList = PlayerIds,
            ghosts = 0;
        for (xlist in playerIdList) {
            c = playerIdList[xlist];
            if (ip == sys.ip(c)) {
                sys.kick(c);
                ghosts++;
            }
        }
        bot.sendMessage(src, ghosts + " ghosts were kicked.", chan);
        return;
    }
    if (command == "me") {
        if (commandData == undefined) {
            bot.sendMessage(src, "You must post a message.", chan);
            return;
        }
        var color = namecolor(src);
        var name = sys.name(src);
        sys.sendHtmlAll("<font color=" + color + "><timestamp/><b><i>*** " + html_escape(name) + " " + html_escape(commandData) + " ***</font></b></i>", chan);
        return;
    }
    if (command == "rules") {
        Lists.Rules.display(src, chan);
        return;
    }
    if (command == "scriptinfo") {
        sys.sendHtmlMessage(src, "<br><font color=red><timestamp/><b> ««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»</b></font><br><font color=black><timestamp/><b>Meteor Falls™ Version 0.1 Scripts</b></font><br><font color=blue><timestamp/><b>Created by: <font color=black>HHT</b></font><br><font color=green><timestamp/><b>Full Script: <a href='https://raw.github.com/meteor-falls/Scripts/master/scripts.js'>https://raw.github.com/meteor-falls/Scripts/master/scripts.js</a></b></font><br><font color=darkorange><timestamp/><b>WebCall Script:</font> <b>Not available</b><br><font color=navy><timestamp/><b>Special Thanks To:</font> <b><font color=black>TheUnknownOne, Ethan,</font> <font color=#8A2BE2>Lutra,</font> <font color=navy>Max.</b></font><br><font color=black><timestamp/><b> © HHT, 2013</b></font><br><font color=red><timestamp/><b> ««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»</b></font><br>", chan);
        return;
    }

    if (command == "emotes") {
        Lists.Emotes.display(src, chan);
        return;
    }
    if (command == "bbcode" || command == "bbcodes") {
        var BB = new CommandList("BB Code List", "navy", "Type in these BB Codes to use them:");
        var formatBB = function (m) {
            return "• " + m + " <b>-</b> " + format(0, m)
        }

        BB.add(formatBB("[b]Bold[/b]"))
        BB.add(formatBB("[i]Italics[/i]"))
        BB.add(formatBB("[s]Strike[/s]"))
        BB.add(formatBB("[u]Underline[/u]"))
        BB.add(formatBB("[sub]Subscript[/sub]"))
        BB.add(formatBB("[sup]Superscript[/sup]"))
        BB.add(formatBB("[code]Code[/code]"))
        BB.add(formatBB("[color=red]Any color[/color]"))
        BB.add(formatBB("[face=arial]Any font[/face] or [font=arial]Any font[/font]"))
        BB.add(formatBB("[spoiler]Spoiler[/spoiler]"))
        BB.add(formatBB("[link]Link[/link]"))
        BB.add("• [servername]Server Name in bold - " + Reg.get("servername").bold())
        BB.add("• [time]A timestamp - <timestamp/>");

        if (myAuth > 0) {
            BB.add(formatBB("[pre]Preformatted text[/pre]"))
            BB.add(formatBB("[size=5]Any size[/size]"))
            BB.add("• [br]Skips a line");
            BB.add("• [hr]Makes a long, solid line - <hr>");
            BB.add("• [ping]Pings everybody");
        }
        BB.finish();
        BB.display(src, chan);
        return;
    }

    if (command == "sendto" || command == "ping") {
        var r = commandData.split(':');
        var mess = cut(r, 1, ':');
        var tar = sys.id(r[0]);
        if (tar == undefined) {
            bot.sendMessage(src, "Must send the message to a real person!", chan);
            return;
        }
        if (mess == undefined || command == "ping") {
            bot.sendMessage(src, "Your ping was sent to " + html_escape(r[0]) + "!", chan);
            bot.sendMessage(tar, "<ping/>" + html_escape(sys.name(src)) + " has sent you a ping!", chan);
            return;
        }
        if (myAuth > 0 && JSESSION.users(tar).emotesOn == true) mess = emoteFormat(mess);
        else mess = html_escape(mess);
        bot.sendMessage(src, "Your message was sent!", chan);
        bot.sendMessage(tar, '<ping/>' + html_escape(sys.name(src)) + ' sent you a message! The message says: ' + mess);
        return;
    }
    if (command == "auth") {
        var authlist = sys.dbAuths().sort()
        sys.sendHtmlMessage(src, "<font color=navy><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br><font color=black><h2>Auth List</h2>", chan);
        sys.sendHtmlMessage(src, "<b><font color=red>**Owners**", chan)
        for (x in authlist) {
            if (sys.dbAuth(authlist[x]) == 3) {
                if (sys.id(authlist[x]) == undefined) {
                    sys.sendHtmlMessage(src, "<img src='Themes/Classic/client/OAway.png'><b><font color=black><font size=2> " + authlist[x], chan);
                }
                if (sys.id(authlist[x]) != undefined) {
                    sys.sendHtmlMessage(src, "<img src='Themes/Classic/client/OAvailable.png'><b><font color=black><font size=2> " + sys.name(sys.id(authlist[x])), chan);
                }
            }
        }
        sys.sendMessage(src, "", chan);
        sys.sendHtmlMessage(src, "<b><font color=blue><font size=3>**Administrators**", chan)
        for (x in authlist) {
            if (sys.dbAuth(authlist[x]) == 2) {
                if (sys.id(authlist[x]) == undefined) {
                    sys.sendHtmlMessage(src, "<img src='Themes/Classic/client/AAway.png'><b><font color=black><font size=2> " + authlist[x], chan);
                }
                if (sys.id(authlist[x]) != undefined) {
                    sys.sendHtmlMessage(src, "<img src='Themes/Classic/client/AAvailable.png'><b><font color=black><font size=2> " + sys.name(sys.id(authlist[x])), chan);
                }
            }
        }
        sys.sendMessage(src, "", chan);
        sys.sendHtmlMessage(src, "<b><font color=green><font size=3>**Moderators**", chan)
        for (x in authlist) {
            if (sys.dbAuth(authlist[x]) == 1) {
                if (sys.id(authlist[x]) == undefined) {
                    sys.sendHtmlMessage(src, "<img src='Themes/Classic/client/MAway.png'><b><font color=black><font size=2> " + authlist[x], chan);
                }
                if (sys.id(authlist[x]) != undefined) {
                    sys.sendHtmlMessage(src, "<img src='Themes/Classic/client/MAvailable.png'><b><font color=black><font size=2> " + sys.name(sys.id(authlist[x])), chan);
                }
            }
        }
        sys.sendMessage(src, "", chan);
        sys.sendHtmlMessage(src, "<font color=navy><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>", chan);
        return;
    }
    if (command == "summonauth") {
        var auths = sys.dbAuths(),
            auth_id;
        for (var x = 0; x < auths.length; x++) {
            auth_id = sys.id(auths[x]);
            if (auth_id != undefined) {
                sys.sendHtmlMessage(auth_id, "<timestamp/><b><font color=" + namecolor(src) + ">" + originalName + "</b></font> has summoned all of the auth!<ping/>");
            }
        }
        return;
    }

    if (command == "join") {
        if (tourmode != 1) {
            bot.sendMessage(src, "Sorry, you are unable to join because a tournament is not currently running or has passed the signups phase.", chan);
            return;
        }
        var name = sys.name(src).toLowerCase();
        if (tourmembers.indexOf(name.toLowerCase()) != -1) {
            bot.sendMessage(src, "Sorry, you are already in the tournament. You are not able to join more than once.", chan);
            return;
        }
        var srctier = getTier(src, tourtier);
        if (!srctier) {
            bot.sendMessage(src, "You are currently not battling in the " + tourtier + " tier. Change your tier to " + tourtier + " to be able to join.", chan);
            return;
        }
        if (script.tourSpots() > 0) {
            tourmembers.push(name);
            tourplayers[name] = sys.name(src);
            sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(sys.name(src)) + " joined the tournament! " + script.tourSpots() + " more spot(s) left!</b></font>", 0);
            if (script.tourSpots() == 0) {
                tourmode = 2;
                roundnumber = 0;
                script.roundPairing();
            }
        }
        return;
    }
    if (command == "viewround") {
        if (tourmode != 2) {
            bot.sendMessage(src, "Sorry, you are unable to view the round because a tournament is not currently running or is in signing up phase.", chan);
            return;
        }
        var myStr;
        var finals = isFinals;
        if (finals) {
            myStr = "<center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'>Finals of <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament:</font><hr width=300/>";
        } else {
            myStr = "<center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'>Round <i>" + roundnumber + "</i> of <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament!</font><hr width=300/>";
        }
        if (battlesLost.length > 0) {
            myStr += "<br><b><u>Battles Finished:</u></b><br>";
            for (var i = 0; i < battlesLost.length; i += 2) {
                myStr += battlesLost[i] + " won against " + battlesLost[i + 1] + "<br>";
            }
            myStr += "<br>";
        }
        if (tourbattlers.length > 0) {
            if (battlesStarted.indexOf(true) != -1) {
                myStr += "<br><b><u>Ongoing battles:</u></b><br>";
                for (var i = 0; i < tourbattlers.length; i += 2) {
                    if (battlesStarted[i / 2] == true) {
                        myStr += script.padd(tourplayers[tourbattlers[i]]) + " VS " + tourplayers[tourbattlers[i + 1]] + "<br>";
                    }
                }
                myStr += "<br>";
            }
            if (battlesStarted.indexOf(false) != -1) {
                myStr += "<br><b><u>Yet to start battles:</u></b><br>";
                for (var i = 0; i < tourbattlers.length; i += 2) {
                    if (battlesStarted[i / 2] == false) {
                        myStr += tourplayers[tourbattlers[i]] + " VS " + tourplayers[tourbattlers[i + 1]] + "<br>";
                    }
                }
            }
        }
        if (tourmembers.length > 0) {
            myStr += "<br><b><u>Members to the next round:</u></b><br>";
            var str = "";
            for (x in tourmembers) {
                myStr += (str.length == 0 ? "" : ", ") + tourplayers[tourmembers[x]] + "<br>";
            }
        }
        sys.sendHtmlMessage(src, myStr, chan);
        return;
    }
    if (command == "unjoin") {
        if (tourmode == 0) {
            bot.sendMessage(src, "Wait till the tournament has started.", chan);
            return;
        }
        var name2 = sys.name(src).toLowerCase();
        if (tourmembers.indexOf(name2) != -1) {
            tourmembers.splice(tourmembers.indexOf(name2), 1);
            delete tourplayers[name2];
            sys.sendHtmlAll("<font color=red><timestamp/><b>" + originalName + " left the tournament!</b></font>", 0);
            return;
        }
        if (tourbattlers.indexOf(name2) != -1) {
            battlesStarted[Math.floor(tourbattlers.indexOf(name2) / 2)] = true;
            sys.sendHtmlAll("<font color=red><timestamp/><b>" + originalName + " left the tournament!</b></font>", 0);
            script.tourBattleEnd(script.tourOpponent(name2), name2);
        }
        return;
    }
    if (command == 'tourtier') {
        if (tourmode == 0) {
            bot.sendMessage(src, "Wait till the tournament has started.", chan);
            return;
        }
        bot.sendMessage(src, 'The tier of the current tournament is ' + tourtier + '!', chan);
        return;
    }
    if (command == 'attack') {
        function randomColor(text) {
            var randColors = new Array("blue", "darkblue", "green", "darkgreen", "red", "darkred", "orange", "skyblue", "purple", "violet", "black", "lightsteelblue", "navy", "burlywood", "DarkSlateGrey", "darkviolet", "Gold", "Lawngreen", "silver");
            var selectedColor = sys.rand(0, randColors.length);

            return "<font color='" + randColors[selectedColor] + "'>" + text + "</font>";
        }
        if (tar == undefined) {
            bot.sendMessage(src, 'Target doesn\'t exist!', chan);
            return;
        }

        var move = sys.rand(1, 559);
        sys.sendHtmlAll("<font color=green><timestamp/><b><i><font color=green>+AttackBot: </i></font><b><font color=" + namecolor(src) + ">" + html_escape(sys.name(src)) + " </b><font color=black>has used <b>" + randomColor(sys.move(move)) + " </b><font color=black>on <b><font color=" + namecolor(tar) + ">" + html_escape(sys.name(tar)) + "!</font>", chan);
        return;
    }
    if (command == "emotetoggle") {
        if (myAuth < 1 && !hasEmotePerms(sys.name(src))) {
            bot.sendMessage(src, "You cannot use emotes.", chan);
            return;
        }
        var word = (hasEmotesToggled(src)) ? "off" : "on";
        bot.sendMessage(src, "Emotes are now toggled " + word + ".", chan);
        if (hasEmotesToggled(src)) {
            delete Emotetoggles[sys.name(src).toLowerCase()];
        } else {
            Emotetoggles[sys.name(src).toLowerCase()] = {};
        }
        Reg.save("Emotetoggles", JSON.stringify(Emotetoggles));
        return;
    }
    if (command == "spin") {
        if (typeof (rouletteoff) != "undefined" && rouletteoff != false) {
            bot.sendMessage(src, "Roulette has been turned off!", chan);
            return;
        }
        var num = sys.rand(1, 279);
        var numb = sys.rand(1, 646);
        var Links = ["<font color=navy><timestamp/><b>±RouletteBot: </b></font><b><font color=" + namecolor(src) + ">" + html_escape(sys.name(src)) + "</b></font> has spun a <font color=gray><b>" + sys.rand(1, 9002) + "</b></font> and won a <b><font color=red>" + sys.nature(sys.rand(1, 25)) + "</b></font> <b><font color=blue>" + sys.pokemon(numb) + "!<img src='pokemon:" + numb + "&gen=5' width='50'></b></font>", "<font color=navy><timestamp/><b>±RouletteBot: </b></font><b><font color=" + namecolor(src) + ">" + sys.name(src) + "</b></font> has spun a <font color=gray><b>" + sys.rand(1, 9002) + "</b></font> and won <b><font color=red>" + sys.item(num) + "! <img src='item:" + num + "'></b></font>"];
        sys.sendHtmlAll(Links[0], chan);
        return;
    }
    if (command == "megausers") {
        var mus = Object.keys(MegaUsers);
        if (mus.length == 0) {
            bot.sendMessage(src, "No megausers yet!", chan);
            return;
        }
        mus = MegaUsers;
        var muList = new CommandList("<font color='goldenrod'>Megausers</font>", "navy", "");
        for (var x in mus) {
            muList.add(x);
        }

        muList.finish();
        muList.display(src, chan);
        return;
    }
    if (command == "floodignorelist") {
        var mus = Object.keys(FloodIgnore);
        if (mus.length == 0) {
            bot.sendMessage(src, "No flood ignore users yet!", chan);
            return;
        }
        mus = FloodIgnore;
        var muList = new CommandList("<font color='goldenrod'>Flood Ignore Users</font>", "navy", "");
        for (var x in mus) {
            muList.add(x);
        }

        muList.finish();
        muList.display(src, chan);
        return;
    }
    if (command == "capsignorelist") {
        var mus = Object.keys(Capsignore);
        if (mus.length == 0) {
            bot.sendMessage(src, "No caps ignore users yet!", chan);
            return;
        }
        mus = Capsignore;
        var muList = new CommandList("<font color='goldenrod'>Caps Ignore Users</font>", "navy", "");
        for (var x in mus) {
            muList.add(x);
        }

        muList.finish();
        muList.display(src, chan);
        return;
    }
    if (command == "autoidlelist") {
        var mus = Object.keys(Autoidle);
        if (mus.length == 0) {
            bot.sendMessage(src, "No Auto idle users yet!", chan);
            return;
        }
        mus = Autoidle;
        var muList = new CommandList("<font color='goldenrod'>Auto Idle Users</font>", "navy", false);
        for (var x in mus) {
            muList.add(x);
        }

        muList.finish();
        muList.display(src, chan);
        return;
    }
    if (command == "emotepermlist") {
        var mus = Object.keys(Emoteperms);
        if (mus.length == 0) {
            bot.sendMessage(src, "No Emote privilege users yet!", chan);
            return;
        }
        mus = Emoteperms;
        var muList = new CommandList("<font color='goldenrod'>Emote Perm Users</font>", "navy", false);
        for (var x in mus) {
            muList.add(x);
        }
        muList.finish();
        muList.display(src, chan);
        return;
    }
    // League Manager Commands
    if (command == "gl") {
        if (!isLManager) {
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

        if (player == "" || player == undefined) {
            bot.sendAll("The gym leader " + spot + " spot has been voided.", 0);
            Reg.save("Gym" + spot, "");
            return;
        }
        bot.sendAll(player + " has been made gym leader " + spot + "!", 0);
        Reg.save("Gym" + spot, player);
        return;
    }
    if (command == "el") {
        if (!isLManager) {
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

        if (player == "" || player == undefined) {
            bot.sendAll("The elite " + spot + " spot has been voided.", 0);
            Reg.save("Elite" + spot, "");
            return;
        }
        bot.sendAll(player + " has been made elite " + spot + "!", 0);
        Reg.save("Elite" + spot, player);
        return;
    }
    if (command == "champ") {
        if (!isLManager) {
            bot.sendMessage(src, "You need to be a league manager to use this command!", chan);
            return;
        }
        if (commandData == undefined) {
            bot.sendAll("The champion spot has been voided.", 0);
            Reg.save("Champ", "");
            return;
        }
        bot.sendAll(commandData + " has been made the champion!", 0);
        Reg.save("Champ", commandData);
        return;
    }
    // MegaUser Commands
    if (poUser.megauser == false && myAuth < 1) {
        bot.sendMessage(src, "The command " + command + " doesn't exist.", chan);
        return;
    }
    if (command == "sub") {
        if (tourmode != 2) {
            bot.sendMessage(src, "Wait until a tournament starts", chan);
            return;
        }
        var players = commandData.split(':');
        if (!script.isInTourney(players[0]) && !script.isInTourney(players[1])) {
            bot.sendMessage(src, "Neither are in the tourney.", chan);
            return;
        }
        sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(players[0]) + " and " + html_escape(players[1]) + " were exchanged places in the ongoing tournament by " + html_escape(sys.name(src)) + ".</b></font>", 0);
        var p1 = players[0].toLowerCase();
        var p2 = players[1].toLowerCase();
        for (x in tourmembers) {
            if (tourmembers[x] == p1) {
                tourmembers[x] = p2;
            } else if (tourmembers[x] == p2) {
                tourmembers[x] = p1;
            }
        }
        for (x in tourbattlers) {
            if (tourbattlers[x] == p1) {
                tourbattlers[x] = p2;
                battlesStarted[Math.floor(x / 2)] = false;
            } else if (tourbattlers[x] == p2) {
                tourbattlers[x] = p1;
                battlesStarted[Math.floor(x / 2)] = false;
            }
        }
        if (!script.isInTourney(p1)) {
            tourplayers[p1] = players[0];
            delete tourplayers[p2];
        } else if (!script.isInTourney(p2)) {
            tourplayers[p2] = players[1];
            delete tourplayers[p1];
        }
        return;
    }
    if (command == "restart") {
        if (tourmode != 2) {
            bot.sendMessage(src, "Wait until a tournament starts", chan);
            return;
        }
        var name = commandData.toLowerCase();
        if (tourbattlers.indexOf(name) != -1) {
            battlesStarted[Math.floor(tourbattlers.indexOf(name) / 2)] = false;
            sys.sendHtmlAll("<font color=green><timestamp/><b>" + html_escape(sys.name(tar)) + "'s match was restarted by " + html_escape(sys.name(src)) + "!</b></font>", 0);
        }
        return;
    }
    if (command == "tour") {
        if (typeof (tourmode) != "undefined" && tourmode > 0) {
            bot.sendMessage(src, "Sorry, you are unable to start a tournament because one is still currently running.", chan);
            return;
        }
        if (commandData.indexOf(':') == -1) commandpart = commandData.split(' ');
        else commandpart = commandData.split(':');
        tournumber = parseInt(commandpart[1]);
        prize = commandpart[2];
        if (isNaN(tournumber) || tournumber <= 2) {
            bot.sendMessage(src, "You must specify a tournament size of 3 or more.", chan);
            return;
        }
        var found = true;
        if (!isTier(commandpart[0])) found = false;
        if (!found) {
            bot.sendMessage(src, "Sorry, the server does not recognise the " + commandpart[0] + " tier.", chan);
            return;
        }
        tourtier = commandpart[0];
        tourmode = 1;
        tourmembers = [];
        tourbattlers = [];
        tourplayers = [];
        battlesStarted = [];
        battlesLost = [];
        isFinals = false;
        var chans = [0];
        for (var x in chans) {
            var y = chans[x];
            if (typeof (prize) == "undefined") {
                prize = "No prize";
            }
            sys.sendHtmlAll("<br/><center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'>Tournament Started by <i style='color:red; font-weight:bold;'>" + html_escape(sys.name(src)) + "!</i></font><hr width=300/><table cellspacing=2 cellpadding=2><tr><td><b>Tier: <font style='color:red; font-weight:bold;'>" + tourtier + "</i></td></tr><tr><td><b>Players: <font style='color:red; font-weight:bold;'>" + tournumber + "</i></td></tr><tr><td><b>Prize: <font style='color:red; font-weight:bold;'>" + html_escape(prize) + "</i></td></tr></table><hr width=300/><center style='margin-right: 7px;'><b>Type <font color=red>/join</font> to join!<br/></td></tr></table></center><br/>", 0);
        }
        return;
    }
    if (command == "dq") {
        if (tourmode == 0) {
            bot.sendMessage(src, "Wait till the tournament has started.", chan);
            return;
        }
        var name2 = commandData.toLowerCase();
        if (tourmembers.indexOf(name2) != -1) {
            tourmembers.splice(tourmembers.indexOf(name2), 1);
            delete tourplayers[name2];
            sys.sendHtmlAll("<font color=red><timestamp/><b>" + html_escape(commandData) + " was disqualified by " + html_escape(sys.name(src)) + "!</b></font>", 0);
            return;
        }
        if (tourbattlers.indexOf(name2) != -1) {
            battlesStarted[Math.floor(tourbattlers.indexOf(name2) / 2)] = true;
            sys.sendHtmlAll("<font color=red><timestamp/><b>" + html_escape(commandData) + " was disqualified by " + html_escape(sys.name(src)) + "!</b></font>", 0);
            script.tourBattleEnd(script.tourOpponent(name2), name2);
        }
        return;
    }
    if (command == "push") {
        if (tourmode == 0) {
            bot.sendMessage(src, "Wait until the tournament has started.", chan);
            return;
        }
        if (sys.id(commandData) == undefined && commandData.toLowerCase() != 'sub') {
            bot.sendMessage(src, "You may only add real people or a sub!", chan);
            return;
        }
        if (script.isInTourney(commandData.toLowerCase())) {
            bot.sendMessage(src, commandData + " is already in the tournament.", chan);
            return;
        }
        if (tourmode == 2) {
            sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(commandData) + " was added to the tournament by " + html_escape(sys.name(src)) + ".</b></font>", 0);

            tourmembers.push(commandData.toLowerCase());
            tourplayers[commandData.toLowerCase()] = commandData;
        }
        if (tourmode == 1) {
            tourmembers.push(commandData.toLowerCase());
            tourplayers[commandData.toLowerCase()] = commandData;
            sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(commandData) + " was added to the tournament by " + html_escape(sys.name(src)) + ".</b></font>", 0);
        }
        if (tourmode == 1 && script.tourSpots() == 0) {
            tourmode = 2;
            roundnumber = 0;
            script.roundPairing();
        }
        return;
    }
    if (command == "changecount") {
        if (tourmode != 1) {
            bot.sendMessage(src, "Sorry, you are unable to join because the tournament has passed the sign-up phase.", chan);
            return;
        }
        var count = parseInt(commandData);
        if (isNaN(count) || count < 3) {
            bot.sendMessage(src, "Minimum amount of players is 3!", chan);
            return;
        }
        if (count < tourmembers.length) {
            bot.sendMessage(src, "There are more than that people registered", chan);
            return;
        }
        tournumber = count;
        sys.sendHtmlAll("<br/><center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'><i style='color:red; font-weight:bold;'>" + html_escape(sys.name(src)) + "</i> changed the number of entrants to <i style='color:red; font-weight:bold;'>" + count + "!</i></font><hr width=300/><br><b><i style='color:red; font-weight:bold;'>" + script.tourSpots() + "</i> more spot(s) left!</b><br/><br/></td></tr></table></center><br/>", 0);
        if (script.tourSpots() == 0) {
            tourmode = 2;
            roundnumber = 0;
            script.roundPairing();
        }
        return;
    }
    if (command == "endtour") {
        if (tourmode != 0) {
            tourmode = 0;
            sys.sendHtmlAll("<br/><center><table width=50% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:20px; font-weight:bold;'>The tour was ended by <i style='color:red; font-weight:bold;'>" + html_escape(sys.name(src)) + "!</i></font><hr width=300/><br><b>Sorry! A new tournament may be starting soon!</b><br/><br/></td></tr></table></center><br/>", 0);
        } else {
            bot.sendMessage(src, "Sorry, you are unable to end a tournament because one is not currently running.", chan);
        }
        return;
    }
    // Mod Commands   
    if (myAuth < 1) {
        bot.sendMessage(src, "The command " + command + " doesn't exist.", chan);
        return;
    }
    if (command == "emoteperms") {
        if (commandData == undefined) {
            bot.sendMessage(src, "You need to specify a user!", chan);
            return;
        }
        if (sys.dbRegistered(commandData) == false) {
            bot.sendMessage(src, "This person is not registered and will not receive permission to use emotes until they register.", chan);
            bot.sendMessage(tar, "Please register so you can receive permission to use emotes.");
            return;
        }
        if (hasEmotePerms(commandData)) {
            bot.sendAll(sys.name(src) + " revoked " + commandData + "'s permission to use emotes!");
            delete Emoteperms[commandData.toLowerCase()];
            Reg.save("Emoteperms", JSON.stringify(Emoteperms));
            return;
        }
        bot.sendAll(sys.name(src) + " has given " + commandData + " permission to use emotes!");
        Emoteperms[commandData.toLowerCase()] = true;
        Reg.save("Emoteperms", JSON.stringify(Emoteperms));
        return;
    }
    if (command == "channelkick") {
        var tar = sys.id(commandData);
        if (tar == undefined) {
            bot.sendMessage(src, "This person either does not exist or isn't logged on.", chan);
            return;
        }
        if (sys.auth(tar) >= myAuth) {
            bot.sendMessage(src, "Unable to channel kick this person.", chan);
            return;
        }
        bot.sendAll(commandData + " has been kicked from the channel!", chan);
        sys.kick(tar, chan);
        return;
    }
    if (command == "motd") {
        if (commandData == undefined) {
            bot.sendMessage(src, "Specify a message!", chan);
            return;
        }
        var MOTDmessage = commandData;

        var name = sys.name(src);
        Reg.save("MOTD", MOTDmessage);
        bot.sendAll("The MOTD has been changed by " + name + " to " + MOTDmessage + ".", 0);
        return;
    }
    if (command == "getmotd") {
        bot.sendMessage(src, "The MOTD is: " + html_escape(Reg.get("MOTD")), chan);
        return;
    }
    if (command == "cwall") {
        if (commandData == undefined) {
            bot.sendMessage(src, "Please post a message.", chan);
            return;
        }
        sys.sendHtmlAll("<br><font color=navy><font size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br>", chan);
        sys.sendHtmlAll("<font color=" + namecolor(src) + "><timestamp/>+<b><i>" + sys.name(src) + ":</b><font color=black> " + html_escape(commandData) + "<br>", chan);
        sys.sendHtmlAll("<font color=navy><font size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br>", chan);
        return;
    }
    if (command == "wall") {
        if (commandData == undefined) {
            bot.sendMessage(src, "Please post a message.", chan);
            return;
        }
        sys.sendHtmlAll("<br><font color=navy><font size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br>");
        sys.sendHtmlAll("<font color=" + namecolor(src) + "><timestamp/>+<b><i>" + sys.name(src) + ":</b><font color=black> " + html_escape(commandData) + "<br>");
        sys.sendHtmlAll("<font color=navy><font size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br>");
        return;
    }
    if (command == "message") {
        if (commandData == undefined) {
            bot.sendMessage(src, "Specify kick, ban, or welcome!", chan);
            return;
        }
        commandData = commandData.split(":");
        if (commandData[1] == undefined || commandData[1] == "") {
            bot.sendMessage(src, "Usage of this command is: [kick/ban/welcome]:[message]", chan);
            return;
        }
        var which = commandData[0];
        var message = cut(commandData, 1, ":");
        var whichl = which.toLowerCase();
        if (whichl == "kick") {
            if (Kickmsgs[sys.name(src).toLowerCase()] != undefined && message == undefined) {
                bot.sendMessage(src, "Your kick message is set to: " + html_escape(Kickmsgs[sys.name(src).toLowerCase()].message), chan);
                return;
            }
            bot.sendMessage(src, "Set kick message to: " + html_escape(message) + "!", chan);
            Kickmsgs[sys.name(src).toLowerCase()] = {
                "message": message
            };
            Reg.save("Kickmsgs", JSON.stringify(Kickmsgs));
            return;
        } else if (whichl == "welcome") {
            if (Welmsgs[sys.name(src).toLowerCase()] != undefined && message == undefined) {
                bot.sendMessage(src, "Your welcome message is set to: " + html_escape(Welmsgs[sys.name(src).toLowerCase()].message), chan);
                return;
            }
            if (Welmsgs[sys.name(src).toLowerCase()] != undefined && message == undefined) {
                bot.sendMessage(src, "Your welcome message is set to: " + html_escape(Welmsgs[sys.name(src).toLowerCase()].message), chan);
                return;
            }
            bot.sendMessage(src, "Set welcome message to: " + html_escape(message) + "!", chan);
            Welmsgs[sys.name(src).toLowerCase()] = {
                "message": message
            };
            Reg.save("Welmsgs", JSON.stringify(Welmsgs));
            return;
        } else if (whichl == "ban") {
            if (myAuth < 2) {
                bot.sendMessage(src, "You need to be a higher auth to set your ban message!", chan);
                return;
            }
            if (Banmsgs[sys.name(src).toLowerCase()] != undefined && message == undefined) {
                bot.sendMessage(src, "Your ban message is set to: " + html_escape(Banmsgs[sys.name(src).toLowerCase()].message), chan);
                return;
            }
            bot.sendMessage(src, "Set ban message to: " + html_escape(message) + "!", chan);
            Banmsgs[sys.name(src).toLowerCase()] = {
                "message": message
            };
            Reg.save("Banmsgs", JSON.stringify(Banmsgs));
            return;
        } else {
            bot.sendMessage(src, "Specify kick or ban!", chan);
            return;
        }
    }
    if (command == "removemessage") {
        var lower = commandData.toLowerCase();
        if (lower == "kick") {
            if (Kickmsgs[sys.name(src).toLowerCase()] == undefined) {
                bot.sendMessage(src, "You don't have a kick message!", chan);
                return;
            }
            delete Kickmsgs[sys.name(src).toLowerCase()];
            Reg.save("Kickmsgs", JSON.stringify(Kickmsgs));
            bot.sendMessage(src, "Kick message removed!", chan);
            return;
        } else if (lower == "ban") {
            if (Banmsgs[sys.name(src).toLowerCase()] == undefined) {
                bot.sendMessage(src, "You don't have a ban message!", chan);
                return;
            }
            delete Banmsgs[sys.name(src).toLowerCase()];
            Reg.save("Banmsgs", JSON.stringify(Banmsgs));
            bot.sendMessage(src, "Ban message removed!", chan);
            return;
        } else if (lower == "welcome") {
            if (Welmsgs[sys.name(src).toLowerCase()] == undefined) {
                bot.sendMessage(src, "You don't have a welcome message!", chan);
                return;
            }
            delete Welmsgs[sys.name(src).toLowerCase()];
            Reg.save("Welmsgs", JSON.stringify(Welmsgs));
            bot.sendMessage(src, "Welcome message removed!", chan);
            return;
        } else {
            bot.sendMessage(src, "Specify a message (kick/ban/welcome) !", chan);
            return;
        }
    }
    if (command == "sendhtmlall") {
        if (commandData == undefined) {
            bot.sendMessage(src, "Sorry, invalid message.", chan);
            return;
        }
        sys.sendHtmlAll(commandData, chan);
        return;
    }
    if (command == "sendall") {
        if (commandData == undefined) {
            bot.sendMessage(src, "Sorry, invalid message.", chan);
            return;
        }
        sys.sendAll(commandData, chan);
        return;
    }
    if (command == "addfloodignore") {
        if (sys.dbIp(commandData) == undefined) {
            bot.sendMessage(src, "Specify a real person!", chan);
            return;
        }
        var playerName = commandData.toLowerCase();
        if (playerName in FloodIgnore) {
            bot.sendMessage(src, "This person already has flood ignore!", chan);
            return;
        }
        if (sys.dbRegistered(commandData) == false) {
            bot.sendMessage(src, "This person is not registered and will not receive flood ignore until they register.", chan);
            bot.sendMessage(tar, "Please register so you can receive flood ignore.");
            return;
        }
        bot.sendMessage(src, commandData + " was added to the flood ignore list!", chan);

        FloodIgnore[playerName] = {
            "by": sys.name(src)
        };
        Reg.save("FloodIgnore", JSON.stringify(FloodIgnore));
        return;
    }
    if (command == 'capsignore') {
        if (sys.dbIp(commandData) == undefined) {
            bot.sendMessage(src, "Specify a real person!", chan);
            return;
        }
        var playerName = commandData.toLowerCase();
        if (playerName in Capsignore) {
            bot.sendMessage(src, "This person already has caps ignore!", chan);
            return;
        }
        if (sys.dbRegistered(commandData) == false) {
            bot.sendMessage(src, "This person is not registered and will not receive caps ignore until they register.", chan);
            bot.sendMessage(tar, "Please register so you can receive caps ignore.");
            return;
        }
        bot.sendMessage(src, commandData + " was added to the caps ignore list!", chan);
        Capsignore[playerName] = {
            "by": sys.name(src)
        }
        Reg.save("Capsignore", JSON.stringify(Capsignore));
        return;
    }
    if (command == "removecapsignore") {
        if (sys.dbIp(commandData) == undefined) {
            bot.sendMessage(src, "Specify a real person!", chan);
            return;
        }
        var playerName = commandData.toLowerCase();
        if (!playerName in Capsignore) {
            bot.sendMessage(src, "This person doesn't have caps ignore!", chan);
            return;
        }
        bot.sendMessage(src, commandData + " was removed from the caps ignore list!", chan);
        delete Capsignore[playerName];
        Reg.save("Capsignore", JSON.stringify(Capsignore));
        return;
    }
    if (command == "removefloodignore") {
        if (sys.dbIp(commandData) == undefined) {
            bot.sendMessage(src, "Specify a real person!", chan);
            return;
        }
        var playerName = commandData.toLowerCase();
        if (!playerName in FloodIgnore) {
            bot.sendMessage(src, "This person doesn't have flood ignore!", chan);
            return;
        }
        bot.sendMessage(src, commandData + " was removed from the flood ignore list!", chan);
        delete FloodIgnore[playerName];
        Reg.save("FloodIgnore", JSON.stringify(FloodIgnore));
        return;
    }
    if (command == "removetopic" && myAuth > 1) {
        if (Channeltopics[sys.channel(chan).toLowerCase()] == undefined) {
            bot.sendMessage(src, "This channel doesn't have a topic!", chan);
            return;
        }
        delete Channeltopics[sys.channel(chan).toLowerCase()];
        bot.sendMessage(src, "Channel topic was removed!", chan);
        return;
    }
    if (command == "changetopic") {
        if (chan == android) {
            topicbot.sendMessage(src, "Can't change the topic of the android channel!", chan);
            return;
        }
        topicbot.sendAll(sys.name(src) + " has the changed the topic of this channel to: " + commandData, chan);
        var channelToLower = sys.channel(chan).toLowerCase();
        Channeltopics[channelToLower] = {
            "by": sys.name(src),
            "topic": commandData
        }
        Reg.save("Channeltopics", JSON.stringify(Channeltopics));
        return;
    }

    if (command == "addautoidle") {
        if (sys.dbIp(commandData) == undefined) {
            bot.sendMessage(src, "Specify a real person!", chan);
            return;
        }
        var playerName = commandData.toLowerCase();
        if (playerName in Autoidle) {
            bot.sendMessage(src, "This person already has auto-idle!", chan);
            return;
        }
        bot.sendMessage(src, commandData + " was added to the auto idle list!", 0);
        Autoidle[playerName] = {
            "by": sys.name(src)
        };

        Reg.save("Autoidle", JSON.stringify(Autoidle));
        return;
    }
    if (command == "removeautoidle") {
        if (sys.dbIp(commandData) == undefined) {
            bot.sendMessage(src, "Specify a real person!", chan);
            return;
        }
        var playerName = commandData.toLowerCase();
        if (!playerName in Autoidle) {
            bot.sendMessage(src, "This person doesn't have auto-idle!", chan);
            return;
        }
        bot.sendMessage(src, commandData + " was removed from the auto idle list!", 0);
        delete Autoidle[playerName];
        Reg.save("Autoidle", JSON.stringify(Autoidle));
        return;
    }
    if (command == "mutes") {
        var mutes = Object.keys(Mutes);
        if (mutes.length == 0) {
            bot.sendMessage(src, "No one is muted.", chan);
            return;
        }
        mutes = Mutes;
        var muteList = new CommandList("Muted Players", "navy", ""),
            c_mute, time_now = sys.time() * 1;
        for (var x in mutes) {
            c_mute = mutes[x];
            muteList.add("IP: " + x + ". Muted on " + c_mute.mutedname + " by " + c_mute.by + ". Muted " + (c_mute.time === 0 ? "forever" : "for " + getTimeString(c_mute.time - time_now)));
        }

        muteList.finish();
        muteList.display(src, chan);
        return;
    }
    if (command == "tempbans") {
        var mutes = Object.keys(Tempbans);
        if (mutes.length == 0) {
            bot.sendMessage(src, "No one is temp banned.", chan);
            return;
        }
        mutes = Tempbans;
        var muteList = new CommandList("Temporarily Banned Players", "navy", ""),
            c_mute, time_now = sys.time() * 1;
        for (var x in mutes) {
            c_mute = mutes[x];
            muteList.add("IP: " + x + ". Banned on " + c_mute.bannedname + " by " + c_mute.by + ". Banned " + (c_mute.time === 0 ? "forever" : "for " + getTimeString(c_mute.time - time_now)));
        }

        muteList.finish();
        muteList.display(src, chan);
        return;
    }
    if (command == "rangebans") {
        var mutes = Object.keys(Rangebans);
        if (mutes.length == 0) {
            bot.sendMessage(src, "No one is rangebanned.", chan);
            return;
        }
        mutes = Rangebans;
        var muteList = new CommandList("IPs banned by range", "navy", ""),
            c_mute, time_now = sys.time() * 1;
        for (var x in mutes) {
            c_mute = mutes[x];
            muteList.add("IP: " + x + ". Banned by " + c_mute.by + ". Reason: " + c_mute.reason);
        }

        muteList.finish();
        muteList.display(src, chan);
        return;
    }

    if (command == 'info') {
        if (sys.dbIp(commandData) == undefined) {
            bot.sendMessage(src, 'You need to put a real person!', chan);
            return;
        }
        var tar = sys.id(commandData);
        var tarip = sys.dbIp(commandData);
        var tarauth = sys.dbAuth(commandData);
        var aliases = sys.aliases(tarip);
        var registered = sys.dbRegistered(commandData) ? "yes" : "no";
        var loggedon = sys.loggedIn(tar) ? "yes" : "no";
        sys.sendMessage(src, "", chan);
        sys.sendHtmlMessage(src, "<timestamp/><b><font color=black>±Bot:</font></b> Information of player <font color=" + namecolor(tar) + "><b>" + commandData + ":</font></b>", chan);
        sys.sendHtmlMessage(src, "<timestamp/><font color=purple><b>IP:</b></font> " + tarip, chan);
        sys.sendHtmlMessage(src, "<timestamp/><font color=black><b>Auth Level:</b></font> " + tarauth, chan)
        sys.sendHtmlMessage(src, "<timestamp/><font color=purple><b>Aliases:</b></font> " + aliases, chan);
        sys.sendHtmlMessage(src, "<timestamp/><font color=black><b>Number of aliases:</b></font> " + aliases.length, chan);
        sys.sendHtmlMessage(src, "<timestamp/><font color=purple><b>Registered:</b></font> " + registered, chan);
        sys.sendHtmlMessage(src, "<timestamp/><font color=black><b>Logged In:</b></font> " + loggedon, chan);
        if (loggedon == "no") {
            sys.sendMessage(src, "", chan);
            return;
        }
        if (loggedon == "yes") {
            var lengths;
            var arrays = [];
            var channelU = sys.channelsOfPlayer(tar);
            for (lengths in channelU) {
                arrays.push(sys.channel(channelU[lengths]));
            }
            sys.sendHtmlMessage(src, "<timestamp/><font color=purple><b>Channels of Player:</b></font> " + arrays.join(", "), chan);
            sys.sendMessage(src, "", chan);
        }
        return;
    }
    if (command == 'disable') {
        var cname = commandData.toLowerCase();
        if (CommandsOff.indexOf(cname) > -1) {
            bot.sendMessage(src, "The " + commandData + " command isn't enabled.", chan);
            return;
        }

        bot.sendAll(html_escape(sys.name(src)) + ' disabled ' + commandData + '!', 0);
        CommandsOff.push(cname);
        return;
    }
    if (command == 'enable') {
        var cname = commandData.toLowerCase();
        if (CommandsOff.indexOf(cname) == -1) {
            bot.sendMessage(src, "The " + commandData + " command isn't disabled.", chan);
            return;
        }

        bot.sendAll(html_escape(sys.name(src)) + ' re-enabled ' + commandData + '!', 0);
        CommandsOff.splice(CommandsOff.indexOf(cname), 1);
        return;
    }
    if (command == "logwarn") {
        if (tar == undefined) {
            bot.sendMessage(src, "This person doesn't exist.", chan);
            return;
        }
        if (myAuth <= getAuth(tar) && myAuth < 3) {
            bot.sendMessage(src, "Can't warn someone with higher or equal auth.", chan);
            return;
        }
        var warning = "@" + commandData + ": If you have a log over (or at) 5 lines, please use http://pastebin.com to show the log. Otherwise, you might be kicked by the Flood Bot, or muted by a Moderator/or you may be temporarily banned. This is your last warning.";
        sys.sendAll(sys.name(src) + ": " + warning, chan);
        return;
    }

    if (command == "silence") {
        if (muteall) {
            bot.sendMessage(src, "Silence is already on!", chan);
            return;
        }
        sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(sys.name(src)) + " silenced the chat!</b></font>");
        muteall = true;
        return;
    }
    if (command == "unsilence") {
        if (!muteall) {
            bot.sendMessage(src, "Silence isn't going on.", chan);
            return;
        }
        sys.sendHtmlAll("<font color=green><timestamp/><b>" + html_escape(sys.name(src)) + " ended the silence!</b></font>");
        muteall = false;
        return;
    }

    if (command == "kick" || command == "k") {
        if (commandData == undefined) {
            bot.sendMessage(src, "You can't kick nothing!", chan);
            return;
        }
        var t = commandData.split(':'),
            tar = sys.id(t[0])
            reason = t[1];

        if (tar == undefined) {
            bot.sendMessage(src, "This person doesn't exist.", chan);
            return;
        }
        if (myAuth <= getAuth(tar) && myAuth < 3) {
            bot.sendMessage(src, "Can't kick someone with higher or equal auth.", chan);
            return;
        }
        if (reason == undefined || reason == "") {
            reason = 'No reason.';
        }
        t[0] = getName(t[0]);
        var theirmessage = Kickmsgs[sys.name(src).toLowerCase()];
        var msg = (theirmessage !== undefined) ? theirmessage.message : "<font color=red><timestamp/><b>" + t[0] + " was kicked by " + html_escape(sys.name(src)) + "!";
        if (theirmessage != undefined) msg = msg.replace(/{target}/gi, t[0]);
        var treason = "<br></font></b><font color=black><timestamp/><b>Reason:</font></b> " + reason;
        sys.sendHtmlAll(msg + treason);
        kick(tar);
        return;
    }
    if (command == 'public') {
        if (!sys.isServerPrivate()) {
            sys.sendMessage(src, "~~Server~~: The server is already public.");
            sys.stopEvent();
            return;
        }
        sys.sendAll('~~Server~~: The server was made public by ' + sys.name(src) + '.');
        sys.makeServerPublic(true);
        return;
    }
    if (command == "warn" || command == "warning") {
        var parts = commandData.split(":"),
            player = parts[0],
            mess = parts[1];

        if (sys.id(player) == undefined) {
            bot.sendMessage(src, "That player isn't online.", chan);
            return;
        }

        if (mess == undefined || mess == "") {
            bot.sendMessage(src, "Please specify a reason.", chan);
            return;
        }

        bot.sendMessage(src, "Warning sent.", chan);
        sys.sendHtmlMessage(tar, "<font color=red><timestamp/><b>" + html_escape(sys.name(src)) + " warned you!", 0);
        sys.sendHtmlMessage(tar, "<font color=green><timestamp/><b>Reason:</b></font> " + html_escape(cut(parts, 1, ':')), 0);
        return;
    }
    if (command == "tempban" || command == "tb") {
        var t = commandData.split(':'),
            bantime = t[1],
            timeunit = t[2],
            reason = t[3];

        if (timeunit === undefined || timeunit == "") {
            timeunit = "minutes";
        }

        var tar = sys.id(t[0]);
        var tarip = sys.dbIp(t[0]);
        if (tarip == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        pruneTempbans();
        if (Tempbans[tarip] != undefined) {
            bot.sendMessage(src, "This person is already tempbanned.", chan);
            return;
        }
        var banlist = sys.banList(),
            a;
        for (a in banlist) {
            if (tarip == sys.dbIp(banlist[a])) {
                bot.sendMessage(src, "This person is already banned.", chan);
                return;
            }
        }
        if (getAuth(t[0]) >= myAuth) {
            bot.sendMessage(src, "You dont have sufficient auth to tempban " + commandData + ".", chan);
            return;
        }
        if (bantime == undefined) {
            bot.sendMessage(src, "Please specify a time.", chan);
            return;
        }
        if (typeof (reason) == 'undefined') {
            reason = 'No reason.';
        }
        bantime = Number(bantime);
        if (bantime == 0) {
            var time = 30,
                timestr = "30 minutes";
        } else {
            var time = stringToTime(timeunit, bantime);
            var timestr = getTimeString(time);
        }

        if (time > 86400 /* seconds */ && myAuth == 1) {
            bot.sendMessage(src, "You can only ban for a maximum of 1 day.", chan);
            return;
        }

        sys.sendHtmlAll("<font color=red><timestamp/><b> " + t[0] + " has been tempbanned by " + html_escape(sys.name(src)) + " for " + timestr + "!</font></b><br><font color=black><timestamp/><b> Reason:</b> " + reason, 0);
        if (tar !== undefined) {
            kick(tar);
        }

        Tempbans[tarip] = {
            "by": sys.name(src),
            "bannedname": commandData,
            "reason": reason,
            "time": time + sys.time() * 1
        };
        Reg.save("Tempbans", JSON.stringify(Tempbans));
        return;
    }
    if (command == "untempban") {
        var tip = sys.dbIp(commandData);
        if (tip == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        pruneTempbans();
        if (Tempbans[tip] === undefined) {
            bot.sendMessage(src, "This person isn't tempbanned.", chan);
            return;
        }
        sys.sendHtmlAll("<font color=blue><timestamp/><b> " + commandData + "'s tempban has been removed by " + html_escape(sys.name(src)) + "!</font></b>", 0);
        delete Tempbans[tip];
        Reg.save("Tempbans", JSON.stringify(Tempbans));
        return;
    }
    if (command == "mute" || command == "m") {
        var v = commandData.split(':'),
            reason = cut(v, 3, ":"),
            mutetime = v[1],
            timeunit = v[2] + '',
            tar = sys.id(v[0]),
            tarip = sys.dbIp(v[0]);

        if (tarip == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        pruneMutes();
        if (Mutes[tarip] != undefined) {
            bot.sendMessage(src, 'This person is already muted.', chan);
            return;
        }
        if (getAuth(v[0]) >= myAuth) {
            bot.sendMessage(src, "You don't have sufficient auth to mute " + v[0] + ".", chan);
            return;
        }
        if (reason == undefined || reason == "") {
            reason = 'No reason.';
        }

        var time = stringToTime(timeunit, Number(mutetime)),
            time_now = sys.time() * 1,
            trueTime = time + time_now,
            timeString = "for " + getTimeString(time);

        if (tar != undefined) {
            JSESSION.users(tar).muted = true;
        }

        if (mutetime == undefined || mutetime == 0 || mutetime == "forever") {
            trueTime = 0;
            time = 0;
            timeString = "forever";
        }

        var muteHash = {
            "by": sys.name(src),
            "reason": reason,
            "time": trueTime,
            "mutedname": v[0]
        };

        Mutes[tarip] = muteHash;
        Reg.save("Mutes", JSON.stringify(Mutes));

        sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(sys.name(src)) + " muted " + v[0] + " " + timeString + "!</b></font>");
        sys.sendHtmlAll("<font color=green><timestamp/><b>Reason:</b></font> " + reason);
        return;
    }

    if (command == "unmute") {
        var ip = sys.dbIp(commandData);
        if (ip == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        pruneMutes();
        if (Mutes[ip] == undefined) {
            bot.sendMessage(src, 'This person is not muted.', chan);
            return;
        }
        sys.sendHtmlAll("<font color=green><timestamp/><b>" + commandData + " was unmuted by " + html_escape(sys.name(src)) + "!</b></font>", 0);
        delete Mutes[ip];
        Reg.save("Mutes", JSON.stringify(Mutes));

        if (tar !== undefined) {
            JSESSION.users(tar).muted = false;
        }

        return;
    }

    if (command == "moderationcommands" || command == "moderatecommands") {
        Lists.Moderate.display(src, chan);
        return;
    }

    if (command == "partycommands" || command == "funmodcommands") {
        Lists.Party.display(src, chan);
        return;
    }
    if (command == "imp") {
        if (commandData == "Ian" && sys.name(src) == "Leskra") {
            sys.stopEvent();
            bot.sendMessage(src, "You may not superimp Ian...", chan);
            return;
        }
        sys.sendHtmlAll('<font color=#8A2BE2><timestamp/><b>' + html_escape(sys.name(src)) + ' has impersonated ' + html_escape(commandData) + '!</font></b>');
        sys.changeName(src, commandData);
        return;
    }
    if (command == "rouletteoff") {
        if (rouletteoff) {
            bot.sendMessage(src, "Roulette is already off!", chan);
            return;
        }
        sys.sendHtmlAll('<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»', chan);
        sys.sendHtmlAll('<font color=black><timestamp/><b><font color=black>' + html_escape(sys.name(src)) + ' ended the roulette game.', chan);
        sys.sendHtmlAll('<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»', chan);
        rouletteoff = true;
        return;
    }
    if (command == "roulette") {
        if (!rouletteoff) {
            bot.sendMessage(src, "Roulette is already on!", chan);
            return;
        }
        sys.sendHtmlAll('<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»', chan);
        sys.sendHtmlAll('<font color=red><timestamp/><b>A roulette game was started by <font color=black>' + html_escape(sys.name(src)) + '!', chan);
        sys.sendHtmlAll('<font color=green><timestamp/><b>Type /spin to play!', chan);
        sys.sendHtmlAll('<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»', chan);
        rouletteoff = false;
        return;
    }
    var partyCmds = ["spacemode", "capsmode", "reversemode", "lolmode", "scramblemode", "colormode", "pewpewpew"];
    for (var i = 0; i < partyCmds.length; ++i) {
        var cmdName = partyCmds[i];
        if (command == cmdName) {
            global[cmdName] = !global[cmdName];
            var word = global[cmdName] ? "on" : "off";
            var name = cmdName.indexOf("mode") > -1 ? cmdName.split("mode")[0] : cmdName;
            name = name.substr(0, 1).toUpperCase() + name.substr(1);
            bot.sendAll(name + " Mode was turned " + word + "!", 0);
            return;
        }
    }
    //Admin Commands
    if (myAuth < 2) {
        bot.sendMessage(src, "The command " + command + " doesn't exist.", chan);
        return;
    }
    if (command == "skick") {
        if (tar == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        if (myAuth <= sys.auth(tar)) {
            bot.sendMessage(src, "Sorry. Your request has been denied.", chan);
            return;
        }
        bot.sendMessage(src, "You silently kicked " + sys.name(tar) + "!", chan);
        kick(tar);
        return;
    }
    if (command == "clearpass") {
        var ip = sys.dbIp(commandData);
        if (ip == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        if (myAuth <= sys.dbAuth(commandData)) {
            bot.sendMessage(src, "You are unable to clear this person's password.", chan);
            return;
        }
        if (!sys.dbRegistered(commandData)) {
            bot.sendMessage(src, "This person isn't registered.", chan);
            return;
        }
        sys.clearPass(commandData);
        bot.sendMessage(src, commandData + "'s password has been cleared!", chan);
        return;
    }
    if (command == "rangeban" || command == "rb") {
        var rb = commandData.split(":"),
            rangeip = rb[0],
            rbreason = rb[1];
        if (rangeip == undefined) {
            sys.sendMessage(src, "Please specify a valid range.");
            return;
        }
        var lowername = originalName.toLowerCase();
        if (rbreason == undefined) {
            bot.sendMessage(src, "Please specify a reason.", chan);
            return;
        }
        var valid = function (ip) {
            if (ip.length > 8) {
                return false;
            }
            if (ip.indexOf(".") == -1) {
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

        Reg.save("Rangebans", JSON.stringify(Rangebans));

        return;
    }
    if (command == "unrangeban") {
        if (commandData == undefined) {
            bot.sendMessage(src, "Please specify a valid range.", chan);
            return;
        }
        if (Rangebans[commandData] == undefined) {
            bot.sendMessage(src, "Range isn't banned.", chan);
            return;
        }
        bot.sendMessage(src, "Rangeban removed for range: " + commandData, chan);

        delete Rangebans[commandData];
        Reg.save("Rangebans", JSON.stringify(Rangebans));
        return;
    }
    if (command == "megauser") {
        if (sys.dbIp(commandData) == undefined) {
            bot.sendMessage(src, "That person does not exist.", chan);
            return;
        }
        var playerName = commandData.toLowerCase();
        if (MegaUsers[playerName] !== undefined) {
            bot.sendMessage(src, "This person is already a megauser!", chan);
            return;
        }
        if (sys.dbRegistered(commandData) == false) {
            bot.sendMessage(src, "This person is not registered and will not receive megauser until they register.", chan);
            bot.sendMessage(tar, "Please register so you can receive megauser.");
            return;
        }

        MegaUsers[playerName] = {
            "by": sys.name(src)
        };

        bot.sendAll(commandData + ' is now a megauser!', 0);
        Reg.save("Megausers", JSON.stringify(MegaUsers));

        if (tar !== undefined) {
            JSESSION.users(tar).megauser = true;
        }

        return;
    }
    if (command == "megauseroff") {
        if (sys.dbIp(commandData) == undefined) {
            bot.sendMessage(src, "That person does not exist.", chan);
            return;
        }
        var playerName = commandData.toLowerCase();
        if (MegaUsers[playerName] == undefined) {
            bot.sendMessage(src, "This person is not a megauser!", chan);
            return;
        }
        delete MegaUsers[playerName];
        Reg.save("Megausers", JSON.stringify(MegaUsers));

        bot.sendAll(commandData + ' is no longer a megauser!', chan);
        if (tar !== undefined) {
            JSESSION.users(tar).megauser = false;
        }

        return;
    }
    if (command == "clearchat") {
        var chan = sys.channelId(commandData);
        if (chan == undefined) {
            bot.sendMessage(src, "Please specify a valid channel.", chan);
            return;
        }
        var c = 0;
        for (; c < 2999; c++) {
            sys.sendAll("", chan);
        }
        sys.sendHtmlAll("<b><font color=" + sys.getColor(src) + ">" + html_escape(sys.name(src)) + " </b></font>cleared the chat in the channel: <b><font color=red>" + sys.channel(chan) + "</b></font>!", chan);
        return;
    }
    if (command == "supersilence" || command == "+ss") {
        if (supersilence) {
            bot.sendMessage(src, "Super Silence is already on!", chan);
            return;
        }
        sys.sendHtmlAll("<font color=blue><timestamp/><b>" + html_escape(sys.name(src)) + " super silenced the chat!</b></font>");
        supersilence = true;
        return;
    }
    if (command == "-ss" || command == "unssilence" || command == "unsupersilence" || command == "supersilenceoff") {
        if (!supersilence) {
            bot.sendMessage(src, "Super Silence isn't going on.", chan);
            return;
        }
        sys.sendHtmlAll("<font color=green><timestamp/><b>" + html_escape(sys.name(src)) + " ended the super silence!</b></font>");
        supersilence = false;
        return;
    }
    if (command == 'private') {
        if (sys.isServerPrivate()) {
            sys.sendMessage(src, "~~Server~~: The server is already private.");
            sys.stopEvent();
            return;
        }
        sys.makeServerPublic(false);
        sys.sendAll('~~Server~~: The server was made private by ' + sys.name(src) + '.');
        return;
    }
    if (command == "showteam" || command == "showteams") {
        if (tar == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        var ret = [];
        ret.push("");
        for (var team = 0; team < sys.teamCount(tar); team++) {
            var toPush = "<table cellpadding=3 cellspacing=3 width='20%' border=1><tr><td><b>Team #" + (team + 1) + "</b></td></tr>";
            toPush += "<tr><td>";
            for (var i = 0; i < 6; i++) {
                var ev_result = "";
                var poke = sys.teamPoke(tar, team, i);
                var item = sys.teamPokeItem(tar, team, i);
                if (poke == 0) continue;

                toPush += "<font color=black><img src='pokemon:" + poke + "&gen=" + sys.gen(tar, team) + "'/><br>Item: <img src='item:" + item + "'/><br>";
                toPush += '<font color=black>Ability: ' + sys.ability(sys.teamPokeAbility(tar, team, i)) + "<br>";

                for (z = 0; z < 6; z++) {
                    if (sys.teamPokeEV(tar, team, i, z) != 0) {
                        var ev_append = sys.teamPokeEV(tar, team, i, z) + " " + ev_name(z) + " / ";
                        ev_result = ev_result + ev_append;
                    }
                }

                toPush += ("EVs: " + ev_result + "<br>");

                for (var j = 0; j < 4; j++) {
                    toPush += '- ' + sys.move(sys.teamPokeMove(tar, team, i, j)) + "<br>";
                }
                if (poke == sys.teamPoke(tar, team, 5)) {
                    toPush += "</td></tr>";
                    toPush += "</table>";
                    ret.push(toPush);
                }
            }
        }
        if (ret.length > 1) {
            for (var i in ret) {
                sys.sendHtmlMessage(src, ret[i], chan);
            }
        } else {
            bot.sendMessage(src, "That person doesn't have a valid team.", chan);
        }
        return;
    }
    if (command == "forcerules") {
        if (tar == undefined) {
            bot.sendMessage(src, "Must force rules to a real person!", chan);
            return;
        }
        bot.sendMessage(tar, html_escape(sys.name(src)) + " has forced the rules to you!");
        Lists.Rules.display(tar, chan);
        bot.sendMessage(src, "You have forced " + sys.name(tar) + " to read the rules!", chan);
        return;
    }
    if (command == "ban" || command == "sban") {
        if (sys.dbIp(commandData) == undefined) {
            bot.sendMessage(src, "No player exists by this name!", chan);
            return;
        }
        var ip = sys.dbIp(commandData);
        if (myAuth <= getAuth(commandData)) {
            bot.sendMessage(src, "You can't ban this person. What are you thinking!", chan);
            return;
        }
        var banlist = sys.banList(),
            a, cmdToL = commandData.toLowerCase();
        for (a in banlist) {
            if (cmdToL == banlist[a].toLowerCase()) {
                bot.sendMessage(src, "He/she's already banned!", chan);
                return;
            }
        }
        if (command == "ban") {
            commandData = getName(commandData);
            var theirmessage = Banmsgs[sys.name(src).toLowerCase()];
            var msg = (theirmessage !== undefined) ? theirmessage.message : "<font color=blue><timestamp/><b>" + commandData + ' was banned by ' + html_escape(sys.name(src)) + '!</font></b>';
            if (theirmessage != undefined) msg = msg.replace(/{target}/, commandData);
            sys.sendHtmlAll(msg);
        } else {
            sys.sendHtmlMessage(src, "<font color=blue><timestamp/> <b>You banned " + commandData + " silently!</b></font>", chan);
        }
        ban(commandData);
        return;
    }
    if (command == "unban") {
        if (sys.dbIp(commandData) == undefined) {
            bot.sendMessage(src, "No player exists by this name!", chan);
            return;
        }

        var banlist = sys.banList(),
            a, found = false;
        for (a in banlist) {
            if (sys.dbIp(commandData) == sys.dbIp(banlist[a])) {
                found = true;
                sys.unban(banlist[a]);
                sys.sendHtmlAll("<font color=blue><timestamp/><b>" + banlist[a] + " was unbanned by " + html_escape(sys.name(src)) + "!", 0);
            }
        }
        if (!found) bot.sendMessage(src, "He/she's not banned!", chan);
        return;
    }

    //Owner Commands
    if (myAuth < 3) {
        bot.sendMessage(src, "The command " + command + " doesn't exist.", chan);
        return;
    }
    if (command == "bots") {
        bots = !bots;
        var word = bots ? "on" : "off";
        bot.sendAll(sys.name(src) + " turned all bots " + word + "!", 0);
        return;
    }
    if (command == "changeauth") {
        var cmdData = commandData.split(":");
        if (cmdData.length != 2) {
            bot.sendMessage(src, "Usage: name:level", chan);
            return;
        }
        var name = cmdData[0],
            level = cmdData[1];
        if (sys.dbIp(name) == undefined) {
            bot.sendMessage(src, "Target doesn't exist!", chan);
            return;
        }
        if (parseInt(level) < 0 || parseInt(level) > 4 || isNaN(parseInt(level))) {
            bot.sendMessage(src, "Invalid level. Try 0-4", chan);
            return;
        }
        if (sys.dbRegistered(name) == false) {
            bot.sendMessage(src, "This person is not registered and will not receive auth until they register.", chan);
            bot.sendMessage(sys.id(name), "Please register so you can receive auth.");
            return;
        }
        bot.sendAll(sys.name(src) + " changed the auth level of " + name + " to " + level);
        sys.changeDbAuth(name, level);
        sys.changeAuth(sys.id(name), level);
        return;
    }
    if (command == "htmlchatoff") {
        if (htmlchatoff) {
            bot.sendMessage(src, "HTML chat is already disabled!", chan);
            return;
        }
        bot.sendMessage(src, "HTML Chat has been disabled!", chan);
        htmlchatoff = true;
        return;
    }
    if (command == "htmlchaton") {
        if (!htmlchatoff) {
            bot.sendMessage(src, "HTML chat is already enabled!", chan);
            return;
        }
        bot.sendMessage(src, "HTML chat has been re-enabled!", chan);
        htmlchatoff = false;
        return;
    }
    if (command == "dbauths") {
        sys.sendMessage(src, sys.dbAuths());
        return;
    }
    if (command == "unidle") {
        if (commandData.length < 1 || sys.id(commandData) == undefined) {
            bot.sendMessage(src, "Invalid target.", chan);
        } else {
            bot.sendMessage(src, "You have made " + commandData + " unidle.", chan);
            sys.changeAway(sys.id(commandData), false);
            return;
        }
    }
    if (command == "resetladder") {
        var tiers = sys.getTierList();
        for (var x in tiers) {
            sys.resetLadder(tiers[x]);
        }
        bot.sendAll("The entire ladder has been reset!");
        return;
    }
    if (command == "authoptions") {
        Lists.Auth.display(src, chan);
        return;
    }
    if (command == "eval") {
        if (sys.ip(src) == "127.0.0.1" || Config.evalperms.indexOf(originalName.toLowerCase()) > -1) {
            bot.sendMessage(src, "You evaluated: " + html_escape(commandData), chan);
            try {
                sys.eval(commandData);
                sys.sendHtmlMessage(src, "<timestamp/><b>Evaluation Check: </b><font color='green'>OK</font>", chan);
            } catch (error) {
                sys.sendHtmlMessage(src, "<timestamp/><b>Evaluation Check: </b><font color='red'>" + error + "</font>", chan);
            }
            return;
        }
    }

    bot.sendMessage(src, "The command " + command + " doesn't exist.", chan);
    return;
}

module.exports = {
    handle: handleCommand
};
