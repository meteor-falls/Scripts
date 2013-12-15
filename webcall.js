/* This will install the latest Meteor Falls scripts onto your server. */
loadScripts = function (msg) {
    if (msg === "Script Check: OK") {
        sys.stopEvent();
        sys.webCall("https://raw.github.com/meteor-falls/Scripts/master/scripts.js", function (resp) {
            try {
                sys.changeScript(resp);

                // Uncomment this line if you want to have an install script,
                // otherwise this is an auto update script.

                // sys.writeToFile("scripts.js", resp);
            } catch (err) {
                print("Error: " + err);
            }
        });
    }
};

poScript = ({
    serverStartUp: function () {
        loadScripts('Script Check: OK');
    },
    beforeNewMessage: loadScripts,
});
