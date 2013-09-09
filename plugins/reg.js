/*jslint continue: true, es5: true, evil: true, forin: true, sloppy: true, vars: true, regexp: true, newcap: true, nomen: true*/
/*global sys, SESSION, script: true, Qt, print, gc, version,
    global: false, Plugin: true, Config: true, module: true, exports: true,
    bot: true, Reg: true, Leaguemanager: true, Lists: true, html_escape: true, namecolor: true, CommandList: true, namecolor: true, MathJS: true, format: true, cut: true, JSESSION: true, emoteFormat: true, hasEmotesToggled: true, tourmode: true, tourmembers: true, getTier: true, tourtier: true, tourplayers: true, roundnumber: true, isFinals: true, battlesLost: true, tourbattlers: true, battlesStarted: true, hasEmotePerms: true, Emotetoggles: true, rouletteon: true, spinTypes: true, EmoteList: true, TableList: true, MegaUsers: true, FloodIgnore: true, Capsignore: true, Autoidle: true, Emoteperms: true, Feedmon: true, getTimeString: true, tournumber: true, prize: true, isTier: true, tournumber: true, Kickmsgs: true, Welmsgs: true, Banmsgs: true, Channeltopics: true, android: true, topicbot: true, Mutes: true, Rangebans: true, getAuth: true, muteall: true, andJoin: true, kick: true, tempBanTime: true, stringToTime: true, tempBan: true, pruneMutes: true, nightclub: true, Nightclub: true, supersilence: true, ev_name: true, getName: true, ban: true, Plugins: true, PHandler: true, reloadPlugin: true, htmlchatoff: true, bots: true, html_strip: true, fisherYates: true, servername: true, isBanned: true, loginMessage: true, logoutMessage: true, cmp: true, floodIgnoreCheck: true, removeTag: true, randcolor: true, colormodemessage: true, lolmessage: true, pewpewpewmessage: true, hasBasicPermissions: true, hasDrizzleSwim: true, hasSandCloak: true, ChannelNames: true, staffchannel: true, testchan: true, watch: true, aliasKick: true, reconnectTrolls: true, nthNumber: true, ChannelLink: true, addChannelLinks: true, firstGen: true, randPoke: true, formatPoke: true, hasIllegalChars: true, teamSpammers: true, Feedmons: true, addEmote: true, Bot: true
*/

/* Documentation for class Reg:
   - Everything is stored in the file Reg.json
   
   Reg.save (key, value):
   Creates/overwrites key with value.
   Example: Reg.save("Server_Name", "Hello");
   
   Reg.init (key, value):
   Creates key with value (no overwrite).
   Example: Reg.init("Script_Loaded", true);
   
   Reg.get (key):
   Gets data associated with key. Can be undefined (if the key doesn't exist)
   Example: Reg.get("Server_Name");
   
   Reg.remove (key):
   Removes key.
   Example: Reg.remove("Server_Name");
   
   Reg.removeIf (function): [ADVANCED]
   Removes all keys which the function returns true on. Function passed gets two parameters. 
   First is the data associated with the current key, second is the name of the key.
   Example: Reg.removeIf(function (key_data, key_name) {
   if (key_name.indexOf("AutoIdle") != -1) {
   return true;
   }
   
   return false;
   });
   
   Reg.removeIfValue (key, value):
   Removes key if the data associated with it is value.
   Example: Reg.removeIfValue("Server_Name", "Hello");

   Reg.saveData ():
   Saves all data stored to Reg.json. All functions do this automaticly, so no need to use this.
   Example: Reg.saveData();

   Reg.clearAll ():
   Removes ALL data stored and clears Reg.json. Useful if you made a huge mistake or change that requires it to be flushed.
   Example: Reg.clearAll();   
*/

(function () {
    function RegClass() {
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
        };
    
        this.init = function (key, value) {
            if (this.data[key] === undefined) {
                this.data[key] = value;
                this.saveData();
            }
        };
    
        this.get = function (key) {
            return this.data[key];
        };
    
        this.remove = function (key) {
            if (this.data[key]) {
                delete this.data[key];
                this.saveData();
            }
        };
    
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
        };
    
        this.removeIfValue = function (key, value) {
            if (this.data[key] === value) {
                delete this.data[key];
                this.saveData();
            }
        };
    
        this.saveData = function () {
            sys.writeToFile(file, JSON.stringify(this.data));
        };
    
        this.clearAll = function () {
            this.data = {};
            this.saveData();
        };
    }
    
    module.exports.Reg = new RegClass();
    module.exports.RegClass = RegClass;
}());