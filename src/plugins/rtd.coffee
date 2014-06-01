module.exports.load = ->
    Effect = (name, chance, duration, type) ->
        @name = name
        @chance = chance
        @duration = duration
        @type = type
        return
    global.RTD = {}
    playerEffects = {}
    MIN_COOLDOWN = 110
    MAX_COOLDOWN = 130
    Positive = undefined
    Neutral = undefined
    Negative = undefined
    Effect.positive = Positive = 0
    Effect.neutral = Neutral = 1
    Effect.negative = Negative = 2
    Short = undefined
    ShortMedium = undefined
    Medium = undefined
    MediumLong = undefined
    Long = undefined
    Effect.short = Short = 10
    Effect.shortMedium = ShortMedium = 15
    Effect.medium = Medium = 20
    Effect.mediumLong = MediumLong = 25
    Effect.long = Long = 30
    VeryCommon = undefined
    Common = undefined
    Uncommon = undefined
    Rare = undefined
    VeryRare = undefined
    Effect.veryCommon = VeryCommon = 1 / 15
    Effect.common = Common = 1 / 18
    Effect.uncommon = Uncommon = 1 / 23
    Effect.rare = Rare = 1 / 25
    Effect.veryRare = VeryRare = 1 / 30
    
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

    RTD.getTypeColor = (type) ->
        
        # positive neutral negative
        [
            "#2de727"
            "#0a281f"
            "#e41a28"
        ][type]

    RTD.rollString = (id, effect) ->
        obj = effects[effect]
        Utils.beautifyName(id) + " rolled and won <b style='color:" + RTD.getTypeColor(obj.type) + "'>" + obj.name + "</b> for <b>" + obj.duration + "</b> seconds."

    RTD.randomEffect = ->
        Utils.randomSample effects

    RTD.giveEffect = (id, effect, duration, timeout) ->
        ip = sys.ip(id)
        peffect = undefined
        if typeof timeout isnt "function"
            timeout = ->
                playerEffects[ip].active = false
                rtdbot.sendAll Utils.beautifyName(id) + "'s effect wore off.", 0    if sys.name(id)
                return
        effect = effect or RTD.randomEffect()
        duration = duration or effects[effect].duration
        
        # NOTE: These are not garbage collected, it's not necessary and keeps things simple.
        peffect = playerEffects[ip] =
            effect: effect
            timer: -1
            at: +sys.time()
            duration: duration
            active: true
            cooldown: sys.rand(MIN_COOLDOWN, MAX_COOLDOWN + 1)

        playerEffects[ip].timer = sys.setTimer(timeout, duration * 1000, false)
        effect

    RTD.hasEffect = (id, effect) ->
        peffect = playerEffects[sys.ip(id)]
        peffect and peffect.effect is effect and peffect.active

    
    # If the result of this function <= 0, the player may roll the dice again.
    RTD.cooldownFor = (id) ->
        ip = sys.ip(id)
        return 0    unless playerEffects[ip]
        playerEffects[ip].at + playerEffects[ip].cooldown - +sys.time()

    RTD.getPlayer = (id) ->
        playerEffects[sys.ip(id)]

    RTD.takeEffect = (id) ->
        ip = sys.ip(id)
        return false    unless playerEffects[ip]
        delete playerEffects[ip]

    RTD.effects = effects
    RTD.MIN_COOLDOWN = MIN_COOLDOWN
    RTD.MAX_COOLDOWN = MAX_COOLDOWN
    return

module.reload = ->
    module.exports.load()
    true
