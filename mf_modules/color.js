function hsv2rgb(h, s, v) {
    var r, g, b;
    var RGB = [];
    var var_r,
        var_g,
        var_b;
    var i;

    if (s === 0) {
        RGB[0] = RGB[1] = RGB[2] = Math.round(v * 255);
    } else {
        // h must be < 1
        var var_h = h * 6;
        if (var_h === 6) {
            var_h = 0;
        }

        //Or ... var_i = floor( var_h )
        var var_i = Math.floor(var_h);
        var var_1 = v * (1 - s);
        var var_2 = v * (1 - s * (var_h - var_i));
        var var_3 = v * (1 - s * (1 - (var_h - var_i)));
        if (var_i === 0) {
            var_r = v;
            var_g = var_3;
            var_b = var_1;
        } else if (var_i === 1) {
            var_r = var_2;
            var_g = v;
            var_b = var_1;
        } else if (var_i === 2) {
            var_r = var_1;
            var_g = v;
            var_b = var_3;
        } else if (var_i === 3) {
            var_r = var_1;
            var_g = var_2;
            var_b = v;
        } else if (var_i === 4) {
            var_r = var_3;
            var_g = var_1;
            var_b = v;
        } else {
            var_r = v;
            var_g = var_1;
            var_b = var_2;
        }
        //rgb results = 0 ÷ 255
        RGB[0] = Math.round(var_r * 255);
        RGB[1] = Math.round(var_g * 255);
        RGB[2] = Math.round(var_b * 255);
    }
    for (i = 0; i < RGB.length; i += 1) {
        RGB[i] = Math.round(RGB[i]).toString(16);
        if (RGB[i].length !== 2) {
            RGB[i] = "0" + RGB[i];
        }
    }
    return "#" + RGB.join("");
}

