hlr.persistence = {stores: []}
class hlr.JsonStore
    constructor: (@file, @saverate=60) ->
        hlr.persistence.stores.push(this)
        @hash = {}
        @dirty = no
        @load()
        @initDefaults()
    markDirty: -> @dirty = yes
    load: ->
        if sys.fileExist(@file)
            @hash = JSON.parse(sys.getFileContent(@file))
    saveAll: ->
        if @dirty
            sys.writeToFile(@file, JSON.stringify(@hash))
    initDefaults: ->
