hlr.nameOf = (id) ->
    if typeof id is 'number'
        return SESSION.users(id).originalName
    else return id

hlr.namelOf = (id) -> hlr.nameOf(id).toLowerCase()
hlr.error = (str) -> throw new Error(str)
hlr.clone = (obj) ->
    if !obj? or typeof obj isnt 'object'
        return obj

    newInstance = new obj.constructor()

    for key of obj
        newInstance[key] = clone(obj[key])

    return newInstance
