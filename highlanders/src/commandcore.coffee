hlr.commands = {}
hlr.canUseCommand = (src, command, chan) ->
    unless hlr.commands.hasOwnProperty(command)
        return no

    command = hlr.commands[command]
    if hlr.isMaintainer(src)
        return yes

    if command.auth is 'maintainer'
        return no

    if command.auth is 'support'
        return hlr.onSupportTeam(src)

    if command.auth is 'registered'
        if hlr.player.registered(src)
            return yes
        else
            throw "In order to use this command, you must first <a href='po:send//hlrreg'>Register a Highlanders account</a>, or sign into an already existing account."

    return yes

hlr.handleCommand = (src, message, command, commandData, tar, chan) ->
    hlr.commands[command].handler.call({src, command, commandData, tar, chan, message})

hlr.addCommand = (name, handler, auth='') -> hlr.commands[name] = {name, handler, auth}
hlr.authSupport = 'support'
hlr.authRegistered = 'registered'
hlr.authMaintainer = 'maintainer'
