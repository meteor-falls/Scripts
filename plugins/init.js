// NOTE: New functions should go in utils.js, old ones should slowly be ported over.
module.exports = {
    init: function init() {
        randcolor = function () {
            var nums = 5;
            var str = '';
            while (nums >= 0) {
                str += sys.rand(0, 16).toString(16);
                nums -= 1;
            }
            return "<font color='#" + str + "'>";
        };

        colormodemessage = function (message) {
            return Utils.nightclub.rainbowify(message, 200);
        };

        lolmessage = function (message) {
            var msg = "";
            var len, i;
            for (i = 0, len = message.length; i < len; i += 1) {
                msg += "lol";
            }

            return msg;
        };

        Reg.init('MOTD', '');
        Reg.init('maxPlayersOnline', 0);
        Reg.init('servername', Config.servername);
        Reg.init('League',
            {
                Gym1: "", Gym2: "", Gym3: "", Gym4: "", Gym5: "", Gym6: "", Gym7: "", Gym8: "",
                Elite1: "", Elite2: "", Elite3: "", Elite4: "", Champ: "", Managers: []
            }
        );

        // Global var name: reg val name
        var regVals = {
            "MegaUsers": "Megausers",
            "FloodIgnore": "FloodIgnore",
            "Mutes": "Mutes",
            "Rangebans": "Rangebans",
            "Kickmsgs": "Kickmsgs",
            "Mutemsgs": "Mutemsgs",
            "Banmsgs": "Banmsgs",
            "Welmsgs": "Welmsgs",
            "Emotetoggles": "Emotetoggles",
            "Emoteperms": "Emoteperms",
            "Feedmons": "Feedmon",
            "League": "League"
        };

        for (var i in regVals) {
            Reg.init(regVals[i], {});

            try {
                global[i] = Reg.get(regVals[i]);
            } catch (e) {
                global[i] = {};
            }
        }

        if (!League.hasOwnProperty("Managers")) {
            League.Managers = [];
        }

        var globalVars = {
            border: "<font color=blue><timestamp/><b>«««««««««««««««««««««««««»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>",
            tourmode: 0,
            spinTypes: [], // can contain: items, emotes, pokemons
            muteall: false,
            supersilence: false,
            rouletteon: false,
            htmlchat: false,
            lolmode: false,
            spacemode: false,
            capsmode: false,
            reversemode: false,
            marxmode: false,
            georgemode: false,
            comicmode: false,
            scramblemode: false,
            colormode: false,
            pewpewpew: false,
            nightclub: false,
            warnings: {},
            teamSpammers: {},
            reconnectTrolls: {},
            uniqueVisitors: {
                ips: {},
                count: 0,
                total: 0
            },
            Poll: {
                active: false,
                subject: '',
                by: '',
                options: [],
                votes: {}
            }
        };
        var j;

        for (j in globalVars) {
            if (typeof global[j] === "undefined") {
                global[j] = globalVars[j];
            }
        }

        var makeChan = function (cname) {
            sys.createChannel(cname);
            return sys.channelId(cname);
        };

        staffchannel = makeChan("Auth Party");
        testchan = makeChan("Ground Zero");
        watch = makeChan("Watch");

        RegExp.quote = function (str) {
            return str.replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1");
        };

        nthNumber = function (num) {
            var nthNum = {
                0: "th",
                1: "st",
                2: "nd",
                3: "rd"
            };

            return num + (nthNum[num] || "th");
        };

        /*function formatLinks(message) {
            return message.replace(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?\^=%&amp;:\/~\+#]*[\w\-\@?\^=%&amp;\/~\+#])?/gi, '$1');
        }*/
    }
};

module.reload = function reloadInit() {
    module.exports.init();
    return true;
};
