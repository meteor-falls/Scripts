(function () {
    function formatArgs(args) {
        if (!args || !Array.isArray(args)) {
            return "";
        }

        return " " + args.map(function (val) {
            return "<b style='color: #f40000;'>[" + val + "]</b>";
        }).join(":");
    }

    function CommandList(title, help, listtype) {
        help = (help || help === "") ? help : "Type one of the following into the channel's chat to use it:";
        listtype = listtype || "ul";

        this.title = title;
        this.listtype = listtype;
        this.template = Bot.border + "<br><h2>" + title + "</h2>";

        if (help !== "") {
            this.template += "<i>" + help + "</i><" + listtype + ">";
        }
    }

    CommandList.prototype.add = function (cmd, desc, args) {
        var len, i;
        if (Array.isArray(cmd)) {
            for (i = 0, len = cmd.length; i < len; i += 1) {
                this.add.apply(this, cmd[i]);
            }
            return this;
        }

        if (arguments.length > 1) {
            if (!args) {
                cmd = "/<a href='po:send//" + cmd + "' style='text-decoration:none;color:black'>" + cmd + "</a>";
            } else {
                cmd = "/" + cmd;
            }

            this.template += "<li><b>" + cmd + "</b>" + formatArgs(args) + " " + desc + "</li>";
        } else {
            this.template += "<li><b>" + cmd + "</b></li>";
        }

        return this;
    };

    CommandList.prototype.finish = function () {
        this.template += "</" + this.listtype + "><br>" + Bot.border;
        return this;
    };

    CommandList.prototype.display = function (player, channel) {
        sys.sendHtmlMessage(player, this.template, channel);
    };

    // Default border: 2
    // Default padding: 5
    function TableList(name, color, border, padding) {
        if (padding == null) {
            padding = 5;
        }
        if (border == null) {
            border = 2;
        }

        this.name = name;
        this.color = color;
        this.border = border;
        this.padding = padding;

        this.template = Bot.border + "<h2>" + name + "</h2><br>";
        this.template += "<table border=" + border + " cellpadding=" + padding + ">";

        this._zebra = true;
    }

    TableList.prototype.bgcolor = function () {
        var color = this.color.toLowerCase();

        if (color === "zebra" || color === "stripe") {
            if (this._zebra) {
                color = "#eaeaea";
            } else {
                color = "#f4f4f4";
            }

            this._zebra = !this._zebra;
        }

        return color;
    };

    TableList.prototype.add = function (elements, isBold) {
        var out = "<tr bgcolor='" + this.bgcolor() + "'>",
            tags = isBold ? ['<th>', '</th>'] : ['<td>', '</td>'],
            len, i;

        for (i = 0, len = elements.length; i < len; i += 1) {
            out += tags[0] + elements[i] + tags[1];
        }

        out += "</tr>";
        this.template += out;
        return this;
    };

    TableList.prototype.addEvery = function (elements, isBold, every, remainingIsBold) {
        var out = [],
            element, len;

        for (element = 0, len = elements.length; element < len; element += 1) {
            out.push(elements[element]);

            if (out.length >= every) {
                this.add(out, isBold);
                out = [];
            }
        }

        if (out.length) {
            this.add(out, remainingIsBold === undefined ? isBold : remainingIsBold);
        }

        return this;
    };

    TableList.prototype.finish = function () {
        this.template += "</table><br><br><font color='" + this.borderColor + "' size='4'><b>»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»</b></font>";
        return this;
    };

    TableList.prototype.display = function (player, channel) {
        sys.sendHtmlMessage(player, this.template, channel);
    };

    global.CommandList = CommandList;
    global.TableList = TableList;

    function generateLists() {
        var Lists = {};

        Lists.Commands = new CommandList("Commands").add([
            ["usercommands", "To view the commands for <b>users</b>."],
            ["feedmoncommands", "To view the commands related to <b>feedmon</b>."],
            ["channelcommands", "To view the commands related to <b>channels</b>."],
            ["pluscommands", "To view the commands for <b>" + Ranks.plus.name + " members</b>."],
            ["pluspluscommands", "To view the commands for <b>" + Ranks.plusplus.name + " members</b>."],
            ["leaguemanagercommands", "To view the commands for <b>league managers</b>."],
            ["hlrcommands", "To view the commands for <b>highlanders</b> (use them in the <a href='po:join/Highlanders'>#Highlanders</a> channel)"],
            ["modcommands", "To view the commands for <b>moderators</b>."],
            ["admincommands", "To view the commands for <b>administrators</b>."],
            ["ownercommands", "To view the commands for <b>owners</b>."],
            ["maintainercommands", "To view commands for <b>maintainers</b>."]
        ]).finish();

        /** USER COMMANDS **/
        Lists.User = new CommandList("User Commands").add([
            ["tourusercommands", "To view the tournament commands for users."],
            ["funcommands", "To view the fun commands."],
            ["rules", "To view the rules."],
            ["scriptinfo", "To view script information."],
            ["auth", "To view the authlist."],
            ["pluslist", "To view the users who have " + Ranks.plus.name + "."],
            ["pluspluslist", "To view the users who have " + Ranks.plusplus.name + "."],
            ["league", "To view the list of gym leaders, elites, and the champion."],
            ["leaguerules", "To view the rules for the League."],
            ["sendto", "To send a message to a certain person. To ping, just type /sendto [person].", ["person", "message"]],
            ["bbcode", "To view a list of bbcodes."],
            ["selfkick", "Kicks all the ghosts on your ip."],
            ["vote", "To vote on a poll option.", ["option"]],
            ["players", "Tells you how many players there are online on the given [os] (windows, mac, linux, android, webclient). If not specified, tells you how many players there are online regardless of OS.", ["os"]]
        ]).finish();

        /** LEAGUE MANAGER **/
        Lists.LeagueManager = new CommandList("League Manager Commands").add([
            ["gl", "To make someone the [spot] gym leader. [spot] can be 1-8. Removes gym leader [spot] if [player] is empty.", ["player", "spot"]],
            ["el", "To make someone the [spot] elite. [spot] can be 1-4. Removes elite [spot] if [player] is empty.", ["player", "spot"]],
            ["champ", "To make someone the champion. Removes the champion if [player] is empty.", ["player"]]
        ]).finish();

        /** FUN **/
        Lists.Fun = new CommandList("Fun Commands").add([
            ["burn", "To burn someone.", ["player"]],
            ["freeze", "To freeze someone.", ["player"]],
            ["paralyze", "To paralyze someone.", ["player"]],
            ["poison", "To poison someone.", ["player"]],
            ["cure", "To cure someone.", ["player"]],
            ["me", "To post a message with *** around it.", ["message"]],
            ["spin", "To play roulette if a game is going on."],
            ["attack", "To use a Pokémon attack on someone.", ["player"]]
        ]).finish();

        /** FEEDMON **/
        Lists.Feedmon = new CommandList("Feedmon Commands").add([
            ["catch", "Catches a random Pokémon."],
            ["feed", "Feeds your caught Pokémon."],
            ["nickname", "Gives your caught Pokémon a nickname.", ["name"]],
            ["level", "If [option] is all, displays requirements for all levels. Otherwise, displays how many EXP you still need for the next level.", ["option"]],
            ["battle", "Starts a battle with a random Pokémon."],
            ["move", "Uses one of your Pokémon moves in battle.", ["num"]],
            ["heal", "Revives/heals your (fainted) Pokémon."]
        ]).finish();

        /** CHANNEL */
        Lists.Channel = new CommandList("Channel Commands").add([
            ["cauth", "Shows this channel's auth."],
            ["topic", "Shows this channel's topic."],
            ["topicsource", "Shows the source of this channel's topic (no formatting)."],
            ["chanmodcommands", "To view the commands for <b>channel moderators</b>."],
            ["chanadmincommands", "To view the commands for <b>channel administrators</b>."],
            ["chanownercommands", "To view the commands for <b>channel owners</b>."],
            ["<b>Note:</b> As creator of the channel, you will always have channel owner permissions. Additionally, your channel auth is never lower than your server auth."]
        ]).finish();

        Lists.ChanMod = new CommandList("Channel Moderator Commands").add([
            ["changetopic", "Sets the topic of the channel to [topic]. HTML is allowed. An empty [topic] will reset the topic.", ["topic"]],
            ["channelkick", "To kick [player] from this channel.", ["player"]]
        ]).finish();

        Lists.ChanAdmin = new CommandList("Channel Administrator Commands").add([
        ]).finish();

        Lists.ChanOwner = new CommandList("Channel Owner Commands").add([
            ["cchangeauth", "Changes the channel auth of [player] to [auth]. [auth] must be 0-3.", ["player", "auth"]]
        ]).finish();

        /** TOURNAMENT USER **/
        Lists.Tour = new CommandList("Tour User Commands").add([
            ["join", "To join a tournament during the sign up phase."],
            ["unjoin", "To leave a tournament."],
            ["viewround", "To view the status of the tournament."],
            ["tourtier", "To view the tier of the tournament."]
        ]).finish();

        /** PLUS **/
        Lists.Plus = new CommandList(Ranks.plus.name + " Commands").add([
            ["rtd", "Roll the dice! You will receive a special effect."],
            ["emotes", "To view a list of emotes."],
            ["emotetoggle", "To toggle emotes on or off for you."]
        ]).finish();

        /** PLUSPLUS **/
        Lists.Plusplus = new CommandList(Ranks.plusplus.name + " Commands").add([
            ["tour", "To start a tournament with tier [tier] that allows [#ofplayers] people to play with optional prize [prize].", ["tier", "#ofplayers", "prize"]],
            ["endtour", "To end a running tournament."],
            ["sub", "To replace [player1] with [player2] in the running tournament.", ["player1", "player2"]],
            ["changecount", "To change the number of entrants allowed to [number] during the sign up phase.", ["number"]],
            ["push", "To force [player] in the running tournament.", ["player"]],
            ["dq", "To disqualify [player] from the running tournament.", ["player"]],
            ["restart", "To restart [name]'s battle in the running tournament. Abusing this can cost you your " + Ranks.plusplus.name + " status.", ["name"]]
        ]).finish();

        /** RULES **/
        var Rules = new CommandList("Rules", "Please follow the rules or risk punishment: <small>(revision 5)</small>", "ol").add([
            ["Do not spam or flood the chat (3 lines in a row is considered flood). CAPS spam isn't not allowed either, neither is posting the exact same message in quick succession. Do not spam emotes or any rtd effects. Any commands that do not send messages to other people are generally exempt, however commands like ping are not. You are not immume to this rule even if you have flood ignore."],
            ["Listen to the auth. If an auth tells you to stop misbehaving, you must listen or your punishment is their choice (as long as it's reasonable). Shouting 'abuse' when you've clearly broken the rules will bring you in more trouble."],
            ["Keep disrespectful statements to a minimum. Attentionwhoring drama, irritating trolling, or provoking behavior will be punished accordingly. We might choose to ban you for a short period of time if it gets out of hand."],
            ["Roleplaying is a no-no, especially the me command. You can do that somewhere else."],
            ["No sexual or harmful content whatsoever. This includes porn sites, viruses, sexual ASCII art, &c."],
            ["Asking for authority is not allowed. This includes ranks. If you have good reasoning, we might consider you."],
            ["Do not advertise your server, your Facebook page, or any other stupid things. Advertising will give your server a bad reputation."],
            ["If you're talking to someone directly, it's best to send them a private message instead of doing so in the main chat, if you know it won't benefit or entertain anyone else. If your conversation is deemed annoying you will be told to take it to PM/channel."],
            ["Ignorance of the rules is not a reason not to follow them. Acting like you've done nothing wrong when you clearly have won't help your case. If you've been muted/banned and you behave, it might be undone prematurely."],
            ["Although PMs are generally free of rules (we cannot see them nor do we care), if you do mean things and the person reports you, we might take action."],
            ["The main channel is English only. You can talk any other language in another channel, though."],
            ["Impersonating someone isn't cool and won't be appreciated."],
            ["Ban evasion will just grant you yet another ban. Rangebans are no different."]
        ]);

        Rules.template += "</ol>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Follow all the rules above and you will have no problem having a good time at " + Reg.get("servername") + "!<br>";
        Rules.finish();

        Lists.Rules = Rules;

        /** LEAGUE RULES **/
        Lists.LeagueRules = new CommandList("League Rules", "Please follow the rules below or you will be unable to challenge the league:", "ol").add([
            ["You must follow any rules made by the gym leader/elite 4. If the rule is crazy, talk to an auth. If the gym leader/elite 4 doesn't have rules, read rule 8."],
            ["No lying. If you lie about defeating a league member, you will have to start the league over again."],
            ["Be a good sport. If you lose, say GG or nothing, just don't be mean!"],
            ["Respect one another. This rule goes for both league members and challengers. Friendly trash talk is fine, don't make it personal."],
            ["If you lose a gym battle, you can rematch that gym at a time specified by the gym leader."],
            ["If you lose to an elite 4 or the champion, you must start back over at the first elite."],
            ["If you defeat the gyms, elites, and the champion, you will be in the Hall of Fame!"],
            ["If the league member does not have set rules, follow these guidelines:</ol><ul><b><li>5th Gen OU Tier</li><b><li>Singles battle</li><b><li>Best 2 out of 3 decides winner</li></ul></li>"]
        ]).finish();

        /** MODERATOR COMMANDS **/
        Lists.Mod = new CommandList("Moderator Commands").add([
            ["moderationcommands", "To display a list of commands that moderate the chat."],
            ["partycommands", "To display a list of party commands."],
            ["[c]wall", "To post [text] with borders around it. [c makes it so it only appears in the channel it's used in]", ["text"]],
            ["imp", "To change your name to [name].", ["name"]],
            ["impoff", "To stop imping."],
            ["motd", "To change the Message of the Day to [message].", ["message"]],
            ["forcerules", "To show the rules to [player].", ["player"]],
            ["info", "To view info about [player].", ["player"]],
            ["sendall", "To send a message to everyone.", ["message"]],
            ["sendhtmlall", "To send an HTML message to everyone.", ["message"]],
            ["warn", "To send a warning to [player] with reason [reason]. If [reason] is undo, the warning is undone. [reason] is only required when the target hasn't been infracted. Further usage of the command will result in a kick/mute (5 minutes) of the player.", ["player", "reason"]],
            ["getmotd", "To get the MOTD (including HTML)."],
            ["public", "To make the server public."],
            ["regfix", "Re-connects the server to the registry."],
            ["poll", "To start a poll. You must specify at least 2 options.", ["subject", "option1*option2*option..."]],
            ["forcepoll", "Shows the poll (subject, options) to everyone in the main channel."],
            ["closepoll", "To close the current poll."],
            ["onos", "Gives you the list of players on the given [os] (windows, mac, linux, android, webclient).", ["os"]]
        ]).finish();

        /** MODERATION COMMANDS **/
        Lists.Moderate = new CommandList("Moderation Commands").add([
            ["logwarn", "To warn [player] of excessive logs.", ["player"]],
            ["tellemotes", "To explain to [player] what emotes are.", ["player"]],
            ["tellandroid", "To explain to [player] how to use the android application.", ["player"]],
            ["[s]kick", "To kick [player] from the server. You can kick multiple players with by separating their names with '*'. [reason] is optional.", ["player*player2", "reason"]],
            ["[s]disconnect", "To disconnect [player] from the server. This will not kick their alts, and will allow them to come back online using the reconnect feature. You can kick multiple players with by separating their names with '*'. [reason] is optional.", ["player*player2", "reason"]],
            ["mute", "To mute someone, [time] and [reason] are optional. Time is split by spaces with a short time unit after the number. (example: 10m -10s (590 seconds), or 10.5m (630 seconds)) If no time is specified, the mute lasts forever. You can skip time by doing: /mute [player]:forever:[reason].", ["player", "time", "reason"]],
            ["unmute", "To unmute [person].", ["person"]],
            ["tempban", "To tempban [person] for [time]. [timeunit] and [reason] are optional. Units are the same from /mute. Default time is 30 minutes. Time should be in minutes (with no seconds specified), otherwise it might become 30 minutes.", ["person", "time", "timeunit", "reason"]],
            ["untempban", "To remove [person]'s tempban.", ["person"]],
            ["mutes", "To see a list of muted people."],
            ["tempbans", "To see a list of temporarily banned players."],
            ["rangebans", "To see a list of rangebanned ips."],
            ["silence", "To (un)silence all users."],
            ["message", "To set your kick, mute, ban, or welcome message. Use {target} for your target (for kick or ban messages). For your own color, use {color}, and for your target's color (in the case of a kick, mute, or ban), use {tcolor}. In your mute message, {duration} is also available and is mandatory. You can use HTML, but don't abuse. Example: " + Utils.escapeHtml("<font color=green><timestamp/> <b>Ethan struck the banhammer on {target}!</b></font>."), ["kick/mute/ban/welcome", "message"]],
            ["viewmessage", "To view your kick, mute, ban, or welcome message.", ["kick/mute/ban/welcome"]],
            ["removemessage", "To remove your kick, mute, ban, or welcome message.", ["kick/mute/ban/welcome"]]
        ]).finish();

        Lists.Party = new CommandList("Party Commands").add([
            ["capsmode", "To turn caps mode on or off."],
            ["scramblemode", "To turn scramble mode on or off."],
            ["colormode", "To turn color mode on or off."],
            ["marxmode", "To turn Marx mode on or off."],
            ["comicmode", "To turn comic mode on or off."],
            ["yeoldemode", "To turn ye olde mode on or off."],
            ["pewpewpew", "To turn pewpewpew mode on or off."],
            ["nightclub", "To turn nightclub on or off."],
            ["roulette", "To start or end a roulette (/spin) game. Types can include: pokemons, items, emotes, avatars. By default, all 4 are enabled. It is separated with a comma followed by a space (, ).", ["type1, type2"]]
        ]).finish();

        /** ADMIN COMMANDS **/
        Lists.Admin = new CommandList("Administrator Commands").add([
            ["[s]ban", "To ban [player] with an optional [reason]. Use /sban instead to silently ban.", ["player", "reason"]],
            ["unban", "To unban a [player].", ["player"]],
            ["clearpass", "To clear [player]'s password.", ["player"]],
            ["clearchat", "To clear the chat in the channel [channel]. Default channel is " + sys.channel(0) + ".", ["channel"]],
            ["supersilence", "To (un)silence all users and mods."],
            ["showteam", "To view a player's team.", ["player"]],
            ["plus", "To add/remove [name]'s " + Ranks.plus.name + ".", ["name"]],
            ["plusplus", "To add/remove [name]'s " + Ranks.plusplus.name + ".", ["name"]],
        ]).finish();

        /** OWNER COMMANDS **/
        Lists.Owner = new CommandList("Owner Commands").add([
            ["servername", "To change the server name in the reg. Defaults to " + Config.servername + ".", ["name"]],
            ["changeauth", "Changes [player]'s auth to [level].", ["player", "level"]],
            ["dbauths", "To view all the players who have auth in the database."],
            ["eval", "To evaluate [code]. Returns the result.", ["code"]],
            ["bots", "To turn all bots on or off."]
        ]).finish();

        /** MAINTAINER COMMANDS **/
        Lists.Maintainer = new CommandList("Maintainer Commands").add([
            ["webcall", "Loads scripts.js from the given [source] (by default, the Scripts repository's scripts.js). Use this when scripts.js is updated. Usually doesn't fully reload plugins.", ["source"]],
            ["updatetiers", "Loads tiers.xml from the given [source] (by default, the Server-Shit repository's tiers.xml).", ["source"]],
            ["updateann", "Sets the server announcement to the file from the given [source] (by default, the Server-Shit repository's announcement.html).", ["source"]],
            ["testann", "Sets the server announcement to the file from the given [source] (by default, the Server-Shit repository's announcement.html), but only for you (for testing purposes). It's recommended to use the Designer Plugin instead.", ["source"]],
            ["updatedesc", "Sets the server description to the file from the given [source] (by default, the Server-Shit repository's description.html).", ["source"]],
            ["syncserver", "Loads the server announcement, description, tiers, and script from the default external source."],
            ["update", "Updates the given [plugins] (separated by spaces: events init utils). '.js' at the end of the plugin name is optional and will be added automatically.", ["plugins"]],
            ["init", "Calls script.init"],
            ["sessionrefill", "Calls SESSION.refill"],
            ["resetprofiling", "Calls sys.resetProfiling"],
            ["regsee", "Shows information about the given [key] in the reg.", ["key"]],
            ["regremove", "Removes the given [key] from the reg.", ["key"]],
            ["cdunregister", "Unregisters the given [channel] from the ChannelManager.", ["channel"]],
            ["dump", "Dumps information about the given type. Available types are: * (selects everything, default), memory, profile, session, reg, channeldata.", ["type1", "type2"]],
            ["id", "Shows [name]'s id.", ["id"]]
        ]).finish();

        return Lists;
    }

    module.exports = {
        lists: generateLists,
        CommandList: CommandList,
        TableList: TableList
    };

    module.reload = function () {
        Lists = generateLists();
        return true;
    };
}());
