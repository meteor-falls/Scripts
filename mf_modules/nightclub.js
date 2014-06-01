var hsv2rgb = require('color').hsv2rgb;
var escapeHtml = require('util').escapeHtml;

function rainbowify(function () {
    var numcolors = 360,
        colors = [],
        base = sys.rand(0, numcolors),
        i;

    for (i = 0; i < numcolors; i += 1) {
        colors.push(hsv2rgb((i % 360) / 360, 1, 1));
    }

    return function (text, step) {
        var html = "";
        step = step || sys.rand(0, 30);
        for (i = 0; i < text.length; i += 1) {
            base += 1;
            html += "<font color='" + colors[(base + step) % numcolors] + "'>" + escapeHtml(text[i]) + "</font>";
        }
        return html;
    };
}());

function format(msg) {
    return "<table cellpadding='12' cellspacing='0' width='100%' " +
               "bgcolor='black' style='margin: -12'><tr><td><b>" + rainbowify(msg) +
               "</b></td></tr></table>";
};

module.exports = {
    rainbowify: rainbowify,
    format: format
};
