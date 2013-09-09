module.exports = function () {
    function getPlayer(name) {
        return Feedmons[name.toLowerCase()];
    }
    
    function ensurePlayer(name) {
        name = name.toLowerCase();
            
        if (!Feedmons[name]) {
            Feedmons[name] = {
                'timeout': 0,
                'feedtimeout': 0,
                'total': 0
            };
        }
        
        return Feedmons[name];
    }
    
    function has(name) {
        return !!getPlayer(name);
    }
    
    function checkTimeout(name, timeout) {
        var player = ensurePlayer(name);
        return player.timeout !== 0 && player[timeout || 'timeout'] > (+sys.time());
    }
    
    function randomPokemon() {
        return sys.pokemon(sys.rand(1, 650));
    }
    
    // Algorithm:
    /* var array = [50]; while(array.length < 100) { array.push(Math.ceil(array[array.length - 1] * 1.16)); } array
    */
    var exp = [50, 58, 68, 79, 92, 107, 125, 145, 169, 197, 229, 266, 309, 359, 417, 484, 562, 652, 757, 879, 1020, 1184, 1374, 1594, 1850, 2146, 2490, 2889, 3352, 3889, 4512, 5234, 6072, 7044, 8172, 9480, 10997, 12757, 14799, 17167, 19914, 23101, 26798, 31086, 36060, 41830, 48523, 56287, 65293, 75740, 87859, 101917, 118224, 137140, 159083, 184537, 214063, 248314, 288045, 334133, 387595, 449611, 521549, 604997, 701797, 814085, 944339, 1095434, 1270704, 1474017, 1709860, 1983438, 2300789, 2668916, 3095943, 3591294, 4165902, 4832447, 5605639, 6502542, 7542949, 8749821, 10149793, 11773760, 13657562, 15842772, 18377616, 21318035, 24728921, 28685549, 33275237, 38599275, 44775159, 51939185, 60249455, 69889368, 81071667, 94043134, 109090036, 126544442];
            
    return {
        getPlayer: getPlayer,
        ensurePlayer: ensurePlayer,
        checkTimeout: checkTimeout,
        randomPokemon: randomPokemon,
        has: has,
        exp: exp
    };
};