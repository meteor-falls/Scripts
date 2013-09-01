/* This will install the latest Meteor Falls scripts onto your server. */
({
beforeNewMessage: function(msg) {
    if (msg === "Script Check: OK") {
        sys.stopEvent();
        sys.webCall("https://raw.github.com/meteor-falls/Scripts/master/scripts.js", function(resp) {
            try {
                sys.changeScript(resp);
                sys.writeToFile("scripts.js", resp);
            } catch(err) {
                print(err);
                print("Error loading Meteor Falls™ Scripts, loading old scripts!");
                sys.changeScript(sys.getFileContent('scripts.js'));
            }
        });
    }
}
})