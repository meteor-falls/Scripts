var words = [];

var exclam = /\b!\b/g;
var exclamrepl = [", verily!", ", verily I say!", ", verily I sayeth!", ", I say!", ", I sayeth!", "! Huzzah!", "! Hear Hear!", "! What-ho!", "! Ho!", "! Fie!", ", indeed!"];

var questi = /\b\?\b/g;
var questirepl = [", I say?", ", I wonder?", ", wonder I?", ", what say thee?", ", what sayeth thee?", ", what say thou?", ", what sayeth thou?", ", I ponder?", ", I pondereth?", ", pray tell?", ", ho?", ", do tell?"];

var insults = /\bidiot\b|\bfool\b|\bbastard\b/gi;

var insultnoun = ["mongrel", "codpiece", "jackanape", "ape", "coxcomb", "harlot", "hussy", "strumpet", "cur", "clot", "fool", "barnacle", "harpy", "wench", "churl", "pleb", "taffer", "scoundrel", "scalliwag", "mooncalf", "rapscallion", "doxy", "bawd", "tosspot", "cupshot", "recreant", "fustalarion", "scullion", "rampallion", "knave", "barbermonger", "boil", "plague-sore", "carbuncle", "whoreson", "clotpole", "lout", "gudgeon", "puttock", "skainsmate", "varlet", "bladder"];

var insultadj = ["artless", "droning", "fawning", "warped", "paunchy", "puny", "spongy", "ruttish", "vain", "lumpish", "craven", "witless", "pustulent", "infested", "ill-bred", "blind", "scurvy", "puny", "fetid", "vile", "gibbering", "mewling", "rank", "fawning", "moonish", "brutish", "malapert", "curst", "lack-linen", "bottle-ailed", "lyingest", "embossed", "cheating", "crook-pated", "base-court", "hasty-witted", "two-faced", "pox-marked", "toad-brained", "errant", "idle-headed", "quailing", "flap-mouthed", "puking", "fly-bitten", "surly", "tottering", "villainous", "rump-fed", "bootless", "churlish", "tickle-brained", "froward"];

var startmsgs = ["Forsooth,", "I say,", "I sayeth,", "Forsooth, I say,", "Forsooth, say I,", "Forsooth, sayeth I,", "Hark!", "Harketh!", "By <god>,", "By the Will of <god adjective> <god>,", "By the <body part adjective> <body part> of the <god adjective> <god>,", "By <god adjective> <god>'s <body part adjective> <body part>,", "Avast,", "Zounds,", "Perchance,", "Pray tell,", "Prithee,", "What hey,", "What ho,", "Pray,", "Surely", "Pray pardon,", "Alas,", "In short,", "My Lord,", "My Lady,", "By my faith,", "If it pleases you,", "I pray you,", "In truth,", "By my trowth,", "In sooth,", "By my word,", "S'wounds,", "Z'wounds,", "<god>'s wounds,", "<god>'s <body part>,", "Heigh-ho,", "Ah,", "Quoth I,", "Listen,", "Listen thee,", "Hear me,", "Now hear me,", "I warrant", "Come,", "Kind sire,", "Sire,", "There is much in what you say, and yet,"];
var endmsgs = ["Anon!", "Hum.", "Good sir!", "Good sire!", "Milady!", "My Liege!", "Guvnor!"];

var gods = ["Odin", "Bob", "Zeus", "Hera", "Thor", "Crom", "Mad-poet Navarth", "Cugel", "Wotsit", "Baron Boddisey", "Poseidon", "Saint Mary", "Pallus Athena", "Loki", "Erlik", "Shoggoth", "Omm", "Vishnu", "Azazoth", "Father Odin", "Allfather Odin", "Cthulhu", "Buddha", "Aphrodite", "Isis", "Kali", "Dionysus", "Zarathustra", "Croesus", "Hermes", "Venus", "Montezuma", "Popacatapetl", "Hephaestus", "Bubastes", "Bacchus", "Nebuchadnezzar", "Assurbanipal", "Sargon", "Xerxes", "Mulwatallish", "Labarna", "Hammurabi", "Rameses", "Minos", "Tilgath-Pileser", "Vercingetorix", "Mithradites", "Pericles", "Belasarius", "Archaemides", "Heraclius", "Imhotep", "Artemis", "Orthia", "Phoebe", "Hestia", "Eros", "Persephone", "Minerva", "Mercury", "Aesculapius", "Discordia", "Hecate", "Hespera"];

