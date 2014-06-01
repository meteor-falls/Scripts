(->
    module.exports = ->
        
        # Various importable stuff.
        
        # http://bost.ocks.org/mike/shuffle/
        
        # While there remain elements to shuffle…
        
        # Pick a remaining element…
        
        # And swap it with the current element.
        
        # h must be < 1
        
        #Or ... var_i = floor( var_h )
        
        #rgb results = 0 ÷ 255
        # Random colors
        
        # The last element.
        
        # For use in map
        
        # For use in filter
        
        # TODO: Remove these unused functions.
        
        # Keys are automatically lowercase.
        atag = (link) ->
            "<a href='" + link + "'>" + link + "</a>"
        util = {}
        clist = [
            "#5811b1"
            "#399bcd"
            "#0474bb"
            "#f8760d"
            "#a00c9e"
            "#0d762b"
            "#5f4c00"
            "#9a4f6d"
            "#d0990f"
            "#1b1390"
            "#028678"
            "#0324b1"
        ]
        CCTiers = [
            "CC 1v1"
            "Wifi CC 1v1"
            "Challenge Cup"
        ]
        formatRegex =
            bold: /\[b\](.*?)\[\/b\]/g
            strike: /\[s\](.*?)\[\/s\]/g
            under: /\[u\](.*?)\[\/u\]/g
            italic: /\[i\](.*?)\[\/i\]/g
            sub: /\[sub\](.*?)\[\/sub\]/g
            sup: /\[sup\](.*?)\[\/sup\]/g
            code: /\[code\](.*?)\[\/code\]/g
            spoiler: /\[spoiler\](.*?)\[\/spoiler\]/g
            color: /\[color=(.*?)\](.*?)\[\/color\]/g
            face: /\[face=(.*?)\](.*?)\[\/face\]/g
            font: /\[font=(.*?)\](.*?)\[\/font\]/g
            size: /\[size=([0-9]{1,})\](.*?)\[\/size\]/g
            pre: /\[pre\](.*?)\[\/pre\]/g
            ping: /\[ping\]/g
            br: /\[br\]/g
            hr: /\[hr\]/g
            atag: /[a-z]{3,}:\/\/[^ ]+/g

        natureNames =
            24: "Quirky</b> Nature"
            23: "Careful</b> Nature (+SDef, -SAtk)"
            22: "Sassy</b> Nature (+SDef, -Spd)"
            21: "Gentle</b> Nature (+SDef, -Def)"
            20: "Calm</b> Nature (+SDef, -Atk)"
            19: "Rash</b> Nature (+SAtk, -SDef)"
            18: "Bashful</b> Nature"
            17: "Quiet</b> Nature (+SAtk, -Spd)"
            16: "Mild</b> Nature (+SAtk, -Def)"
            15: "Modest</b> Nature (+SAtk, -Atk)"
            14: "Naive</b> Nature (+Spd, -SDef)"
            13: "Jolly</b> Nature (+Spd, -SAtk)"
            12: "Serious</b> Nature"
            11: "Hasty</b> Nature (+Spd, -Def)"
            10: "Timid</b> Nature (+Spd, -Atk)"
            9: "Lax</b> Nature (+Def, -SDef)"
            8: "Impish</b> Nature (+Def, -SAtk)"
            7: "Relaxed</b> Nature (+Def, -Spd)"
            6: "Docile</b> Nature"
            5: "Bold</b> Nature (+Def, -Atk)"
            4: "Naughty</b> Nature (+Atk, -SDef)"
            3: "Adamant</b> Nature (+Atk, -SAtk)"
            2: "Brave</b> Nature (+Atk, -Spd)"
            1: "Lonely</b> Nature (+Atk, -Def)"
            0: "Hardy</b> Nature"

        typeColorNames =
            0: "#a8a878"
            1: "#c03028"
            2: "#a890f0"
            3: "#a040a0"
            4: "#e0c068"
            5: "#b8a038"
            6: "#a8b820"
            7: "#705898"
            8: "#b8b8d0"
            9: "#f08030"
            10: "#6890f0"
            11: "#78c850"
            12: "#f8d030"
            13: "#f85888"
            14: "#98d8d8"
            15: "#7038f8"
            16: "#705848"

        genderToImportable =
            incompatible:
                male: "<img src='Themes/Classic/genders/gender1.png'> (M)"
                female: "<img src='Themes/Classic/genders/gender2.png'> (F)"
                genderless: "<img src='Themes/Classic/genders/gender0.png'>"

            male: "(M)"
            female: "(F)"
            genderless: ""

        statNames =
            0: "HP"
            1: "Atk"
            2: "Def"
            3: "SAtk"
            4: "SDef"
            5: "Spd"

        bannedDWAbilities = chandelure: ["shadow tag"]
        annNameRegex = /<!name ([a-z]+)>/
        util.escapeHtml = (str, noAmp) ->
            str = "" + str
            str = str.replace(/\&/g, "&amp;")    unless noAmp
            str.replace(/</g, "&lt;").replace /\>/g, "&gt;"

        util.stripHtml = (str) ->
            str.replace /<\/?[^>]*>/g, ""

        util.clink = (channel) ->
            channel = sys.channel(channel)    if typeof channel is "number"
            "<a href='po:join/" + channel + "'>#" + channel + "</a>"

        util.escapeRegex = (str) ->
            str.replace /([.?*+\^$\[\]\\(){}|\-])/g, "\\$1"

        util.fisheryates = fisheryates = (array) ->
            m = array.length
            t = undefined
            i = undefined
            while m
                i = Math.floor(Math.random() * m)
                m -= 1
                t = array[m]
                array[m] = array[i]
                array[i] = t
            array

        util.nightclub = {}
        util.nightclub.hsv2rgb = (h, s, v) ->
            r = undefined
            g = undefined
            b = undefined
            RGB = []
            var_r = undefined
            var_g = undefined
            var_b = undefined
            i = undefined
            if s is 0
                RGB[0] = RGB[1] = RGB[2] = Math.round(v * 255)
            else
                var_h = h * 6
                var_h = 0    if var_h is 6
                var_i = Math.floor(var_h)
                var_1 = v * (1 - s)
                var_2 = v * (1 - s * (var_h - var_i))
                var_3 = v * (1 - s * (1 - (var_h - var_i)))
                if var_i is 0
                    var_r = v
                    var_g = var_3
                    var_b = var_1
                else if var_i is 1
                    var_r = var_2
                    var_g = v
                    var_b = var_1
                else if var_i is 2
                    var_r = var_1
                    var_g = v
                    var_b = var_3
                else if var_i is 3
                    var_r = var_1
                    var_g = var_2
                    var_b = v
                else if var_i is 4
                    var_r = var_3
                    var_g = var_1
                    var_b = v
                else
                    var_r = v
                    var_g = var_1
                    var_b = var_2
                RGB[0] = Math.round(var_r * 255)
                RGB[1] = Math.round(var_g * 255)
                RGB[2] = Math.round(var_b * 255)
            i = 0
            while i < RGB.length
                RGB[i] = Math.round(RGB[i]).toString(16)
                RGB[i] = "0" + RGB[i]    if RGB[i].length isnt 2
                i += 1
            "#" + RGB.join("")

        util.nightclub.rainbowify = (->
            numcolors = 360
            colors = []
            base = sys.rand(0, numcolors)
            i = undefined
            i = 0
            while i < numcolors
                colors.push util.nightclub.hsv2rgb((i % 360) / 360, 1, 1)
                i += 1
            (text, step) ->
                html = ""
                step = step or sys.rand(0, 30)
                i = 0
                while i < text.length
                    base += 1
                    html += "<font color='" + colors[(base + step) % numcolors] + "'>" + util.escapeHtml(text[i]) + "</font>"
                    i += 1
                html
        ())
        util.nightclub.format = (msg) ->
            "<table cellpadding='12' cellspacing='0' width='100%' " + "bgcolor='black' style='margin: -12'><tr><td><b>" + util.nightclub.rainbowify(msg) + "</b></td></tr></table>"

        util.loginMessage = (name, color) ->
            sys.sendHtmlAll "<font color='#0c5959'><timestamp/>±<b>WelcomeBot:</b></font> <b><font color=" + color + ">" + name + "</font></b> joined <b>" + Reg.get("servername") + "</b>!", 0
            return

        util.logoutMessage = (name, color) ->
            sys.sendHtmlAll "<font color='#0c5959'><timestamp/>±<b>GoodbyeBot:</b></font> <b><font color=" + color + ">" + name + "</font></b> left <b>" + Reg.get("servername") + "</b>!", 0
            return

        util.channelNames = (lowercase) ->
            cids = sys.channelIds()
            len = undefined
            i = undefined
            names = []
            cname = undefined
            i = 0
            len = cids.length

            while i < len
                cname = sys.channel(cids[i])
                cname = cname.toLowerCase()    if lowercase
                names.push cname
                i += 1
            names

        util.isTier = (tier) ->
            list = sys.getTierList()
            len = undefined
            i = undefined
            tier = tier.toLowerCase()
            i = 0
            len = list.length

            while i < len
                return true    if list[i].toLowerCase() is tier
                i += 1
            false

        util.nameColor = (src) ->
            src = 1    if typeof src isnt "number"
            getColor = sys.getColor(src)
            return "blue"    if src and RTD and RTD.hasEffect(src, "im_blue")
            return clist[src % clist.length]    if getColor is "#000000" or not getColor
            getColor

        util.hasIllegalChars = (m) ->
            return true    if /[\u202E\u202D]/.test(m)
            return true    if /[\u0300-\u036F]/.test(m)
            return true    if /[\u0430-\u044f\u2000-\u200d]/.test(m)
            return true    if /[\u0458\u0489\u202a-\u202e\u0300-\u036F\u1dc8\u1dc9\u1dc4-\u1dc7\u20d0\u20d1\u0415\u0421\u20f0\u0783\uFE22\u0E47\u0E01\u0E49\u5462\u0614]/.test(m)
            false

        util.cut = (array, entry, join) ->
            join = join or ""
            [].concat(array).splice(entry).join join

        util.announcementName = ->
            matches = sys.getAnnouncement().match(annNameRegex)
            (if matches then matches[1] else "")

        util.stringToTime = (str, time) ->
            return 0    if typeof str isnt "string"
            str = str.toLowerCase()
            time = +time
            unitString = str[0]
            unitString2 = str.substr(0, 2)
            units =
                s: 1
                m: 60
                h: 3600
                d: 86400
                w: 604800
                y: 31536000

            units2 =
                mo: 2592000
                de: 315360000

            unit1 = units[unitString]
            unit2 = units2[unitString2]
            return unit2 * time    if unit2 isnt `undefined`
            return unit1 * time    if unit1 isnt `undefined`
            units.m * time

        util.getAuth = (src) ->
            auth = 0
            if typeof src is "string"
                id = sys.name(src)
                auth = (if (id isnt `undefined`) then sys.auth(id) else sys.dbAuth(src))
            else
                auth = sys.auth(src)
            auth

        util.getTimeString = (sec) ->
            s = []
            n = undefined
            d = [
                [
                    315360000
                    "decade"
                ]
                [
                    31536000
                    "year"
                ]
                [
                    2592000
                    "month"
                ]
                [
                    604800
                    "week"
                ]
                [
                    86400
                    "day"
                ]
                [
                    3600
                    "hour"
                ]
                [
                    60
                    "minute"
                ]
                [
                    1
                    "second"
                ]
            ]
            j = undefined
            j = 0
            while j < d.length
                n = parseInt(sec / d[j][0], 10)
                if n > 0
                    s.push (n + " " + d[j][1] + ((if n > 1 then "s" else "")))
                    sec -= n * d[j][0]
                    break    if s.length >= d.length
                j += 1
            return "1 second"    if s.length is 0
            util.fancyJoin s

        util.fancyJoin = (array, separator) ->
            len = array.length
            separator = separator or "and"
            if len <= 1
                return array
            else return array[0] + " " + separator + " " + array[1]    if len is 2
            array[len - 1] = separator + " " + array[len - 1]
            array.join ", "

        util.boldKeys = (val) ->
            "<b>" + val + "</b>"

        util.lowerKeys = (val) ->
            ("" + val).toLowerCase()

        util.stripEmpty = (val) ->
            !!val

        util.nameIp = (src, suffix) ->
            name = src
            id = undefined
            if typeof src is "number"
                name = sys.name(src)
            else if id = sys.id(name)
                src = id
                name = sys.name(src)
            "<b style='color: " + Utils.nameColor(src) + "' title='" + ((if typeof src is "number" then sys.ip(src) else sys.dbIp(name))) + "'>" + Utils.escapeHtml(name) + (suffix or "") + "</b>"

        util.beautifyName = (src, suffix) ->
            id = undefined
            src = id    if typeof src is "string" and (id = sys.id(src))
            name = (if typeof src is "number" then sys.name(src) else src)
            "<b style='color: " + Utils.nameColor(src) + "'>" + Utils.escapeHtml(name) + (suffix or "") + "</b>"

        util.beautifyNames = (names) ->
            names.map (name) ->
                util.beautifyName sys.id(name) or name


        util.randPoke = ->
            "<img src='pokemon:num=" + sys.rand(1, 649) + ((if sys.rand(1, 100) is 50 then "&shiny=true:" else "")) + "'>"

        util.formatPoke = (pokenum, shiny, back, genderId, gan) ->
            if not pokenum or pokenum < 1 or isNaN(pokenum)
                unless sys.pokeNum(pokenum)
                    return "<img src='pokemon:0'>"
                else
                    pokenum = sys.pokeNum(pokenum)
            gender = "neutral"
            if genderId
                genderId = Number(genderId)
                if genderId is 0 or genderId is 1 or genderId is 2
                    gender =
                        0: "neutral"
                        1: "male"
                        2: "female"
                    [{genderId}]
            "<img src='pokemon:" + pokenum + "&shiny=" + shiny + "&back=" + back + "&gender=" + gender + "&gen=" + gan + "'>"

        util.isLCaps = isLCaps = (letter) ->
            letter >= "A" and letter <= "Z"

        util.isMCaps = (message) ->
            count = 0
            i = 0
            c = undefined
            while i < message.length
                c = message[i]
                if @isLCaps(c)
                    count += 1
                    return true    if count is 5
                else
                    count -= 2
                    count = 0    if count < 0
                i += 1
            false

        util.removeTag = (name) ->
            name.replace(/\[[^\]]*\]/g, "").replace /\{[^\]]*\}/g, ""

        util.toCorrectCase = (name) ->
            return sys.name(name)    if typeof name is "number"
            id = sys.id(name)
            return sys.name(id)    if id isnt `undefined`
            name

        util.EVName = (num) ->

                0: "HP"
                1: "ATK"
                2: "DEF"
                3: "SPATK"
                4: "SPDEF"
                5: "SPD"
            [{num}]

        util.checkFor = (obj, key) ->
            obj.hasOwnProperty (("" + key).toLowerCase())

        util.regToggle = (container, key, field, addCheck) ->
            added = undefined
            key = key.toLowerCase()
            addCheck = addCheck or ->
                true

            if key of container
                delete container[key]

                added = false
            else if addCheck(container, key, field)
                container[key] = true
                added = true
            else
                added = "fail"
            Reg.save field, container
            added

        util.format = format = (src, str) ->
            auth = (if src is 0 then 3 else sys.maxAuth(sys.ip(src)))
            str = "" + str
            str = str.replace(formatRegex.bold, "<b>$1</b>").replace(formatRegex.strike, "<s>$1</s>").replace(formatRegex.under, "<u>$1</u>").replace(formatRegex.italic, "<i>$1</i>").replace(formatRegex.sub, "<sub>$1</sub>").replace(formatRegex.sup, "<sup>$1</sup>").replace(formatRegex.code, "<code>$1</code>").replace(formatRegex.spoiler, "<a style=\"color: black; background-color:black;\">$1</a>").replace(formatRegex.color, "<font color=$1>$2</font>").replace(formatRegex.face, "<font face=$1>$2</font>")
            
            # Potential security risk (not going into detail).
            #str = str.replace(/\[link\](.*?)\[\/link\]/gi, '<a href="$1">$1</a>');
            str = str.replace(formatRegex.atag, atag)    if (auth is 3 and not htmlchat) or (auth isnt 3)
            str = str.replace(formatRegex.size, "<font size=$1>$2</font>").replace(formatRegex.pre, "<pre>$1</pre>").replace(formatRegex.ping, "<ping/>").replace(formatRegex.br, "<br>").replace(formatRegex.hr, "<hr>")    if not src or Utils.mod.hasBasicPermissions(src)
            util.addChannelLinks str # Do this last to prevent collisions.

        util.addChannelLinks = (line) ->
            index = line.indexOf("#")
            return line    if index is -1
            str = ""
            fullChanName = undefined
            chanName = undefined
            chr = undefined
            lastIndex = 0
            pos = undefined
            i = undefined
            channelNames = Utils.channelNames(true) # lower case names
            while index isnt -1
                str += line.substring(lastIndex, index)
                lastIndex = index + 1 # Skip over the '#'
                fullChanName = ""
                chanName = ""
                i = 0
                pos = lastIndex

                while i < 20 and (chr = line[pos])
                    fullChanName += chr
                    chanName = fullChanName    if channelNames.indexOf(fullChanName.toLowerCase()) isnt -1
                    i += 1
                    pos += 1
                if chanName
                    str += "<a href='po:join/" + chanName + "'>#" + chanName + "</a>"
                    lastIndex += chanName.length
                else
                    str += "#"
                index = line.indexOf("#", lastIndex)
            str += line.substr(lastIndex)    if lastIndex < line.length
            str

        util.placeCommas = (number) ->
            number.toString().replace /\B(?=(\d{3})+(?!\d))/g, ","

        util.realName = (src) ->
            SESSION.users(src).originalName or sys.name(src)

        util.uptime = ->
            diff = parseInt(sys.time(), 10) - startUpTime
            days = parseInt(diff / (60 * 60 * 24), 10)
            hours = parseInt((diff % (60 * 60 * 24)) / (60 * 60), 10)
            minutes = parseInt((diff % (60 * 60)) / 60, 10)
            seconds = (diff % 60)
            formatTime = (num, type) ->
                (if (num > 0 and num isnt 1) then (num + " " + type + "s") else (if (num is 1) then (num + " " + type) else ""))

            [
                formatTime(days, "day")
                formatTime(hours, "hour")
                formatTime(minutes, "minute")
                formatTime(seconds, "second")
            ].filter @stripEmpty

        util.sendHtmlSemuted = (html, chan) ->
            ids = sys.playerIds()
            sess = undefined
            id = undefined
            len = undefined
            i = undefined
            i = 0
            len = ids.length

            while i < len
                id = ids[i]
                if sys.isInChannel(id, chan)
                    sess = SESSION.users(id)
                    sys.sendHtmlMessage id, html, chan    if sess and sess.semuted
                i += 1
            return

        util.randomSample = (hash) ->
            cum = 0
            val = Math.random()
            psum = 0.0
            x = undefined
            count = 0
            for x of hash
                psum += hash[x].chance
                count += 1
            if psum is 0.0
                j = 0
                for x of hash
                    cum = (++j) / count
                    return x    if cum >= val
            else
                for x of hash
                    cum += hash[x].chance / psum
                    return x    if cum >= val
            return

        
        # Creates an importable [array] for src's team, teamId.
        # Importables will have some goodies that will break them for use with PO, disable this with a third argument that is true.
        util.teamImportable = (src, teamId, compatible) ->
            importable = []
            maxTeamPokemon = 6
            pokemonStatsCount = 6
            maxPokemonMoves = 4
            pokemonMaxLevel = 100
            pokemon_MissingNo = 0
            itemname_NoItem = "(No Item)"
            move_NoMove = 0
            move_HiddenPower = 237
            gen = sys.gen(src, teamId)
            fullGen = sys.generation(gen, sys.subgen(src, teamId))
            pokemon = undefined
            move = undefined
            ev = undefined
            iv = undefined
            pokemonId = undefined
            pokemonName = undefined
            pokemonLevel = undefined
            pokemonItem = undefined
            pokemonAbility = undefined
            pokemonColor = undefined
            pokemonGender = undefined
            pokemonNature = undefined
            pokemonShiny = undefined
            pokemonNickname = undefined
            pokemonEV = undefined
            pokemonEVs = []
            pokemonIV = undefined
            pokemonIVs = []
            moveId = undefined
            moveName = undefined
            moveType = undefined
            movePart = undefined
            nicknamePart = undefined
            itemPart = undefined
            genderPart = undefined
            importable.push "Team #" + (teamId + 1) + ": Gen " + gen + " (" + fullGen + ")"    unless compatible
            
            # Loop over their Pokémon.
            pokemon = 0
            while pokemon < maxTeamPokemon
                pokemonId = sys.teamPoke(src, teamId, pokemon)
                
                # Don't handle MissingNo
                continue    if pokemonId is pokemon_MissingNo
                pokemonName = sys.pokemon(pokemonId)
                pokemonLevel = sys.teamPokeLevel(src, teamId, pokemon)
                pokemonItem = sys.teamPokeItem(src, teamId, pokemon)
                pokemonAbility = sys.teamPokeAbility(src, teamId, pokemon)
                pokemonColor = typeColorNames[sys.pokeType1(pokemonId)]
                pokemonGender = sys.teamPokeGender(src, teamId, pokemon)
                pokemonNature = sys.teamPokeNature(src, teamId, pokemon)
                pokemonShiny = sys.teamPokeShine(src, teamId, pokemon)
                pokemonNickname = sys.teamPokeNick(src, teamId, pokemon)
                importable.push "<img src='pokemon:num=" + pokemonId + "&gen=" + gen + "&back=false&shiny=" + pokemonShiny + "&gender=" + pokemonGender + "'> <img src='pokemon:num=" + pokemonId + "&gen=" + gen + "&back=true&shiny=" + pokemonShiny + "&gender=" + pokemonGender + "'>"    unless compatible
                nicknamePart = pokemonNickname + "</b></font>"
                nicknamePart += " (<b style='color:" + pokemonColor + "'>" + pokemonName + "</b>)"    if pokemonName isnt pokemonNickname
                itemPart = sys.item(pokemonItem)
                if itemPart is itemname_NoItem
                    itemPart = ""
                # If the item isn't (No Item), and compatible is off, display an image instead.
                else itemPart = itemPart + " <img src='item:" + pokemonItem + "'>"    unless compatible
                genderPart = (if compatible then genderToImportable[sys.gender(pokemonGender)] else genderToImportable.incompatible[sys.gender(pokemonGender)])
                
                # <b> tag is closed by nicknamePart
                importable.push "<b style='color: " + pokemonColor + "'>" + nicknamePart + " " + genderPart + " @ " + itemPart
                
                # In Generation 1 and 2, there were no abilities.
                importable.push "<b style='color: " + pokemonColor + "'>Trait:</b> " + sys.ability(pokemonAbility)    if gen > 2
                
                # Only add the level header if the Pokémon's level isn't maximum.
                importable.push "<b style='color: " + pokemonColor + "'>Level:</b> " + pokemonLevel    if pokemonMaxLevel > pokemonLevel
                
                # No EVs or IVs in Generation 1.
                if gen > 1
                    
                    # EVs
                    pokemonEVs = []
                    ev = 0
                    while ev < pokemonStatsCount
                        pokemonEV = sys.teamPokeEV(src, teamId, pokemon, ev)
                        
                        # 255 is the default in Generation 2.
                        continue    if pokemonEV is 0 or (gen is 2 and pokemonEV is 255)
                        pokemonEVs.push pokemonEV + " " + statNames[ev]
                        ev += 1
                    
                    # If there are custom EVs, add the header. EVs are separated with a forward slash, one space before it, and one after.
                    importable.push "<b style='color: " + pokemonColor + "'>EVs:</b> " + pokemonEVs.join(" / ")    if pokemonEVs.length
                    pokemonIVs = []
                    
                    # IVs - DVs in Pokémon Online
                    iv = 0
                    while iv < pokemonStatsCount
                        pokemonIV = sys.teamPokeDV(src, teamId, pokemon, iv)
                        
                        # 15 is the default in Generation 2, 31 otherwise.
                        continue    if pokemonIV is 31 or (gen is 2 and pokemonIV is 15)
                        pokemonIVs.push pokemonIV + " " + statNames[iv]
                        iv += 1
                    
                    # If there are custom IVs, add the header. IVs are separated with a forward slash, one space before it, and one after.
                    importable.push "<b style='color: " + pokemonColor + "'>IVs:</b> " + pokemonIVs.join(" / ")    if pokemonIVs.length
                
                # There are no natures in Generation 2 either.
                
                # natureNames contains all the info we need. <b> is once again closed in this aswell.
                importable.push "<b style='color: " + pokemonColor + "'>" + natureNames[pokemonNature]    if gen > 2
                
                # Now handle the moves. Oh boy.
                move = 0
                while move < maxPokemonMoves
                    moveId = sys.teamPokeMove(src, teamId, pokemon, move)
                    moveName = sys.move(moveId)
                    moveType = sys.moveType(moveId)
                    movePart = "<b style='color: " + typeColorNames[moveType] + "'>" + moveName + "</b>"
                    
                    # Skip empty move slots.
                    continue    if moveId is move_NoMove
                    
                    # Special stuff for Hidden Power.
                    if moveId is move_HiddenPower
                        
                        # Redo the IVs, this time include every one.
                        pokemonIVs = []
                        iv = 0
                        while iv < pokemonStatsCount
                            pokemonIV = sys.teamPokeDV(src, teamId, pokemon, iv)
                            pokemonIVs.push pokemonIV
                            iv += 1
                        
                        # Combine the gen with the pokemon's complete IV list to get the type of hidden power via hiddenPowerType.
                        moveType = sys.hiddenPowerType.apply(sys, [gen].concat(pokemonIVs))
                        movePart = "<b style='color: " + typeColorNames[moveType] + "'>" + moveName + "</b>"
                    importable.push "-" + movePart
                    move += 1
                pokemon += 1
            importable

        util.watch = {}
        util.watch.message = (src, type, message, chan) ->
            watchbot.sendAll "[" + Utils.clink(chan) + "] " + type + " » " + Utils.nameIp(src, ":") + " " + Utils.escapeHtml(message), watch
            return

        util.watch.notify = (message) ->
            watchbot.sendAll message, watch
            return

        util.mod = {}
        util.mod.kick = (src) ->
            pids = sys.playerIds()
            ip = sys.ip(src)
            found = false
            len = undefined
            id = undefined
            i = undefined
            i = 0
            len = pids.length

            while i < len
                id = pids[i]
                if sys.ip(id) is ip and sys.loggedIn(id)
                    sys.kick id
                    found = true
                i += 1
            if found
                reconnectTrolls[ip] = true
                sys.setTimer (->
                    delete reconnectTrolls[ip]

                    return
                ), 3000, false
            found

        
        # If a player is banned.
        util.mod.isBanned = (playerName) ->
            sys.banned sys.dbIp(playerName)

        
        # Returns the amount of seconds name is temporary banned for.
        # This > sys.dbTempBanTime.
        # NOTE: Unlike sys.dbTempBanTime, this returns 0 if the player isn't banned.
        util.mod.tempBanTime = (playerName) ->
            
            # Return their name. This allows us to accept ids as well.
            trueName = (sys.name(playerName) or playerName).toLowerCase()
            
            # If they aren't banned, return 0.
            return 0    unless sys.banned(sys.dbIp(trueName))
            
            # Otherwise, return for how long they are banned.
            sys.dbTempBanTime trueName

        
        # Temporarly bans a player.
        # NOTE: Time is in minutes.
        # NOTE: This is done quietly.
        util.mod.tempBan = (name, time) ->
            tar = sys.id(name)
            trueName = (SESSION.users(tar) or originalName: name).originalName or name
            time = Math.round(time)
            sys.tempBan trueName, time
            util.mod.kickIp sys.ip(tar) or sys.dbIp(name)
            return

        util.mod.kickIp = (ip) ->
            aliases = sys.aliases(ip)
            found = false
            id = undefined
            len = undefined
            i = undefined
            i = 0
            len = aliases.length

            while i < len
                id = sys.id(aliases[i])
                if id
                    sys.kick id
                    found = true
                i += 1
            if found
                reconnectTrolls[ip] = true
                sys.setTimer (->
                    delete reconnectTrolls[ip]

                    return
                ), 3000, false
            return

        util.mod.ban = (name) ->
            sys.ban name
            if sys.id(name)
                util.mod.kick sys.id(name)
            else
                util.mod.kickIp sys.dbIp(name)
            return

        util.mod.pruneMutes = ->
            now = +sys.time()
            mute = undefined
            meta = undefined
            for mute of Mutes
                meta = Mutes[mute]
                delete Mutes[mute]    if meta.time isnt 0 and meta.time < now
            return

        util.mod.hasBasicPermissions = (src) ->
            user = SESSION.users(src)
            util.getAuth(src) > 0 or user and Config.maintainers.indexOf(user.originalName) isnt -1

        util.channel = {}
        util.channel.channelAuth = (src, chan) ->
            src = sys.name(src)    if typeof src is "number"
            sess = SESSION.channels(chan)
            name = src.toLowerCase()
            auth = util.getAuth(src)
            cauth = (if (sess.creator.toLowerCase() is name) then 3 else (sess.auth[name] or 0))
            (if auth > cauth then auth else cauth)

        util.channel.isChannelMember = (src, chan) ->
            src = sys.name(src)    if typeof src is "number"
            sess = SESSION.channels(chan)
            name = src.toLowerCase()
            (if (sess.creator.toLowerCase() is name) then true else (sess.members[name] or false))

        util.channel.hasChannelAuth = (src, chan) ->
            util.channel.channelAuth(src, chan) > 0

        util.channel.isChannelMod = (src, chan) ->
            util.channel.channelAuth(src, chan) >= 1

        util.channel.isChannelAdmin = (src, chan) ->
            util.channel.channelAuth(src, chan) >= 2

        util.channel.isChannelOwner = (src, chan) ->
            util.channel.channelAuth(src, chan) >= 3

        util.tier = {}
        util.tier.isCCTier = (tier) ->
            CCTiers.indexOf(tier) > -1

        util.tier.hasOneUsablePoke = (src, team) ->
            fine = false
            j = undefined
            i = undefined
            i = 0
            while i < 6
                if sys.teamPoke(src, team, i) isnt 0
                    j = 0
                    while j < 4
                        if sys.teamPokeMove(src, team, i, j) isnt 0
                            fine = true
                            break
                        j += 1
                i += 1
            fine

        util.tier.hasDrizzleSwim = hasDrizzleSwim = (src) ->
            swiftswim = undefined
            drizzle = undefined
            teamCount = sys.teamCount(src)
            teams_banned = []
            ability = undefined
            team = undefined
            i = undefined
            if sys.hasTier(src, "5th Gen OU")
                team = 0
                while team < teamCount
                    continue    if sys.tier(src, team) isnt "5th Gen OU"
                    swiftswim = false
                    drizzle = false
                    i = 0
                    while i < 6
                        ability = sys.ability(sys.teamPokeAbility(src, team, i))
                        if ability is "Swift Swim"
                            swiftswim = true
                        else drizzle = true    if ability is "Drizzle"
                        if drizzle and swiftswim
                            teams_banned.push team
                            break
                        i += 1
                    team += 1
            teams_banned

        util.tier.hasSandCloak = hasSandCloak = (src) -> # Has Sand Veil or Snow Cloak in tiers < 5th Gen Ubers.
            teams_banned = []
            teamCount = sys.teamCount(src)
            ability = undefined
            team = undefined
            i = undefined
            team = 0
            while team < teamCount
                continue    if sys.tier(src, team) is "5th Gen Ubers" or sys.gen(src, team) isnt 5 # Only care about 5th Gen
                i = 0
                while i < 6
                    ability = sys.ability(sys.teamPokeAbility(src, team, i))
                    if ability is "Sand Veil" or ability is "Snow Cloak"
                        teams_banned.push team
                        break
                    i += 1
                team += 1
            teams_banned

        util.tier.dreamAbilityCheck = dreamAbilityCheck = (src) ->
            teamCount = sys.teamCount(src)
            ability = undefined
            poke = undefined
            lpoke = undefined
            i = undefined
            i = 0
            while i < teamCount
                ability = sys.ability(sys.teamPokeAbility(src, i, i))
                poke = sys.pokemon(sys.teamPoke(src, i, i))
                lpoke = poke.toLowerCase()
                if bannedAbilities.hasOwnProperty(lpoke) and bannedAbilities[lpoke].indexOf(ability.toLowerCase()) isnt -1
                    bot.sendMessage src, poke + " is not allowed to have ability " + ability + " in the 5th Gen OU Tier. Please change it in Teambuilder. You are now in the Random Battle tier."
                    return true
                i += 1
            false

        
        # https://github.com/davidmerfield/randomColor
        util.color = {}
        util.color.randomColor = (options) ->
            
            # Check if we need to generate multiple colors
            
            # Populate the color dictionary
            
            # First we pick a hue (H)
            
            # Then use H to determine saturation (S)
            
            # Then use S and H to determine brightness (B).
            
            # Then we return the HSB color in the desired format
            pickHue = (options) ->
                hueRange = getHueRange(options.hue)
                hue = randomWithin(hueRange)
                
                # Instead of storing red as two seperate ranges,
                # we group them, using negative numbers
                hue = 360 + hue    if hue < 0
                hue
            pickSaturation = (hue, options) ->
                if options.luminosity is "random"
                    return randomWithin([
                        0
                        100
                    ])
                return 0    if options.hue is "monochrome"
                saturationRange = getSaturationRange(hue)
                sMin = saturationRange[0]
                sMax = saturationRange[1]
                switch options.luminosity
                  when "bright"
                        sMin = 55
                  when "dark"
                        sMin = sMax - 10
                  when "light"
                        sMax = 55
                randomWithin [
                    sMin
                    sMax
                ]
            pickBrightness = (H, S, options) ->
                brightness = undefined
                bMin = getMinimumBrightness(H, S)
                bMax = 100
                switch options.luminosity
                  when "dark"
                        bMax = bMin + 20
                  when "light"
                        bMin = (bMax + bMin) / 2
                  when "random"
                        bMin = 0
                        bMax = 100
                randomWithin [
                    bMin
                    bMax
                ]
            setFormat = (hsv, options) ->
                switch options.format
                  when "hsvArray"
                        hsv
                  when "hsv"
                        colorString "hsv", hsv
                  when "rgbArray"
                        HSVtoRGB hsv
                  when "rgb"
                        colorString "rgb", HSVtoRGB(hsv)
                    else
                        HSVtoHex hsv
            getMinimumBrightness = (H, S) ->
                lowerBounds = getColorInfo(H).lowerBounds
                i = 0

                while i < lowerBounds.length - 1
                    s1 = lowerBounds[i][0]
                    v1 = lowerBounds[i][1]
                    s2 = lowerBounds[i + 1][0]
                    v2 = lowerBounds[i + 1][1]
                    if S >= s1 and S <= s2
                        m = (v2 - v1) / (s2 - s1)
                        b = v1 - m * s1
                        return m * S + b
                    i++
                0
            getHueRange = (colorInput) ->
                if typeof parseInt(colorInput) is "number"
                    number = parseInt(colorInput)
                    if number < 360 and number > 0
                        return [
                            number
                            number
                        ]
                if typeof colorInput is "string"
                    if colorDictionary[colorInput]
                        color = colorDictionary[colorInput]
                        return color.hueRange    if color.hueRange
                [
                    0
                    360
                ]
            getSaturationRange = (hue) ->
                getColorInfo(hue).saturationRange
            getColorInfo = (hue) ->
                
                # Maps red colors to make picking hue easier
                hue -= 360    if hue >= 334 and hue <= 360
                for colorName of colorDictionary
                    color = colorDictionary[colorName]
                    return colorDictionary[colorName]    if color.hueRange and hue >= color.hueRange[0] and hue <= color.hueRange[1]
                "Color not found"
            randomWithin = (range) ->
                Math.floor range[0] + Math.random() * (range[1] + 1 - range[0])
            shiftHue = (h, degrees) ->
                (h + degrees) % 360
            HSVtoHex = (hsv) ->
                componentToHex = (c) ->
                    hex = c.toString(16)
                    (if hex.length is 1 then "0" + hex else hex)
                rgb = HSVtoRGB(hsv)
                hex = "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2])
                hex
            defineColor = (name, hueRange, lowerBounds) ->
                sMin = lowerBounds[0][0]
                sMax = lowerBounds[lowerBounds.length - 1][0]
                bMin = lowerBounds[lowerBounds.length - 1][1]
                bMax = lowerBounds[0][1]
                colorDictionary[name] =
                    hueRange: hueRange
                    lowerBounds: lowerBounds
                    saturationRange: [
                        sMin
                        sMax
                    ]
                    brightnessRange: [
                        bMin
                        bMax
                    ]

                return
            loadColorBounds = ->
                defineColor "monochrome", null, [
                    [
                        0
                        0
                    ]
                    [
                        100
                        0
                    ]
                ]
                defineColor "red", [
                    -26
                    18
                ], [
                    [
                        20
                        100
                    ]
                    [
                        30
                        92
                    ]
                    [
                        40
                        89
                    ]
                    [
                        50
                        85
                    ]
                    [
                        60
                        78
                    ]
                    [
                        70
                        70
                    ]
                    [
                        80
                        60
                    ]
                    [
                        90
                        55
                    ]
                    [
                        100
                        50
                    ]
                ]
                defineColor "orange", [
                    19
                    46
                ], [
                    [
                        20
                        100
                    ]
                    [
                        30
                        93
                    ]
                    [
                        40
                        88
                    ]
                    [
                        50
                        86
                    ]
                    [
                        60
                        85
                    ]
                    [
                        70
                        70
                    ]
                    [
                        100
                        70
                    ]
                ]
                defineColor "yellow", [
                    47
                    62
                ], [
                    [
                        25
                        100
                    ]
                    [
                        40
                        94
                    ]
                    [
                        50
                        89
                    ]
                    [
                        60
                        86
                    ]
                    [
                        70
                        84
                    ]
                    [
                        80
                        82
                    ]
                    [
                        90
                        80
                    ]
                    [
                        100
                        75
                    ]
                ]
                defineColor "green", [
                    63
                    158
                ], [
                    [
                        30
                        100
                    ]
                    [
                        40
                        90
                    ]
                    [
                        50
                        85
                    ]
                    [
                        60
                        81
                    ]
                    [
                        70
                        74
                    ]
                    [
                        80
                        64
                    ]
                    [
                        90
                        50
                    ]
                    [
                        100
                        40
                    ]
                ]
                defineColor "blue", [
                    159
                    257
                ], [
                    [
                        20
                        100
                    ]
                    [
                        30
                        86
                    ]
                    [
                        40
                        80
                    ]
                    [
                        50
                        74
                    ]
                    [
                        60
                        60
                    ]
                    [
                        70
                        52
                    ]
                    [
                        80
                        44
                    ]
                    [
                        90
                        39
                    ]
                    [
                        100
                        35
                    ]
                ]
                defineColor "purple", [
                    258
                    282
                ], [
                    [
                        20
                        100
                    ]
                    [
                        30
                        87
                    ]
                    [
                        40
                        79
                    ]
                    [
                        50
                        70
                    ]
                    [
                        60
                        65
                    ]
                    [
                        70
                        59
                    ]
                    [
                        80
                        52
                    ]
                    [
                        90
                        45
                    ]
                    [
                        100
                        42
                    ]
                ]
                defineColor "pink", [
                    283
                    334
                ], [
                    [
                        20
                        100
                    ]
                    [
                        30
                        90
                    ]
                    [
                        40
                        86
                    ]
                    [
                        60
                        84
                    ]
                    [
                        80
                        80
                    ]
                    [
                        90
                        75
                    ]
                    [
                        100
                        73
                    ]
                ]
                return
            HSVtoRGB = (hsv) ->
                
                # this doesn't work for the values of 0 and 360
                # here's the hacky fix
                h = hsv[0]
                h = 1    if h is 0
                h = 359    if h is 360
                
                # Rebase the h,s,v values
                h = h / 360
                s = hsv[1] / 100
                v = hsv[2] / 100
                h_i = Math.floor(h * 6)
                f = h * 6 - h_i
                p = v * (1 - s)
                q = v * (1 - f * s)
                t = v * (1 - (1 - f) * s)
                r = 256
                g = 256
                b = 256
                switch h_i
                  when 0
                        r = v
                        g = t
                        b = p
                  when 1
                        r = q
                        g = v
                        b = p
                  when 2
                        r = p
                        g = v
                        b = t
                  when 3
                        r = p
                        g = q
                        b = v
                  when 4
                        r = t
                        g = p
                        b = v
                  when 5
                        r = v
                        g = p
                        b = q
                result = [
                    Math.floor(r * 255)
                    Math.floor(g * 255)
                    Math.floor(b * 255)
                ]
                result
            colorString = (prefix, values) ->
                prefix + "(" + values.join(", ") + ")"
            options = options or {}
            colorDictionary = {}
            H = undefined
            S = undefined
            B = undefined
            if options.count
                totalColors = options.count
                colors = []
                options.count = false
                colors.push randomColor(options)    while totalColors > colors.length
                return colors
            loadColorBounds()
            H = pickHue(options)
            S = pickSaturation(H, options)
            B = pickBrightness(H, S, options)
            return setFormat([
                H
                S
                B
            ], options)
            return

        util.color.randomDark = ->
            util.color.randomColor
                luminosity: "dark"
                count: 27


        util

    module.reload = ->
        Utils = module.exports()
        true

    return
)()
