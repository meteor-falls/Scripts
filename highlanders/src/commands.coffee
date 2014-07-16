hlr.addCommands = ->
    {addCommand, authMaintainer: maintainer, authRegistered: registered} = hlr

    addCommand 'hlrcommands', ->
        list = hlr.commandList("Highlanders Commands").add([
            ["register", "Registers a Highlanders account for this name. The account is bound to your name, not your IP."]
            ["location", "Shows your current location. Aliases: l, loc"]
            ["go", "Go to that location. Aliases: g, goto", ["location"]]
            ["fish", "Fish in locations that allow it. Also used to choose your rod toss direction.", ["direction"]]
        ]).finish().render(@src, @chan)

    addCommand 'register', ->
        if hlr.player.registered(@src)
            hlr.sendErrorTo @src, "Your account is already registered."
        else
            if !sys.dbRegistered(sys.name(@src))
                hlr.sendErrorTo @src, "Your PO username must be registered before you make a Highlanders account."
                return

            hlr.player.register(@src)
            hlr.sendTo @src, "Account registered!"

            # Registration drops
            hlr.player.giveMoney(@src, 100)

            hlr.player.goto(@src, 'market')

    addCommand 'inventory', ->
        hlr.player.showInventory(@src)
    , registered

    addCommand 'location', ->
        hlr.player.sendLocationInfo(@src)
    , registered

    addCommand ['go', 'g', 'goto'], ->
        loc = @commandData.toLowerCase().trim()
        player = hlr.player.player(@src)
        ploc = player.location

        if loc is ploc
            hlr.sendErrorTo @src, "You are already there!"
            return

        maygo = hlr.location(ploc).to
        if !(loc in maygo)
            hlr.sendErrorTo @src, "You can't go there, sorry."
            return

        hlr.player.goto(@src, @ploc)
    , registered

    # todo: timer
    addCommand 'fish', ->
        player = hlr.player.player(@src)
        sess = hlr.player.session(@src)
        lobj = hlr.location(player.location)

        if lobj.type isnt hlr.Location.FishArea
            hlr.sendErrorTo @src, "You can't fish here!"
            return

        sess.fishing ?= {}

        if !sess.fishing.fishing and sess.fishing.cooldown > sys.time()
            hlr.sendErrorTo @src, "Slow down, cowboy."
            return

        direction = @commandData.toLowerCase().trim()
        if sess.fishing.fishing and !direction
            hlr.sendErrorTo @src, "You're already fishing!"
            return
        else if !sess.fishing.fishing and direction
            hlr.sendErrorTo @src, "To what fish?"
            return

        if !(direction in ['left', 'center', 'right'])
            hlr.sendErrorTo @src, "You can only go throw your fishing rod to the left, center, or right.", chan
            return

        setCooldown = -> sess.fishing.cooldown = sys.time() + 5
        if sess.fishing.fishing
            if direction is sess.fishing.direction
                hlr.sendTo @src, "You caught the #{hlr.item(sess.fishing.fish).name}!"
                id = hlr.player.giveItem(@src, sess.fishing.fish)[0]
                hlr.player.sendQuicksellInfo(@src, id)
            else
                hlr.sendTo @src, "The #{hlr.item(sess.fishing.fish).name} went #{sess.fishing.direction}, not #{direction}! Better luck next time..."

            sess.fishing.fishing = no
            setCooldown()
        else
            if Math.random() > lobj.fishFailChance
                hlr.sendTo @src, "You didn't find anything."
                setCooldown()
                return

            sess.fishing.fishing = yes
            sess.fishing.fish = Utils.randomSample(lobj.fish)
            sess.fishing.direction = Utils.randomSample({left: 1/3, center: 1/3, right: 1/3})
            hlr.sendTo @src, "You found #{hlr.an(hlr.item(sess.fishing.fish).name)}! Catch it quickly! Throw your rod in one of these directions:"
            hlr.sendTo @src, "<a href='po:send//fish left'>[Left]</a> <a href='po:send//fish center'>[Center]</a> <a href='po:send//fish right'>[Right]</a>"
    , registered

    # Unlisted commands
    addCommand 'quicksell', ->
        player = hlr.player.player(@src)
        itemid = parseInt(@commandData, 10)

        # Ignore (missclick or something)
        if !(itemid of player.inventory)
            return

        item = player.inventory[itemid]
        price = hlr.quicksellPrice(item)

        item = hlr.player.takeItem(@src, itemid, hlr.SILENT)
        # More appropriate message
        hlr.sendTo @src, "You sold your #{hlr.item(item).name} for #{hlr.currencyFormat(price)}!"
        hlr.player.giveMoney(@src, price)
    , registered
