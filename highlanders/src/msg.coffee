hlr.sendMsg = (message, chan=hlr.chan) -> sys.sendAll(message, chan)
hlr.sendHtml = (message, chan=hlr.chan) -> sys.sendHtmlAll(message, chan)
hlr.sendPlayer = (src, message, chan=hlr.chan) -> sys.sendMessage(src, message, chan)
hlr.sendPlayerHtml = (src, message, chan=hlr.chan) -> sys.sendHtmlMessage(src, message, chan)

hlr.sendErrorTo = (src, message, chan=hlr.chan) -> hlr.sendPlayerHtml(src, "<timestamp/><i>#{message}</i>", chan)
hlr.sendTo = (src, message, chan=hlr.chan) -> hlr.sendPlayer(src, message, chan)

hlr.commandList = (title, help, listtype) -> new require('lists.js').CommandList(title, help, listtype)
