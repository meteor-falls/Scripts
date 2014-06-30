(function () {
    var currentVersion = 1;
    function updateReg(reg) {
        reg.save("version", currentVersion);
        reg.version = currentVersion;
    }

    function RegClass() {
        var file = "Reg.json";
        this.data = {};
        this.changed = false;
        this.version = -1;

        if (sys.fileExists(file)) {
            this.data = JSON.parse(sys.getFileContent(file));
        } else {
            sys.writeToFile(file, "{}");
        }

        this.version = this.data.version || currentVersion;
        updateReg(this);
    }

    var reg = RegClass.prototype;
    reg.save = function (key, value) {
        this.data[key] = value;
        this.changed = true;
        this.saveData();
    };

    this.init = function (key, value) {
        if (this.data[key] === undefined) {
            this.save(key, value);
        }
    };

    reg.get = function (key) {
        return this.data[key];
    };

    reg.remove = function (key) {
        var deleted = false;
        if (this.data[key]) {
            deleted = (delete this.data[key]);
            this.changed = true;
            this.saveData();
        }

        return deleted;
    };

    reg.saveData = function () {
        if (!this.changed) {
            return;
        }

        this.changed = false;
        sys.writeToFile(file, JSON.stringify(this.data));
    };

    reg.clearAll = function () {
        this.data = {};
        this.changed = true;
        this.saveData();
    };

    reg.dump = function () {
        var dataKeys = Object.keys(this.data);
        return [
            "Reg dump @ " + (new Date()).toUTCString(),
            "Version " + this.version,
            dataKeys.length + " keys, being:",
            dataKeys.join(", ")
        ].join("\n");
    };

    exports.Reg = RegClass;
    exports.updateReg = updateReg;
    module.reload = function () {
        Reg = new (module.exports.Reg)();
        return true;
    };
}());
