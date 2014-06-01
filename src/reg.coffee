file = "Reg.json"

class Reg
    constructor: ->
        @data = {}
        @version = -1

        if sys.fileExists(file)
            @data = JSON.parse(sys.getFileContent(file))
        else
            sys.writeToFile file, "{}"

        @version = @data.version ? 1

    save: (key, value) ->
        @data[key] = value
        @saveData()

    init: (key, value) ->
        if !@data[key]?
            @save key, value

    get: (key) -> @data[key]

    remove: (key) ->
        deleted = false
        if @data[key]?
            deleted = (delete @data[key])
            @saveData()
        return deleted

    saveData: ->
        sys.writeToFile file, JSON.stringify(@data)

    clearAll: ->
        @data = {}
        @saveData()

    dump: ->
        dataKeys = Object.keys(@data)
        return """
            Reg dump @ #{(new Date()).toUTCString()}
            Version #{@version}
            #{dataKeys.length} keys, being:
            #{dataKeys.join(", ")}
        """

module.exports = {
    Reg,
    reg: new Reg()
}
