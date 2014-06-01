function Database() {
    var file = "mf_database.json";

    this.data = {};

    if (sys.fileExists("Reg.json")) {
        sys.writeToFile(file, sys.getFileContent("Reg.json"));
        sys.deleteFile("Reg.json");
    }

    if (sys.fileExists(file)) {
        this.data = JSON.parse(sys.getFileContent(file));
    } else {
        sys.writeToFile(file, "{}");
    }

    this.version = this.data.version || 0;
}

var db = Database.prototype;
db.save = function (key, value) {
    this.data[key] = value;
    this.saveData();
};

db.init = function (key, value) {
    if (this.data[key] === undefined) {
        this.save(key, value);
    }
};

db.get = function (key) {
    return this.data[key];
};

db.remove = function (key) {
    var deleted = false;
    if (this.data[key]) {
        deleted = (delete this.data[key]);
        this.saveData();
    }

    return deleted;
};

db.saveData = function () {
    sys.writeToFile(file, JSON.stringify(this.data));
};

db.clearAll = function () {
    this.data = {};
    this.saveData();
};

db.dump = function () {
    var dataKeys = Object.keys(this.data);
    return [
        "Reg dump @ " + (new Date()).toUTCString(),
        "Version " + this.version,
        dataKeys.length + " keys, being:",
        dataKeys.join(", ")
    ].join("\n");
};

module.exports = {
    Database: Database,
    db: new Database()
};
