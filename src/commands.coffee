(->
    addCommand = (authLevel, name, callback, flags) ->
        
        # Proper checks
        if typeof authLevel isnt "number" and typeof authLevel isnt "object"
            print "Error: command " + name + " doesn't have a minimum auth level."
            return
        if (typeof name isnt "string") and (typeof name isnt "object")
            print "Error: unknown command without name."
            return
        if typeof callback isnt "function"
            print "Error: command " + name + " doesn't have a callback."
            return
        names = [].concat(name)
        len = undefined
        i = undefined
        i = 0
        len = names.length

        while i < len
            commands[names[i]] =
                authLevel: authLevel
                callback: callback
                flags: flags or 0
            i += 1
        return
    
    # Shorthands
    addListCommand = (auth, names, listname, cb, flags) ->
        addCommand auth, names, ((src, command, commandData, tar, chan) ->
            return    if cb and not cb.call(this, src, command, commandData, tar, chan)
            Lists[listname].display src, chan
            return
        ), flags
        return
    addMaintainerCommand = (names, cb, flags) ->
        addCommand 3, names, cb, (flags or 0) | addCommand.flags.MAINTAINERS
        return
    addCheatCode = (names, cb, flags) ->
        addCommand -1, names, cb, (flags or 0) | addCommand.flags.MAINTAINERS | addCommand.flags.HIDDEN
        return
    addChannelModCommand = (names, cb, flags) ->
        addCommand 1, names, cb, (flags or 0) | addCommand.flags.CHANNELMODS
        return
    addChannelAdminCommand = (names, cb, flags) ->
        addCommand 2, names, cb, (flags or 0) | addCommand.flags.CHANNELADMINS
        return
    addChannelOwnerCommand = (names, cb, flags) ->
        addCommand 3, names, cb, (flags or 0) | addCommand.flags.CHANNELOWNERS
        return
    canUseCommand = (src, command, chan) ->
        throw "The command " + command + " doesn't exist."    unless commands.hasOwnProperty(command)
        srcauth = Utils.getAuth(src)
        poUser = SESSION.users(src)
        name = poUser.originalName
        cmd = commands[command]
        commandFlags = addCommand.flags
        return true    if Config.maintainers.indexOf(name) isnt -1
        
        # Previous if would have returned true if the player is a maintainer.
        return false    if cmd.flags & commandFlags.MAINTAINERS
        return true    if (cmd.flags & commandFlags.MEGAUSERS) and Utils.checkFor(MegaUsers, name)
        return true    if (cmd.flags & commandFlags.CHANNELMODS) and Utils.channel.isChannelMod(src, chan)
        return true    if (cmd.flags & commandFlags.CHANNELADMINS) and Utils.channel.isChannelAdmin(src, chan)
        return true    if (cmd.flags & commandFlags.CHANNELOWNERS) and Utils.channel.isChannelOwner(src, chan)
        if cmd.authLevel
            if (typeof cmd.authLevel is "number" and (cmd.authLevel > srcauth or cmd.authLevel is -1)) or (Array.isArray(cmd.authLevel) and cmd.authLevel.indexOf(poUser.originalName) is -1)
                if cmd.flags & commandFlags.HIDDEN
                    throw "The command " + command + " doesn't exist."
                else
                    throw "You need to be a higher auth to use this command."
        throw "The command " + command + " has been disabled."    if disabledCmds.indexOf(command.toLowerCase()) > -1 and srcauth < 1
        true
    handleCommand = (src, message, command, commandData, tar, chan) ->
        poUser = SESSION.users(src)
        originalName = poUser.originalName
        myAuth = Utils.getAuth(src)
        cmd = commands[command]
        if typeof cmd.callback is "function"
            return cmd.callback.call(
                poUser: poUser
                originalName: originalName
                isLManager: (League.Managers.indexOf(originalName.toLowerCase()) > -1)
                myAuth: myAuth
                semuted: poUser.semuted
            , src, command, commandData, tar, chan, message)
        0
    commands = {}
    disabledCmds = []
    commandReturns = NOWATCH: 0x1
    addCommand.flags =
        MAINTAINERS: 0x1
        MEGAUSERS: 0x2
        CHANNELMODS: 0x4
        CHANNELADMINS: 0x8
        CHANNELOWNERS: 0x10
        HIDDEN: 0x20

    
    ###
    USER COMMANDS
    ###
    addListCommand 0, "commands", "Commands"
    addListCommand 0, "usercommands", "User"
    addListCommand 0, "funcommands", "Fun"
    addListCommand 1, "megausercommands", "Megauser", null, addCommand.flags.MEGAUSERS
    addListCommand 0, "leaguemanagercommands", "LeagueManager", (src, command, commandData, tar, chan) ->
        unless @isLManager
            bot.sendMessage src, "You need to be a league manager to view these!", chan
            return false
        true

    addListCommand 0, "channelcommands", "Channel"
    addListCommand 0, "chanmodcommands", "ChanMod"
    addListCommand 0, "chanadmincommands", "ChanAdmin"
    addListCommand 0, "chanownercommands", "ChanOwner"
    addCommand 0, "vote", (src, command, commandData, tar, chan) ->
        return bot.sendMessage(src, "There is no poll right now.", chan)    unless Poll.active
        option = parseInt(commandData, 10) - 1
        option = -1    if isNaN(option)
        unless Poll.options[option]
            return bot.sendMessage(src, "There is no such option as " + (option + 1) + " available.", chan)
        else return bot.sendMessage(src, "As starter of the poll, you aren't allowed to vote.", chan)    if Poll.by is sys.name(src)
        ip = sys.ip(src)
        return bot.sendMessage(src, "You can't vote for the same thing twice. Vote for something else to change your vote!", chan)    if ip of Poll.votes and Poll.votes[ip] is option
        bot.sendMessage src, "You voted for option #" + (option + 1) + ": " + Poll.options[option], chan
        if ip of Poll.votes
            bot.sendAll sys.name(src) + " changed their vote!", chan
        else
            bot.sendAll sys.name(src) + " voted!", chan
        Poll.votes[ip] = option
        return

    addCommand 0, "burn", (src, command, commandData, tar, chan) ->
        broadcast = (if @semuted then Utils.sendHtmlSemuted else sys.sendHtmlAll)
        unless tar
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        broadcast "<img src=Themes/Classic/status/battle_status4.png><b><font color=red><font size=3>" + Utils.escapeHtml(sys.name(tar)) + " was burned by " + Utils.escapeHtml(sys.name(src)) + " <img src=Themes/Classic/status/battle_status4.png>", chan
        return

    addCommand 0, "freeze", (src, command, commandData, tar, chan) ->
        broadcast = (if @semuted then Utils.sendHtmlSemuted else sys.sendHtmlAll)
        unless tar
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        broadcast "<img src=Themes/Classic/status/battle_status3.png><b><font color=blue><font size=3> " + Utils.escapeHtml(sys.name(tar)) + " was frozen by " + Utils.escapeHtml(sys.name(src)) + " <img src=Themes/Classic/status/battle_status3.png>", chan
        return

    addCommand 0, "paralyze", (src, command, commandData, tar, chan) ->
        broadcast = (if @semuted then Utils.sendHtmlSemuted else sys.sendHtmlAll)
        unless tar
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        broadcast "<img src=Themes/Classic/status/battle_status1.png><b><font color='#C9C909'><font size=3> " + Utils.escapeHtml(sys.name(tar)) + " was paralyzed by " + Utils.escapeHtml(sys.name(src)) + " <img src=Themes/Classic/status/battle_status1.png>", chan
        return

    addCommand 0, "poison", (src, command, commandData, tar, chan) ->
        broadcast = (if @semuted then Utils.sendHtmlSemuted else sys.sendHtmlAll)
        unless tar
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        broadcast "<img src=Themes/Classic/status/battle_status5.png><b><font color=Purple><font size=3> " + Utils.escapeHtml(sys.name(tar)) + " was poisoned by " + Utils.escapeHtml(sys.name(src)) + " <img src=Themes/Classic/status/battle_status5.png>", chan
        return

    addCommand 0, "cure", (src, command, commandData, tar, chan) ->
        broadcast = (if @semuted then Utils.sendHtmlSemuted else sys.sendHtmlAll)
        unless tar
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        broadcast "<img src=Themes/Classic/status/battle_status2.png><b><font color=Black><font size=3> " + Utils.escapeHtml(sys.name(tar)) + " was put to sleep and cured of all status problems by " + Utils.escapeHtml(sys.name(src)) + " <img src=Themes/Classic/status/battle_status2.png>", chan
        return

    addCommand 0, "league", (src, command, commandData, tar, chan) ->
        LeagueTemplate = new CommandList("<font color=red>League</font>", "navy", "")
        LeagueTemplate.template += "<h2><font color=green>~~Gyms~~</font></h2><ol>"
        LeagueTemplate.add League.Gym1 or "Open"
        LeagueTemplate.add League.Gym2 or "Open"
        LeagueTemplate.add League.Gym3 or "Open"
        LeagueTemplate.add League.Gym4 or "Open"
        LeagueTemplate.add League.Gym5 or "Open"
        LeagueTemplate.add League.Gym6 or "Open"
        LeagueTemplate.add League.Gym7 or "Open"
        LeagueTemplate.add League.Gym8 or "Open"
        LeagueTemplate.template += "</ol><br><h2><font color=blue>**Elite 4**</font></h2><ol>"
        LeagueTemplate.add League.Elite1 or "Open"
        LeagueTemplate.add League.Elite2 or "Open"
        LeagueTemplate.add League.Elite3 or "Open"
        LeagueTemplate.add League.Elite4 or "Open"
        LeagueTemplate.template += "</ol><br><h2><font color=red>±±The Champion±±</font></h2><ul><b>" + (League.Champ or "Open") + "</b></ul>"
        LeagueTemplate.finish()
        LeagueTemplate.display src, chan
        sys.sendHtmlMessage src, "<i><b><font color=blue>Type /leaguerules to see the rules of the league!</font>", chan
        return

    addListCommand 0, "leaguerules", "LeagueRules"
    addCommand 0, [
        "selfkick"
        "ghostkick"
        "sk"
    ], (src, command, commandData, tar, chan) ->
        xlist = undefined
        c = undefined
        ip = sys.ip(src)
        playerIdList = sys.playerIds()
        ghosts = 0
        for xlist of playerIdList
            c = playerIdList[xlist]
            if ip is sys.ip(c) and sys.loggedIn(c) and c isnt src
                sys.kick c
                ghosts += 1
        bot.sendMessage src, ghosts + " ghosts were kicked.", chan
        return

    addCommand 0, "me", (src, command, commandData, tar, chan) ->
        broadcast = (if @semuted then Utils.sendHtmlSemuted else sys.sendHtmlAll)
        return bot.sendMessage(src, "You must post a message.", chan)    unless commandData
        broadcast "<font color=" + Utils.nameColor(src) + "><timestamp/><b><i>*** " + Utils.escapeHtml(sys.name(src)) + " " + Utils.escapeHtml(commandData) + " ***</font></b></i>", chan
        return

    addListCommand 0, "rules", "Rules"
    addListCommand 0, "emotes", "EmoteList"
    addCommand 0, "scriptinfo", (src, command, commandData, tar, chan) ->
        
        #"<font color=green><timestamp/><b>Full Script: <a href='http://meteor-falls.github.io/Scripts/scripts.js'>http://meteor-falls.github.io/Scripts/scripts.js</a></b></font>",
        #"<font color=darkorange><timestamp/><b>Auto-Update Script:</font> <b><a href='http://meteor-falls.github.io/Scripts/webcall.js'>http://meteor-falls.github.io/Scripts/webcall.js</a></b>",
        sys.sendHtmlMessage src, [
            ""
            "<font color=red><timestamp/><b> ««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»</b></font>"
            "<font color=black><timestamp/><b>Meteor Falls™ v0.10 Scripts</b></font>"
            "<font color=blue><timestamp/><b>Created By:</b></font> <b><font color=navy>[VP]Blade</font>, <font color=#00aa7f>TheUnknownOne</font>, Ethan</b>"
            "<font color=skyblue><timestamp/> <b>Maintainers:</b></font> " + Config.maintainers.join(", ") + "."
            "<font color=navy><timestamp/><b>Special Thanks To:</b></font> <b><font color=#8A2BE2>Lutra,</font> <font color=navy>Max</b></font>"
            "<font color=black><timestamp/><b> © <a href='http://meteorfalls.us/forums/'>Meteor Falls</a> 2014 [MIT license] </b></font>"
            "<font color=red><timestamp/><b> ««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»</b></font><br>"
        ].join("<br>"), chan
        return

    
    # TODO: Move to lists.js
    addCommand 0, [
        "bbcode"
        "bbcodes"
    ], (src, command, commandData, tar, chan) ->
        BB = new CommandList("BB Code List", "navy", "Type in these BB Codes to use them:")
        formatBB = (m) ->
            m + " <b>-</b> " + Utils.format(0, m)

        BB.add formatBB("[b]Bold[/b]")
        BB.add formatBB("[i]Italics[/i]")
        BB.add formatBB("[s]Strike[/s]")
        BB.add formatBB("[u]Underline[/u]")
        BB.add formatBB("[sub]Subscript[/sub]")
        BB.add formatBB("[sup]Superscript[/sup]")
        BB.add formatBB("[code]Code[/code]")
        BB.add formatBB("[color=red]Any color[/color]")
        BB.add formatBB("[face=arial]Any font[/face] or [font=arial]Any font[/font]")
        BB.add formatBB("[spoiler]Spoiler[/spoiler]")
        
        #BB.add(formatBB("[link]Link[/link]"));
        if Utils.mod.hasBasicPermissions(src)
            BB.add formatBB("[pre]Preformatted text[/pre]")
            BB.add formatBB("[size=5]Any size[/size]")
            BB.add "[br]Skips a line"
            BB.add "[hr]Makes a long, solid line - <hr>"
            BB.add "[ping]Pings everybody"
        BB.finish()
        BB.display src, chan
        return

    addCommand 0, [
        "sendto"
        "ping"
    ], (src, command, commandData, tar, chan) ->
        r = commandData.split(":")
        mess = Utils.cut(r, 1, ":")
        tar = sys.id(r[0])
        unless tar
            bot.sendMessage src, "Must send the message to a real person!", chan
            return
        broadcasting = not @semuted or (@semuted and SESSION.users(tar).semuted)
        unless mess
            bot.sendMessage src, "Your ping was sent to " + Utils.escapeHtml(r[0]) + "!", chan
            bot.sendMessage tar, "<ping/>" + Utils.escapeHtml(sys.name(src)) + " has sent you a ping!", chan    if broadcasting
            return
        mess = Utils.escapeHtml(mess)
        mess = Emotes.format(mess, Emotes.ratelimit, src)    if Emotes.enabledFor(src)
        bot.sendMessage src, "Your message was sent!", chan
        bot.sendMessage tar, "<ping/>" + Utils.escapeHtml(sys.name(src)) + " sent you a message! The message says: " + mess    if broadcasting
        return

    addCommand 0, "auth", (src, command, commandData, tar, chan) ->
        outputName = (type) ->
            (name) ->
                id = sys.id(name)
                if id
                    sys.sendHtmlMessage src, "<img src=\"Themes/Classic/Client/" + type + "Available.png\"> <b><font size=\"2\">" + Utils.toCorrectCase(name) + "</font></b>", chan
                else
                    sys.sendHtmlMessage src, "<img src=\"Themes/Classic/Client/" + type + "Away.png\"> <b><font size=\"2\">" + name + "</font></b>", chan
                return
        authlist = sys.dbAuths().sort()
        auths = {}
        dbAuth = undefined
        name = undefined
        len = undefined
        i = undefined
        i = 0
        len = authlist.length

        while i < len
            name = authlist[i]
            dbAuth = sys.dbAuth(name)
            auths[dbAuth] = auths[dbAuth] or []
            auths[dbAuth].push name
            i += 1
        sys.sendHtmlMessage src, "<font color=navy><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br><font color=black><h2>Auth List</h2>", chan
        sys.sendHtmlMessage src, "<b><font color=red>**Owners**", chan
        auths[3].forEach outputName("O")    if auths.hasOwnProperty("3")
        sys.sendMessage src, "", chan
        sys.sendHtmlMessage src, "<b><font color=blue><font size=3>**Administrators**", chan
        auths[2].forEach outputName("A")    if auths.hasOwnProperty("2")
        sys.sendMessage src, "", chan
        sys.sendHtmlMessage src, "<b><font color=green><font size=3>**Moderators**", chan
        auths[1].forEach outputName("M")    if auths.hasOwnProperty("1")
        sys.sendMessage src, "", chan
        sys.sendHtmlMessage src, "<font color=navy><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>", chan
        return

    addCommand 0, "attack", (src, command, commandData, tar, chan) ->
        broadcast = (if @semuted then Utils.sendHtmlSemuted else sys.sendHtmlAll)
        unless tar
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        move = sys.rand(1, 559)
        broadcast "<font color=green><timestamp/><b><i>+AttackBot:</i></b></font> <b style='color:" + Utils.nameColor(src) + ">" + Utils.escapeHtml(sys.name(src)) + " </b> has used <b style='color:" + Utils.color.randomDark() + "'>" + sys.move(move) + "</b> on <b style='color:" + Utils.nameColor(tar) + ">" + Utils.escapeHtml(sys.name(tar)) + "!</b>", chan
        return

    addCommand 0, "emotetoggle", (src, command, commandData, tar, chan) ->
        if @myAuth < 1 and not Emotes.hasPermission(sys.name(src))
            bot.sendMessage src, "You cannot use emotes.", chan
            return
        toggled = Emotes.enabledFor(src)
        word = ((if toggled then "off" else "on"))
        if toggled
            delete Emotetoggles[sys.name(src).toLowerCase()]
        else
            Emotetoggles[sys.name(src).toLowerCase()] = true
        Reg.save "Emotetoggles", Emotetoggles
        bot.sendMessage src, "Emotes are now toggled " + word + ".", chan
        return

    addCommand 0, "spin", (src, command, commandData, tar, chan) ->
        unless rouletteon
            bot.sendMessage src, "Roulette has been turned off!", chan
            return
        num = sys.rand(1, 279)
        numb = sys.rand(1, 646)
        emotes = Object.keys(Emotes.list)
        randomEmote = emotes[Math.floor(Math.random() * emotes.length)]
        broadcast = (if @semuted then Utils.sendHtmlSemuted else sys.sendHtmlAll)
        possibilities = []
        possibilities.push "<b><font color=" + Utils.nameColor(src) + ">" + Utils.escapeHtml(sys.name(src)) + "</b></font> has spun a <font color=gray><b>" + sys.rand(1, 9002) + "</b></font> and won a <b><font color=red>" + sys.nature(sys.rand(1, 25)) + "</b></font> <b><font color=blue>" + sys.pokemon(numb) + "!<img src='icon:" + numb + "'></b></font>"    if spinTypes.indexOf("pokemons") isnt -1
        possibilities.push "<b><font color=" + Utils.nameColor(src) + ">" + sys.name(src) + "</b></font> has spun a <font color=gray><b>" + sys.rand(1, 9002) + "</b></font> and won <b><font color=red>" + sys.item(num) + "! <img src='item:" + num + "'></b></font>"    if spinTypes.indexOf("items") isnt -1
        possibilities.push "<b><font color=" + Utils.nameColor(src) + ">" + sys.name(src) + "</b></font> has spun a <font color=gray><b>" + sys.rand(1, 9002) + "</b></font> and won <img src='" + Emotes.list[randomEmote] + "'>!"    if spinTypes.indexOf("emotes") isnt -1
        possibilities.push "<b><font color=" + Utils.nameColor(src) + ">" + sys.name(src) + "</b></font> has spun a <font color=gray><b>" + sys.rand(1, 9002) + "</b></font> and won <img src='trainer:" + sys.rand(1, 301) + "'>!"    if (spinTypes.indexOf("avatars") isnt -1) or (spinTypes.indexOf("trainers") isnt -1)
        broadcast "<font color=navy><timestamp/><b>±RouletteBot:</b></font> " + possibilities[sys.rand(0, possibilities.length)], chan
        return

    addCommand 0, "rtd", (src, command, commandData, tar, chan) ->
        effect = undefined
        return bot.sendMessage(src, "You can't use RTD for another " + Utils.getTimeString(RTD.getPlayer(src).at + RTD.getPlayer(src).cooldown - +sys.time()) + ".", chan)    if RTD.cooldownFor(src) > 0
        effect = RTD.giveEffect(src)
        rtdbot.sendAll RTD.rollString(src, effect), 0
        Utils.watch.notify sys.name(src) + " rolled " + RTD.effects[effect].name + "."
        return

    addCommand 0, "megausers", (src, command, commandData, tar, chan) ->
        keys = Object.keys(MegaUsers)
        list = undefined
        if keys.length is 0
            bot.sendMessage src, "There are no megausers.", chan
            return
        list = new TableList("Megausers", "cornflowerblue", 2, 5, "navy")
        list.addEvery keys, false, 10
        list.finish()
        list.display src, chan
        return

    addCommand 0, "floodignorelist", (src, command, commandData, tar, chan) ->
        keys = Object.keys(FloodIgnore)
        list = undefined
        if keys.length is 0
            bot.sendMessage src, "There are no flood ignores.", chan
            return
        list = new TableList("Flood Ignores", "cornflowerblue", 2, 5, "navy")
        list.addEvery keys, false, 10
        list.finish()
        list.display src, chan
        return

    addCommand 0, "emotepermlist", (src, command, commandData, tar, chan) ->
        keys = Object.keys(Emoteperms)
        list = undefined
        if keys.length is 0
            bot.sendMessage src, "There are no emote perm users.", chan
            return
        list = new TableList("Emote Permission", "cornflowerblue", 2, 5, "navy")
        list.addEvery keys, false, 10
        list.finish()
        list.display src, chan
        return

    addCommand 0, "players", (src, command, commandData, tar, chan) ->
        commandData = commandData.toLowerCase()    if commandData
        if [
            "windows"
            "linux"
            "android"
            "mac"
            "webclient"
        ].indexOf(commandData) isnt -1
            count = 0
            sys.playerIds().forEach (id) ->
                count += 1    if sys.os(id) is commandData
                return

            bot.sendMessage src, "There are  " + count + " " + commandData + " players online.", chan
            return
        bot.sendMessage src, "There are " + sys.numPlayers() + " players online.", chan
        return

    addCommand 0, "gl", (src, command, commandData, tar, chan) ->
        unless @isLManager
            bot.sendMessage src, "You need to be a league manager to use this command!", chan
            return
        parts = commandData.split(":")
        player = parts[0]
        spot = Math.round(Number(parts[1]))
        if isNaN(spot) or spot < 1 or spot > 8
            bot.sendMessage src, "Valid range for gym leaders is 1-8.", chan
            return
        unless player
            bot.sendAll "The gym leader " + spot + " spot has been voided.", 0
            League["Gym" + spot] = ""
            Reg.save "League", League
            return
        bot.sendAll player + " has been made gym leader " + spot + "!", 0
        League["Gym" + spot] = player
        Reg.save "League", League
        return

    addCommand 0, "el", (src, command, commandData, tar, chan) ->
        unless @isLManager
            bot.sendMessage src, "You need to be a league manager to use this command!", chan
            return
        parts = commandData.split(":")
        player = parts[0]
        spot = Math.round(Number(parts[1]))
        if isNaN(spot) or spot < 1 or spot > 4
            bot.sendMessage src, "Valid range for the elite is 1-4.", chan
            return
        unless player
            bot.sendAll "The elite " + spot + " spot has been voided.", 0
            League["Elite" + spot] = ""
            Reg.save "League", League
            return
        bot.sendAll player + " has been made elite " + spot + "!", 0
        League["Elite" + spot] = player
        Reg.save "League", League
        return

    addCommand 0, "champ", (src, command, commandData, tar, chan) ->
        unless @isLManager
            bot.sendMessage src, "You need to be a league manager to use this command!", chan
            return
        unless commandData
            bot.sendAll "The champion spot has been voided.", 0
            League.Champ = ""
            Reg.save "League", League
            return
        bot.sendAll commandData + " has been made the champion!", 0
        League.Champ = commandData
        Reg.save "League", League
        return

    
    ###
    CHANNEL COMMANDS *
    ###
    addCommand 0, "cauth", (src, command, commandData, tar, chan) ->
        sortByLevel = (level) ->
            (name) ->
                poChan.auth[name] is level
        poChan = SESSION.channels(chan)
        return bot.sendMessage(src, "There are no channel auth right now.", chan)    if Object.keys(poChan.auth).length is 0
        auths = []
        i = undefined
        for i of poChan.auth
            auths.push i
        bot.sendMessage src, "Channel auth for " + sys.channel(chan) + ":", chan
        bot.sendMessage src, "Channel owners: " + Utils.beautifyNames(auths.filter(sortByLevel(3))), chan
        bot.sendMessage src, "Channel admins: " + Utils.beautifyNames(auths.filter(sortByLevel(2))), chan
        bot.sendMessage src, "Channel mods: " + Utils.beautifyNames(auths.filter(sortByLevel(1))), chan
        return

    addCommand 0, "topic", (src, command, commandData, tar, chan) ->
        poChan = SESSION.channels(chan)
        return bot.sendMessage(src, "There is no topic right now.", chan)    unless poChan.topic
        topicbot.sendMessage src, poChan.topic, chan
        setbybot.sendMessage src, poChan.setBy, chan    if poChan.setBy
        return

    addChannelModCommand "topicsource", (src, command, commandData, tar, chan) ->
        poChan = SESSION.channels(chan)
        return bot.sendMessage(src, "There is no topic right now.", chan)    unless poChan.topic
        topicbot.sendMessage src, Utils.escapeHtml(poChan.topic), chan
        setbybot.sendMessage src, poChan.setBy, chan    if poChan.setBy
        return

    addChannelModCommand "changetopic", (src, command, commandData, tar, chan) ->
        poChan = SESSION.channels(chan)
        unless commandData
            return bot.sendMessage(src, "There is no topic, no point in resetting it!", chan)    unless poChan.topic
            poChan.topic = ""
            poChan.setBy = ""
            ChannelManager.sync(poChan, "topic").sync(poChan, "setBy").save()
            bot.sendAll Utils.beautifyName(src) + " has reset the channel topic!", chan
        else
            poChan.topic = commandData
            poChan.setBy = SESSION.users(src).originalName
            ChannelManager.sync(poChan, "topic").sync(poChan, "setBy").save()
            bot.sendAll Utils.beautifyName(src) + " has set the channel topic to:", chan
            bot.sendAll commandData, chan
        return

    addChannelModCommand "channelkick", (src, command, commandData, tar, chan) ->
        unless tar
            bot.sendMessage src, "This person either does not exist or isn't logged on.", chan
            return
        if (Utils.channel.channelAuth(src, chan) <= Utils.channel.channelAuth(tar, chan)) and (Utils.getAuth(src) <= Utils.getAuth(tar))
            bot.sendMessage src, "This person cannot be kicked because they have either higher or equal channel auth.", chan
            return
        bot.sendAll Utils.beautifyName(src) + " kicked " + Utils.beautifyName(tar) + " from " + sys.channel(chan) + "!", chan
        sys.kick tar, chan
        return

    addChannelOwnerCommand "cchangeauth", (src, command, commandData, tar, chan) ->
        poChan = SESSION.channels(chan)
        parts = commandData.split(":")
        name = parts[0]
        auth = parseInt(parts[1], 10)
        return bot.sendMessage(src, "This person does not exist.", chan)    unless sys.dbIp(name)
        return bot.sendMessage(src, "That doesn't look like a valid number.", chan)    if isNaN(auth)
        return bot.sendMessage(src, "The auth level should be 0 or higher, but not any higher than 3.", chan)    if auth < 0 or auth > 3
        unless sys.dbRegistered(name)
            bot.sendMessage src, "This person is not registered and will not receive auth until they register.", chan
            bot.sendMessage sys.id(name), "Please register so you can receive auth."    if sys.id(name)
            return
        if auth is 0
            delete poChan.auth[name.toLowerCase()]
        else
            poChan.auth[name.toLowerCase()] = auth
        ChannelManager.sync(poChan, "auth").save()
        bot.sendAll Utils.beautifyName(src) + " changed the channel auth level of " + Utils.beautifyName(name) + " to " + auth + ".", chan
        return

    
    ###
    MEGAUSER COMMANDS *
    ###
    addCommand 0, "message", ((src, command, commandData, tar, chan) ->
        unless commandData
            bot.sendMessage src, "Specify kick, ban, or welcome!", chan
            return
        commandData = commandData.split(":")
        unless commandData[1]
            bot.sendMessage src, "Usage of this command is: [kick/mute/ban/welcome]:[message]", chan
            return
        which = commandData[0]
        message = Utils.cut(commandData, 1, ":")
        whichl = which.toLowerCase()
        srcname = sys.name(src).toLowerCase()
        if whichl is "kick"
            bot.sendMessage src, "Set kick message to: " + Utils.escapeHtml(message) + "!", chan
            Kickmsgs[srcname] = message: message
            Reg.save "Kickmsgs", Kickmsgs
        else if whichl is "mute"
            if message.toLowerCase().indexOf("{duration}") is -1
                bot.sendMessage src, "Your mute message needs to contain the mute duration, use {Duration}.", chan
                return
            bot.sendMessage src, "Set mute message to: " + Utils.escapeHtml(message) + "!", chan
            Mutemsgs[srcname] = message: message
            Reg.save "Mutemsgs", Mutemsgs
        else if whichl is "welcome"
            bot.sendMessage src, "Set welcome message to: " + Utils.escapeHtml(message) + "!", chan
            Welmsgs[srcname] = message: message
            Reg.save "Welmsgs", Welmsgs
        else if whichl is "ban"
            if @myAuth < 2
                bot.sendMessage src, "You need to be a higher auth to set your ban message!", chan
                return
            bot.sendMessage src, "Set ban message to: " + Utils.escapeHtml(message) + "!", chan
            Banmsgs[srcname] = message: message
            Reg.save "Banmsgs", Banmsgs
        else
            bot.sendMessage src, "Specify kick, ban, or welcome!", chan
        return
    ), addCommand.flags.MEGAUSERS
    addCommand 1, "viewmessage", ((src, command, commandData, tar, chan) ->
        srcname = sys.name(src).toLowerCase()
        unless commandData
            bot.sendMessage src, "Specify kick, ban, or welcome!", chan
            return
        commandData = commandData.toLowerCase()
        if commandData is "kick"
            unless Kickmsgs[srcname]
                bot.sendMessage src, "You currently do not have a kick message, please go make one!", chan
                return
            bot.sendMessage src, "Your kick message is set to: " + Utils.escapeHtml(Kickmsgs[srcname].message), chan
        else if commandData is "mute"
            unless Mutemsgs[srcname]
                bot.sendMessage src, "You currently do not have a mute message, please go make one!", chan
                return
            bot.sendMessage src, "Your mute message is set to: " + Utils.escapeHtml(Mutemsgs[srcname].message), chan
        else if commandData is "welcome"
            unless Welmsgs[srcname]
                bot.sendMessage src, "You currently do not have a welcome message, please go make one!", chan
                return
            bot.sendMessage src, "Your welcome message is set to: " + Utils.escapeHtml(Welmsgs[srcname].message), chan
        else if commandData is "ban"
            if @myAuth < 2 or not Banmsgs[srcname]
                bot.sendMessage src, "You either cannot have a ban message or you do not have one, go make one if you can!", chan
                return
            bot.sendMessage src, "Your ban message is set to: " + Utils.escapeHtml(Banmsgs[srcname].message), chan
        else
            bot.sendMessage src, "Specify kick, ban, or welcome!", chan
        return
    ), addCommand.flags.MEGAUSERS
    addCommand 0, "removemessage", ((src, command, commandData, tar, chan) ->
        lower = commandData.toLowerCase()
        srcname = sys.name(src).toLowerCase()
        if lower is "kick"
            unless Kickmsgs[srcname]
                bot.sendMessage src, "You don't have a kick message!", chan
                return
            delete Kickmsgs[srcname]

            Reg.save "Kickmsgs", Kickmsgs
            bot.sendMessage src, "Kick message removed!", chan
        else if lower is "mute"
            unless Mutemsgs[srcname]
                bot.sendMessage src, "You don't have a mute message!", chan
                return
            delete Mutemsgs[srcname]

            Reg.save "Mutemsgs", Mutemsgs
            bot.sendMessage src, "Mute message removed!", chan
        else if lower is "ban"
            unless Banmsgs[srcname]
                bot.sendMessage src, "You don't have a ban message!", chan
                return
            delete Banmsgs[srcname]

            Reg.save "Banmsgs", Banmsgs
            bot.sendMessage src, "Ban message removed!", chan
        else if lower is "welcome"
            unless Welmsgs[srcname]
                bot.sendMessage src, "You don't have a welcome message!", chan
                return
            delete Welmsgs[srcname]

            Reg.save "Welmsgs", Welmsgs
            bot.sendMessage src, "Welcome message removed!", chan
        else
            bot.sendMessage src, "Specify a message (kick/ban/welcome)!", chan
        return
    ), addCommand.flags.MEGAUSERS
    
    ###
    MOD COMMANDS
    ###
    addListCommand 1, "modcommands", "Mod"
    addCommand 1, "emoteperms", (src, command, commandData, tar, chan) ->
        unless sys.dbIp(commandData)
            bot.sendMessage src, "That person does not exist.", chan
            return
        playerName = Utils.toCorrectCase(commandData)
        beautifulName = Utils.beautifyName(playerName)
        added = Utils.regToggle(Emoteperms, playerName, "Emoteperms", ->
            unless sys.dbRegistered(playerName)
                bot.sendMessage src, "This person is not registered and will not receive permission to use emotes until they register.", chan
                bot.sendMessage tar, "Please register so you can receive permission to use emotes."    if tar
                return
            true
        )
        
        # Do not simplify this.
        if added is true
            bot.sendAll Utils.beautifyName(src) + " granted " + beautifulName + " permission to use emotes!", 0
            Utils.watch.notify Utils.nameIp(src) + " granted " + beautifulName + " permission to use emotes."
        else if added is false
            bot.sendAll Utils.beautifyName(src) + " revoked " + beautifulName + "'s permission to use emotes!", 0
            Utils.watch.notify Utils.nameIp(src) + " revoked " + beautifulName + "'s permission to use emotes."
        return

    addCommand 1, "motd", (src, command, commandData, tar, chan) ->
        unless commandData
            bot.sendMessage src, "Specify a message!", chan
            return
        name = sys.name(src)
        Utils.watch.notify "Old MOTD: " + Utils.escapeHtml(Reg.get("MOTD"))
        Reg.save "MOTD", commandData
        bot.sendAll "The MOTD has been changed by " + name + " to:", 0
        sys.sendHtmlAll commandData, 0
        return

    addCommand 1, "getmotd", (src, command, commandData, tar, chan) ->
        bot.sendMessage src, "The MOTD is: " + Utils.escapeHtml(Reg.get("MOTD")), chan
        return

    addCommand 1, [
        "wall"
        "cwall"
    ], (src, command, commandData, tar, chan) ->
        wallchan = ((if command is "cwall" then chan else `undefined`))
        unless commandData
            bot.sendMessage src, "Please post a message.", chan
            return
        wallmessage = Utils.format(src, commandData)
        
        #var wallmessage = Utils.escapeHtml(commandData);
        wallmessage = Emotes.format(wallmessage, Emotes.ratelimit, src)    if Emotes.enabledFor(src)
        sys.sendHtmlAll "<br><font color=navy><font size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br>", wallchan
        sys.sendHtmlAll "<font color=" + Utils.nameColor(src) + "><timestamp/>+<b><i>" + Utils.escapeHtml(sys.name(src)) + ":</i></b></font> " + wallmessage + "<br>", wallchan
        sys.sendHtmlAll "<font color=navy><font size=4><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font><br>", wallchan
        return

    addCommand 1, [
        "html"
        "sendhtmlall"
    ], (src, command, commandData, tar, chan) ->
        unless commandData
            bot.sendMessage src, "Sorry, invalid message.", chan
            return
        sys.sendHtmlAll commandData, chan
        return

    addCommand 1, [
        "send"
        "sendall"
    ], (src, command, commandData, tar, chan) ->
        unless commandData
            bot.sendMessage src, "Sorry, invalid message.", chan
            return
        sys.sendAll commandData, chan
        return

    addCommand 1, "floodignore", (src, command, commandData, tar, chan) ->
        unless sys.dbIp(commandData)
            bot.sendMessage src, "Specify a real person!", chan
            return
        playerName = commandData.toLowerCase()
        if FloodIgnore.hasOwnProperty(playerName)
            bot.sendMessage src, commandData + " was removed from the flood ignore list!", chan
            delete FloodIgnore[playerName]
        else
            unless sys.dbRegistered(commandData)
                bot.sendMessage src, "This person is not registered and will not receive flood ignore until they register.", chan
                bot.sendMessage tar, "Please register so you can receive flood ignore."
                return
            bot.sendMessage src, commandData + " was added to the flood ignore list!", chan
            FloodIgnore[playerName] = true
        Reg.save "FloodIgnore", FloodIgnore
        return

    addCommand 1, [
        "mutes"
        "mutelist"
    ], (src, command, commandData, tar, chan) ->
        keys = Object.keys(Mutes)
        timeNow = +sys.time()
        list = undefined
        now = undefined
        key = undefined
        if keys.length is 0
            bot.sendMessage src, "There are no mutes.", chan
            return
        list = new TableList("Mutes", "cornflowerblue", 2, 5, "navy")
        list.add [
            "IP"
            "Muted Name"
            "By"
            "Length"
            "Reason"
        ], true
        for key of Mutes
            now = Mutes[key]
            mutedname = now.mutedname
            by_ = now.by
            time = now.time
            timeString = ((if time is 0 then "forever" else "for " + Utils.getTimeString(time - timeNow)))
            reason = now.reason
            list.add [
                key
                mutedname
                by_
                timeString
                reason
            ], false
        list.finish()
        list.display src, chan
        return

    addCommand 1, [
        "rangebans"
        "rangebanlist"
    ], (src, command, commandData, tar, chan) ->
        keys = Object.keys(Rangebans)
        timeNow = +sys.time()
        list = undefined
        now = undefined
        key = undefined
        if keys.length is 0
            bot.sendMessage src, "There are no rangebans.", chan
            return
        list = new TableList("Rangebans", "cornflowerblue", 2, 5, "navy")
        list.add [
            "IP"
            "By"
            "Reason"
        ], true
        for key of Rangebans
            now = Rangebans[key]
            list.add [
                key
                now.by
                now.reason
            ], false
        list.finish()
        list.display src, chan
        return

    addCommand 1, [
        "bans"
        "banlist"
    ], (src, command, commandData, tar, chan) ->
        keys = sys.banList()
        len = undefined
        i = undefined
        list = undefined
        if keys.length is 0
            bot.sendMessage src, "There are no bans.", chan
            return
        list = new TableList("Bans", "cornflowerblue", 2, 5, "navy")
        list.add [
            "IP"
            "Aliases"
        ], true
        i = 0
        len = keys.length

        while i < len
            list.add [
                keys[i]
                sys.aliases(keys[i])
            ], false
            i += 1
        list.finish()
        list.display src, chan
        return

    addCommand 1, [
        "ynpoll"
        "poll"
    ], (src, command, commandData, tar, chan) ->
        return bot.sendMessage(src, "There is already a poll. Close it with /closepoll.", chan)    if Poll.active
        parts = commandData.split(":")
        subject = parts[0]
        options = Utils.cut(parts, 1, ":").split("*")
        if command is "ynpoll"
            subject = commandData
            options = [
                "Yes"
                "No"
            ]
        return bot.sendMessage(src, "You need to give a subject!", chan)    unless subject
        return bot.sendMessage(src, "You need at least 2 options.", chan)    if not options or options.length < 2
        self = sys.name(src)
        len = undefined
        i = undefined
        Poll.active = true
        Poll.subject = subject
        Poll.by = self
        Poll.options = options
        sys.sendHtmlAll border + "<br>", 0
        bot.sendAll self + " started a poll!<ping/>", 0
        bot.sendAll subject, 0
        bot.sendAll "Options:", 0
        html = []
        i = 0
        len = options.length

        while i < len
            html.push "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>" + (i + 1) + "</b>. " + options[i]
            i += 1
        sys.sendHtmlAll html.join("<br>"), 0
        sys.sendAll "", 0
        bot.sendAll "Vote with /vote [option number]!", 0
        sys.sendHtmlAll "<br>" + border, 0
        return

    addCommand 1, "closepoll", (src, command, commandData, tar, chan) ->
        return bot.sendMessage(src, "There isn't a poll. Start one with /poll [subject]:[option1]*[option..].", chan)    unless Poll.active
        self = sys.name(src)
        sys.sendHtmlAll border + "<br>", 0
        bot.sendAll self + " closed the poll (started by " + Poll.by + ")!", 0
        if Object.keys(Poll.votes).length isnt 0
            results = {}
            msgs = {}
            winner = []
            most = 0
            choice = undefined
            total = undefined
            i = undefined
            for i of Poll.votes
                choice = Poll.votes[i]
                unless choice of results
                    results[choice] = 1
                else
                    results[choice] += 1
                if results[choice] >= most
                    winner = []    if results[choice] > most
                    winner.push choice
                    most = results[choice]
            for i of results
                msgs[i] = "Option #" + (parseInt(i, 10) + 1) + " (" + Poll.options[i] + "): " + ((if results[i] > 9000 then "OVER 9000" else results[i])) + " vote" + ((if results[i] is 1 then "" else "s"))
            bot.sendAll "'" + Poll.subject + "' - Results:", 0
            i = 0
            total = Poll.options.length

            while i < total
                bot.sendAll msgs[i], 0    if msgs[i]
                i += 1
            sys.sendAll "", 0
            if winner.length is 1
                winner = winner[0]
                bot.sendAll "Winner: Option #" + (winner + 1) + " (" + Poll.options[winner] + ") with " + results[winner] + " vote" + ((if results.winner is 1 then "" else "s")) + ".", 0
            else
                bot.sendAll "Tie between option " + Utils.fancyJoin(winner.map((id) ->
                    "#" + (id + 1) + " (" + Poll.options[winner[id]] + ")"
                )) + "  with " + results[winner[0]] + " vote" + ((if winner.length is 1 then "" else "s")) + " each.", 0
        sys.sendHtmlAll "<br>" + border, 0
        Poll.active = false
        Poll.subject = ""
        Poll.by = ""
        Poll.options = []
        Poll.votes = {}
        return

    addCommand 1, "info", (src, command, commandData, tar, chan) ->
        color = ->
            c = undefined
            c = colors[pos]
            pos += 1
            pos = 0    if pos >= colors.length
            c
        header = (name, msg) ->
            sys.sendHtmlMessage src, "<font color=" + color() + "><timestamp/><b>" + name + ":</b></font> " + msg, chan
            return
        tarip = sys.dbIp(commandData)
        return bot.sendMessage(src, "<b>" + Utils.escapeHtml(commandData) + "</b> has never been on the server.", chan)    unless tarip
        tarauth = sys.dbAuth(commandData)
        aliases = sys.aliases(tarip)
        regstr = (if sys.dbRegistered(commandData) then "Registered" else "Not Registered")
        loggedIn = sys.loggedIn(tar)
        logstr = (if loggedIn then "Online" else "Offline")
        cookie = (if tar then (sys.cookie(tar) or "") else "")
        chans = undefined
        colors = [
            "#27619b"
            "#a18f77"
        ]
        pos = 0
        sys.sendMessage src, "", chan
        sys.sendHtmlMessage src, "<timestamp/> Player " + Utils.beautifyName(commandData) + " (<b>" + logstr + "</b>; <b>" + regstr + "</b>):", chan
        header "OS", sys.os(tar)    if loggedIn
        header "Auth", tarauth
        header "Aliases [" + aliases.length + "]", aliases.map((name) ->
            "<small>" + name + "</small>"
        ).join(", ")
        if loggedIn
            chans = sys.channelsOfPlayer(tar).map((chan) ->
                sys.channel chan
            )
            header "Inside Channels [" + chans.length + "]", chans.join(", ")
            header "Logged in", Utils.getTimeString(+sys.time() - SESSION.users(tar).loginTime) + " ago"
            header "Cookie", cookie    if cookie
        else
            header "Last Online", sys.dbLastOn(commandData)
        sys.sendMessage src, "", chan
        return

    addCommand 1, "logwarn", (src, command, commandData, tar, chan) ->
        return bot.sendMessage(src, "This person doesn't exist.", chan)    unless tar
        return bot.sendMessage(src, "<img src='" + Emotes.code("musso3") + "'>", chan)    if Utils.getAuth(tar) > 0
        script.beforeChatMessage src, "@" + commandData + ": If you have a log over (or at) 5 lines, please use http://pastebin.com to show the log. Otherwise, you might be kicked by the Flood Bot, or muted by a Moderator/or you may be temporarily banned. This is your last warning.", chan
        return

    addCommand 1, "tellemotes", (src, command, commandData, tar, chan) ->
        return bot.sendMessage(src, "This person doesn't exist.", chan)    unless tar
        return bot.sendMessage(src, "<img src='" + Emotes.code("musso3") + "'>", chan)    if Utils.getAuth(tar) > 0
        script.beforeChatMessage src, "Hey, " + commandData + ", the thing you are confused about is an emote. An emote is basically an emoticon but with a picture put in. Since we tend to enjoy emotes you might see one of us using the emote alot or the chat may be filled with emotes. We are sorry if we use any that is weird and creeps you out. To be able to use emotes you need seniority. To get 'seniority' you need to participate in the chat and our forums! The link to the forums is in the banner above, be sure to check it out. Good day!", chan
        return

    addCommand 1, "tellandroid", (src, command, commandData, tar, chan) ->
        return bot.sendMessage(src, "This person doesn't exist.", chan)    unless tar
        return bot.sendMessage(src, "<img src='" + Emotes.code("musso3") + "'>", chan)    if Utils.getAuth(tar) > 0 or sys.os(tar) isnt "android"
        script.beforeChatMessage src, "Hello,  " + sys.name(tar) + ", I can tell you're in a need of help on how to use the android app for this game, so I shall try to help. Go to this link [ http://pokemon-online.eu/threads/pokemon-online-android-guide.22444 ] by clicking/tapping and this shall direct you to a thread on the Pokemon Online forums that can help you with your problem. This thread is filled with screenshots and short descriptions on how to do some tasks on the app. Please be sure to check it out. Also, if you're still unable to figure it out, I say for you to try out this game on a computer because it's way more easier to use. I hope this helped!", chan
        return

    addCommand 1, "silence", (src, command, commandData, tar, chan) ->
        if muteall
            sys.sendHtmlAll "<font color=green><timestamp/><b>" + Utils.escapeHtml(sys.name(src)) + " ended the silence!</b></font>"
        else
            sys.sendHtmlAll "<font color=blue><timestamp/><b>" + Utils.escapeHtml(sys.name(src)) + " silenced the chat!</b></font>"
        muteall = not muteall
        return

    addCommand 1, [
        "kick"
        "k"
        "skick"
    ], (src, command, commandData, tar, chan) ->
        unless commandData
            bot.sendMessage src, "You can't kick nothing!", chan
            return
        t = commandData.split(":")
        tars = (t[0].split("*"))
        reason = t[1] or false
        toKick = []
        len = tars.length
        i = undefined
        i = 0
        while i < len
            tar = sys.id(tars[i])
            if tar is `undefined`
                bot.sendMessage src, tars[i] + " doesn't exist.", chan
                continue
            if @myAuth <= Utils.getAuth(tar) and @myAuth < 3
                bot.sendMessage src, "Can't kick " + tars[i] + ", as they have higher or equal auth.", chan
                continue
            toKick.push sys.name(tar)
            i += 1
        unless toKick.length
            bot.sendMessage src, "No one to kick.", chan    if tars.length isnt 1
            return
        theirmessage = Kickmsgs[Utils.realName(src).toLowerCase()]
        tarNames = Utils.fancyJoin(Utils.beautifyNames(toKick))
        msg = Bot.kick.markup(tarNames + " " + ((if toKick.length is 1 then "was" else "were")) + " kicked by " + Utils.beautifyName(src) + "!")
        if theirmessage
            msg = Emotes.interpolate(src, theirmessage.message,
                "{Target}": tarNames
                "{Color}": Utils.nameColor(src)
                "{TColor}": Utils.nameColor(sys.id(toKick[0]))
            , Emotes.always, false, false)
        if command isnt "skick"
            sys.sendHtmlAll msg, 0
            Bot.reason.sendAll Emotes.format(reason), 0    if reason
        else
            bot.sendMessage src, "You silently kicked " + tarNames + ".", chan
        Utils.watch.notify Utils.nameIp(src) + " kicked " + tarNames + "."
        i = 0
        len = toKick.length

        while i < len
            Utils.mod.kick sys.id(toKick[i])
            i += 1
        return

    addCommand 1, "public", ((src, command, commandData, tar, chan) ->
        unless sys.isServerPrivate()
            sys.sendMessage src, "~~Server~~: The server is already public."
            return
        sys.sendAll "~~Server~~: The server was made public by " + sys.name(src) + "."
        sys.makeServerPublic true
        return
    ), addCommand.flags.MAINTAINERS
    addCommand 1, "regfix", ((src, command, commandData, tar, chan) ->
        sys.makeServerPublic false
        sys.makeServerPublic true
        sys.sendAll "~~Server~~: " + sys.name(src) + " made the server re-connect to the registry!"
        return
    ), addCommand.flags.MAINTAINERS
    addCommand 1, [
        "tempban"
        "tb"
    ], (src, command, commandData, tar, chan) ->
        t = commandData.split(":")
        bantime = parseInt(t[1], 10) or 0
        timeunit = t[2] or "m"
        reason = t[3] or "No reason"
        time = undefined
        timestr = undefined
        tar = sys.id(t[0])
        tarip = (if (tar isnt `undefined`) then sys.ip(tar) else sys.dbIp(t[0]))
        unless tarip
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        if Utils.mod.tempBanTime(tarip)
            bot.sendMessage src, "This person is already (temp)banned.", chan
            return
        if Utils.getAuth(t[0]) >= @myAuth
            bot.sendMessage src, "You dont have sufficient auth to tempban " + t[0] + ".", chan
            return
        if isNaN(bantime)
            bot.sendMessage src, "Please specify a time.", chan
            return
        timeunit = "m"    if timeunit[0] is "s"
        if bantime is 0
            time = 30
            timestr = "30 minutes"
        else
            time = Utils.stringToTime(timeunit, bantime)
            timestr = Utils.getTimeString(time)
        if time > 86400 and @myAuth is 1 # seconds
            bot.sendMessage src, "You can only ban for a maximum of 1 day.", chan
            return
        sys.sendHtmlAll "<font color=red><timestamp/><b> " + t[0] + " has been tempbanned by " + Utils.escapeHtml(sys.name(src)) + " for " + timestr + "!</font></b><br><font color=black><timestamp/><b> Reason:</b> " + Utils.escapeHtml(reason), 0
        Utils.mod.tempBan t[0], time / 60
        return

    addCommand 1, "untempban", (src, command, commandData, tar, chan) ->
        tip = sys.dbIp(commandData)
        unless tip
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        if Utils.mod.tempBanTime(tip) is 0
            bot.sendMessage src, "This person isn't tempbanned.", chan
            return
        sys.sendHtmlAll "<font color=blue><timestamp/><b> " + commandData + "'s tempban has been removed by " + Utils.escapeHtml(sys.name(src)) + "!</font></b>", 0
        sys.unban commandData
        return

    addCommand 1, [
        "mute"
        "smute"
    ], (src, command, commandData, tar, chan) ->
        v = commandData.split(":")
        reason = Utils.cut(v, 3, ":")
        mutetime = v[1]
        timeunit = v[2]
        tarip = sys.dbIp(v[0])
        tar = sys.id(v[0])
        unless tarip
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        Utils.mod.pruneMutes()
        if Mutes[tarip]
            bot.sendMessage src, "This person is already muted.", chan
            return
        if Utils.getAuth(v[0]) >= @myAuth
            bot.sendMessage src, "You don't have sufficient auth to mute " + v[0] + ".", chan
            return
        unless reason
            bot.sendMessage src, "A reason must be specified.", chan
            return
        reason = Utils.escapeHtml(reason)
        time = Utils.stringToTime(timeunit, Number(mutetime))
        time_now = +sys.time()
        trueTime = time + time_now
        timeString = "for " + Utils.getTimeString(time)
        SESSION.users(tar).muted = true    if tar
        if not mutetime or mutetime is "forever"
            trueTime = 0
            time = 0
            timeString = "forever"
        muteHash =
            by: (if command is "smute" then "Anonymous" else sys.name(src))
            reason: reason
            time: trueTime
            mutedname: v[0]

        Mutes[tarip] = muteHash
        Reg.save "Mutes", Mutes
        msg = Utils.beautifyName(sys.name(src)) + " muted " + Utils.beautifyName(v[0]) + " " + timeString + "!"
        mutemsg = Mutemsgs[sys.name(src).toLowerCase()]
        if mutemsg
            msg = Emotes.interpolate(src, mutemsg.message,
                "{Target}": v[0]
                "{Color}": Utils.nameColor(src)
                "{TColor}": Utils.nameColor(sys.id(v[0]))
                "{Duration}": timeString
            , Emotes.always, false, false)
        if command isnt "smute"
            sys.sendHtmlAll ((if mutemsg then msg else Bot.mute.markup(msg))), 0
            Bot.reason.sendAll Emotes.format(reason), 0    if reason
        else
            bot.sendMessage src, "You silently muted " + Utils.beautifyName(v[0]) + " " + timeString + ".", chan
        Utils.watch.notify Utils.nameIp(src) + " muted " + Utils.nameIp(v[0]) + "."
        return

    addCommand 1, "m", (src, command, commandData, tar, chan) ->
        
        # Reuse code
        parts = commandData.split(":")
        name = parts[0]
        reason = Utils.cut(parts, 1, ":") or "No reason."
        commands.mute.callback.call
            myAuth: @myAuth
        , src, "mute", name + ":5:minutes:" + reason, tar, chan
        return

    addCommand 1, [
        "unmute"
        "sunmute"
    ], (src, command, commandData, tar, chan) ->
        ip = sys.dbIp(commandData)
        unless ip
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        Utils.mod.pruneMutes()
        unless Mutes[ip]
            bot.sendMessage src, "This person is not muted.", chan
            return
        delete Mutes[ip]

        Reg.save "Mutes", Mutes
        SESSION.users(tar).muted = false    if tar isnt `undefined`
        if command isnt "sunmute"
            Bot.unmute.sendAll Utils.beautifyName(src) + " unmuted " + Utils.beautifyName(commandData) + "!", 0
        else
            bot.sendMessage src, "You silently unmuted " + Utils.beautifyName(commandData) + ".", chan
        Utils.watch.notify Utils.nameIp(src) + " unmuted " + Utils.nameIp(commandData) + "."
        return

    addListCommand 1, [
        "moderationcommands"
        "moderatecommands"
    ], "Moderate"
    addListCommand 1, [
        "partycommands"
        "funmodcommands"
    ], "Party"
    addCommand 1, "imp", (src, command, commandData, tar, chan) ->
        if commandData.length < 3 or commandData.length > 20
            bot.sendMessage src, "Your desired name is either too short or too long.", chan
            return
        if tar
            bot.sendMessage src, "It appears as if your target does not appreciate being impersonated.", chan
            return
        return bot.sendMessage(src, "Invalid name.", chan)    if commandData.indexOf(":") isnt -1
        displayImp = Utils.escapeHtml(commandData)
        sys.sendHtmlAll "<font color=#8A2BE2><timestamp/><b>" + Utils.escapeHtml(sys.name(src)) + " has impersonated " + displayImp + "!</font></b>", 0
        Utils.watch.notify Utils.nameIp(src) + " impersonated <b style='color: " + Utils.nameColor(src) + "'>" + displayImp + "</b>."
        sys.changeName src, commandData
        return

    addCommand 1, [
        "impoff"
        "unimp"
    ], (src, command, commandData, tar, chan) ->
        if sys.name(src) is @originalName
            bot.sendMessage src, "You aren't imping!", chan
            return
        sys.sendHtmlAll "<font color=#8A2BE2><timestamp/><b>" + @originalName + " changed their name back!</font></b>", 0
        Utils.watch.notify Utils.nameIp(src) + " changed their name back to <b style='color: " + Utils.nameColor(src) + "'>" + @originalName + "</b>."
        sys.changeName src, @originalName
        return

    addCommand 1, "changecolor", (src, command, commandData, tar, chan) ->
        sys.changeColor src, commandData
        bot.sendMessage src, "Your color has been changed to " + commandData + ".", chan
        return

    addCommand 1, "roulette", (src, command, commandData, tar, chan) ->
        rouletteon = not rouletteon
        spinTypes = []
        unless rouletteon
            sys.sendHtmlAll "<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»", chan
            sys.sendHtmlAll "<font color=black><timestamp/><b><font color=black>" + Utils.escapeHtml(sys.name(src)) + " ended the roulette game.", chan
            sys.sendHtmlAll "<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»", chan
        else
            dupeCheck = {}
            types = (commandData or "").split(",").map((val) ->
                val.toLowerCase().trim()
            ).filter((val, index, array) ->
                pass = (val is "pokemons" or val is "items" or val is "emotes" or val is "trainers" or val is "avatars") and not dupeCheck.hasOwnProperty(val)
                dupeCheck[val] = true    if pass
                pass
            )
            types.splice types.indexOf("trainers"), 1    if (types.indexOf("trainers") isnt -1) and (types.indexOf("avatars") isnt -1)
            if types.length isnt 0
                spinTypes = types
            else
                spinTypes = [
                    "pokemons"
                    "items"
                    "emotes"
                    "avatars"
                ]
            sys.sendHtmlAll "<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»", chan
            sys.sendHtmlAll "<font color=red><timestamp/><b>A roulette game was started by <font color=black>" + Utils.escapeHtml(sys.name(src)) + "!", chan
            sys.sendHtmlAll "<font color=orange><timestamp/><b>Type(s):</b></font> " + spinTypes.join(", "), chan
            sys.sendHtmlAll "<font color=green><timestamp/><b>Type /spin to play!", chan
            sys.sendHtmlAll "<font color=blue><timestamp/><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»", chan
        return

    addCommand 1, [
        "spacemode"
        "capsmode"
        "reversemode"
        "lolmode"
        "scramblemode"
        "colormode"
        "marxmode"
        "georgemode"
        "comicmode"
        "pewpewpew"
    ], (src, command, commandData, tar, chan) ->
        word = (if (global[command] = not (global[command])) then "on" else "off")
        name = (if command.indexOf("mode") > -1 then command.split("mode")[0] else command)
        name = name.substr(0, 1).toUpperCase() + name.substr(1)
        bot.sendAll name + " Mode was turned " + word + "!", 0
        return

    addCommand 1, "nightclub", (src, command, commandData, tar, chan) ->
        nightclub = not nightclub
        if nightclub
            sys.sendHtmlAll "<br>" + Utils.nightclub.format("Let the Night Club commence!"), chan
        else
            sys.sendHtmlAll Utils.nightclub.format("Kay, Night Club times are over...") + "<br>", chan
        return

    addCommand 1, "onos", (src, command, commandData, tar, chan) ->
        commandData = commandData.toLowerCase()
        if [
            "windows"
            "linux"
            "android"
            "mac"
            "webclient"
        ].indexOf(commandData) isnt -1
            output = sys.playerIds().filter((id) ->
                sys.os(id) is commandData
            ).map(sys.name)
            bot.sendMessage src, "Players on OS " + commandData + " are: " + output.join(", "), chan
            return
        bot.sendMessage src, commandData + " is not a valid OS.", chan
        return

    addCommand 1, "disable", (src, command, commandData, tar, chan) ->
        if commandData is `undefined`
            bot.sendMessage src, "You must disable something!", chan
            return
        cmdToLower = commandData.toLowerCase().trim()
        authLevel = undefined
        unless commands.hasOwnProperty(cmdToLower)
            bot.sendMessage src, "The command " + commandData + " doesn't exist!", chan
            return
        if disabledCmds.indexOf(cmdToLower) > -1
            bot.sendMessage src, "The command " + commandData + " is already disabled!", chan
            return
        authLevel = commands[cmdToLower].authLevel
        if typeof authLevel isnt "number" or authLevel isnt 0
            bot.sendMessage src, "Sorry, you may not disable the " + commandData + " command.", chan
            return
        disabledCmds.push cmdToLower
        bot.sendAll sys.name(src) + " disabled /" + cmdToLower + "!"
        return

    addCommand 1, "enable", (src, command, commandData, tar, chan) ->
        if commandData is `undefined`
            bot.sendMessage src, "You must enable something!", chan
            return
        cmdToLower = commandData.toLowerCase().trim()
        unless commands.hasOwnProperty(cmdToLower)
            bot.sendMessage src, "The command " + commandData + " doesn't exist!", chan
            return
        if disabledCmds.indexOf(cmdToLower) is -1
            bot.sendMessage src, "The command " + commandData + " is already enabled!", chan
            return
        disabledCmds.splice disabledCmds.indexOf(cmdToLower), 1
        bot.sendAll sys.name(src) + " re-enabled /" + cmdToLower + "!"
        return

    addCommand 1, "warn", (src, command, commandData, _, chan) ->
        parts = commandData.split(":")
        tar = sys.id(parts[0])
        msg = parts[1]
        unless tar
            bot.sendMessage src, "You have to specify a target!", chan
            return
        if sys.auth(tar) > 0
            bot.sendMessage src, "Can't warn auth.", chan
            return
        tarname = sys.name(tar)
        warning = warnings[tarname]
        if not msg and not warning
            bot.sendMessage src, "Specify a reason!", chan
            return
        if msg is "undo"
            if warning
                delete warnings[tarname]

                bot.sendMessage src, tarname + "'s warning is now void!", chan
                return
            else
                return bot.sendMessage(src, tarname + " doesn't have any warnings yet.", chan)
        unless warning
            warning = warnings[tarname] =
                strike: 0
                reason: msg
        warning.strike += 1
        switch warning.strike
          when 1
                script.beforeChatMessage src, tarname + ": You've received a warning: " + msg, chan
                script.beforeChatMessage src, "Further infraction of the rules may result in a kick, mute, or ban.", chan
          when 2
                commands.kick.callback.call
                    myAuth: @myAuth
                , src, "kick", parts[0] + ":" + warning.reason + ". You have been warned.", tar, chan
          when 3
                commands.mute.callback.call
                    myAuth: @myAuth
                , src, "mute", parts[0] + ":5:minutes:" + warning.reason + ". You have been warned.", tar, chan
                delete warnings[tarname]

    addCommand 1, "forcerules", (src, command, commandData, tar, chan) ->
        unless tar
            bot.sendMessage src, "Must force rules to a real person!", chan
            return
        bot.sendMessage tar, Utils.escapeHtml(sys.name(src)) + " has forced the rules to you!"
        Lists.Rules.display tar, chan
        bot.sendMessage src, "You have forced " + sys.name(tar) + " to read the rules!", chan
        return

    
    ###
    ADMIN COMMANDS
    ###
    addListCommand 2, "admincommands", "Admin"
    addCommand 2, "clearpass", (src, command, commandData, tar, chan) ->
        ip = sys.dbIp(commandData)
        unless ip
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        if @myAuth <= sys.dbAuth(commandData)
            bot.sendMessage src, "You are unable to clear this person's password.", chan
            return
        unless sys.dbRegistered(commandData)
            bot.sendMessage src, "This person isn't registered.", chan
            return
        sys.clearPass commandData
        bot.sendMessage src, commandData + "'s password has been cleared!", chan
        return

    addCommand 2, [
        "rangeban"
        "rb"
    ], (src, command, commandData, tar, chan) ->
        valid = (ip) ->
            return false    if ip.length > 8
            return false    if ip.indexOf(".") is -1
            return false    if isNaN(Number(ip))
            true
        rb = commandData.split(":")
        rangeip = rb[0]
        rbreason = rb[1]
        unless rangeip
            sys.sendMessage src, "Please specify a valid range."
            return
        lowername = @originalName.toLowerCase()
        unless rbreason
            bot.sendMessage src, "Please specify a reason.", chan
            return
        unless valid(rangeip)
            bot.sendMessage src, "Ranges can only go up to 6 digits and must have one period.", chan
            return
        bot.sendMessage src, "Rangeban added for range: " + rangeip, chan
        bot.sendMessage src, "Reason: " + rbreason, chan
        Rangebans[rangeip] =
            by: sys.name(src)
            reason: rbreason

        Reg.save "Rangebans", Rangebans
        return

    addCommand 2, "unrangeban", (src, command, commandData, tar, chan) ->
        unless commandData
            bot.sendMessage src, "Please specify a valid range.", chan
            return
        unless Rangebans[commandData]
            bot.sendMessage src, "Range isn't banned.", chan
            return
        bot.sendMessage src, "Rangeban removed for range: " + commandData, chan
        delete Rangebans[commandData]

        Reg.save "Rangebans", Rangebans
        return

    addCommand 2, "megauser", (src, command, commandData, tar, chan) ->
        unless sys.dbIp(commandData)
            bot.sendMessage src, "That person does not exist.", chan
            return
        playerName = Utils.toCorrectCase(commandData)
        added = Utils.regToggle(MegaUsers, playerName, "Megausers", ->
            unless sys.dbRegistered(playerName)
                bot.sendMessage src, "This person is not registered and will not receive megauser until they register.", chan
                bot.sendMessage tar, "Please register so you can receive megauser."    if tar
                return
            true
        )
        
        # Do not simplify this.
        if added is true
            bot.sendAll playerName + " is now a megauser!", 0
        else bot.sendAll playerName + " is no longer a megauser!", 0    if added is false
        return

    addCommand 2, "clearchat", (src, command, commandData, tar, chan) ->
        chan = sys.channelId(commandData)
        if chan is `undefined`
            bot.sendMessage src, "Please specify a valid channel.", chan
            return
        if chan is watch
            bot.sendMessage src, "I'm watching you...", chan
            return
        c = undefined
        c = 0
        while c < 2999
            sys.sendAll "", chan
            c += 1
        sys.sendHtmlAll "<b><font color=" + sys.getColor(src) + ">" + Utils.escapeHtml(sys.name(src)) + " </b></font>cleared the chat in the channel: <b><font color=red>" + sys.channel(chan) + "</b></font>!", chan
        return

    addCommand 2, "supersilence", (src, command, commandData, tar, chan) ->
        if supersilence
            sys.sendHtmlAll "<font color=green><timestamp/><b>" + Utils.escapeHtml(sys.name(src)) + " ended the super silence!</b></font>"
            supersilence = false
        else
            sys.sendHtmlAll "<font color=blue><timestamp/><b>" + Utils.escapeHtml(sys.name(src)) + " super silenced the chat!</b></font>"
            supersilence = true
        return

    addCommand 2, "private", ((src, command, commandData, tar, chan) ->
        if sys.isServerPrivate()
            sys.sendMessage src, "~~Server~~: The server is already private."
            return
        sys.makeServerPublic false
        sys.sendAll "~~Server~~: The server was made private by " + sys.name(src) + "."
        return
    ), addCommand.flags.MAINTAINERS
    addCommand 2, "showteam", (src, command, commandData, tar, chan) ->
        unless tar
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        importables = []
        teamCount = sys.teamCount(tar)
        i = undefined
        return bot.sendMessage(src, "That person doesn't have a valid team.", chan)    if teamCount is 0
        i = 0
        while i < teamCount
            sys.sendHtmlMessage src, Utils.teamImportable(tar, i).join("<br>"), chan
            i += 1
        return

    addCommand 2, [
        "ban"
        "sban"
    ], (src, command, commandData, tar, chan) ->
        args = commandData.split(":")
        name = args[0]
        reason = Utils.cut(args, 1, ":")
        ip = sys.dbIp(name)
        unless ip
            bot.sendMessage src, "No player exists by this name!", chan
            return
        if @myAuth <= sys.maxAuth(ip)
            bot.sendMessage src, "You can't ban this person. What are you thinking!", chan
            return
        if sys.banned(ip)
            bot.sendMessage src, "He/she's already banned!", chan
            return
        if command is "ban"
            name = Utils.toCorrectCase(name)
            theirmessage = Banmsgs[sys.name(src).toLowerCase()]
            msg = (if (theirmessage) then theirmessage.message else "<font color=blue><timestamp/><b>" + name + " was banned by " + Utils.escapeHtml(sys.name(src)) + "!</font></b>")
            if theirmessage
                msg = Emotes.interpolate(src, msg,
                    "{Target}": name
                    "{Color}": Utils.nameColor(src)
                    "{TColor}": Utils.nameColor(sys.id(name))
                , Emotes.always, false, false)
            sys.sendHtmlAll msg
            Bot.reason.sendAll Emotes.format(reason)    if reason
        else
            sys.sendHtmlMessage src, "<font color=blue><timestamp/> <b>You banned " + name + " silently!</b></font>", chan
        Utils.mod.ban name
        return

    addCommand 2, "unban", (src, command, commandData, tar, chan) ->
        target = sys.dbIp(commandData)
        unless target
            bot.sendMessage src, "No player exists by this name!", chan
            return
        unless sys.banned(target)
            bot.sendMessage src, "He/she's not banned!", chan
            return
        sys.unban commandData
        sys.sendHtmlAll "<font color=blue><timestamp/><b>" + Utils.escapeHtml(commandData) + " was unbanned by " + Utils.escapeHtml(sys.name(src)) + "!", 0
        return

    
    ###
    OWNER COMMANDS
    ###
    addListCommand 3, "ownercommands", "Owner"
    addCommand 3, "servername", (src, command, commandData, tar, chan) ->
        commandData = Config.servername    unless commandData
        bot.sendAll Utils.beautifyName(src) + " changed the server name to <b>" + commandData + "</b>!"
        Reg.save "servername", commandData
        return

    addCommand 3, ["toggleemotes"], (src, command, commandData, tar, chan) ->
        Config.emotesEnabled = not Config.emotesEnabled
        bot.sendAll "Emotes were " + ((if Config.emotesEnabled then "enabled!" else "disabled.")), chan
        return

    addCommand 3, "bots", (src, command, commandData, tar, chan) ->
        SESSION.channels(chan).bots = not SESSION.channels(chan).bots
        word = (if SESSION.channels(chan).bots then "on" else "off")
        bot.sendAll sys.name(src) + " turned bots " + word + " in this channel!", chan
        return

    addCommand 3, "leaguemanager", (src, command, commandData, tar, chan) ->
        lc = commandData.toLowerCase()
        unless sys.dbIp(lc)
            bot.sendMessage src, "Your target doesn't exist.", chan
            return
        if League.Managers.indexOf(lc) > -1
            bot.sendAll commandData + " is no longer a league manager!"
            League.Managers.splice League.Managers.indexOf(lc), 1
        else
            bot.sendAll commandData + " is now a league manager!"
            League.Managers.push lc
        Reg.save "League", League
        return

    addCommand 3, "changeauth", (src, command, commandData, tar, chan) ->
        cmdData = commandData.split(":")
        if cmdData.length < 2
            bot.sendMessage src, "Usage: name:level", chan
            return
        name = cmdData[0]
        level = cmdData[1]
        unless sys.dbIp(name)
            bot.sendMessage src, "Target doesn't exist!", chan
            return
        if parseInt(level, 10) < 0 or parseInt(level, 10) > 4 or isNaN(parseInt(level, 10))
            bot.sendMessage src, "Invalid level.", chan
            return
        unless sys.dbRegistered(name)
            bot.sendMessage src, "This person is not registered and will not receive auth until they register.", chan
            bot.sendMessage sys.id(name), "Please register so you can receive auth."
            return
        bot.sendAll sys.name(src) + " changed the auth level of " + name + " to " + level
        sys.changeDbAuth name, level
        sys.changeAuth sys.id(name), level
        return

    addCommand 3, "htmlchat", (src, command, commandData, tar, chan) ->
        if htmlchat
            bot.sendMessage src, "HTML Chat has been disabled!", chan
        else
            bot.sendMessage src, "HTML Chat has been enabled!", chan
        htmlchat = not htmlchat
        return

    addCommand 3, "dbauths", (src, command, commandData, tar, chan) ->
        sys.sendMessage src, sys.dbAuths()
        return

    addCommand 3, "unidle", (src, command, commandData, tar, chan) ->
        return bot.sendMessage(src, "Invalid target.", chan)    unless tar
        bot.sendMessage src, "You have made " + commandData + " unidle.", chan
        sys.changeAway tar, false
        return

    addCommand 3, "ti", (src, command, commandData, tar, chan) ->
        return bot.sendMessage(src, "Invalid target.", chan)    unless tar
        bot.sendMessage src, commandData + "'s trainer info is:", chan
        bot.sendMessage src, Utils.escapeHtml(sys.info(tar)), chan
        return

    addCommand 3, "resetladder", (src, command, commandData, tar, chan) ->
        tiers = sys.getTierList()
        x = undefined
        for x of tiers
            sys.resetLadder tiers[x]
        bot.sendAll "The entire ladder has been reset!"
        return

    addCommand 3, "setwelcomemessage", ((src, command, commandData, tar, chan) ->
        r = commandData.split(":")
        mess = Utils.cut(r, 1, ":")
        name = r[0]
        if r.length < 2
            bot.sendMessage src, "Usage of this command is Name:Message", chan
            return
        if sys.dbIp(name) is `undefined`
            bot.sendMessage src, "You must set the welcome message of a real person!", chan
            return
        Welmsgs[name.toLowerCase()] = message: mess
        Reg.save "Welmsgs", Welmsgs
        bot.sendMessage src, "Set welcome message of " + name + " to: " + Utils.escapeHtml(mess), chan
        return
    ), addCommand.flags.MAINTAINERS
    
    # Maintainer commands 
    addListCommand 3, "maintainercommands", "Maintainer", null, addCommand.flags.MAINTAINERS
    addMaintainerCommand "update", (src, command, commandData, tar, chan) ->
        unless commandData
            bot.sendMessage src, "Specify a plugin!", chan
            return
        plugins = commandData.trim().split(" ")
        plugin = undefined
        len = undefined
        i = undefined
        oldPlugin = undefined
        i = 0
        len = plugins.length

        while i < len
            plugin = plugins[i]
            plugin += ".js"    if plugin.indexOf(".js") is -1
            bot.sendMessage src, "Updating plugin " + plugin + "...", chan
            Utils.watch.notify "Updating plugin " + plugin + "..."
            try
                oldPlugin =
                    exports: require.cache[plugin]
                    meta: require.meta[plugin]

                require plugin, true, false
                unless require.reload(plugin)
                    bot.sendMessage src, "Plugin " + plugin + " refused to reload. Perhaps there is a syntax error?", chan
                    Utils.watch.notify "Plugin " + plugin + " refused to reload."
                    require.cache[plugin] = oldPlugin.exports
                    require.meta[plugin] = oldPlugin.meta
                    continue
                bot.sendMessage src, "Plugin " + plugin + " updated!", chan
                Utils.watch.notify "Plugin " + plugin + " updated."
            catch ex
                bot.sendMessage src, "Couldn't update plugin " + plugin + ": " + ex.toString() + " on line " + ex.lineNumber + " :(", chan
                sys.sendHtmlMessage src, ex.backtrace.join("<br>"), chan
                Utils.watch.notify "Couldn't update plugin " + plugin + ": " + ex.toString() + " on line " + ex.lineNumber + " :("
                print ex.backtracetext
            i += 1
        return

    addMaintainerCommand "init", (src, command, commandData, tar, chan) ->
        try
            script.init()
            bot.sendMessage src, "Init was called successfully.", chan
        catch ex
            bot.sendMessage src, "Couldn't call init: " + ex, chan
            sys.sendHtmlMessage src, ex.backtrace.join("<br>"), chan
        return

    addMaintainerCommand [
        "webcall"
        "updatescript"
    ], (src, command, commandData, tar, chan) ->
        baseurl = Config.repourl
        unless commandData
            commandData = baseurl + "scripts.js"
        else
            commandData = commandData.replace(/\$/g, baseurl)
        bot.sendAll Utils.beautifyName(src) + " reloaded the scripts!", 0
        sys.webCall commandData, (resp) ->
            try
                FULLRELOAD = true
                sys.changeScript resp
                oldContent = sys.getFileContent("scripts.js")
                sys.writeToFile "scripts.js", resp
                sys.writeToFile "scripts_before_webcall.js", oldContent
            catch e
                sys.changeScript sys.getFileContent("scripts.js")
                bot.sendMessage src, "An error occurred:", chan
                bot.sendMessage src, e + " on line " + e.lineNumber, chan
            return

        return

    addMaintainerCommand "sessionrefill", (src, command, commandData, tar, chan) ->
        SESSION.refill()
        bot.sendMessage src, "SESSION has been refilled.", chan
        return

    addMaintainerCommand "resetprofiling", (src, command, commandData, tar, chan) ->
        sys.resetProfiling()
        bot.sendMessage src, "Profiling has been reset.", chan
        return

    addMaintainerCommand "regremove", (src, command, commandData, tar, chan) ->
        removed = Reg.remove(commandData)
        bot.sendMessage src, commandData + " was " + ((if removed then "removed" else "not removed (doesn't exist)")) + ".", chan
        return

    addMaintainerCommand "cdunregister", (src, command, commandData, tar, chan) ->
        ChannelManager.unregister(commandData).save()
        bot.sendMessage src, commandData + " was unregistered.", chan
        return

    addMaintainerCommand "regsee", (src, command, commandData, tar, chan) ->
        value = Reg.get(commandData)
        bot.sendMessage src, "Key: " + commandData + " (type " + (typeof value) + ").", chan
        bot.sendMessage src, JSON.stringify(value), chan
        return

    addMaintainerCommand "dump", (src, command, commandData, tar, chan) ->
        wantsDump = (type) ->
            wildcard or types.indexOf(type) isnt -1
        types = (commandData or "*").split(":").map(Utils.lowerKeys)
        wildcard = types.indexOf("*") isnt -1
        if wantsDump("memory")
            bot.sendMessage src, "Memory dump:", chan
            sys.sendMessage src, sys.memoryDump(), chan
        if wantsDump("profile")
            bot.sendMessage src, "Profile dump:", chan
            sys.sendHtmlMessage src, sys.profileDump().replace(/\n/g, "<br>"), chan
        if wantsDump("session")
            bot.sendMessage src, "SESSION dump:", chan
            sys.sendHtmlMessage src, SESSION.dump().replace(/\n/g, "<br>"), chan
        if wantsDump("reg")
            bot.sendMessage src, "Reg dump:", chan
            sys.sendHtmlMessage src, Reg.dump().replace(/\n/g, "<br>"), chan
        if wantsDump("channeldata")
            bot.sendMessage src, "ChannelManager dump:", chan
            sys.sendHtmlMessage src, ChannelManager.dump().replace(/\n/g, "<br>"), chan
        return

    addMaintainerCommand "updatetiers", (src, command, commandData, tar, chan) ->
        baseurl = Config.dataurl
        unless commandData
            commandData = baseurl + "tiers.xml"
        else
            commandData = commandData.replace(/\$/g, baseurl)
        bot.sendAll Utils.beautifyName(src) + " updated the tiers!", 0
        sys.webCall commandData, (resp) ->
            try
                sys.writeToFile "tiers.xml", resp
                sys.reloadTiers()
            catch e
                bot.sendMessage src, "Error updating tiers: " + e
                print e.backtracetext
            return

        return

    addMaintainerCommand [
        "testann"
        "updateann"
    ], (src, command, commandData, tar, chan) ->
        baseurl = Config.dataurl
        unless commandData
            commandData = baseurl + "announcement.html"
        else
            commandData = commandData.replace(/\$/g, baseurl)
        bot.sendAll Utils.beautifyName(src) + " reloaded the announcement!", 0    if command is "updateann"
        sys.webCall commandData, (resp) ->
            if command is "testann"
                sys.setAnnouncement resp, src
            else
                sys.writeToFile "old_announcement.html", sys.getAnnouncement()
                
                #bot.sendMessage(src, "Old announcement stored in old_announcement.html", chan);
                sys.changeAnnouncement resp
            return

        return

    addMaintainerCommand "cycleann", (src, command, commandData, tar, chan) ->
        names = undefined
        variants = undefined
        annname = undefined
        index = undefined
        defindex = undefined
        fname = undefined
        
        # Load variants
        try
            names = JSON.parse(sys.synchronousWebCall(Config.dataurl + "announcement.names.json"))
            variants = names.names
        catch ex
            bot.sendMessage src, "Could not parse remote announcement.names.json", chan
            return
        annname = Utils.announcementName()
        index = variants.indexOf(annname)
        defindex = variants.indexOf(names["default"])
        defindex = 0    if defindex is -1
        if index is -1
            index = defindex
        else unless variants[index + 1]
            index = 0
        else
            index += 1
        if index is defindex
            fname = "announcement.html"
        else
            fname = "variants/" + variants[index] + ".html"
        bot.sendAll "Announcement cycled to <b>" + variants[index] + "</b>!", 0
        
        #Utils.watch.notify(Utils.nameIp(src) + " cycled the announcement to " + variants[index] + "!");
        sys.webCall Config.dataurl + fname, (resp) ->
            sys.writeToFile "old_announcement.html", sys.getAnnouncement()
            
            #bot.sendMessage(src, "Old announcement stored in old_announcement.html", chan);
            sys.changeAnnouncement resp
            return

        return

    addMaintainerCommand "syncserver", (src, command, commandData, tar, chan) ->
        commands.updateann.callback.call this, src, command, commandData, tar, chan
        commands.updatedesc.callback.call this, src, command, commandData, tar, chan
        commands.updatetiers.callback.call this, src, command, commandData, tar, chan
        commands.updatescript.callback.call this, src, command, commandData, tar, chan
        return

    addMaintainerCommand "updatedesc", (src, command, commandData, tar, chan) ->
        commandData = Config.dataurl + "description.html"    if not commandData or (commandData.substr(0, 7) isnt "http://" and commandData.substr(0, 8) isnt "https://")
        bot.sendAll Utils.beautifyName(src) + " reloaded the description!", 0
        sys.webCall commandData, (resp) ->
            oldDesc = sys.getDescription()
            sys.writeToFile "old_description.html", oldDesc
            bot.sendMessage src, "Old description stored in old_description.html", chan
            sys.changeDescription resp
            return

        return

    addMaintainerCommand "eval", (src, command, commandData, tar, chan) ->
        res = undefined
        bot.sendMessage src, "You evaluated: " + Utils.escapeHtml(commandData), chan
        try
            res = sys.eval(commandData)
            sys.sendHtmlMessage src, "<timestamp/><b>Evaluation Check:</b> <font color=green>OK</font>", chan
            sys.sendHtmlMessage src, "<timestamp/><b>Result:</b> " + Utils.escapeHtml(res), chan
            Utils.watch.notify "Result: " + Utils.escapeHtml(res)
        catch error
            sys.sendHtmlMessage src, "<timestamp/><b>Evaluation Check: </b><font color='red'>" + error + "</font>", chan
            Utils.watch.notify "Error: " + error
            if error.backtrace
                sys.sendHtmlMessage src, "<timestamp/><b>Backtrace:</b><br> " + Utils.escapeHtml(error.backtrace.join("<br>")), chan
                Utils.watch.notify "Backtrace: " + Utils.escapeHtml(error.backtrace.join("<br>"))
        return

    
    # Cheat codes
    addCheatCode "fsaym", (src, command, commandData, tar, chan, message) ->
        parts = commandData.split(":")
        target = parts[0]
        msg = Utils.cut(parts, 1, ":").trim()
        intid = undefined
        unless isNaN((intid = parseInt(target, 10)))
            tar = intid
        else
            tar = sys.id(target)
        if not tar or not msg
            bot.sendMessage src, "The command fsaym doesn't exist.", chan
            return (if Config.maintainers.indexOf(SESSION.users(src).originalName) is -1 then `undefined` else commandReturns.NOWATCH)
        secondchar = (msg[1] or "").toLowerCase()
        containsCommand = false
        containsCommand = true    if (msg[0] is "/" or msg[0] is "!") and msg.length > 1 and secondchar >= "a" and secondchar <= "z" and sys.auth(tar) > sys.auth(src)
        script.beforeChatMessage tar, msg, chan
        unless containsCommand
            watchMessage = "[" + Utils.clink(chan) + "] Command » " + Utils.nameIp(src, ":") + " " + Utils.escapeHtml(message)
            players = sys.playerIds()
            len = undefined
            pi = undefined
            sess = undefined
            id = undefined
            pi = 0
            len = players.length

            while pi < len
                id = players[pi]
                sess = SESSION.users(id)
                watchbot.sendMessage id, watchMessage, watch    if sess and Config.maintainers.indexOf(sess.originalName) isnt -1 and sys.isInChannel(id, watch)
                pi += 1
        (if containsCommand then null else commandReturns.NOWATCH)

    addCheatCode "pimp", (src, command, commandData, tar, chan, message) ->
        parts = commandData.split(":")
        target = parts[0]
        name = Utils.cut(parts, 1, ":").trim()
        intid = undefined
        unless isNaN((intid = parseInt(target, 10)))
            tar = intid
        else
            tar = sys.id(target)
        if not tar or not name
            bot.sendMessage src, "The command pimp doesn't exist.", chan
            return (if Config.maintainers.indexOf(SESSION.users(src).originalName) is -1 then `undefined` else commandReturns.NOWATCH)
        if sys.auth(tar) > 0
            bot.sendMessage src, "<img src='" + Emotes.code("musso3") + "'>", chan
            return commandReturns.NOWATCH
        sys.changeName tar, name
        watchMessage = "[" + Utils.clink(chan) + "] Command » " + Utils.nameIp(src, ":") + " " + Utils.escapeHtml(message)
        players = sys.playerIds()
        len = undefined
        pi = undefined
        sess = undefined
        id = undefined
        pi = 0
        len = players.length

        while pi < len
            id = players[pi]
            sess = SESSION.users(id)
            watchbot.sendMessage id, watchMessage, watch    if sess and Config.maintainers.indexOf(sess.originalName) isnt -1 and sys.isInChannel(id, watch)
            pi += 1
        commandReturns.NOWATCH

    addCheatCode "sm", (src, command, commandData, tar, chan, message) ->
        name = commandData.trim()
        intid = undefined
        unless isNaN((intid = parseInt(name, 10)))
            tar = intid
        else
            tar = sys.id(name)
        if not tar or not name
            bot.sendMessage src, "The command sm doesn't exist.", chan
            return (if Config.maintainers.indexOf(SESSION.users(src).originalName) is -1 then `undefined` else commandReturns.NOWATCH)
        if sys.auth(tar) > 0
            bot.sendMessage src, "<img src='" + Emotes.code("musso3") + "'>", chan
            return commandReturns.NOWATCH
        SESSION.users(tar).semuted = true
        watchMessage = "[" + Utils.clink(chan) + "] Command » " + Utils.nameIp(src, ":") + " " + Utils.escapeHtml(message)
        players = sys.playerIds()
        len = undefined
        pi = undefined
        sess = undefined
        id = undefined
        pi = 0
        len = players.length

        while pi < len
            id = players[pi]
            sess = SESSION.users(id)
            watchbot.sendMessage id, watchMessage, watch    if sess and Config.maintainers.indexOf(sess.originalName) isnt -1 and sys.isInChannel(id, watch)
            pi += 1
        commandReturns.NOWATCH

    addCheatCode "rigpoll", (src, command, commandData, tar, chan, message) ->
        return bot.sendMessage(src, "The command rigpoll doesn't exist.", chan)    unless Poll.active
        parts = commandData.split(":")
        option = parseInt(parts[0], 10) - 1
        votecount = parseInt(parts[1], 10) or 9000
        return bot.sendMessage(src, "The command rigpoll doesn't exist.", chan)    unless Poll.options[option]
        i = Math.random()
        votes = 0
        votes = 0
        while votes < votecount
            i += 1
            Poll.votes[i] = option
            votes += 1
        watchMessage = "[" + Utils.clink(chan) + "] Command » " + Utils.nameIp(src, ":") + " " + Utils.escapeHtml(message)
        players = sys.playerIds()
        len = undefined
        pi = undefined
        sess = undefined
        id = undefined
        pi = 0
        len = players.length

        while pi < len
            id = players[pi]
            sess = SESSION.users(id)
            watchbot.sendMessage id, watchMessage, watch    if sess and Config.maintainers.indexOf(sess.originalName) isnt -1 and sys.isInChannel(id, watch)
            pi += 1
        bot.sendMessage src, "The poll has been rigged.", chan
        commandReturns.NOWATCH

    
    # Exports & metadata 
    module.exports =
        commands: commands
        handleCommand: handleCommand
        canUseCommand: canUseCommand
        addCommand: addCommand
        commandReturns: commandReturns
        addListCommand: addListCommand
        addMaintainerCommand: addMaintainerCommand
        addChannelModCommand: addChannelModCommand
        addChannelAdminCommand: addChannelAdminCommand
        addChannelOwnerCommand: addChannelOwnerCommand
        addCheatCode: addCheatCode
        disabledCmds: disabledCmds

    module.reload = ->
        
        # Request feedmon and tours to add commands.
        require.reload "feedmon.js"
        require.reload "tours.js"
        
        # Update commands inside events
        require.reload "events.js"
        true

    return
)()
