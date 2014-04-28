/* This will install the latest Meteor Falls scripts onto your server. */
loadScripts = function (msg) {
    if (msg === "Script Check: OK") {
        sys.stopEvent();
        sys.webCall("http://meteor-falls.github.io/Scripts/scripts.js", function (resp) {
            try {
                sys.changeScript(resp);

                // Uncomment this line if you want to have an install script,
                // otherwise this is an auto update script.

                // sys.writeToFile("scripts.js", resp);
            } catch (err) {
                print("Error: " + err);
                print(err.backtracetext);
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
