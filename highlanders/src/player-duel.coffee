hlr.player ?= {}
hlr.player.duel = {}

hlr.player.duel.isChallenged = (id) ->
    tar = hlr.player.session(id).duel?.awaitingChallenge
    if tar then sys.loggedIn(tar) else no

hlr.player.duel.hasChallenged = (id) ->
    tar = hlr.player.session(id).duel?.challenged
    if tar then sys.loggedIn(tar) else no

hlr.player.duel.isDueling = (id) ->
    tar = hlr.player.session(id).duel?.dueling
    if tar then sys.loggedIn(tar) else no

hlr.player.duel.challenge = (id, tar) ->
    srcsess = hlr.player.session(id)
    tarsess = hlr.player.session(tar)

    srcduel = srcsess.duel or= {}
    tarduel = tarsess.duel or= {}

    srcduel.challenged = tar
    tarduel.awaitingChallenge = src

hlr.player.duel.denyDuel = (id) ->
    duel = hlr.player.session(id).duel

    hlr.player.session(duel.awaitingChallenge)?.challenged = no
    duel.awaitingChallenge = no
