hlr.sendMsg = (message) -> Bot.hlr.sendAll(message, hlr.chan)
hlr.sendPlayer = (src, message) -> Bot.hlr.sendMessage(src, message, hlr.chan)
hlr.lineTo = (src) -> Bot.hlr.line(src, hlr.chan)
hlr.lineAll = (src) -> Bot.hlr.lineAll(hlr.chan)

hlr.sendErrorTo = (src, message) -> sys.sendHtmlMessage(src, "<timestamp/><i>#{message}</i>", hlr.chan)
hlr.sendTo = hlr.sendPlayer

hlr.commandList = (title, help, listtype) ->
    lists = require('lists')
    return new lists.CommandList(title, help, listtype)
