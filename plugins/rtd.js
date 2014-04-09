module.exports.load = function () {
    global.RTD = {};
    var playerEffects = {};
    var MIN_COOLDOWN = 90; // 1m30s
    var MAX_COOLDOWN = 130; // 2m10s

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

    var effects = {
        blank_emotes: {
            name: 'Blank Emotes',
            chance: 1/18,
            duration: 30,
            type: 'negative'
        },
        bigger_emotes: {
            name: 'Bigger Emotes',
            chance: 1/20,
            duration: 20,
            type: 'neutral'
        }
    };

    RTD.getTypeColor = function (type) {
        return {
            'negative': '#e41a28',
            'neutral': '#0a281f',
            'positive': '#2de727'
        }[type];
    };

    RTD.rollString = function (id, effect) {
        var obj = effects[effect];
        return sys.name(id) + " rolled and won <b style='color: " + RTD.getTypeColor(obj.type) + ";'>" + obj.name + "</b> for <b>" + obj.duration + "</b> seconds.";
    };

    RTD.rollTheDice = function () {
        return randomSample(effects);
    };

    RTD.giveEffect = function (id, timeout, effect) {
        if (typeof timeout === 'string') {
            effect = timeout;
            timeout = null;
        }

        if (typeof timeout !== 'function') {
            timeout = function () {
                rtdbot.sendAll(sys.name(id) + "'s effect ended.", 0);
            };
        }

        effect = effect || RTD.rollTheDice();

        playerEffects[id] = {
            effect: effect,
            timer: -1,
            at: +sys.time(),
            cooldown: sys.rand(MIN_COOLDOWN, MAX_COOLDOWN)
        };

        playerEffects[id].timer = sys.setTimer(timeout, effects[effect].duration * 1000, false);
        return effect;
    };

    RTD.hasEffect = function (id, effect) {
        return playerEffects.hasOwnProperty(id) && playerEffects[id].effect === effect && (playerEffects[id].at + effects[effect].duration) >= +sys.time();
    };

    // If the result of this function <= 0, the player may roll the dice again.
    RTD.cooldownFor = function (id) {
        if (!playerEffects[id]) {
            return 0;
        }

        return playerEffects[id].at + playerEffects[id].cooldown - +sys.time();
    };

    RTD.getPlayer = function (id) {
        return playerEffects[id];
    };

    RTD.takeEffect = function (id) {
        if (!playerEffects[id]) {
            return false;
        }

        return (delete playerEffects[id]);
    };

    RTD.effects = effects;
    RTD.MIN_COOLDOWN = MIN_COOLDOWN;
    RTD.MAX_COOLDOWN = MAX_COOLDOWN;
};

module.reload = function () {
    module.exports.load();
    return true;
};
