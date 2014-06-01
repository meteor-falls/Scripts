(->
    updateReg = (reg) ->
        if reg.version is 0
            ("Megausers FloodIgnore Mutes Rangebans Kickmsgs Banmsgs Welmsgs EmoteToggles Emoteperms Feedmon").split(" ").forEach (key) ->
                val = reg.get(key)
                reg.save key, JSON.parse(val)    if typeof val is "string"
                return

        reg.save "version", currentVersion
        reg.version = currentVersion
        return
    RegClass = ->
        file = "Reg.json"
        @data = {}
        @version = -1
        if sys.fileExists(file)
            @data = JSON.parse(sys.getFileContent(file))
        else
            sys.writeToFile file, "{}"
        @version = @data.version or currentVersion
        @save = (key, value) ->
            
            # Not sure if this solution is advantageous...
            #if (typeof(this.data[key]) === "string" && typeof(value) === "string") {
            #                if (this.data[key] === value) {
            #                    return;
            #                }
            #            }
            @data[key] = value
            @saveData()
            return

        @init = (key, value) ->
            @save key, value    if @data[key] is `undefined`
            return

        @get = (key) ->
            @data[key]

        @remove = (key) ->
            deleted = false
            if @data[key]
                deleted = (delete @data[key]
                )
                @saveData()
            deleted

        
        #
        #        this.removeIf = function (func) {
        #            var x, d = this.data,
        #                madeChange = false;
        #            for (x in d) {
        #                if (func(d, x)) {
        #                    delete d[x];
        #                    madeChange = true;
        #                }
        #            }
        #
        #            if (madeChange) {
        #                this.saveData();
        #            }
        #        };
        #
        #        this.removeIfValue = function (key, value) {
        #            if (this.data[key] === value) {
        #                delete this.data[key];
        #                this.saveData();
        #            }
        #        };
        @saveData = ->
            sys.writeToFile file, JSON.stringify(@data)
            return

        @clearAll = ->
            @data = {}
            @saveData()
            return

        @dump = ->
            dataKeys = Object.keys(@data)
            [
                "Reg dump @ " + (new Date()).toUTCString()
                "Version " + @version
                dataKeys.length + " keys, being:"
                dataKeys.join(", ")
            ].join "\n"

        updateReg this
        return
    currentVersion = 1
    module.exports.Reg = RegClass
    module.exports.updateReg = updateReg
    module.reload = ->
        Reg = new (module.exports.Reg)()
        true

    return
)()
