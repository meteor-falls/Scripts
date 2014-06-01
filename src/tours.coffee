(->
    addCommands = ->
        commandsModule = require("commands.js")
        addListCommand = commandsModule.addListCommand
        addCommand = commandsModule.addCommand
        addListCommand 0, "tourusercommands", "Tour"
        addCommand 0, "join", (src, command, commandData, tar, chan) ->
            if tourmode isnt 1
                bot.sendMessage src, "Sorry, you are unable to join because a tournament is not currently running or has passed the signups phase.", chan
                return
            name = sys.name(src).toLowerCase()
            if tourips.indexOf(sys.ip(src)) isnt -1
                bot.sendMessage src, "Sorry, you are already in the tournament. You are not able to join more than once.", chan
                return
            srctier = sys.hasTier(src, tourtier)
            unless srctier
                bot.sendMessage src, "You are currently not battling in the " + tourtier + " tier. Change your tier to " + tourtier + " to be able to join.", chan
                return
            if tourSpots() > 0
                tourmembers.push name
                tourips.push sys.ip(src)
                tourplayers[name] = sys.name(src)
                sys.sendHtmlAll "<font color=blue><timestamp/><b>" + Utils.escapeHtml(sys.name(src)) + " joined the tournament! " + tourSpots() + " more spot(s) left!</b></font>", 0
                if tourSpots() is 0
                    tourmode = 2
                    roundnumber = 0
                    roundPairing()
            return

        addCommand 0, "viewround", (src, command, commandData, tar, chan) ->
            if tourmode isnt 2
                bot.sendMessage src, "Sorry, you are unable to view the round because a tournament is not currently running or is in signing up phase.", chan
                return
            myStr = undefined
            finals = isFinals
            i = undefined
            if finals
                myStr = "<center><table width=50% bgcolor=gray><tr style='background-color:" + gradient + "'><td align=center><br/><font style='font-size:20px; font-weight:bold;'>Finals of <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament:</font><hr width=300/>"
            else
                myStr = "<center><table width=50% bgcolor=gray><tr style='background-color:" + gradient + "'><td align=center><br/><font style='font-size:20px; font-weight:bold;'>Round <i>" + roundnumber + "</i> of <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament!</font><hr width=300/>"
            if battlesLost.length > 0
                myStr += "<br><b><u>Battles Finished:</u></b><br>"
                i = 0
                while i < battlesLost.length
                    myStr += battlesLost[i] + " won against " + battlesLost[i + 1] + "<br>"
                    i += 2
                myStr += "<br>"
            if tourbattlers.length > 0
                if battlesStarted.indexOf(true) isnt -1
                    myStr += "<br><b><u>Ongoing battles:</u></b><br>"
                    i = 0
                    while i < tourbattlers.length
                        myStr += tourplayers[tourbattlers[i]] + " VS " + tourplayers[tourbattlers[i + 1]] + "<br>"    if battlesStarted[i / 2] is true
                        i += 2
                    myStr += "<br>"
                if battlesStarted.indexOf(false) isnt -1
                    myStr += "<br><b><u>Yet to start battles:</u></b><br>"
                    i = 0
                    while i < tourbattlers.length
                        myStr += tourplayers[tourbattlers[i]] + " VS " + tourplayers[tourbattlers[i + 1]] + "<br>"    if battlesStarted[i / 2] is false
                        i += 2
            if tourmembers.length > 0
                myStr += "<br><b><u>Members to the next round:</u></b><br>"
                str = ""
                x = undefined
                for x of tourmembers
                    myStr += ((if str.length is 0 then "" else ", ")) + tourplayers[tourmembers[x]] + "<br>"
            sys.sendHtmlMessage src, myStr, chan
            return

        addCommand 0, "unjoin", (src, command, commandData, tar, chan) ->
            if tourmode is 0
                bot.sendMessage src, "Wait till the tournament has started.", chan
                return
            name2 = sys.name(src).toLowerCase()
            if tourmembers.indexOf(name2) isnt -1
                tourmembers.splice tourmembers.indexOf(name2), 1
                tourips.splice tourips.indexOf(sys.ip(src)), 1
                delete tourplayers[name2]

                sys.sendHtmlAll "<font color=red><timestamp/><b>" + @originalName + " left the tournament!</b></font>", 0
                return
            if tourbattlers.indexOf(name2) isnt -1
                battlesStarted[Math.floor(tourbattlers.indexOf(name2) / 2)] = true
                sys.sendHtmlAll "<font color=red><timestamp/><b>" + @originalName + " left the tournament!</b></font>", 0
                tourBattleEnd tourOpponent(name2), name2
            return

        addCommand 0, "tourtier", (src, command, commandData, tar, chan) ->
            if tourmode is 0
                bot.sendMessage src, "Wait till the tournament has started.", chan
                return
            bot.sendMessage src, "The tier of the current tournament is " + tourtier + "!", chan
            return

        addCommand 1, "sub", ((src, command, commandData, tar, chan) ->
            if tourmode isnt 2
                bot.sendMessage src, "Wait until a tournament starts", chan
                return
            players = commandData.split(":")
            if not isInTourney(players[0]) and not isInTourney(players[1])
                bot.sendMessage src, "Neither are in the tourney.", chan
                return
            sys.sendHtmlAll "<font color=blue><timestamp/><b>" + Utils.escapeHtml(players[0]) + " and " + Utils.escapeHtml(players[1]) + " were exchanged places in the ongoing tournament by " + Utils.escapeHtml(sys.name(src)) + ".</b></font>", 0
            p1 = players[0].toLowerCase()
            p2 = players[1].toLowerCase()
            x = undefined
            for x of tourmembers
                if tourmembers[x] is p1
                    tourmembers[x] = p2
                else tourmembers[x] = p1    if tourmembers[x] is p2
            for x of tourbattlers
                if tourbattlers[x] is p1
                    tourbattlers[x] = p2
                    battlesStarted[Math.floor(x / 2)] = false
                else if tourbattlers[x] is p2
                    tourbattlers[x] = p1
                    battlesStarted[Math.floor(x / 2)] = false
            unless isInTourney(p1)
                tourplayers[p1] = players[0]
                delete tourplayers[p2]
            else unless isInTourney(p2)
                tourplayers[p2] = players[1]
                delete tourplayers[p1]
            return
        ), addCommand.flags.MEGAUSERS
        addCommand 1, "restart", ((src, command, commandData, tar, chan) ->
            if tourmode isnt 2
                bot.sendMessage src, "Wait until a tournament starts", chan
                return
            name = commandData.toLowerCase()
            if tourbattlers.indexOf(name) isnt -1
                battlesStarted[Math.floor(tourbattlers.indexOf(name) / 2)] = false
                sys.sendHtmlAll "<font color=green><timestamp/><b>" + Utils.escapeHtml(sys.name(tar)) + "'s match was restarted by " + Utils.escapeHtml(sys.name(src)) + "!</b></font>", 0
            return
        ), addCommand.flags.MEGAUSERS
        addCommand 1, "tour", ((src, command, commandData, tar, chan) ->
            if typeof tourmode isnt "undefined" and tourmode > 0
                bot.sendMessage src, "Sorry, you are unable to start a tournament because one is still currently running.", chan
                return
            commandpart = undefined
            if commandData.indexOf(":") is -1
                commandpart = commandData.split(" ")
            else
                commandpart = commandData.split(":")
            tournumber = parseInt(commandpart[1], 10)
            prize = commandpart[2]
            if isNaN(tournumber) or tournumber <= 2
                bot.sendMessage src, "You must specify a tournament size of 3 or more.", chan
                return
            unless Utils.isTier(commandpart[0])
                bot.sendMessage src, "Sorry, the server does not recognise the " + commandpart[0] + " tier.", chan
                return
            tourtier = commandpart[0]
            tourmode = 1
            tourmembers = []
            tourips = []
            tourbattlers = []
            tourplayers = []
            battlesStarted = []
            battlesLost = []
            isFinals = false
            prize = "No prize"    if typeof prize is "undefined"
            sys.sendHtmlAll "<br/><center><table width=50% bgcolor=gray><tr style='background-color:" + gradient + "'><td align=center><br/><font style='font-size:20px; font-weight:bold;'>Tournament Started by <i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(sys.name(src)) + "!</i></font><hr width=300/><table cellspacing=2 cellpadding=2><tr><td><b>Tier: <font style='color:red; font-weight:bold;'>" + tourtier + "</i></td></tr><tr><td><b>Players: <font style='color:red; font-weight:bold;'>" + tournumber + "</i></td></tr><tr><td><b>Prize: <font style='color:red; font-weight:bold;'>" + Utils.escapeHtml(prize) + "</i></td></tr></table><hr width=300/><center style='margin-right: 7px;'><b>Type <font color=red>/join</font> to join!<br/></td></tr></table></center><br/>", 0
            return
        ), addCommand.flags.MEGAUSERS
        addCommand 1, "dq", ((src, command, commandData, tar, chan) ->
            if tourmode is 0
                bot.sendMessage src, "Wait till the tournament has started.", chan
                return
            name2 = commandData.toLowerCase()
            if tourmembers.indexOf(name2) isnt -1
                tourmembers.splice tourmembers.indexOf(name2), 1
                tourips.splice tourips.indexOf(sys.dbIp(name2)), 1
                delete tourplayers[name2]

                sys.sendHtmlAll "<font color=red><timestamp/><b>" + Utils.escapeHtml(commandData) + " was disqualified by " + Utils.escapeHtml(sys.name(src)) + "!</b></font>", 0
                return
            if tourbattlers.indexOf(name2) isnt -1
                battlesStarted[Math.floor(tourbattlers.indexOf(name2) / 2)] = true
                sys.sendHtmlAll "<font color=red><timestamp/><b>" + Utils.escapeHtml(commandData) + " was disqualified by " + Utils.escapeHtml(sys.name(src)) + "!</b></font>", 0
                tourBattleEnd tourOpponent(name2), name2
            return
        ), addCommand.flags.MEGAUSERS
        addCommand 1, "push", ((src, command, commandData, tar, chan) ->
            if tourmode is 0
                bot.sendMessage src, "Wait until the tournament has started.", chan
                return
            if not sys.id(commandData) and commandData.toLowerCase() isnt "sub"
                bot.sendMessage src, "You may only add real people or a sub!", chan
                return
            if isInTourney(commandData.toLowerCase())
                bot.sendMessage src, commandData + " is already in the tournament.", chan
                return
            if tourmode is 2
                sys.sendHtmlAll "<font color=blue><timestamp/><b>" + Utils.escapeHtml(commandData) + " was added to the tournament by " + Utils.escapeHtml(sys.name(src)) + ".</b></font>", 0
                tourmembers.push commandData.toLowerCase()
                tourips.push sys.dbIp(commandData)
                tourplayers[commandData.toLowerCase()] = commandData
            else if tourmode is 1
                tourmembers.push commandData.toLowerCase()
                tourips.push sys.dbIp(commandData)
                tourplayers[commandData.toLowerCase()] = commandData
                sys.sendHtmlAll "<font color=blue><timestamp/><b>" + Utils.escapeHtml(commandData) + " was added to the tournament by " + Utils.escapeHtml(sys.name(src)) + ".</b></font>", 0
            if tourmode is 1 and tourSpots() is 0
                tourmode = 2
                roundnumber = 0
                roundPairing()
            return
        ), addCommand.flags.MEGAUSERS
        addCommand 1, "changecount", ((src, command, commandData, tar, chan) ->
            if tourmode isnt 1
                bot.sendMessage src, "Sorry, you are unable to join because the tournament has passed the sign-up phase.", chan
                return
            count = parseInt(commandData, 10)
            if isNaN(count) or count < 3
                bot.sendMessage src, "Minimum amount of players is 3!", chan
                return
            if count < tourmembers.length
                bot.sendMessage src, "There are more than that people registered", chan
                return
            tournumber = count
            sys.sendHtmlAll "<br/><center><table width=50% bgcolor=gray><tr style='background-color:" + gradient + "'><td align=center><br/><font style='font-size:20px; font-weight:bold;'><i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(sys.name(src)) + "</i> changed the number of entrants to <i style='color:red; font-weight:bold;'>" + count + "!</i></font><hr width=300/><br><b><i style='color:red; font-weight:bold;'>" + tourSpots() + "</i> more spot(s) left!</b><br/><br/></td></tr></table></center><br/>", 0
            if tourSpots() is 0
                tourmode = 2
                roundnumber = 0
                roundPairing()
            return
        ), addCommand.flags.MEGAUSERS
        addCommand 1, "endtour", ((src, command, commandData, tar, chan) ->
            if tourmode isnt 0
                tourmode = 0
                sys.sendHtmlAll "<br/><center><table width=50% bgcolor=gray><tr style='background-color:" + gradient + "'><td align=center><br/><font style='font-size:20px; font-weight:bold;'>The tour was ended by <i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(sys.name(src)) + "!</i></font><hr width=300/><br><b>Sorry! A new tournament may be starting soon!</b><br/><br/></td></tr></table></center><br/>", 0
            else
                bot.sendMessage src, "Sorry, you are unable to end a tournament because one is not currently running.", chan
            return
        ), addCommand.flags.MEGAUSERS
        return
    tourSpots = ->
        tournumber - tourmembers.length
    isInTourney = (name) ->
        tourplayers.hasOwnProperty name.toLowerCase()
    tourOpponent = (nam) ->
        name = nam.toLowerCase()
        x = tourbattlers.indexOf(name)
        if x isnt -1
            if x % 2 is 0
                return tourbattlers[x + 1]
            else
                return tourbattlers[x - 1]
        ""
    areOpponentsForTourBattle = (src, dest) ->
        isInTourney(sys.name(src)) and isInTourney(sys.name(dest)) and tourOpponent(sys.name(src)) is sys.name(dest).toLowerCase()
    areOpponentsForTourBattle2 = (src, dest) ->
        isInTourney(src) and isInTourney(dest) and tourOpponent(src) is dest.toLowerCase()
    ongoingTourneyBattle = (name) ->
        tourbattlers.indexOf(name.toLowerCase()) isnt -1 and battlesStarted[Math.floor(tourbattlers.indexOf(name.toLowerCase()) / 2)] is true
    tourBattleEnd = (src, dest) ->
        return    if not areOpponentsForTourBattle2(src, dest) or not ongoingTourneyBattle(src)
        battlesLost.push src
        battlesLost.push dest
        srcL = src.toLowerCase()
        destL = dest.toLowerCase()
        battlesStarted.splice Math.floor(tourbattlers.indexOf(srcL) / 2), 1
        tourbattlers.splice tourbattlers.indexOf(srcL), 1
        tourbattlers.splice tourbattlers.indexOf(destL), 1
        tourmembers.push srcL
        delete tourplayers[destL]

        str = ""
        if tourbattlers.length isnt 0 or tourmembers.length > 1
            str = "<br/><center><table width=50% bgcolor=gray><tr style='background-color:" + gradient + "'><td align=center><br/><font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>B</font>attle <font style='font-size:25px;'>C</font>ompleted!</font><hr width=300/><br>"
            str += "<b><i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(Utils.toCorrectCase(src)) + "</i> won their battle and moves on to the next round.<br><br><i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(Utils.toCorrectCase(dest)) + "</i> lost their battle and is out of the tournament.</b>"
        if tourbattlers.length > 0
            str += "<br><hr width=300/><br><i style='color:red; font-weight:bold;'>" + tourbattlers.length / 2 + "</i>  battle(s) remaining!"
            str += "<br/><br/></td></tr></table></center><br/>"
            sys.sendHtmlAll str, 0
            return
        sys.sendHtmlAll str + "<br/><br/></td></tr></table></center><br/>", 0    if str.length > 0
        roundPairing()
        return
    roundPairing = ->
        roundnumber += 1
        battlesStarted = []
        tourbattlers = []
        battlesLost = []
        if tourmembers.length is 1
            sys.sendHtmlAll "<br/><center><table width=50% bgcolor=gray><tr style='background-color:" + gradient + "'><td align=center><br/><font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>C</font>ongratulations, <i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(tourplayers[tourmembers[0]]) + "!</i></font><hr width=300/><br><b>You won the tournament! You win " + prize + "!</b><br/><br/></td></tr></table></center><br/>", 0
            tourmode = 0
            isFinals = false
            return
        str = undefined
        finals = tourmembers.length is 2
        unless finals
            str = "<br/><center><table width=50% bgcolor=gray><tr style='background-color:" + gradient + "'><td align=center><br/><font style='font-size:20px; font-weight:bold;'>Round <i>" + roundnumber + "</i> of <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament!</font><hr width=300/><i>Current Matchups</i><br/><b>"
        else
            isFinals = true
            str = "<br/><center><table width=50% bgcolor=gray><tr style='background-color:" + gradient + "'><td align=center><br/><font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>F</font>inals of <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament!</font><hr width=300/><i>Matchup</i><br/><b>"
        players = sys.playerIds()
        i = 0
        inTour = undefined
        player = undefined
        j = undefined
        len = undefined
        while tourmembers.length >= 2
            i += 1
            x1 = sys.rand(0, tourmembers.length)
            tourbattlers.push tourmembers[x1]
            name1 = tourplayers[tourmembers[x1]]
            tourmembers.splice x1, 1
            x1 = sys.rand(0, tourmembers.length)
            tourbattlers.push tourmembers[x1]
            name2 = tourplayers[tourmembers[x1]]
            tourmembers.splice x1, 1
            battlesStarted.push false
            str += Utils.escapeHtml(name1) + " vs " + Utils.escapeHtml(name2) + "<br/>"
        str += "</b><br/><i>" + Utils.escapeHtml(tourplayers[tourmembers[0]]) + " is randomly selected to go next round!<br/>"    if tourmembers.length > 0
        str += "<br/></td></tr></table></center><br/>"
        j = 0
        len = players.length

        while j < len
            player = players[j]
            continue    unless sys.loggedIn(player)
            inTour = tourplayers.indexOf(sys.name(player)) > -1
            if inTour
                sys.changeAway player, false
                bot.sendMessage player, "You have been unidled for the tournament.", 0
            sys.sendHtmlMessage player, str + ((if inTour then "<ping/>" else "")), 0
            j += 1
        return
    gradient = "qlineargradient(spread:pad, x1:0.432, y1:0.692955, x2:0.145, y2:1, stop:0 rgba(139, 191, 228, 255), stop:1 rgba(189, 221, 246, 255))"
    tourmode = 0    if typeof (tourmode) isnt "number"
    events =
        beforeChallengeIssued: (src, dest) ->
            if tourmode is 2
                name1 = sys.name(src)
                name2 = sys.name(dest)
                if isInTourney(name1)
                    if isInTourney(name2)
                        if tourOpponent(name1) isnt name2.toLowerCase()
                            bot.sendMessage src, "This guy isn't your opponent in the tourney."
                            sys.stopEvent()
                            return
                    else
                        bot.sendMessage src, "This guy isn't your opponent in the tourney."
                        sys.stopEvent()
                        return
                    if not sys.hasTier(src, tourtier) or not sys.hasTier(sys.id(name2), tourtier)
                        bot.sendMessage src, "You must be both in the tier " + tourtier + " to battle in the tourney."
                        sys.stopEvent()
                        return
                else
                    if isInTourney(name2)
                        bot.sendMessage src, "This guy is in the tournament and you are not, so you can't battle him/her."
                        sys.stopEvent()
                        return

        beforeBattleMatchup: (src, dest, clauses, rated, mode, team1, team2) ->
            if tourmode is 2 and (isInTourney(sys.name(src)) or isInTourney(sys.name(dest)))
                sys.stopEvent()
                return

        afterBattleStarted: (src, dest, info, id, t1, t2) ->
            battlesStarted[Math.floor(tourbattlers.indexOf(sys.name(src).toLowerCase()) / 2)] = true    if sys.hasTier(src, tourtier) and sys.hasTier(dest, tourtier)    if areOpponentsForTourBattle(src, dest)    if tourmode is 2
            return

        afterBattleEnded: (src, dest, desc) ->
            return    if tourmode isnt 2 or desc is "tie"
            tourBattleEnd sys.name(src), sys.name(dest)
            return

    module.reload = ->
        addCommands()
        true

    module.exports = events
    module.exports.addCommands = addCommands
    if tourmode > 0
        module.exports.tourSpots = tourSpots
        module.exports.tourtier = tourtier
    return
)()
