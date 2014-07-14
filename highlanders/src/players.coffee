hlr.player = {}
hlr.player.sessions = {}
hlr.player.markDirty = -> hlr.player.jsonstore.markDirty()

hlr.player.player = (id) -> hlr.players[hlr.namelOf(id)]
hlr.player.session = (id) -> hlr.player.sessions[id] or= {}
hlr.player.registered = (id) -> hlr.namelOf(id) of hlr.players
hlr.player.register = (id) ->
    if hlr.player.registered(id)
        hlr.error("hlr.player.register called on a registered player")

    hlr.players[hlr.nameOf(id)] =
        name: id
        balance: 0
        inventory: {}

    hlr.player.markDirty()

#### PLAYER - ITEMS
hlr.player.giveItem = (id, item, qty=1, silent=no) ->
    player = hlr.player.player(id)

    amount = qty
    ids = []
    while amount
        id = hlr.uniqItemId()
        ids.push(id)
        player.inventory[id] = item
        amount -= 1

    hlr.player.markDirty()

    if !silent and sys.loggedIn(id)
        hlr.sendTo id, "You have obtained #{qty} #{hlr.item(item).name}!"
    return ids

hlr.player.sendQuicksellInfo = (id, itemid) ->
    player = hlr.player.player(id)

    if !(itemid of player.inventory)
        hlr.error("hlr.player.sendQuicksellInfo called with non-existent item id")

    item = hlr.item(player.inventory[itemid]))
    hlr.sendTo id, "<a href='po:send//quicksell #{itemid}'><b>Quicksell #{item.name} for #{Math.ceil(item.sell / 2)}</b></a>."

#### PLAYER - MONEY
hlr.player.giveMoney = (id, money, silent=no) ->
    player = hlr.player.player(id)
    player.balance += money
    hlr.player.markDirty()

    if !silent and sys.loggedIn(id)
        hlr.sendTo id, "You have obtained #{hlr.currencyFormat(money)}!"

#### PLAYER - LOCATION
hlr.player.goto = (id, loc, silent=no) ->
    player = hlr.player.player(id)
    player.location = loc
    hlr.player.markDirty()

    if !silent and sys.loggedIn(id)
        hlr.player.sendLocationInfo(id, loc)

hlr.player.sendLocationInfo = (id, loc=hlr.player.player(id).location) ->
    lobj = hlr.location(loc)

    hlr.sendTo id, "You are now in <a href='po:send//location'><b>#{lobj.name}</b> (#{hlr.locationTypeName(lobj.type)})</a>!"
    if lobj.welcome
        hlr.sendTo id, lobj.welcome

    locs = ("<a href='po:send//go #{place}><b>#{hlr.location(place).name}</b> (#{place})</a>" for place in lobj.to)
    hlr.sendTo id, "From here, you can go to #{Utils.fancyJoin(locs)}."

    hlr.sendTo id, ""

    switch lobj.type
        when hlr.Location.SellArea
            hlr.sendTo id, "You can <a href='po:send//inventory'>sell items from your inventory</a> here."
        when hlr.Location.FishArea
            hlr.sendTo id, "You can <a href='po:send//fish'>fish</a> here."

hlr.player.initStorage = ->
    players = new hlr.JsonStore("hlr-players.json")
    hlr.player.jsonstore = players
    hlr.players = players.hash