function randomColor(options) {

  options = options || {};

  var colorDictionary = {},
      H,S,B;

  // Check if we need to generate multiple colors
  if (options.count) {

    var totalColors = options.count,
        colors = [];

    options.count = false;

    while (totalColors > colors.length) {
      colors.push(randomColor(options));
    }

    return colors;
  };

  // Populate the color dictionary
  loadColorBounds();

  // First we pick a hue (H)
  H = pickHue(options);

  // Then use H to determine saturation (S)
  S = pickSaturation(H, options);

  // Then use S and H to determine brightness (B).
  B = pickBrightness(H, S, options);

  // Then we return the HSB color in the desired format
  return setFormat([H,S,B], options);

  function pickHue (options) {

    var hueRange = getHueRange(options.hue),
        hue = randomWithin(hueRange);

    // Instead of storing red as two seperate ranges,
    // we group them, using negative numbers
    if (hue < 0) {hue = 360 + hue}

    return hue;

  }

  function pickSaturation (hue, options) {

    if (options.luminosity === 'random') {
      return randomWithin([0,100]);
    }

    if (options.hue === 'monochrome') {
      return 0;
    }

    var saturationRange = getSaturationRange(hue);

    var sMin = saturationRange[0],
        sMax = saturationRange[1];

    switch (options.luminosity) {

      case 'bright':
        sMin = 55;
        break;

      case 'dark':
        sMin = sMax - 10;
        break;

      case 'light':
        sMax = 55;
        break;
   }

    return randomWithin([sMin, sMax]);

  }

  function pickBrightness (H, S, options) {

    var brightness,
        bMin = getMinimumBrightness(H, S),
        bMax = 100;

    switch (options.luminosity) {

      case 'dark':
        bMax = bMin + 20;
        break;

      case 'light':
        bMin = (bMax + bMin)/2;
        break;

      case 'random':
        bMin = 0;
        bMax = 100;
        break;
    }

    return randomWithin([bMin, bMax]);

  }

  function setFormat (hsv, options) {

    switch (options.format) {

      case 'hsvArray':
        return hsv;

      case 'hsv':
        return colorString('hsv', hsv);

      case 'rgbArray':
        return HSVtoRGB(hsv);

      case 'rgb':
        return colorString('rgb', HSVtoRGB(hsv));

      default:
        return HSVtoHex(hsv);
    }

  }

  function getMinimumBrightness(H, S) {

    var lowerBounds = getColorInfo(H).lowerBounds;

    for (var i = 0; i < lowerBounds.length - 1; i++) {

      var s1 = lowerBounds[i][0],
          v1 = lowerBounds[i][1];

      var s2 = lowerBounds[i+1][0],
          v2 = lowerBounds[i+1][1];

      if (S >= s1 && S <= s2) {

         var m = (v2 - v1)/(s2 - s1),
             b = v1 - m*s1;

         return m*S + b;
      }

    };

    return 0
  }

  function getHueRange (colorInput) {

    if (typeof parseInt(colorInput) === 'number') {

      var number = parseInt(colorInput);

      if (number < 360 && number > 0) {
        return [number, number];
      }

    }

    if (typeof colorInput === 'string') {

      if (colorDictionary[colorInput]) {
        var color = colorDictionary[colorInput];
        if (color.hueRange) {return color.hueRange}
      }
    }

    return [0,360];

  }

  function getSaturationRange (hue) {
    return getColorInfo(hue).saturationRange;
  }

  function getColorInfo (hue) {

    // Maps red colors to make picking hue easier
    if (hue >= 334 && hue <= 360) {
      hue-= 360;
    }

    for (var colorName in colorDictionary) {
       var color = colorDictionary[colorName];
       if (color.hueRange &&
           hue >= color.hueRange[0] &&
           hue <= color.hueRange[1]) {
          return colorDictionary[colorName];
       }
    } return 'Color not found';
  }

  function randomWithin (range) {
    return Math.floor(range[0] + Math.random()*(range[1] + 1 - range[0]));
  }



  function shiftHue (h, degrees) {
    return (h + degrees)%360;
  }

  function HSVtoHex (hsv){

    var rgb = HSVtoRGB(hsv);

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    var hex = "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);

    return hex;

  }

  function defineColor (name, hueRange, lowerBounds) {

    var sMin = lowerBounds[0][0],
        sMax = lowerBounds[lowerBounds.length - 1][0],

        bMin = lowerBounds[lowerBounds.length - 1][1],
        bMax = lowerBounds[0][1];

    colorDictionary[name] = {
      hueRange: hueRange,
      lowerBounds: lowerBounds,
      saturationRange: [sMin, sMax],
      brightnessRange: [bMin, bMax]
    };

  }

  function loadColorBounds () {

    defineColor(
      'monochrome',
      null,
      [[0,0],[100,0]]
    );

    defineColor(
      'red',
      [-26,18],
      [[20,100],[30,92],[40,89],[50,85],[60,78],[70,70],[80,60],[90,55],[100,50]]
    );

    defineColor(
      'orange',
      [19,46],
      [[20,100],[30,93],[40,88],[50,86],[60,85],[70,70],[100,70]]
    );

    defineColor(
      'yellow',
      [47,62],
      [[25,100],[40,94],[50,89],[60,86],[70,84],[80,82],[90,80],[100,75]]
    );

    defineColor(
      'green',
      [63,158],
      [[30,100],[40,90],[50,85],[60,81],[70,74],[80,64],[90,50],[100,40]]
    );

    defineColor(
      'blue',
      [159, 257],
      [[20,100],[30,86],[40,80],[50,74],[60,60],[70,52],[80,44],[90,39],[100,35]]
    );

    defineColor(
      'purple',
      [258, 282],
      [[20,100],[30,87],[40,79],[50,70],[60,65],[70,59],[80,52],[90,45],[100,42]]
    );

    defineColor(
      'pink',
      [283, 334],
      [[20,100],[30,90],[40,86],[60,84],[80,80],[90,75],[100,73]]
    );

  }

  function colorString (prefix, values) {
    return prefix + '(' + values.join(', ') + ')';
  }

}

function randomDark() {
    return randomColor({luminosity: 'dark', count: 27});
}

module.exports = {
    hsv2rgb: hsv2rgb,
    randomColor: randomColor,
    randomDark: randomDark
};
