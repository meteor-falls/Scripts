(->
    commands = require("commands.js")
    sendWarningsTo = [
        "Ethan"
        "TheUnknownOne"
    ]
    sendErrorsTo = [
        "Ethan"
        "TheUnknownOne"
    ]
    ignoreNext = false
    module.exports =
        warning: (func, message, backtrace) ->
            len = sendWarningsTo.length
            id = undefined
            i = undefined
            i = 0
            while i < len
                id = sys.id(sendWarningsTo[i])
                if id and sys.isInChannel(id, 0)
                    sys.sendMessage id, "Script warning in function " + func + ": " + message, 0
                    sys.sendHtmlMessage id, backtrace.split("\n").join("<br>"), 0
                i += 1
            return

        beforeNewMessage: (message) ->
            if ignoreNext
                ignoreNext = false
                return sys.stopEvent()
            else if ignoreNextChanMsg
                
                # Don't call sys.stopEvent here
                ignoreNextChanMsg = false
                return
            return sys.stopEvent()    if message.substr(0, 8) is "[#Watch]"
            
            # Strip HTML. :]
            if Config.stripHtmlFromChannelMessages and message.substring(0, 2) is "[#"
                sys.stopEvent()
                ignoreNextChanMsg = true
                print Utils.stripHtml(message)
                return

        afterNewMessage: (message) ->
            if message is "Script Check: OK"
                sys.sendHtmlAll "<font size=4><b><font color=blue>±Scripts:</font></b> Scripts were updated!</font>"
                script.init()
                return
            if message.substr(0, 17) is "Script Error line"
                len = sendErrorsTo.length
                id = undefined
                i = undefined
                i = 0
                while i < len
                    id = sys.id(sendErrorsTo[i])
                    if id and sys.isInChannel(id, 0)
                        sys.sendMessage id, message, 0
                        sys.sendHtmlMessage id, sys.backtrace().split("\n").join("<br>"), 0
                    i += 1
            ignoreNext = true
            return

        
        #if (typeof watch !== 'undefined' && typeof watchbot !== 'undefined' && message.substr(0, 2) !== '[#' && message.substr(0, 2) !== '<f') {
        #                Utils.watch.notify(message.split("\n").join("<br>"));
        #            }
        beforeServerMessage: (message) ->
            isEval = message.substr(0, 2) is ">>"
            evalCode = undefined
            if isEval
                sys.stopEvent()
                evalCode = message.substr(2)
                print message
                try
                    print eval_(evalCode)
                catch ex
                    print ex
                    print ex.backtracetext
            return

        beforeChannelJoin: (src, channel) ->
            user = SESSION.users(src)
            basicPermissions = Utils.mod.hasBasicPermissions(src)
            
            # Allow always
            return    if SESSION.channels(channel) and (Utils.channel.isChannelMember(src, channel) or Utils.channel.hasChannelAuth(src, channel))
            
            # TODO: Auto kick
            if (channel is staffchannel and not Utils.checkFor(MegaUsers, user.originalName) and not basicPermissions) or (channel is watch and not basicPermissions)
                guard.sendMessage src, "HEY! GET AWAY FROM THERE!", 0    if sys.isInChannel(src, 0)
                
                # TODO: Remove this when autokick is implemented
                Utils.watch.notify Utils.nameIp(src) + " tried to join " + Utils.clink(sys.channel(channel)) + "!"    unless user.semuted
                sys.stopEvent()

        afterChannelCreated: (channel, cname, src) ->
            chan = SESSION.channels(channel)
            ChannelManager.populate chan
            if src
                Utils.watch.notify Utils.nameIp(src) + " created channel " + Utils.clink(cname) + "."
                if chan.creator is ""
                    chan.creator = sys.name(src)
                    ChannelManager.sync(chan, "creator").save()
            return

        beforeChannelDestroyed: (channel) ->
            if channel is staffchannel or channel is testchan or channel is watch
                sys.stopEvent()
                return
            ChannelManager.absorb(SESSION.channels(channel)).save()
            Utils.watch.notify "Channel " + Utils.clink(channel) + " was destroyed."
            return

        afterChannelJoin: (src, chan) ->
            poChan = SESSION.channels(chan)
            channelToLower = poChan.name.toLowerCase()
            topic = poChan.topic
            if topic
                topicbot.sendMessage src, topic, chan
                setbybot.sendMessage src, poChan.setBy, chan    if poChan.setBy
            Utils.watch.notify Utils.nameIp(src) + " joined " + Utils.clink(sys.channel(chan)) + "!"    if chan isnt 0
            return

        beforeLogIn: (src) ->
            srcip = sys.ip(src)
            poUser = SESSION.users(src)
            auth = sys.auth(src)
            ip = undefined
            if auth < 1
                for ip of Rangebans
                    if ip is srcip.substr(0, ip.length)
                        Utils.watch.notify "Rangebanned IP [" + srcip + "] tried to log in."
                        return sys.stopEvent()
                if reconnectTrolls.hasOwnProperty(ip)
                    Utils.watch.notify "Blocked auto-reconnect from IP " + srcip + "."
                    return sys.stopEvent()
            if auth < 3
                if Utils.hasIllegalChars(sys.name(src))
                    Utils.watch.notifyl "Blocked login for bad characters from IP " + srcip + "."
                    sys.stopEvent()

        afterLogIn: (src, defaultChan) ->
            displayBot = (name, message, color) ->
                sys.sendHtmlMessage src, "<font color='" + color + "'><timestamp/> ±<b>" + name + ":</b></font> " + message, defaultChan
                return
            poUser = SESSION.users(src)
            myName = sys.name(src)
            ip = sys.ip(src)
            myAuth = Utils.getAuth(src)
            numPlayers = sys.numPlayers()
            os = sys.os(src)
            newRecord = false
            cookie = (sys.cookie(src) or "").split(";")
            if cookie.indexOf("cockblocked") > -1
                Utils.watch.notify "Cockblocked " + Utils.nameIp(src) + "."
                poUser.autokick = true
                return sys.kick(src)
            else if cookie.indexOf("blackbagged") > -1
                Utils.watch.notify "Blackbagged " + Utils.nameIp(src) + "."
                poUser.semuted = true
            poUser.originalName = sys.name(src)
            if Utils.mod.hasBasicPermissions(src)
                sys.putInChannel src, watch    unless sys.isInChannel(src, watch)
                sys.putInChannel src, staffchannel    unless sys.isInChannel(src, staffchannel)
            if numPlayers > Reg.get("maxPlayersOnline")
                Reg.save "maxPlayersOnline", numPlayers
                newRecord = true
            sys.putInChannel src, defaultChan    unless sys.isInChannel(src, defaultChan)
            displayBot "ServerBot", "Hey, <b><font color='" + Utils.nameColor(src) + "'>" + sys.name(src) + "</font></b>!", "purple"
            displayBot "CommandBot", "Type <b>/commands</b> for a list of commands, <b>/rules</b> for a list of rules, and <b>/league</b> for the league.", "green"
            displayBot "ForumBot", "Get in touch with the community by joining the <b><a href='http://meteorfalls.us/'>Meteor Falls Forums</a></b>!", "blue"    if Reg.get("forumbotEnabled") isnt false
            displayBot "StatsBot", "There are <b>" + numPlayers + "</b> players online. You are the <b>" + nthNumber(Utils.placeCommas(src)) + "</b> player to join. At most, there were <b>" + Reg.get("maxPlayersOnline") + "</b> players online" + ((if newRecord then " (new record!)" else "")) + ".", "goldenrod"
            displayBot "UptimeBot", "The server has been up for " + Utils.fancyJoin(Utils.uptime()) + ".", "orange"    if typeof (startUpTime) is "number" and startUpTime < +sys.time()
            MOTD = Reg.get("MOTD")
            displayBot "Message of the Day", MOTD, "red"    if MOTD isnt ""
            sys.sendMessage src, ""
            Utils.mod.pruneMutes()
            if Mutes.hasOwnProperty(ip)
                myMute = Mutes[ip]
                muteStr = (if myMute.time isnt 0 then Utils.getTimeString(myMute.time - +sys.time()) else "forever")
                poUser.muted = true
                bot.sendMessage src, "You are muted for " + muteStr + ". By: " + myMute.by + ". Reason: " + myMute.reason, defaultChan
            unless poUser.muted
                hasWelcomeMessage = Welmsgs.hasOwnProperty(sys.name(src).toLowerCase())
                unless hasWelcomeMessage
                    Utils.loginMessage sys.name(src), Utils.nameColor(src)    if sys.numPlayers() < 30 and os isnt "android"
                else
                    theirmessage = Welmsgs[sys.name(src).toLowerCase()]
                    msg = (if (theirmessage) then theirmessage.message else Utils.loginMessage(sys.name(src), Utils.nameColor(src)))
                    if theirmessage
                        msg = Emotes.interpolate(src, msg,
                            "{Color}": Utils.nameColor(src)
                        , Emotes.always)
                    sys.sendHtmlAll msg, 0
            i = undefined
            drizzleSwim = Utils.tier.hasDrizzleSwim(src)
            if drizzleSwim.length > 0
                i = 0
                while i < drizzleSwim.length
                    bot.sendMessage src, "Sorry, DrizzleSwim is banned from 5th Gen OU.", defaultChan
                    sys.changeTier src, drizzleSwim[i], "5th Gen Ubers"
                    i += 1
            sandCloak = Utils.tier.hasSandCloak(src)
            if sandCloak.length > 0
                i = 0
                while i < sandCloak.length
                    bot.sendMessage src, "Sorry, Sand Veil & Snow Cloak are only usable in 5th Gen Ubers.", defaultChan
                    sys.changeTier src, sandCloak[i], "5th Gen Ubers"
                    i += 1
            team = 0

            while team < sys.teamCount(src)
                if not Utils.tier.hasOneUsablePoke(src, team) and not Utils.tier.isCCTier(sys.tier(src, team))
                    bot.sendMessage src, "Sorry, you do not have a valid team for the " + sys.tier(src, team) + " tier.", defaultChan
                    bot.sendMessage src, "You have been placed into 'Challenge Cup'.", defaultChan
                    sys.changeTier src, team, "Challenge Cup"
                team++
            tier = sys.hasTier(src, "5th Gen OU")
            Utils.tier.dreamAbilityCheck src    if tier
            tour = require("tours.js")
            if tourmode is 1
                sys.sendHtmlMessage src, "<br/><center><table width=30% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:11px; font-weight:bold;'>A <i style='color:red; font-weight:bold;'>" + tour.tourtier + "</i> tournament is in sign-up phase</font><hr width=200/><br><b><i style='color:red; font-weight:bold;'>" + tour.tourSpots() + "</i> space(s) are remaining!<br><br>Type <i style='color:red; font-weight:bold;'>/join</i> to join!</b><br/><br/></td></tr></table></center><br/>", defaultChan
            else sys.sendHtmlMessage src, "<br/><center><table width=35% bgcolor=black><tr style='background-image:url(Themes/Classic/battle_fields/new/hH3MF.jpg)'><td align=center><br/><font style='font-size:11px; font-weight:bold;'>A <i style='color:red; font-weight:bold;'>" + tour.tourtier + "</i> tournament is currently running.</font><hr width=210/><br><b>Type <i style='color:red; font-weight:bold;'>/viewround</i> to check the status of the tournament!</b><br/><br/></td></tr></table></center><br/>", defaultChan    if tourmode is 2
            Utils.watch.notify Utils.nameIp(src) + " logged in."
            return

        beforeChangeTier: (src, team, oldtier, newtier) ->
            if not Utils.tier.hasOneUsablePoke(src, team) and not Utils.tier.isCCTier(newtier)
                sys.stopEvent()
                bot.sendMessage src, "Sorry, you do not have a valid team for the " + newtier + " tier."
                bot.sendMessage src, "You have been placed into 'Challenge Cup'."
                sys.changeTier src, team, "Challenge Cup"
            drizzleSwim = Utils.tier.hasDrizzleSwim(src)
            i = undefined
            if drizzleSwim.length > 0
                i = 0
                while i < drizzleSwim.length
                    bot.sendMessage src, "Sorry, DrizzleSwim is banned from 5th Gen OU."
                    sys.changeTier src, drizzleSwim[i], "5th Gen Ubers"
                    sys.stopEvent()
                    i += 1
            sandCloak = Utils.tier.hasSandCloak(src)
            if sandCloak.length > 0
                i = 0
                while i < sandCloak.length
                    bot.sendMessage src, "Sorry, Sand Veil & Snow Cloak are only usable in 5th Gen Ubers."
                    sys.changeTier src, sandCloak[i], "5th Gen Ubers"
                    sys.stopEvent()
                    i += 1
            sys.stopEvent()    if Utils.tier.dreamAbilityCheck(src)    if newtier is "5th Gen OU"
            return

        beforeChatMessage: (src, message, chan) ->
            poUser = SESSION.users(src)
            isMuted = poUser.muted
            originalName = poUser.originalName
            isLManager = League.Managers.indexOf(originalName.toLowerCase()) > -1
            messageToLowerCase = message.toLowerCase()
            myAuth = Utils.getAuth(src)
            isOwner = myAuth is 3
            charLimit = Config.characterLimit
            if not Utils.mod.hasBasicPermissions(src) and message.length > charLimit
                sys.stopEvent()
                bot.sendMessage src, "Sorry, your message has exceeded the " + charLimit + " character limit.", chan
                
                #Utils.watch.notify("User, " + Utils.nameIp(src) + ", has tried to post a message that exceeds the " + charLimit + " character limit. Take action if need be.");
                script.afterChatMessage src, message, chan
                return
            if Utils.hasIllegalChars(message) and myAuth < 1
                bot.sendMessage src, "WHY DID YOU TRY TO POST THAT, YOU NOOB?!", chan
                Utils.watch.notify Utils.nameIp(src) + " TRIED TO POST A BAD CODE! KILL IT!"
                sys.stopEvent()
                script.afterChatMessage src, message, chan
                return
            if myAuth < 2 and isMuted
                Utils.mod.pruneMutes()
                unless Mutes.hasOwnProperty(sys.ip(src))
                    poUser.muted = false
                else
                    sys.stopEvent()
                    myMute = Mutes[sys.ip(src)]
                    muteStr = (if myMute.time isnt 0 then Utils.getTimeString(myMute.time - +sys.time()) else "forever")
                    bot.sendMessage src, "Shut up, you are muted for " + muteStr + ", by " + myMute.by + "! Reason: " + myMute.reason, chan
                    Utils.watch.message src, "Muted Message", message, chan
                    script.afterChatMessage src, message, chan
                    return
            if myAuth < 1 and muteall or myAuth < 2 and supersilence
                sys.stopEvent()
                bot.sendMessage src, "Shut up! Silence is on!", chan
                Utils.watch.message src, "Silence Message", message, chan
                script.afterChatMessage src, message, chan
                return
            
            # Strip empty character
            message = message.replace(/\ufffc/g, "")
            if message.length is 0
                Utils.watch.notify Utils.nameIp(src) + " posted an empty message but failed."
                return sys.stopEvent()
            secondchar = (message[1] or "").toLowerCase()
            if (message[0] is "/" or message[0] is "!") and message.length > 1 and secondchar >= "a" and secondchar <= "z"
                print "[#" + sys.channel(chan) + "] Command -- " + sys.name(src) + ": " + message
                sys.stopEvent()
                command = ""
                commandData = ""
                pos = message.indexOf(" ")
                commandResult = undefined
                if pos isnt -1
                    command = message.substring(1, pos).toLowerCase()
                    commandData = message.substr(pos + 1)
                else
                    command = message.substr(1).toLowerCase()
                tar = sys.id(commandData)
                try
                    if commands.canUseCommand(src, command, chan)
                        commandResult = commands.handleCommand(src, message, command, commandData, tar, chan) or 0
                        Utils.watch.message src, ((if poUser.semuted then "Secommand" else "Command")), message, chan    unless commandResult & commands.commandReturns.NOWATCH
                catch err
                    bot.sendMessage src, err + ((if err.lineNumber then " on line " + err.lineNumber else "")), chan
                    print err.backtracetext
                    Utils.watch.message src, ((if poUser.semuted then "Secommand" else "Command")), message, chan
                script.afterChatMessage src, message, chan
                return
            originalMessage = message
            sentMessage = ((if (isOwner and htmlchat) then originalMessage else Utils.escapeHtml(originalMessage, true).replace(/&lt;_&lt;/g, "<_<").replace(/&gt;_&lt;/g, ">_<").replace(/&gt;_&gt;/g, ">_>"))) # no amp
            emotes = false
            sentMessage = Utils.format(src, sentMessage)
            if Emotes.enabledFor(src) and not pewpewpew and not nightclub
                simpleMessage = sentMessage
                sentMessage = Emotes.format(sentMessage, Emotes.ratelimit, src)
                emotes = true    if simpleMessage isnt sentMessage
            sentMessage = sentMessage.replace(/<_</g, "&lt;_&lt;").replace(/>_</g, "&gt;_&lt;").replace(/<3/g, "&lt;3")
            message = sentMessage
            unless emotes
                message = lolmessage(message)    if lolmode
                message = message.split("").join(" ")    if spacemode
                message = message.toUpperCase()    if capsmode
                message = message.split("").reverse().join("")    if reversemode
                message = Utils.fisheryates(message.split("")).join("")    if scramblemode or RTD.hasEffect(src, "screech")
                message = "<b>" + Utils.nightclub.rainbowify(message, 200) + "</b>"    if colormode
            sendStr = ""
            visibleAuth = sys.auth(src) > 0 and sys.auth(src) < 4
            player = src
            name = undefined
            pids = undefined
            if nightclub
                sendStr = Utils.nightclub.format("(" + sys.name(src) + "): " + originalMessage)
            else
                if pewpewpew or RTD.hasEffect(src, "pew")
                    ids = sys.playerIds().filter((id) ->
                        sys.loggedIn(id) and id isnt src
                    )
                    player = ids[sys.rand(0, ids.length)] or src
                sendStr += "<font face='comic sans'>"    if comicmode
                sendStr += "<font color=" + Utils.nameColor(player) + "><timestamp/>"
                sendStr += "+<i>"    if visibleAuth
                name = Utils.escapeHtml(sys.name(player))
                name = "<img src='" + Emotes.code(Emotes.random()) + "'>"    if RTD.hasEffect(player, "emote_infection")
                sendStr += "<b>" + name + ":</b>"
                sendStr += "</i>"    if visibleAuth
                sendStr += "</font> "
                if RTD.hasEffect(player, "big_text")
                    sendStr += "<font size=6>"
                else sendStr += "<font size=2>"    if RTD.hasEffect(player, "small_text")
                sendStr += message
                sendStr += "</font>"    if RTD.hasEffect(player, "big_text") or RTD.hasEffect(player, "small_text")
                sendStr += "</font>"    if comicmode
            sys.stopEvent()
            if poUser.semuted
                Utils.sendHtmlSemuted sendStr, chan
                Utils.watch.message src, "Sessage", originalMessage, chan
            else
                sys.sendHtmlAll sendStr, chan
                Utils.watch.message src, "Message", originalMessage, chan    if chan isnt watch
            script.afterChatMessage src, originalMessage, chan
            return

        beforeLogOut: (src) ->
            user = SESSION.users(src)
            os = sys.os(src)
            
            # Done automatically
            # RTD.takeEffect(src);
            if sys.numPlayers() < 30 and not user.autokick and not user.muted
                Utils.logoutMessage Utils.escapeHtml(sys.name(src)), Utils.nameColor(src)    if os isnt "android"
                Utils.watch.notify Utils.nameIp(src) + " logged out."
            return

        afterChangeTeam: (src) ->
            if Utils.hasIllegalChars(sys.name(src))
                Utils.mod.kickIp sys.ip(src)
                return
            team = 0

            while team < sys.teamCount(src)
                if not Utils.tier.hasOneUsablePoke(src, team) and not Utils.tier.isCCTier(sys.tier(src, team))
                    bot.sendMessage src, "Sorry, you do not have a valid team for the " + sys.tier(src, team) + " tier."
                    bot.sendMessage src, "You have been placed into 'Challenge Cup'."
                    sys.changeTier src, team, "Challenge Cup"
                team++
            drizzleSwim = Utils.tier.hasDrizzleSwim(src)
            i = undefined
            if drizzleSwim.length > 0
                i = 0
                while i < drizzleSwim.length
                    bot.sendMessage src, "Sorry, DrizzleSwim is banned from 5th Gen OU."
                    sys.changeTier src, drizzleSwim[i], "5th Gen Ubers"
                    i += 1
            sandCloak = Utils.tier.hasSandCloak(src)
            if sandCloak.length > 0
                i = 0
                while i < sandCloak.length
                    bot.sendMessage src, "Sorry, Sand Veil & Snow Cloak are only usable in 5th Gen Ubers."
                    sys.changeTier src, sandCloak[i], "5th Gen Ubers"
                    i += 1
            myUser = SESSION.users(src)
            myUser.originalName = sys.name(src)
            myUser.teamChanges += 1
            teamChanges = myUser.teamChanges
            ip = sys.ip(src)
            if teamChanges > 2
                unless teamSpammers.hasOwnProperty(ip)
                    teamSpammers[ip] = true
                else
                    bot.sendMessage src, "You are being kicked for changing your name too often.", chan
                    Utils.watch.notify "Kicked " + Utils.nameIp(src) + " for change name spamming."
                    Utils.mod.kick src
                    return
                sys.setTimer (->
                    delete teamSpammers[ip]

                    return
                ), 10000, false
            sys.setTimer (->
                myUser.teamChanges -= 1    if myUser
                return
            ), 1000, false
            Utils.watch.notify Utils.nameIp(src) + " changed teams."
            return

        beforePlayerKick: (src, bpl) ->
            sys.stopEvent()
            if Utils.getAuth(bpl) >= Utils.getAuth(src)
                bot.sendMessage src, "You may not kick this person!"
                return
            theirmessage = Kickmsgs[Utils.realName(src).toLowerCase()]
            msg = Bot.kick.markup(Utils.beautifyName(src) + " kicked " + Utils.beautifyName(bpl) + "!")
            if theirmessage
                msg = Emotes.interpolate(src, theirmessage.message,
                    "{Target}": sys.name(bpl)
                    "{Color}": Utils.nameColor(src)
                    "{TColor}": Utils.nameColor(bpl)
                , Emotes.always, false, false)
            sys.sendHtmlAll msg, 0
            Utils.watch.notify Utils.nameIp(src) + " kicked " + Utils.nameIp(bpl) + "."
            Utils.mod.kick bpl
            return

        beforePlayerBan: (src, bpl, time) ->
            sys.stopEvent()
            if Utils.getAuth(bpl) >= Utils.getAuth(src)
                bot.sendMessage src, "You may not ban this person!"
                return
            targetName = sys.name(bpl)
            timeString = undefined
            banMessage = (Banmsgs[Utils.realName(src).toLowerCase()] or message: "").message
            if banMessage
                banMessage = Emotes.interpolate(src, banMessage,
                    "{Target}": targetName
                    "{Color}": Utils.nameColor(src)
                    "{TColor}": Utils.nameColor(bpl)
                , Emotes.always, false, false)
            if time
                
                # Temporary ban.
                # Time is in minutes, and getTimeString expects seconds.
                timeString = Utils.getTimeString(time * 60)
                if banMessage
                    sys.sendHtmlAll banMessage, 0
                else
                    sys.sendHtmlAll "<font color=blue><timestamp/><b>" + sys.name(src) + " banned " + Utils.escapeHtml(targetName) + " for " + timeString + "!</font></b>", 0
                Utils.watch.notify Utils.nameIp(src) + " banned " + Utils.nameIp(bpl) + " for " + timeString + "."
                Utils.mod.tempBan targetName, time
            else
                
                # Permanent ban.
                if banMessage
                    sys.sendHtmlAll banMessage, 0
                else
                    sys.sendHtmlAll "<font color=blue><timestamp/><b>" + sys.name(src) + " banned " + Utils.escapeHtml(targetName) + "!</font></b>", 0
                Utils.watch.notify Utils.nameIp(src) + " banned " + Utils.nameIp(bpl) + "."
                Utils.mod.ban targetName
            return

        afterChatMessage: (src, message, chan) ->
            return    unless SESSION.channels(chan).bots
            time = +sys.time()
            srcip = sys.ip(src)
            poUser = SESSION.users(src)
            limit = undefined
            ignoreFlood = Utils.checkFor(FloodIgnore, sys.name(src))
            auth = Utils.getAuth(src)
            if auth < 1 and not ignoreFlood
                poUser.floodCount = 0    if poUser.floodCount < 0
                poUser.floodCount += 1
                sys.setTimer (->
                    user = SESSION.users(src)
                    user.floodCount -= 1    if user
                    return
                ), 8 * 1000, false
                limit = ((if chan is testchan then 18 else 7))
                if poUser.floodCount > limit and not poUser.muted
                    Utils.watch.notify Utils.nameIp(src) + " was kicked and muted for flooding in " + Utils.clink(sys.channel(chan)) + "."
                    flbot.sendAll sys.name(src) + " was kicked and muted for flooding.", chan
                    poUser.muted = true
                    Mutes[srcip] =
                        by: flbot.name
                        mutedname: sys.name(src)
                        reason: "Flooding."
                        time: time + 300

                    Utils.mod.kick src
                    return
            if Utils.isMCaps(message) and auth < 1 and not ignoreFlood
                poUser.caps += 1
                limit = ((if chan is testchan then 15 else 6))
                if poUser.caps >= limit and not poUser.muted
                    capsbot.sendAll sys.name(src) + " was muted for 5 minutes for CAPS.", 0
                    poUser.muted = true
                    poUser.caps = 0
                    Mutes[srcip] =
                        by: capsbot.name
                        mutedname: sys.name(src)
                        reason: "Caps."
                        time: time + 300
            else poUser.caps -= 1    if poUser.caps > 0
            return

        beforeChallengeIssued: (src, dest) ->
            Utils.watch.notify Utils.nameIp(src) + " challenged " + Utils.nameIp(dest) + "."
            return

        beforeBattleMatchup: (src, dest, clauses, rated, mode, team1, team2) ->
            Utils.watch.notify Utils.nameIp(src) + " got matched up via Find Battle with " + Utils.nameIp(dest)
            return

    module.reload = ->
        commands = require("commands.js")
        true

    return
)()
