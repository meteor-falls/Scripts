sessid = "Meteor Falls Script v1.0.0"

class User
    constructor: (@id) ->
        ip = sys.ip(id)

        @ip = ip
        @floodCount = 0
        @teamChanges = 0
        @caps = 0
        @muted = no
        @semuted = no
        @originalName = sys.name(id)
        @loginTime = sys.time()

        # This is an array so we can track multiple emotes in their last message.
        @lastEmote = []

class Channel
    constructor: (@id) ->
        @name = sys.channel(id)
        @creator = ""
        @topic = ""
        @setBy = ""
        @members = {}
        @auth = {}
        @mutes = {}
        @bans = {}
        @bots = true
        @isPublic = true

register = ->
    SESSION.identifyScriptAs sessid
    SESSION.registerUserFactory User
    SESSION.registerChannelFactory Channel
    SESSION.refill()

module.exports = {User, Channel, sessid, register}
