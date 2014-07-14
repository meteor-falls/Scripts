hlr.locations = {}
hlr.location = (e, obj) -> if obj then hlr.locations[e] = obj else hlr.locations[e]

hlr.Location =
    SellArea: 0x0
    FishArea: 0x1
    DuelGunArea: 0x2

#### LOCATIONS ####
hlr.location 'market', {
    name: "Market"
    to: ['river'] # todo: saloon
    type: hlr.Location.SellArea
    welcome: 'Welcome to the Market! Here you can sell your fish for full price.'
}

hlr.location 'river', {
    name: "River"
    to: ['market']
    type: hlr.Location.FishArea
    fish: {
        tuna: 1/7
        sardine: 1/7
        mackerel: 1/9
        salmon: 1/9
        barb: 1/10
        bass: 1/10
        catfish: 1/13
        clownfish: 1/16
        swordfish: 1/18
    }
    fishFailChance: 0.1
    welcome: 'Welcome to the River! Here you can fish and quicksell it for a cheaper price.'
}

hlr.location 'saloon', {
    name: "Saloon"
    to: ['market']
    type: hlr.Location.DuelGunArea
}

hlr.locationTypeName = (type) ->
    ["Marketplace", "Fishing", "Gun Dueling"][type]
