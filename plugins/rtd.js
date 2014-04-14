module.exports.load = function () {
    global.RTD = {};
    var playerEffects = {};
    var MIN_COOLDOWN = 120; // 2m
    var MAX_COOLDOWN = 145; // 2m25s

    function randomSample(hash) {
        var cum = 0;
        var val = Math.random();
        var psum = 0.0;
        var x;
        var count = 0;
        for (x in hash) {
            psum += hash[x].chance;
            count += 1;
        }
        if (psum === 0.0) {
            var j = 0;
            for (x in hash) {
                cum = (++j) / count;
                if (cum >= val) {
                    return x;
                }
            }
        } else {
            for (x in hash) {
                cum += hash[x].chance / psum;
                if (cum >= val) {
                    return x;
                }
            }
        }
    }

    function Effect(name, chance, duration, type) {
        this.name = name;
        this.chance = chance;
        this.duration = duration;
        this.type = type;
    }

    var Positive, Neutral, Negative;
    Effect.positive = Positive = 0;
    Effect.neutral  = Neutral  = 1;
    Effect.negative = Negative = 2;

    var Short, Medium, Long;
    Effect.short  = Short  = 10;
    Effect.medium = Medium = 20;
    Effect.long   = Long   = 30;

    var VeryCommon, Common, Uncommon, Rare, VeryRare;
    Effect.veryCommon = VeryCommon = 1/15;
    Effect.common     = Common     = 1/18;
    Effect.uncommon   = Uncommon   = 1/23;
    Effect.rare       = Rare       = 1/25;
    Effect.veryRare   = VeryRare   = 1/30;

    var effects = {
        // Emotes
        bigger_emotes: new Effect('Bigger Emotes', Uncommon, Medium, Positive),
        mega_emotes: new Effect('Mega Emotes', VeryRare, Short, Positive),

        nobody_cares: new Effect('Nobody Cares', Common, Long, Neutral),
        terry_crews: new Effect('Terry Crews', VeryCommon, Long, Neutral),
        im_blue: new Effect("I'm Blue", Common, Long, Neutral),

        blank_emotes: new Effect('Blank Emotes', VeryCommon, Long, Negative),
        smaller_emotes: new Effect('Smaller Emotes', VeryCommon, Long, Negative),

        // Chat text
        big_text: new Effect('Big Text', Rare, Medium, Positive)
    };

    RTD.getTypeColor = function (type) {
        // positive neutral negative
        return ['#2de727', '#0a281f', '#e41a28'][type];
    };

    RTD.rollString = function (id, effect) {
        var obj = effects[effect];
        return sys.name(id) + " rolled and won <b style='color: " + RTD.getTypeColor(obj.type) + ";'>" + obj.name + "</b> for <b>" + obj.duration + "</b> seconds.";
    };

    RTD.rollTheDice = function () {
        return randomSample(effects);
    };

    RTD.giveEffect = function (id, effect, duration, timeout) {
        var ip = sys.ip(id),
            peffect;

        if (typeof timeout !== 'function') {
            timeout = function () {
                var name = sys.name(id);
                if (!name) { // player left
                    return;
                }

                rtdbot.sendAll(name + "'s effect ended.", 0);
                playerEffects[ip].active = false;
            };
        }

        effect = effect || RTD.rollTheDice();
        duration = duration || effects[effect].duration;

        // NOTE: These are not garbage collected, it's not necessary and keeps things simple.
        peffect = playerEffects[ip] = {
            effect: effect,
            timer: -1,
            at: +sys.time(),
            duration: duration,
            active: true,
            cooldown: sys.rand(MIN_COOLDOWN, MAX_COOLDOWN)
        };

        playerEffects[ip].timer = sys.setTimer(timeout, duration * 1000, false);
        return effect;
    };

    RTD.hasEffect = function (id, effect) {
        var peffect = playerEffects[sys.ip(id)];
        return peffect && peffect.effect === effect && (peffect.at + peffect.duration) >= +sys.time() && peffect.active;
    };

    // If the result of this function <= 0, the player may roll the dice again.
    RTD.cooldownFor = function (id) {
        var ip = sys.ip(id);
        if (!playerEffects[ip]) {
            return 0;
        }

        return playerEffects[ip].at + playerEffects[ip].cooldown - +sys.time();
    };

    RTD.getPlayer = function (id) {
        return playerEffects[sys.ip(id)];
    };

    RTD.takeEffect = function (id) {
        var ip = sys.ip(id);
        if (!playerEffects[ip]) {
            return false;
        }

        return (delete playerEffects[ip]);
    };

    RTD.effects = effects;
    RTD.MIN_COOLDOWN = MIN_COOLDOWN;
    RTD.MAX_COOLDOWN = MAX_COOLDOWN;
};

module.reload = function () {
    module.exports.load();
    return true;
};
