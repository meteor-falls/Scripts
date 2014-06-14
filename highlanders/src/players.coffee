hlr.player = {}

hlr.player.player = (id) -> hlr.players[hlr.namelOf(id)]
hlr.player.registered = (id) -> hlr.namelOf(id) of hlr.players
hlr.player.register = (id) ->
    if hlr.player.registered(id)
        hlr.error("hlr.player.register called on a registered player")

    hlr.players[id.toLowerCase()] =
        name: id
        inventory: {}
        loadouts: {}
    hlr.players.markDirty()

hlr.player.initStorage = ->
    players = new hlr.JsonStore("hlr-players.json")
    hlr.player.jsonstore = players
    hlr.players = players.hash
