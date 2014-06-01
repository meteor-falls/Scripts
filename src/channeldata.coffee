file = "channeldata.json"

defaultValues =
    creator: ""
    topic: ""
    setBy: ""
    members: {}
    auth: {}
    mutes: {}
    bans: {}
    bots: on
    isPublic: yes

fields = Object.keys(defaultValues)

class ChannelManager
    constructor: ->
        @data = {}
        @version = -1

        if sys.fileExists(file)
            @data = JSON.parse(sys.getFileContent(file))
        else
            sys.writeToFile file, "{}"

        unless @data.hasOwnProperty("__meta__")
            @data.__meta__ = {}

        # Channels can't have a double dash.
        @version = @data.__meta__.version ? 1
    find: (cname) -> @data[cname.toLowerCase()]
    get: (cname, key) ->
        chan = @find(cname)
        unless chan
            return null

        return chan[key] ? defaultValues[key]
    # Expects a SESSION object.
    populate: (chan) ->
        name = chan.name.toLowerCase()
        obj = @find(name)

        unless obj
            return false

        for field in fields
            if obj.hasOwnProperty(field)
                chan[field] = obj[field]

        return true
    # Expects a SESSION object.
    absorb: (chan) ->
        name = chan.name.toLowerCase()

        @data[name] ?= {}
        data = @data[name]

        for field in fields
            if chan.hasOwnProperty(field)
                data[field] = chan[field]

        return this
    update: (cname, key, value) ->
        cname = cname.toLowerCase()
        @data[cname] ?= {}
        @data[cname][key] = value
        return this
    # Expects a SESSION object
    sync: (chan, key) ->
        cname = chan.name.toLowerCase()
        @data[cname] ?= {}
        @data[cname][key] = chan[key]
        return this

    unregister: (cname) ->
        delete @data[cname.toLowerCase()]
        return this

    save: ->
        sys.writeToFile file, JSON.stringify(@data)
        return this

    dump: ->
        dataKeys = Object.keys(@data)
        # Exclude __meta__
        return """
            ChannelManager dump @ #{new Date()).toUTCString()}
            Version #{@version}
            #(dataKeys.length - 1} channels.
            #{dataKeys.length} keys, being:
            #{dataKeys.join(", ")}
        """

module.exports = {
    ChannelManager,
    manager: new ChannelManager()
}
