# Meteor Falls v0.10 Scripts.
#    By: [VP]Blade, TheUnknownOne, Ethan
#    Credit to: Max, Lutra
#

# Configuration for the script.

# Repo to load plugins from.

# Repo to load data (announcement/description + tiers) from.

# Plugin directory.

# Do not touch unless you are adding a new plugin.
# Plugins to load on script load.
# mathjs is loaded dynamically.

# Whether or not to load plugins from repourl. If set to false, they will load locally.

# If HTML should be stripped from channel messages outputted onto the server window.

# If emotes are enabled.

# Character limit in messages.
poUser = (id) ->
    ip = sys.ip(id)
    @id = id
    @ip = ip
    @floodCount = 0
    @teamChanges = 0
    @caps = 0
    @muted = false
    @semuted = false
    @originalName = sys.name(id)
    @loginTime = +sys.time()
    
    # This is an array so we can track multiple emotes in their last message.
    @lastEmote = []
    return
poChannel = (chanId) ->
    @id = chanId
    @name = sys.channel(chanId)
    @creator = ""
    @topic = ""
    @setBy = ""
    @members = {}
    @auth = {}
    @mutes = {}
    @bans = {}
    @bots = true
    @isPublic = true
    return
Config =
    servername: "Meteor Falls"
    maintainers: [
        "TheUnknownOne"
        "[ᴠᴘ]ʙʟᴀᴅᴇ"
    ]
    repourl: "http://meteor-falls.github.io/Scripts/"
    dataurl: "http://meteor-falls.github.io/Server-Shit/"
    emotesurl: "http://meteor-falls.github.io/Emotes/emotes.json"
    plugindir: "plugins/"
    datadir: "data/"
    plugins: [
        "bot"
        "reg"
        "utils"
        "rtd"
        "channeldata"
        "emotes"
        "lists"
        "init"
        "feedmon"
        "tours"
        "commands"
        "events"
    ]
    data: ["emoji"]
    load_from_web: true
    stripHtmlFromChannelMessages: true
    emotesEnabled: true
    characterLimit: 600

(->
    dir = Config.plugindir
    datadir = Config.datadir
    sys.makeDir dir
    sys.makeDir datadir
    require = require = (name, webcall, noCache) ->
        return require.cache[name]    if (name of require.cache) and not webcall and not noCache
        __fileContent = undefined
        module = undefined
        exports = undefined
        __resp = undefined
        if webcall
            __resp = sys.synchronousWebCall(Config.repourl + "plugins/" + name)
            sys.writeToFile dir + name, __resp
        unless sys.fileExists(dir + name)
            throw
                name: "NoFileError"
                toString: ->
                    "Couldn't find file " + (dir + name) + "."
        __fileContent = sys.getFileContent(dir + name)
        module =
            exports: {}
            reload: ->
                false

            name: name

        exports = module.exports
        try
            sys.eval __fileContent, dir + name
        catch e
            sys.sendAll "Error loading module " + name + ": " + e + " on line " + e.lineNumber
            print e.backtracetext
            throw e
        print "Loaded module " + name
        require.cache[name] = module.exports
        require.meta[name] = module
        module.exports

    require.reload = require_reload = (name) ->
        require name, false, false
        require.meta[name].reload()

    if not require.cache or (typeof FULLRELOAD is "boolean" and FULLRELOAD is true)
        require.cache = {}
        require.meta = {}
    FULLRELOAD = false
    require.callPlugins = require_callPlugins = (event) ->
        args = Array::slice.call(arguments_, 1)
        plugins = @meta
        exports = undefined
        plugin = undefined
        for plugin of plugins
            exports = plugins[plugin].exports
            if event of exports
                try
                    exports[event].apply exports, args
                catch e
                    print "Plugin error (" + plugins[plugin].name + ") on line " + e.lineNumber + ": " + e
                    print e.backtracetext
        return

    plugin = undefined
    data = undefined
    resp = undefined
    i = undefined
    i = 0
    while i < Config.plugins.length
        plugin = Config.plugins[i] + ".js"
        require plugin, Config.load_from_web
        i += 1
    i = 0
    while i < Config.data.length
        data = Config.data[i] + ".json"
        unless sys.fileExists(datadir + data)
            resp = sys.synchronousWebCall(Config.repourl + "data/" + data)
            sys.writeToFile datadir + data, resp
        i += 1
    return
)()
ignoreNextChanMsg = false
try
    ChannelManager = require("channeldata.js").manager
