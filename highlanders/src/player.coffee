hlr.player = {}
hlr.player.sessions = {}
hlr.player.markDirty = -> hlr.player.jsonstore.markDirty()

hlr.player.player = (id) -> hlr.players[hlr.namelOf(id)]
hlr.player.session = (id) -> hlr.player.sessions[id] or= {}
hlr.player.registered = (id) -> hlr.namelOf(id) of hlr.players
hlr.player.register = (id) ->
    hlr.assert(!hlr.player.registered(id), "can't register already registered players")

    hlr.players[hlr.nameOf(id)] =
        name: id
        balance: 0
        inventory: {}

    hlr.player.markDirty()

hlr.player.unregister = (id) ->
    hlr.assert(hlr.player.registered(id), "can't unregister non-registered players")

    delete hlr.players[hlr.namelOf(id)]
    hlr.player.markDirty()

#### PLAYER - ITEMS
hlr.player.giveItem = (id, item, qty=1, notify=hlr.VERBOSE) ->
    player = hlr.player.player(id)

    amount = qty
    ids = []
    while amount
        id = hlr.uniqItemId()
        ids.push(id)
        player.inventory[id] = item
        amount -= 1

    hlr.player.markDirty()

    if notify is hlr.VERBOSE and sys.loggedIn(id)
        hlr.sendTo id, "You have obtained #{qty} #{hlr.item(item).name}!"
    return ids

hlr.player.takeItem = (id, itemid, notify=hlr.VERBOSE) ->
    player = hlr.player.player(id)

    hlr.assert(itemid of player.inventory, "player doesn't have itemid in inventory")

    item = player.inventory[itemid]

    delete player.inventory[itemid]
    hlr.player.markDirty()

    if notify is hlr.VERBOSE and sys.loggedIn(id)
        hlr.sendTo id, "You lost your #{hlr.item(item).name}!"
    return item

hlr.player.sendQuicksellInfo = (id, itemid) ->
    player = hlr.player.player(id)

    hlr.assert(itemid of player.inventory, "player doesn't have itemid in inventory")

    item = hlr.item(player.inventory[itemid])
    hlr.sendTo id, "<a href='po:send//quicksell #{itemid}'><b>Quicksell #{item.name} for #{hlr.currencyFormat(hlr.quicksellPrice(item.sell))}</b></a>."

hlr.player.showInventory = (id) ->
    player = hlr.player.player(id)
    inv = player.inventory
    icount = Object.keys(inv).length

    if icount is 0
        hlr.sendTo id, "Your inventory is empty."
        return

    hlr.lineTo id
    hlr.sendTo id, "Your inventory:"

    html = "<table cellpadding='1' cellspacing='3'>"
    page = 0
    count = 0

    # Per page, 50 items (10 columns, 5 rows)
    for uniqid, itemid of inv
        if count % 50 is 0
            page += 1
            if count isnt 0
                html += "</tr>"
            html += "<tr><th colspan=10><font color=red>Page #{page}</font></th></tr><tr><th>Item</th><th>Item</th><th>Item</th><th>Item</th><th>Item</th><th>Item</th><th>Item</th><th>Item</th><th>Item</th></tr><tr>"
        else if count % 10 is 0
            html += "</tr><tr>"

        html += "<td><a href='po:send//iteminfo #{uniqid}'>#{hlr.item(itemid).name}</a></td>"
        count += 1

    html += "</tr></table>"
    hlr.sendTo id, html

    hlr.sendTo id, "To see more information about an item, as well as be able to sell it, click on its name."
    hlr.lineTo id

#### PLAYER - MONEY
hlr.player.giveMoney = (id, money, notify=hlr.VERBOSE) ->
    player = hlr.player.player(id)
    player.balance += money
    hlr.player.markDirty()

    if notify is hlr.VERBOSE and sys.loggedIn(id)
        hlr.sendTo id, "You have obtained #{hlr.currencyFormat(money)}!"

#### PLAYER - LOCATION
hlr.player.goto = (id, loc, notify=hlr.VERBOSE) ->
    player = hlr.player.player(id)
    player.location = loc
    hlr.player.markDirty()

    if notify is hlr.VERBOSE and sys.loggedIn(id)
        hlr.player.sendLocationInfo(id, loc)

hlr.player.sendLocationInfo = (id, loc) ->
    if !loc?
        loc = hlr.player.player(id).location

    lobj = hlr.location(loc)

    hlr.lineTo id

    hlr.sendTo id, "You are now in <a href='po:send//location'><b>#{lobj.name}</b> (#{hlr.locationTypeName(lobj.type)})</a>!"
    if lobj.welcome
        hlr.sendTo id, lobj.welcome

    locs = ("<a href='po:send//go #{place}'><b>#{hlr.location(place).name}</b></a>" for place in lobj.to)
    hlr.sendTo id, "From here, you can go to #{Utils.fancyJoin(locs)}."

    switch lobj.type
        when hlr.Location.SellArea
            hlr.sendTo id, "You can <a href='po:send//inventory'>sell items from your inventory</a> here."
        when hlr.Location.FishArea
            hlr.sendTo id, "You can <a href='po:send//fish'>fish</a> here."

    hlr.lineTo id

hlr.player.initStorage = ->
    players = new hlr.JsonStore("hlr-players.json")
    hlr.player.jsonstore = players
    hlr.players = players.hash