var godadjs = ["Almighty", "Unthinkable", "Unknowable", "All-knowing", "All-seeing", "Lecherous", "Scandalous", "Merciful", "Ravaging", "Thunderous", "Wrathful", "Distant", "Vengeful", "Supreme", "Wise", "Warlike", "Jealous", "Vindictive", "Powerful", "Adulterous", "Licentious", "Crafty", "Benefical", "Virtuous", "Protective", "Prophetic", "Bloodthirsty", "Murderous", "Ruinous", "Militant", "Invisible", "Omnipotent", "Forgotten", "Enlightened", "Tempestuous", "Destructive", "Grim"];

var bodyparts = ["Beard", "Third Leg", "Scalp", "Eye", "Thigh", "Arm", "Sword", "Heel", "Gaze", "Tongue", "Hammer", "Toenail", "Nether Regions", "Liver", "Lights", "Spleen", "Gall", "Liver and Lights"];

var bodypartadjs = ["Unknowable", "Unescapable", "Unfathomable", "Unthinkable", "Righteous", "Hairy", "Hairless", "Wandering", "Blistered", "Awe-inspiring", "Toothy", "Ravaged", "Aged", "Endless", "Wondrous", "Unavoidable", "Pestilent", "Forgotten", "Beautiful", "Fertile", "Prophetic", "Musical", "Helpful", "Virginal", "Curative", "Bleak", "Incessant", "Sagely", "Unfashionable", "Unfaltering", "Unfamiliar", "Abysmal", "Boundless", "Eternal", "Immeasurable", "Infinite", "Unending", "Soundless", "Incomprehensible", "Inexplicable", "Profound", "Unintelligible", "Unbelievable", "Impenetrable", "Indecipherable", "Esoteric", "Enigmatic", "Ancient", "Venerable", "Baneful", "Contagious", "Corrupting", "Deadly", "Deleterious", "Evil", "Noxious", "Diseased", "Pernicious", "Pestiferous", "Pestilential", "Tainted", "Contaminated", "Pulchritudinous", "Odoriferous", "Misbegotten", "Sacriligio"];

function arrRandom(arr) {
    return arr[sys.rand(0, arr.length)];
}

function word(original, replacement) {
    var len, i;

    if (!Array.isArray(original)) {
        original = [original];
    }
    if (!Array.isArray(replacement)) {
        replacement = [replacement];
    }

    for (i = 0, len = original.length; i < len; i += 1) {
        words.push({regex: new RegExp("\b" + original[i] + "\b", "gi"), replacements: replacement});
    }
}

