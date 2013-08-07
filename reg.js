Reg = new(function () {
	var file = "Reg.json";
	this.data = {};

	try {
		this.data = JSON.parse(sys.getFileContent(file));
	} catch (e) {
		print("Runtime Error: Could not find Reg.json");
		sys.writeToFile("Reg.json", "{}");
	}

	this.save = function (key, value) {
		this.data[key] = value;
		this.saveData();
	}

	this.init = function (key, value) {
		if (this.data[key] === undefined) {
			this.data[key] = value;
			this.saveData();
		}
	}

	this.get = function (key) {
		return this.data[key];
	}

	this.remove = function (key) {
		if (this.data[key] != undefined) {
			delete this.data[key];
			this.saveData();
		}
	}

	this.removeIf = function (func) {
		var x, d = this.data,
			madeChange = false;
		for (x in d) {
			if (func(d, x)) {
				delete d[x];
				madeChange = true;
			}
		}

		if (madeChange) {
			this.saveData();
		}
	}

	this.removeIfValue = function (key, value) {
		if (this.data[key] === value) {
			delete this.data[key];
			this.saveData();
		}
	}

	this.saveData = function () {
		sys.writeToFile(file, JSON.stringify(this.data));
	}

	this.clearAll = function () {
		this.data = {};
		this.saveData();
	}
});

module.exports['Reg'] = Reg;