Bot = (name, color, prefix, italics) ->
    italics = italics or false
    prefix = prefix or ((if italics then "+" else "±"))
    color = color or "red"
    @name = name
    @prefix = prefix
    @color = color
    @italics = italics
    @italicsPart = (if italics then [
        "<i>"
        "</i>"
    ] else [
        ""
        ""
    ])
    return

Bot::markup = (message) ->
    "<font color='" + @color + "'><timestamp/>" + @prefix + "<b>" + @italicsPart[0] + @name + ":" + @italicsPart[1] + "</b></font> " + message

Bot::sendAll = (message, channel) ->
    if message is ""
        sys.sendAll message, channel
        return
    markup = @markup(message)
    if channel is `undefined`
        sys.sendHtmlAll markup
    else
        sys.sendHtmlAll markup, channel
    return

Bot::sendMessage = (player, message, channel) ->
    if message is ""
        sys.sendMessage player, message, channel
        return
    markup = @markup(message)
    if channel is `undefined`
        sys.sendHtmlMessage player, markup
    else
        sys.sendHtmlMessage player, markup, channel
    return

Bot::line = (src, channel) ->
    if channel isnt `undefined`
        sys.sendMessage src, "", channel
    else
        sys.sendMessage src, ""
    return

Bot::lineAll = (channel) ->
    if channel isnt `undefined`
        sys.sendAll "", channel
    else
        sys.sendAll ""
    return

module.exports.Bot = Bot
module.reload = ->
    
    # These are all meant to be globals.
    bot = new Bot("Bot", "#0a4aff")
    guard = new Bot("Guard", "#a80000")
    watchbot = new Bot("Watch", "#00aa7f")
    topicbot = new Bot("Channel Topic", "#cc0000")
    setbybot = new Bot("Set By", "#ffaf1e")
    capsbot = new Bot("CAPSBot", "#31945e")
    flbot = new Bot("FloodBot", "#39ab5a")
    rtdbot = new Bot("RTD", "#1c4eaa")
    
    # Then there are also lesser used bots, as static properties on Bot
    Bot.kick = new Bot("Kick", "#d6000f")
    Bot.mute = new Bot("Mute", "#5b1eff")
    Bot.unmute = new Bot("Unmute", "#089107")
    Bot.reason = new Bot("Reason", "#000ff4")
    true
