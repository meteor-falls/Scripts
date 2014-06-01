var CCTiers = ["CC 1v1", "Wifi CC 1v1", "Challenge Cup"];
var bannedDWAbilities = {
    'chandelure': ['shadow tag']
};

function isTier(tier) {
    var list = sys.getTierList(),
        len, i;

    tier = tier.toLowerCase();

    for (i = 0, len = list.length; i < len; i += 1) {
        if (list[i].toLowerCase() === tier) {
            return true;
        }
    }

    return false;
}

function isCCTier(tier) {
    return CCTiers.indexOf(tier) > -1;
}

        util.isTier = function (tier) {
            var list = sys.getTierList(),
                len, i;

            tier = tier.toLowerCase();

            for (i = 0, len = list.length; i < len; i += 1) {
                if (list[i].toLowerCase() === tier) {
                    return true;
                }
            }

            return false;
        };

function hasOneUsablePoke(src, team) {
    var fine = false;
    var j, i;
    for (i = 0; i < 6; i += 1) {
        if (sys.teamPoke(src, team, i) !== 0) {
            for (j = 0; j < 4; j += 1) {
                if (sys.teamPokeMove(src, team, i, j) !== 0) {
                    fine = true;
                    break;
                }
            }
        }
    }

    return fine;
}

function hasDrizzleSwim(src) {
    var swiftswim,
        drizzle,
        teamCount = sys.teamCount(src),
        teams_banned = [];
    var ability, team, i;

    if (sys.hasTier(src, "5th Gen OU")) {
        for (team = 0; team < teamCount; team += 1) {
            if (sys.tier(src, team) !== "5th Gen OU") {
                continue;
            }
            swiftswim = false;
            drizzle = false;
            for (i = 0; i < 6; i += 1) {
                ability = sys.ability(sys.teamPokeAbility(src, team, i));
                if (ability === "Swift Swim") {
                    swiftswim = true;
                } else if (ability === "Drizzle") {
                    drizzle = true;
                }

                if (drizzle && swiftswim) {
                    teams_banned.push(team);
                    break;
                }
            }
        }
    }

    return teams_banned;
}

function hasSandCloak(src) { // Has Sand Veil or Snow Cloak in tiers < 5th Gen Ubers.
    var teams_banned = [],
        teamCount = sys.teamCount(src);
    var ability, team, i;

    for (team = 0; team < teamCount; team += 1) {
        if (sys.tier(src, team) === "5th Gen Ubers" || sys.gen(src, team) !== 5) {
            continue; // Only care about 5th Gen
        }
        for (i = 0; i < 6; i += 1) {
            ability = sys.ability(sys.teamPokeAbility(src, team, i));
            if (ability === "Sand Veil" || ability === "Snow Cloak") {
                teams_banned.push(team);
                break;
            }
        }
    }

    return teams_banned;
}

function dreamAbilityCheck(src) {
    var teamCount = sys.teamCount(src),
        ability, poke, lpoke, i;

    for (i = 0; i < teamCount; i += 1) {
        ability = sys.ability(sys.teamPokeAbility(src, i, i));
        poke = sys.pokemon(sys.teamPoke(src, i, i));
        lpoke = poke.toLowerCase();

        if (bannedAbilities.hasOwnProperty(lpoke) && bannedAbilities[lpoke].indexOf(ability.toLowerCase()) !== -1) {
            bot.sendMessage(src, poke + " is not allowed to have ability " + ability + " in the 5th Gen OU Tier. Please change it in Teambuilder. You are now in the Random Battle tier.");
            return true;
        }
    }

    return false;
}

module.exports = {
    isTier: isTier,
    isCCTier: isCCTier,
    hasOneUsablePoke: hasOneUsablePoke,
    hasDrizzleSwim: hasDrizzleSwim,
    hasSandCloak: hasSandCloak,
    dreamAbilityCheck: dreamAbilityCheck
};
