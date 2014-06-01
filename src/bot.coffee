class Bot
    constructor: (@name, color="red", @prefix, @italics=no) ->
        if !prefix?
            prefix = if italics then "+" else "±"

        @name = name
        @prefix = prefix
        @color = color
        @_italicsPart = (if italics then ["<i>", "</i>"] else ["", ""])

    markup: (message) ->
        "<font color='#{@color}'><timestamp/>#{@prefix}<b>#{@_italicsPart[0]}#{@name}:#{@_italicsPart[1]}</b></font> #{message}"

    sendAll = (message, channel) ->
        if message is ""
            @lineAll()
            return

        markup = @markup(message)
        if channel?
            sys.sendHtmlAll markup, channel
        else
            sys.sendHtmlAll markup

    sendMessage = (player, message, channel) ->
        if message is ""
            @line()
            return

        markup = @markup(message)
        if channel?
            sys.sendHtmlMessage player, markup, channel
        else
            sys.sendHtmlMessage player, markup

    line = (src, channel) ->
        if channel?
            sys.sendMessage src, "", channel
        else
            sys.sendMessage src, ""

    lineAll = (channel) ->
        if channel?
            sys.sendAll "", channel
        else
            sys.sendAll ""

bot = new Bot("Bot", "#0a4aff")
guard = new Bot("Guard", "#a80000")
watch = new Bot("Watch", "#00aa7f")
topic = new Bot("Channel Topic", "#cc0000")
setby = new Bot("Set By", "#ffaf1e")
caps = new Bot("CAPSBot", "#31945e")
flood = new Bot("FloodBot", "#39ab5a")
rtd = new Bot("RTD", "#1c4eaa")

kick = new Bot("Kick", "#d6000f")
mute = new Bot("Mute", "#5b1eff")
unmute = new Bot("Unmute", "#089107")
reason = new Bot("Reason", "#000ff4")

module.exports = {
    Bot,

    # Bot instances
    bot,
    guard, watch, caps, flood,
    topic, setby,
    rtd,
    kick, mute, unmute, reason
}
