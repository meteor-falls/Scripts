(->
    ChannelManager = ->
        @data = {}
        @version = currentVersion
        if sys.fileExists(file)
            @data = JSON.parse(sys.getFileContent(file))
        else
            sys.writeToFile file, "{}"
        @data.__meta__ = version: @version    unless @data.hasOwnProperty("__meta__")
        
        # Channels can't have a double dash.
        @version = @data.__meta__.version or currentVersion
        this
    currentVersion = 1
    file = "channeldata.json"
    defaultValues =
        creator: ""
        topic: ""
        setBy: ""
        members: {}
        auth: {}
        mutes: {}
        bans: {}
        bots: true
        isPublic: true

    fields = [
        "creator"
        "topic"
        "setBy"
        "members"
        "auth"
        "mutes"
        "bans"
        "bots"
        "isPublic"
    ]
    ChannelManager::find = (cname) ->
        cname = cname.toLowerCase()
        @data[cname]

    ChannelManager::get = (cname, key) ->
        chan = @find(cname)
        return null    unless chan
        chan[key] or defaultValues[key]

    
    # Expects a SESSION object
    ChannelManager::populate = (chan) ->
        name = chan.name.toLowerCase()
        obj = @find(name)
        return false    unless obj
        field = undefined
        len = undefined
        i = undefined
        i = 0
        len = fields.length

        while i < len
            field = fields[i]
            chan[field] = obj[field]    if obj.hasOwnProperty(field)
            i += 1
        true

    
    # Expects a SESSION object.
    ChannelManager::absorb = (chan) ->
        name = chan.name.toLowerCase()
        data = (@data[name] or (@data[name] = {}))
        field = undefined
        len = undefined
        i = undefined
        i = 0
        len = fields.length

        while i < len
            field = fields[i]
            data[field] = chan[field]    if chan.hasOwnProperty(field)
            i += 1
        this

    ChannelManager::update = (cname, key, value) ->
        cname = cname.toLowerCase()
        @data[cname] = {}    unless cname of @data
        @data[cname][key] = value
        this

    
    # Expects a SESSION object
    ChannelManager::sync = (chan, key) ->
        cname = chan.name.toLowerCase()
        @data[cname] = {}    unless @data.hasOwnProperty(cname)
        @data[cname][key] = chan[key]
        this

    ChannelManager::unregister = (cname) ->
        delete @data[cname.toLowerCase()]

        this

    ChannelManager::save = ->
        sys.writeToFile file, JSON.stringify(@data)
        this

    ChannelManager::dump = ->
        dataKeys = Object.keys(@data)
        # Exclude __meta__
        [
            "ChannelManager dump @ " + (new Date()).toUTCString()
            "Version " + @version
            (dataKeys.length - 1) + " channels."
            dataKeys.length + " keys, being:"
            dataKeys.join(", ")
        ].join "\n"

    exports.ChannelManager = ChannelManager
    exports.manager = new ChannelManager()
    module.reload = ->
        module.exports.manager = new ChannelManager()
        true

    return
)()
