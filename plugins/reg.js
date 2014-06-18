(function () {
    var currentVersion = 1;
    function updateReg(reg) {
        reg.save("version", currentVersion);
        reg.version = currentVersion;
    }

    function RegClass() {
        var file = "Reg.json";
        this.data = {};
        this.version = -1;

        if (sys.fileExists(file)) {
            this.data = JSON.parse(sys.getFileContent(file));
        } else {
            sys.writeToFile(file, "{}");
        }

        this.version = this.data.version || currentVersion;

        this.save = function (key, value) {
            // Not sure if this solution is advantageous...
            /*if (typeof(this.data[key]) === "string" && typeof(value) === "string") {
                if (this.data[key] === value) {
                    return;
                }
            }*/
            this.data[key] = value;
            this.saveData();
        };

        this.init = function (key, value) {
            if (this.data[key] === undefined) {
                this.save(key, value);
            }
        };

        this.get = function (key) {
            return this.data[key];
        };

        this.remove = function (key) {
            var deleted = false;
            if (this.data[key]) {
                deleted = (delete this.data[key]);
                this.saveData();
            }

            return deleted;
        };

        this.saveData = function () {
            sys.writeToFile(file, JSON.stringify(this.data));
        };

        this.clearAll = function () {
            this.data = {};
            this.saveData();
        };

        this.dump = function () {
            var dataKeys = Object.keys(this.data);
            return [
                "Reg dump @ " + (new Date()).toUTCString(),
                "Version " + this.version,
                dataKeys.length + " keys, being:",
                dataKeys.join(", ")
            ].join("\n");
        };

        updateReg(this);
    }

    module.exports.Reg = RegClass;
    module.exports.updateReg = updateReg;
    module.reload = function () {
        Reg = new (module.exports.Reg)();
        return true;
    };
}());
