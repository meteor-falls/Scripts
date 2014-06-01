# Meteor Falls v0.10 Scripts.
# By [VP]Blade, TheUnknownOne, Ethan, and Max.
# Maintained with <3 by TheUnknownOne.

# ignoreNextChanMsg = no

Session = require './session'
Server  = require './server'
{callhooks} = require './hooks'

Session.register()

global.poScript =
    serverStartUp: ->
        Server.startUpTime = sys.time()
        poScript.init()
    init: ->
        callhooks 'init'
        sys.resetProfiling()
    warning: (func, message, backtrace) -> callhooks 'warning', func, message, backtrace
    beforeNewMessage: (message) -> callhooks 'beforeNewMessage', message
    afterNewMessage: (message) -> callhooks 'afterNewMessage', message
    beforeServerMessage: (message) -> callhooks 'beforeServerMessage', message
    beforeChannelJoin: (src, channel) -> callhooks 'beforeChannelJoin', src, channel
    beforeChannelDestroyed: (channel) -> callhooks 'beforeChannelDestroyed', channel
    afterChannelCreated: (chan, name, src) -> callhooks 'afterChannelCreated', chan, name, src
    afterChannelJoin: (src, chan) -> callhooks 'afterChannelJoin', src, chan
    beforeLogIn: (src) -> callhooks 'beforeLogIn', src
    afterLogIn: (src, defaultChan) -> callhooks 'afterLogIn', src, defaultChan
    beforeChangeTier: (src, team, oldtier, newtier) -> callhooks 'beforeCHangeTier', src, team, oldtier, newtier
    beforeChangeTeam: (src) -> callhooks 'beforeChangeTeam', src
    beforeChatMessage: (src, message, chan) -> callhooks 'beforeChatMessage', src, message, chan
    beforeLogOut: (src) -> callhooks 'beforeLogOut', src
    afterChangeTeam: (src) -> callhooks 'afterChangeTeam', src
    beforePlayerKick: (src, bpl) -> callhooks 'beforePlayerKick', src, bpl
    beforePlayerBan: (src, bpl, time) -> callhooks 'beforePlayerBan', src, bpl, time
    beforeChallengeIssued: (src, dest) -> callhooks 'beforeChallengeIssued', src, dest
    beforeBattleMatchup: (src, dest, clauses, rated, mode, team1, team2) -> callhooks 'beforeBattleMatchup', src, dest, clauses, rated, mode, team1, team2
    afterBattleStarted: (src, dest, info, id, t1, t2) -> callhooks 'afterBattleStarted' src, dest, info, id, t1, t2
    afterBattleEnded: (src, dest, desc) -> callhooks 'afterBattleEnded', src, dest, desc
    afterChatMessage: (src, message, chan) -> callhooks 'afterChatMessage', src, message, chan
    beforePlayerRegister: (src) -> callhooks 'beforePlayerRegister', src
    #Utils.watch.notify Utils.nameIp(src) + " registered."
    battleConnectionLost: -> callhooks 'battleConnectionLost'
    #Utils.watch.notify "Connection to the battle server has been lost."
