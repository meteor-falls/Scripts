class hlr.Class
    constructor: ({@id, @name, @loadout}) ->

hlr.class = (id) -> hlr.classes.classes[id]
hlr.classes = {}
hlr.classes.classes = {}
hlr.classes.makeClass = (params) ->
    clas = new hlr.Class(params)
    hlr.classes.classes[clas.id] = clas

hlr.addClasses = ->
    {makeClass} = hlr

    makeClass id: "scout", name: "Scout", loadout: ["scattergun", "pistol_scout", "bat"]
