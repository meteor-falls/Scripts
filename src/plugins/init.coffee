# NOTE: New functions should go in utils.js, old ones should slowly be ported over.
exports.init = ->
    lolmessage = (message) ->
        message.split("").map(->
            "lol"
        ).join ""

    Reg.init "MOTD", ""
    Reg.init "maxPlayersOnline", 0
    Reg.init "servername", Config.servername
    Reg.init "League",
        Gym1: ""
        Gym2: ""
        Gym3: ""
        Gym4: ""
        Gym5: ""
        Gym6: ""
        Gym7: ""
        Gym8: ""
        Elite1: ""
        Elite2: ""
        Elite3: ""
        Elite4: ""
        Champ: ""
        Managers: []

    
    # Global var name: reg val name
    regVals =
        MegaUsers: "Megausers"
        FloodIgnore: "FloodIgnore"
        Mutes: "Mutes"
        Rangebans: "Rangebans"
        Kickmsgs: "Kickmsgs"
        Mutemsgs: "Mutemsgs"
        Banmsgs: "Banmsgs"
        Welmsgs: "Welmsgs"
        Emotetoggles: "Emotetoggles"
        Emoteperms: "Emoteperms"
        Feedmons: "Feedmon"
        League: "League"

    for i of regVals
        Reg.init regVals[i], {}
        try
            global[i] = Reg.get(regVals[i])
        catch e
            global[i] = {}
    League.Managers = []    unless League.hasOwnProperty("Managers")
    globalVars =
        border: "<font color=blue><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>"
        tourmode: 0
        spinTypes: [] # can contain: items, emotes, pokemons
        muteall: false
        supersilence: false
        rouletteon: false
        htmlchat: false
        lolmode: false
        spacemode: false
        capsmode: false
        reversemode: false
        marxmode: false
        georgemode: false
        comicmode: false
        scramblemode: false
        colormode: false
        pewpewpew: false
        nightclub: false
        warnings: {}
        teamSpammers: {}
        reconnectTrolls: {}
        uniqueVisitors:
            ips: {}
            count: 0
            total: 0

        Poll:
            active: false
            subject: ""
            by: ""
            options: []
            votes: {}

    j = undefined
    for j of globalVars
        global[j] = globalVars[j]    if typeof global[j] is "undefined"
    makeChan = (cname) ->
        sys.createChannel cname
        sys.channelId cname

    staffchannel = makeChan("Auth Party")
    testchan = makeChan("Ground Zero")
    watch = makeChan("Watch")
    nthNumber = (num) ->
        nthNum =
            0: "th"
            1: "st"
            2: "nd"
            3: "rd"

        num + (nthNum[num] or "th")

    return


#function formatLinks(message) {
#        return message.replace(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?\^=%&amp;:\/~\+#]*[\w\-\@?\^=%&amp;\/~\+#])?/gi, '$1');
#    }
module.reload = reloadInit = ->
    module.exports.init()
    true