// http://wiki.teamfortress.com/wiki/Medieval_Mode#Chat_parser
function addWords() {
    words = [];

    // 1
    word(["it is", "it's"], "tis");
    word("it was", "'twas");
    word("it would", "'twould");
    word("it will", "'twill");
    word("it were", "'twere");
    word(["shall not", "will not"], "shan't");
    word("over there", "yonder");
    word("in the", "i' the");
    word("thank you", ["many good thanks to you", "thankee", "kindly thanks to you", "grammercy to you"]);
    word(["you", "u"], ["thou", "thee", "ye"]);
    word("are", "art");
    word("lol", ["lolleth", "lollery"]);
    word(["killed", "beaten"], ["slain", "vanquished", "brung low", "conquered", "fleeced", "humbled", "subjugated", "bested", "foiled"]);
    word(["goodbye", "bye", "seeya", "goodnight"], ["farewell", "fare thee well", "good morrow", "by your leave", "godspeed", "begone", "good day", "good day, sirrah", "good day, sire", "good day, master", "adieu", "cheerio", "pleasant journey", "I bid thee good day", "I bid thee farewell"]);
    word("yes", ["aye", "yea", "yea verily"]);
    word("no", ["nay", "nayeth"]);
    word(["hello", "hi"], ["good day", "well met", "well meteth", "tally ho", "ave"]);
    word("does", ["doeseth", "dost", "doth"]);
    word(["kill", "gank"], ["slay", "vanquish", "bring low", "conquer", "fleece", "humble", "subjugate", "best", "foil"]);
    word("your", ["thy", "thine", "thyne"]);
    word("my", "mine");
    word("in", "within");
    word("flag", ["pennant", "banner", "colors", "heraldry"]);

    // 2
    word("walking", "a-walkin'");
    word("bet", "warrant");
    word("the", "ye");
    word("joke", ["jest", "jape"]);
    word(["balls", "groin"], ["leathers", "beans", "poundables", "nethers", "nadchakles", "buis", "fellahs", "coin purse"]);
    word("afk", ["away, fighting kobolds", "away, fruity knights", "aft, frisking knickers", "abaft, flailing knouts"]);
    word("map", "chart");
    word("please", ["I pray you", "prithee", "pray"]);
    word("ok", ["as you will", "agreed", "well said", "just so"]);
    word("is", "be");
    word("never", "ne'er");
    word(["haha", "hehe", "heh", "hah"], ["guffaw!", "cackle!", "oh, 'tis to laugh!", "zounds!", "chuckle!", "snigger!", "snort!", "snicker!", "cachinnate!", "titter!", "and there was much tittering!", "and there was much guffawing!", "and there was much chuckling!", "and there was much snorting!", "and there was much snickering!", "and there was much mirth!"]);
    word("assist", ["aid", "aideth", "saveth", "assistance", "succor"]);
    word("could", "couldst");
    word("would", "wouldst");
    word("sure", "shore");
    word("maybe", ["mayhaps", "perchance"]);
    word(["girl", "woman"], ["madame", "waif", "mistress", "lass", "lady", "goodwife", "maid", "maiden"]);
    word("later", "anon");
    word("often", "oft");
    word("really", ["indeed", "in truth"]);
    word("those", "yon");
    word("here", "hither");
    word("enough", "enow");
    word("child", "poppet");
    word("why", "wherefore");
    word("away", "aroint");
    word("being", "bein'");
    word("of", "o'");
    word("fucker", "swiver");
    word("shit", "nightsoil");
}

function yeolde(message) {
    var startmsg = arrRandom(startmsgs),
        endmsg = arrRandom(endmsgs),
        word, len, i;

    startmsg = startmsg
        .replace("<god>", arrRandom(gods))
        .replace("<god adjective>", arrRandom(godadjs))
        .replace("<body part>", arrRandom(bodyparts))
        .replace("<body part adjective>", arrRandom(bodypartadjs));

    message = message.replace(exclam, arrRandom(exclamrepl));
    message = message.replace(questi, arrRandom(questirepl));

    message = message.replace(insults, function () {
        var adjs = insultadj.slice(),
            adj1 = arrRandom(adjs),
            noun = arrRandom(insultnoun);

        adjs.splice(adjs.indexOf(adj1), 1);
        return adj1 + ", " + arrRandom(adjs) + ", " + noun;
    });

    for (i = 0, len = words.length; i < len; i += 1) {
        word = words[i];
        message = message.replace(word.regex, arrRandom(word.replacements));
    }

    if (["!", "?", ";", ",", "."].indexOf(message[message.length - 1]) === -1) {
        message += ".";
    }

    return startmsg + " " + message + " " + endmsg;
}

module.exports = {
    yeolde: yeolde,
    addWords: addWords,
    words: words
};

module.reload = function () {
    addWords();
    return true;
};
