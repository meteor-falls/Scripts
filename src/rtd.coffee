Utils = require './utils'
rtdbot = require('./bot').rtd

playerEffects = {}
MIN_COOLDOWN = 110
MAX_COOLDOWN = 130

class Effect
    @Positive: 0
    @Neutral: 1
    @Negative: 2

    @Short: 10
    @ShortMedium: 15
    @Medium: 20
    @MediumLong: 25
    @Long: 30

    @VeryCommon: 1/15
    @Common: 1/18
    @Uncommon: 1/23
    @Rare: 1/25
    @VeryRare: 1/30

    constructor: (@name, @chance, @duration, @type) ->

{Positive, Neutral, Ngeative, Short, ShortMedium, MediumLong, Long, VeryCommon, Common, Uncommon, Rare, VeryRare} = Effect

# Name Chance Duration Type
effects =
    # Emotes
    bigger_emotes: new Effect("Bigger Emotes", Uncommon, Medium, Positive)
    nobody_cares: new Effect("Nobody Cares", Common, Long, Neutral)
    im_blue: new Effect("I'm Blue", Uncommon, Long, Neutral)
    random_emotes: new Effect("Random Emotes", Uncommon, MediumLong, Neutral)
    emote_infection: new Effect("Emote Infection", Rare, Long, Positive)
    blank_emotes: new Effect("Blank Emotes", Common, Long, Negative)
    smaller_emotes: new Effect("Smaller Emotes", Uncommon, Long, Negative)

    # Chat text
    big_text: new Effect("Big Text", Rare, Medium, Positive)
    small_text: new Effect("Small Text", Common, Long, Negative)
    screech: new Effect("Screech", Common, Long, Negative)
    pew: new Effect("Pew!", Rare, Long, Neutral)

getTypeColor = (type) ->
    # positive neutral negative
    return [
        "#2de727"
        "#0a281f"
        "#e41a28"
    ][type]

# TODO: to command
#rollString = (id, effect) ->
#    obj = effects[effect]
#    Utils.beautifyName(id) + " rolled and won <b style='color:" + RTD.getTypeColor(obj.type) + "'>" + obj.name + "</b> for <b>" + obj.duration + "</b> seconds."

randomEffect = ->
    Utils.randomSample effects

giveEffect = (id, effect, duration, timeout) ->
    ip = sys.ip(id)

    if typeof timeout isnt "function"
        timeout = ->
            playerEffects[ip].active = false
            if sys.name(id)
                rtdbot.sendAll Utils.beautifyName(id) + "'s effect wore off.", 0

    effect = effect or randomEffect()
    duration = duration or effects[effect].duration

    # NOTE: These are not garbage collected, it's not necessary and keeps things simple.
    peffect = playerEffects[ip] =
        effect: effect
        timer: -1
        at: sys.time()
        duration: duration
        active: true
        cooldown: sys.rand(MIN_COOLDOWN, MAX_COOLDOWN + 1)

    playerEffects[ip].timer = sys.setTimer(timeout, duration * 1000, false)
    return effect

hasEffect = (id, effect) ->
    peffect = playerEffects[sys.ip(id)]
    return peffect and peffect.effect is effect and peffect.active

# If the result of this function <= 0, the player may roll the dice again.
cooldownFor = (id) ->
    ip = sys.ip(id)

    unless playerEffects[i]
        return 0

    return playerEffects[ip].at + playerEffects[ip].cooldown - sys.time()

getPlayer = (id) ->
    playerEffects[sys.ip(id)]

takeEffect = (id) ->
    ip = sys.ip(id)
    unless playerEffects[ip]
        return false

    delete playerEffects[ip]

module.exports = {
    Effect, effects,
    playerEffects,
    MIN_COOLDOWN, MAX_COOLDOWN,
    getTypeColor, randomEffect, giveEffect, hasEffect, cooldownFor, getPlayer, takeEffect
}
