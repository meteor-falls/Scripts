hooks = {}

reghook = (name, handler) ->
    hooks[name] ?= []
    hooks[name].push handler

callhooks = (name, args...) ->
    eventhooks = hooks[name]
    if eventhooks
        for handler in eventhooks
            handler args...

module.exports = {hooks, reghook, callhook}
