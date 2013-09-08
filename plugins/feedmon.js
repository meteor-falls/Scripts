var Feedmon = (function () {
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
    
    return {
        getPlayer: getPlayer,
        ensurePlayer: ensurePlayer,
        checkTimeout: checkTimeout,
        randomPokemon: randomPokemon,
        has: has
    };
}());