# Script state - global variables, &c.
Server =
    startUpTime: -1
    # border: "<font color=blue><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>"
    tourmode: 0

    spinTypes: [] # can contain: items, emotes, pokemons

    silence: off # TODO: from muteall
    supersilence: off

    roulette: off # TODO: from rouletteon
    htmlchat: off

    lolmode: off
    spacemode: off
    capsmode: off
    reversemode: off
    marxmode: off
    georgemode: off
    comicmode: off
    scramblemode: off
    colormode: off
    pewpewpew: off
    nightclub: off

    warnings: {}
    teamSpammers: {}
    reconnectTrolls: {}
    uniqueVisitors:
        ips: {}
        count: 0
        total: 0

    poll:
        active: no
        subject: ""
        'by': ""
        options: []
        votes: {}

module.exports = Server
