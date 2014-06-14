hlr.inv = {}
hlr.inv.resolveItem = (id, itemid) -> hlr.player.player(id).inventory[itemid]
hlr.inv.hasItemId = (id, itemid) -> hlr.inv.resolveItem(id, itemid)?
hlr.inv.giveItem = (id, item) ->
    player = hlr.player(id)

    if !player?
        hlr.error("hlr.inv.giveItemTo: bad player")
    else if player.inventory[item.id]?
        hlr.error("hlr.inv.giveItemTo: item #{JSON.stringify(item)} already in inventory of #{id}")

    player.inventory[item.id] = item

hlr.inv.fixupLoadout = (clas, loadout) ->
    {Primary, Secondary, Melee, Cosmetic, Misc, Taunt, NoItem} = hlr.Item

    slots = [Primary, Secondary, Melee, Cosmetic, Misc, Taunt]
    for slot in slots
        unless hlr.inv.hasItem(loadout[slot])
            loadout[slot] = hlr.class(clas).loadout[slot] ? NoItem
    return loadout

hlr.inv.loadoutForClass = (id, clas) ->
    player = hlr.player(id)
    if !player?
        hlr.error("hlr.inv.loadoutForClass: bad player")

    return hlr.inv.fixupLoadout(clas, player.loadout[clas])
