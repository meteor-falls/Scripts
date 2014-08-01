hlr.items = {}
hlr.item = (e, obj) -> if obj then hlr.items[e] = obj else hlr.items[e]

hlr.item.gun = (e, obj) ->
    if obj
        obj.type = hlr.Item.Gun
    hlr.item(e, obj)
hlr.item.fish = (e, obj) ->
    if obj
        obj.type = hlr.Item.Fish
    hlr.item(e, obj)

hlr.Item =
    Gun: 0x0
    Fish: 0x1

hlr.quicksellPrice = (price=0) ->
    if typeof price is 'object'
        price = price.sell
    else if typeof price is 'string'
        price = hlr.item(price).sell

    if price
        return Math.ceil(price / 2)
    else return 0

hlr.currencyFormat = (a) -> "£#{a}"

#### GUNS ####
hlr.item.gun 'revolver', name: "Revolver"

#### FISH ####
# Low tier
hlr.item.fish 'tuna', name: "Tuna", sell: 3
hlr.item.fish 'sardine', name: "Sardine", sell: 3
hlr.item.fish 'mackerel', name: "Mackerel", sell: 4
hlr.item.fish 'salmon', name: 'Salmon', sell: 4
hlr.item.fish 'barb', name: 'Barb', sell: 5
hlr.item.fish 'bass', name: 'Bass', sell: 5
hlr.item.fish 'catfish', name: 'Catfish', sell: 6

# Mid tier
hlr.item.fish 'clownfish', name: "Clownfish", sell: 9
hlr.item.fish 'swordfish', name: "Swordfish", sell: 10