catch ex
    ChannelManager = {}
    sys.sendAll "Couldn't load ChannelManager: " + ex
SESSION.identifyScriptAs "Meteor Falls Script v0.10.1"
SESSION.registerUserFactory poUser
SESSION.registerChannelFactory poChannel
SESSION.refill()
poScript = undefined
poScript = (
    serverStartUp: serverStartUp = ->
        startUpTime = +sys.time()
        script.init()
        return

    init: init = ->
        require.reload "utils.js"
        require.reload "reg.js"
        require.reload "bot.js"
        require.reload "rtd.js"
        require.reload "feedmon.js"
        require.reload "tours.js"
        require.reload "init.js"
        require.reload "emotes.js"
        
        # lists.js reloaded by emotes.js
        #require.reload('lists.js');
        sys.resetProfiling()
        return

    warning: warning = (func, message, backtrace) ->
        require.callPlugins "warning", func, message, backtrace
        return

    beforeNewMessage: beforeNewMessage = (message) ->
        require.callPlugins "beforeNewMessage", message
        return

    afterNewMessage: afterNewMessage = (message) ->
        require.callPlugins "afterNewMessage", message
        return

    beforeServerMessage: (message) ->
        require.callPlugins "beforeServerMessage", message
        return

    beforeChannelJoin: beforeChannelJoin = (src, channel) ->
        require.callPlugins "beforeChannelJoin", src, channel
        return

    beforeChannelDestroyed: beforeChannelDestroyed = (channel) ->
        require.callPlugins "beforeChannelDestroyed", channel
        return

    afterChannelCreated: afterChannelCreated = (chan, name, src) ->
        require.callPlugins "afterChannelCreated", chan, name, src
        return

    afterChannelJoin: afterChannelJoin = (src, chan) ->
        require.callPlugins "afterChannelJoin", src, chan
        return

    beforeLogIn: beforeLogIn = (src) ->
        require.callPlugins "beforeLogIn", src
        return

    afterLogIn: afterLogIn = (src, defaultChan) ->
        require.callPlugins "afterLogIn", src, defaultChan
        return

    beforeChangeTier: (src, team, oldtier, newtier) ->
        require.callPlugins "beforeChangeTier", src, team, oldtier, newtier
        return

    beforeChangeTeam: beforeChangeTeam = (src) ->
        require.callPlugins "beforeChangeTeam", src
        return

    beforeChatMessage: beforeChatMessage = (src, message, chan) ->
        require.callPlugins "beforeChatMessage", src, message, chan
        return

    beforeLogOut: beforeLogOut = (src) ->
        require.callPlugins "beforeLogOut", src
        return

    afterChangeTeam: afterChangeTeam = (src) ->
        require.callPlugins "afterChangeTeam", src
        return

    beforePlayerKick: beforePlayerKick = (src, bpl) ->
        require.callPlugins "beforePlayerKick", src, bpl
        return

    beforePlayerBan: beforePlayerBan = (src, bpl, time) ->
        require.callPlugins "beforePlayerBan", src, bpl, time
        return

    beforeChallengeIssued: beforeChallengeIssued = (src, dest) ->
        require.callPlugins "beforeChallengeIssued", src, dest
        return

    
    #afterPlayerAway: function afterPlayerAway(src, mode) {
    #    },
    beforeBattleMatchup: beforeBattleMatchup = (src, dest, clauses, rated, mode, team1, team2) ->
        require.callPlugins "beforeBattleMatchup", src, dest, clauses, rated, mode, team1, team2
        return

    afterBattleStarted: afterBattleStarted = (src, dest, info, id, t1, t2) ->
        require.callPlugins "afterBattleStarted", src, dest, info, id, t1, t2
        return

    afterBattleEnded: afterBattleEnded = (src, dest, desc) ->
        require.callPlugins "afterBattleEnded", src, dest, desc
        return

    afterChatMessage: afterChatMessage = (src, message, chan) ->
        require.callPlugins "afterChatMessage", src, message, chan
        return

    beforePlayerRegister: (src) ->
        Utils.watch.notify Utils.nameIp(src) + " registered."
        return

    battleConnectionLost: ->
        Utils.watch.notify "Connection to the battle server has been lost."
        return
)
