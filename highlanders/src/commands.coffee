hlr.addCommands = ->
    {addCommand, authSupport: support, authMaintainer: maintainer, authRegistered: registered} = hlr

    addCommand 'commands', ->
        hlr.sendTo @src, """
            Highlanders Commands
            ====================

            commands: Shows this message.
            register: Register a highlanders account on this name.

            To use the following, you must have registered first:
            -----------------------------------------------------

            inventory: Shows your inventory.
        """, chan

    addCommand 'register', ->
        if hlr.player.registered(@src)
            hlr.sendErrorTo @src, "Your account is already registered.", @chan
        else
            hlr.player.register(@src)
            hlr.sendTo @src, "Account registered! Check out the other commands.", @chan

    #addCommand 'inventory', ->
    #, registered
