do ->
    schematic = """
        S S S S S S S S S S S S
        o o o o o o o o o o o o
        o o o o o o o o o o o o
        o o o o o o o o o o o o
        o o o o o o o o o o o o
        S S S S S S S S S S S S
    """

    map = new hlr.Map("dm_chesslane", {
        name: 'Chesslane'
        gamemode: hlr.GameMode.Deathmatch
        maxplayers: 24
    }).schematic(schematic)
