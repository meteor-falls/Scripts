class hlr.JsonStore
    constructor: (@file, @saverate=30) ->
        @hash = {}
        @dirty = no
        @load()
        @initDefaults()
    markDirty: ->
        @dirty = yes
        return this
    load: ->
        if sys.fileExists(@file)
            @hash = JSON.parse(sys.getFileContent(@file))
        return this
    saveAll: ->
        if @dirty
            sys.writeToFile(@file, JSON.stringify(@hash))
            Utils.watch.notify("hlr #{@file} saved")
        return this
    initDefaults: ->
