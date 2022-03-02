const Discord = require('discord.js')
const { Client,VoiceChannel, Intents } = require('discord.js');
const { RepeatMode } = require('discord-music-player')
const { Permissions, TextChannel } = require('discord.js');
const { Timeout } = require('discord.js')
const allintents = new Discord.Intents(32767)
const path = require('path')
const Config = require(path.resolve('./Config.json'))
const moment = require('moment')
const sqlite = require('sqlite3').verbose()
const fs = require('fs')
const { MessageEmbed } = require('discord.js');
const { reddit } = require(path.resolve('./Functions/Reddit.js'))
const mathjs = require('mathjs')
const ytdl = require('discord-ytdl-core')
const bot = new Client({intents: allintents})

const ms = require('ms')
const {re, arg, row} = require("mathjs");
var servers = {}
const { Player } = require('discord-music-player')
const player = new Player(bot, {
    leaveOnEmpty: true,
})
//global variables
let reason,target,target2,target3,amount,amount2,cases,MusicBool,MathBool,RedditBool,LevelsBool,logsChannel,DefaultRole;
let subreddits = ["196", "antimeme", "bikinibottomtwitter","dankmemes", "shitposting","shitpostcrusaders","leagueofmemes","apandah", "meme","memes", "whenthe","prequelmemes","terriblefacebookmemes","funny", "okbuddyretard","comedycemetery","wholesomememes","raimimemes","historymemes","comedyheaven"]

bot.on('ready',async () =>{
    amount = ""
    console.log(`Logged in as ${bot.user.tag} at ${moment(Date.now()).format("DD MM YYYY")}`)
    bot.user.setActivity("?help")

})
bot.player = player;

bot.on('messageCreate',async message => {
    if (message.author.bot) {
        return;
    }
    if (!message.guild) {
        return;
    }
    //create the goddamed database
    let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${message.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE) // refresh database to avoid errors
    db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
    db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
    db.run(`CREATE TABLE IF NOT EXISTS settings(MusicBool INTEGER DEFAULT 1, MathBool INTEGER DEFAULT 1, RedditBool INTEGER DEFAULT 1, LevelsBool INTEGER DEFAULT 1)`)
    db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${message.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE) // refresh database to avoid errors
    //get server settings in case there arent means its first message insert default seetings
    db.get(`SELECT * FROM settings`, (err, row) => {
        if (err) {
            return;
        }
        if (row === undefined) {
            db.run(`INSERT INTO settings VALUES (?,?,?,?,?)`, [1, 1, 1, 1, 0])
        }
        try {
            MusicBool = row.MusicBool
            MathBool = row.MathBool
            RedditBool = row.RedditBool
            LevelsBool = row.LevelsBool
        } catch (e) {
            return;
        }
    })
    //get the logs channel
    logsChannel = message.guild.channels.cache.find(channel => channel.name.includes("logs"))
    if (message.content.startsWith(Config.prefix)) {
        //get arguments o we can switch the initial statement
        let args = message.content.substring(Config.prefix.length).split(" ")
        //create the logging embed
        const LogEmbed = new MessageEmbed()
            .setColor('#0000ff')
            .addField('Command', "`" + message.content + "`", true)
            .addField('Sent by', `<@${message.author.id}>`, true)
            .addField("Channel", `<#${message.channel.id}>`, true)
            .addField("Message", message.url)
            .setTimestamp()

        switch (args[0]) {
            case "help":
                const HelpEmbed = new MessageEmbed()
                    .setColor('#38F20A')
                    .setTitle("BostenBot")
                    .setURL('https://bostengard.github.io/BostenBot/index.html')
                    .setDescription("prefix = ?")
                    .addField(' :blue_circle: User', "User Commands\n `?help-user`", true)
                    .addField(' :blue_circle: Mods', "Moderator Commands\n `?help-moderation`", true)
                    .addField(' :blue_circle: Math', "Math commands\n `?help-math`", true)
                    .addField(' :blue_circle: Music', "Music commands\n `?help-music`", true)
                    .addField(' :blue_circle: Settings', "Bot Settings \n `?help-settings`", true)
                    .setTimestamp()
                message.reply({embeds: [HelpEmbed]})
                break;
            case "help-moderation":
                const HelpmodEmbed = new MessageEmbed()
                    .setColor('#38F20A')
                    .setTitle("Lord Bostengard's Commands")
                    .setDescription("prefix = ?")
                    .addField(':blue_circle: delete', "deletes a custom amount(max:99)of messages in a channel`?delete < quantity >`")
                    .addField(':blue_circle: Spam', "Sends a custom amount of messages in a channel (its slow) `?spam< quantity >`")
                    .addField(':blue_circle: warn', "Warns a member and sends a dm to the user`?warn < mention >< reason >`")
                    .addField(':blue_circle: kick', "Kicks a member and sends a dm to the user `?kick < mention >< reason >`")
                    .addField(':blue_circle: Mute', "Mutes a mentioned membed `?mute < mention > < reason > < time(ex: 1w)>`")
                    .addField(':blue_circle: UnMute', "UnMutes a member `?unmute < mention or ID >`")
                    .addField(':blue_circle: ban', "Bans a member and sends a dm to the mentioned user `?ban < mention><reason>`")
                    .addField(':blue_circle: unban', "UnBans a member`?unban < mention><reason>`")
                    .addField(':blue_circle: slowmode', "Changes the slowmode in a channel `?slowmode < amount >< channel >`")
                    .addField(':blue_circle: cases', "shows the cases for a person and their type`?cases < mention >`")
                    .addField(':blue_circle: Reset leaderboard', "Resets the server leaderboard `?resetleaderboard`")
                    .addField(':blue_circle: Reset Cases', "Resets a user cases `?resetcases < mention >`")
                    .addField(':blue_circle: mutevoice/unmutevoice', "mutes or unmutes all users in a voice channel that doesnt have permissions \n `?mutevoice / ?unmutevoice`")
                    .setTimestamp()
                message.reply({embeds: [HelpmodEmbed]});
                break;
            case "help-user":
                const HelpUserEmbed = new MessageEmbed()
                    .setColor('#38F20A')
                    .setTitle("Lord Bostengard's Commands")
                    .setDescription("prefix = ?")
                    .addField(' :blue_circle: aboutme', "Shows a full-of-info embed of yourself`?aboutme`")
                    .addField(' :blue_circle: random', "random number`?random < max number >`")
                    .addField(':blue_circle: leaderboard', 'shows the top 3 users for this server `?leaderboard`')
                    .addField(':blue_circle: Server Info', 'shows the info of the current server `?serverinfo`')
                    .addField(':blue_circle: Role Info', 'shows info of the role mentioned `?roleinfo < ID >`')
                    .addField(':blue_circle: math', 'solves your maths quations `?math < operation > `')
                    .addField(':blue_circle: Reddit', 'get yourself a meme`?reddit < random/subreddit >`')
                    .addField(':blue_circle: Music', 'Plays your favourite youtube song`?help-music`')
                    .setTimestamp()
                message.reply({embeds: [HelpUserEmbed]})
                break;
            case "help-music":
                //check if music is enabled if its not send a mesage and stop
                if (MusicBool == 0) {
                    message.channel.send("This command is disabled in the bot settings");
                    return
                }
                //define help embed
                const HelpMusic = new MessageEmbed()
                    .setColor('#38F20A')
                    .setTitle("Lord Bostengard's Commands")
                    .setDescription("usage = ?music <>")
                    .addField(':blue_circle: play', "Play a youtube video (send link) \n `?music play < link >`",true)
                    .addField(':blue_circle: playlist', 'Plays a toutube or spotify playlist \n `?music playlist < link >`',true)
                    .addField(':blue_circle: skip', 'Skips to the next song in the queue \n `?music skip`',true)
                    .addField(':blue_circle: stop', 'Leaves tha channel \n `?music stop`',true)
                    .addField(':blue_circle: loop', 'Loops the current song \n `?music loop`',true)
                    .addField(':blue_circle: queueloop', 'Loops the current queue \n `?music queueloop`',true)
                    .addField(':blue_circle: Remove loop', 'Removes the current loop\n `?music removeloop`',true)
                    .addField(':blue_circle: now Playing', 'Shows the song playing in that moment\n `?music nowplaying`',true)
                    .addField(':blue_circle: Shuffle', 'Shuffles the queu order \n `?music shuffle`',true)
                    .setTimestamp()
                message.reply({embeds: [HelpMusic]});
                break;
            case "help-math":
                //checki f maths is enable in case its not send a message and stop
                if (MathBool == 0) {
                    message.channel.send("this command is disabled in the bot settings");
                    return;
                }
                //define the embed
                const HelpMathEmbed = new MessageEmbed()
                    .setColor('#38F20A')
                    .setTitle("Lord Bostengard's Commands")
                    .setDescription("Usage = `?math < operation>`")
                    .addField(' :blue_circle: Basic Operations', "Plus: `x + y` Minus: `x - y` Multiply: `x * y` Divide: `X / y`  ")
                    .addField(':blue_circle: Functions and constants', 'Round: `round( x , < decimals to round >)` \n Atan2:  `atan2(x,y)` \n Logarithm: `log(x)` \n Power: `pow( < base >, < power >` \n Square root: `sqrt(x)` \n Derivative: `derivative( x , y )`')
                    .addField(':blue_circle: Unit change', ' `x < initial > to < final >` Example: `?math 10 inch to cm`')
                    .addField(':blue_circle: Other Operations', 'Cos: `cos(x)` \n Tan: `tan(x)` \n Determinant: `det([matrix values])` Example: `det([-1, 2; 3, 1])` ')
                    .addField(':blue_circle: Usefull Info', 'Number pi: `pi` Example : ` 1 * pi` \n Degree: `deg` Example: `cos(45 deg)` \n Simplify: `simplify(x)` Example: `simplify(3 + 2 / 4) = "7 / 2 "`')
                    .addField('Official documentation', "[Constants](https://mathjs.org/docs/reference/constants.html) , [Main Page](https://mathjs.org/docs/index.html)")
                    .setTimestamp()
                message.reply({embeds: [HelpMathEmbed]})
                break;
            case "help-settings":
                const HelpSettingsEmbed = new MessageEmbed()
                    .setColor('#38F20A')
                    .setTitle("Bostenbot Settings")
                    .setDescription("Usage = `?settings < setting > < amount>` 1(active) 0(inactive)")
                    .addField(':blue_circle: Music', '`?settings MusicBool < 0/1 >`')
                    .addField(':blue_circle: Math', '`?settings MathBool < 0/1 >`')
                    .addField(':blue_circle: Reddit', '`?settings RedditBool < 0/1 >`')
                    .addField(':blue_circle: Levels', '`?settings LevelsBool < 0/1 >`')
                    .addField(':blue_circle: Overall', 'look at your current settings`?view-settings`')
                    .setTimestamp()
                message.reply({embeds: [HelpSettingsEmbed]})
                break;
            case "random":
                //get the amount
                amount = message.content.split(" ")[1]
                if (isNaN(amount)) {
                    message.reply("that's not a number!");
                    return
                }
                if (amount > 10000000) {
                    amount = 10000000
                }
                if (!amount) {
                    amount = 10
                }
                const number = Math.floor(Math.random() * amount)
                //embed moment
                const RandomEmbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle('Random Number: ' + number)
                    .setDescription(`Random number between 0 and ${amount}`)
                    .setTimestamp()
                message.reply({embeds: [RandomEmbed]})
                break;
            case "aboutme":

                target = message.content.split(" ")[1]
                if (!target) {
                    target = message.author.id
                }
                target2 = message.guild.members.cache.find(member => member.id == target)
                target3 = bot.users.cache.find(user => user.id == target)
                await target3.fetch()
                await target.fetch
                let userrolemap = target2.roles.cache
                    .sort((a, b) => b.position - a.position)
                    .map(r => r)
                    .join(" ");
                if (userrolemap.length > 1024) userrolemap = "To many roles to display";
                if (!userrolemap) userrolemap = "No roles";
                let usertag = target2.nickname;
                if (!usertag) {
                    usertag = "none"
                }
                const aboutmeEmbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle(`User Info ${target3.username}`)
                    .addField('User ID and Mention', ` ID: \`${target}\` \n  Mention:${target2.toString()} \n Tag: ${usertag}`)
                    .addField('Account creation date', ` \`${moment(target3.createdAt).format("SS:MM:HH DD-MM-YYYY")}\``, true)
                    .addField('Highest Role', target2.roles.highest.toString())
                    .addField('Roles', userrolemap)
                    .setThumbnail(target3.avatarURL({
                        format: 'png',
                        dynamic: 'true',
                        size: 2048
                    }) || target3.defaultAvatarURL)
                    .setImage(target3.bannerURL({format: 'png', dynamic: true, size: 2048}))
                    .setTimestamp()
                    .setFooter({text: "What a beautiful profile", iconURL: bot.user.avatarURL()})
                message.reply({embeds: [aboutmeEmbed]})
                break;
            case "delete":
                if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                    message.reply("Missing Permissions");
                    return;
                }
                amount = message.content.split(" ")[1]
                //cehck cringe option
                if (!amount) {
                    message.reply('Send a number')
                }
                if (isNaN(amount)) {
                    message.reply("that's not a number");
                    return;
                }
                if (amount > 99) {
                    return message.reply('Max 99 messages');
                }
                //embed moment
                const DeleteEmbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle(`Deleted ${amount} messages`)
                    .addField(`Deleted By`, message.author.toString())
                    .setTimestamp()

                message.channel.bulkDelete(amount).catch(err => "")
                message.channel.send({embeds: [DeleteEmbed]})
                if (logsChannel) {
                    logsChannel.send({embeds: [LogEmbed]})
                }
                break;
            case "spam":
                if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                    message.reply("Missing Permissions");
                    return;
                }
                amount = message.content.split(" ")[1]
                //check if its a number and if theres acutally something
                if (isNaN(amount)) {
                    message.reply("that's not a number");
                    return;
                }
                if (amount > 20) {
                    message.reply("max 20");
                    return;
                }
                if (!amount) {
                    message.reply('Send an amount');
                    return
                }
                const SpamEmbed = new MessageEmbed()
                    .setColor("#0000ff")
                //create a massive embed
                for (let i = 0; i < amount; i++) {
                    SpamEmbed.addField(`message number ${amount - i}`, `Message Number ${amount - 1 - i}`)
                    i++

                }
                message.channel.send({embeds: [SpamEmbed]})
                if (logsChannel) {
                    logsChannel.send({embeds: [LogEmbed]})
                }
                break;
            case "kick":
                if (!message.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
                    message.reply("Missing Permiissions");
                    return;
                }
                target = message.mentions.members.first();
                target2 = message.mentions.users.first();
                if (!target) {
                    message.reply("Mention a user to kick");
                    return;
                }
                reason = args.slice(2).join(" ")
                if (!reason) {
                    reason = "no reason provided"
                }
                const kickEmbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle(`kick`)
                    .addField(`Member Kicked`, `\n${target.toString()} \n \`${target2.id}\``, true)
                    .addField(`Moderator`, `${message.author.toString()} \n \`${message.author.id}\` `, true)
                    .addField(`Reason`, `\`${reason}\``)
                    .setTimestamp()

                if (target.kickable) {
                    target.kick(reason);
                    message.reply({embeds: [kickEmbed]})
                } else {
                    message.reply("Can't kick this user");
                    return;
                }
                db.get(`SELECT * FROM cases WHERE UserId = ?`, [target2.id], (err, row) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (row === undefined) {
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, target2.id, target2.tag, message.author.tag, message.author.id, "kick", moment(Date.now()).format('DD:MM:YYYY')])
                    } else {
                        //put another row of info into the database
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, target2.id, target2.tag, message.author.tag, message.author.id, "kick", moment(Date.now()).format('DD:MM:YYYY')])
                    }
                })
                if (logsChannel) {
                    logsChannel.send({embeds: [LogEmbed]})
                }
                break;
            case "ban":
                if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                    message.reply('Missing Permission');
                    return;
                }
                target = message.content.split(" ")[1]
                if (!target) {
                    message.reply("Mention a user to Ban");
                    return;
                }
                target = target = target.toString().replace(/[\\<>@#&!]/g, "")
                if(isNaN(target)){
                    message.reply("Unknown user")
                }
                target = message.guild.members.cache.find(x => x.id == target)
                if(!target){return message.reply("Unknown User"); }
                reason = args.slice(2).join(" ")
                if (!reason) {
                    reason = "no reason provided"
                }
                const banEmbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle(`Ban`)
                    .addField(`Member Banned`, `\n${target.toString()} \n \`${target.id}\``, true)
                    .addField(`Moderator`, `${message.author.toString()} \n \`${message.author.id}\` `, true)
                    .addField(`Reason`, `\`${reason}\``)
                    .setTimestamp()
                if (target.bannable) {
                    target.ban();
                    message.reply({embeds: [banEmbed]})
                } else {
                    message.reply("Can't Ban this user");
                    return
                }
                target = bot.users.cache.find(x => x.id == target)
                db.get(`SELECT * FROM cases WHERE UserId = ?`, [target.id], (err, row) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (row === undefined) {
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, target.id, target.tag, message.author.tag, message.author.id, "Ban", moment(Date.now()).format('DD:MM:YYYY')])
                    } else {
                        //put another row of info into the database
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, target.id, target.tag, message.author.tag, message.author.id, "Ban", moment(Date.now()).format('DD:MM:YYYY')])
                    }
                })
                if (logsChannel) {
                    logsChannel.send({embeds: [LogEmbed]})
                }
                break;
            case "slowmode":
                if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                    message.reply("Missing Permission");
                    return;
                }
                target = message.mentions.channels.first()
                if (!target) {
                    target = message.channel
                }
                amount = message.content.split(" ")[1]
                if (isNaN(amount)) {
                    message.reply("That's not a number");
                    return;
                }
                if (!amount) {
                    amount = 0
                }
                const SlowmodeEmbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle('Slowmode Changed')
                    .addField('Slowmode Changed', `The slowmode is now ${amount} seconds`)
                    .addField('Moderator', message.author.toString())
                    .setTimestamp()
                target.setRateLimitPerUser(amount)
                target.send({embeds: [SlowmodeEmbed]})
                if (logsChannel) {
                    logsChannel.send({embeds: [SlowmodeEmbed]})
                }
                break;
            case "warn":
                if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                    message.reply("missing permissions");
                    return;
                }
                target = message.mentions.members.first()
                target2 = message.mentions.users.first()
                if (!target) {
                    message.reply('Mention a user');
                    return;
                }
                reason = args.slice(2).join(" ")
                if (!reason) {
                    reason = "no reason provided"
                }
                const WarnEmbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle('Warn')
                    .addField('Member Warned', `${target.toString()} \n \`${target2.id}\``)
                    .addField(`Moderator`, `${message.author.toString()}\n \`${message.author.id}\``)
                    .setTimestamp();

                db.get(`SELECT * FROM cases WHERE UserId = ?`, [target2.id], (err, row) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (row === undefined) {
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, target2.id, target2.tag, message.author.tag, message.author.id, "Warn", moment(Date.now()).format('DD:MM:YYYY')])
                    } else {
                        //put another row of info into the database
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, target2.id, target2.tag, message.author.tag, message.author.id, "Warn", moment(Date.now()).format('DD:MM:YYYY')])
                    }
                })
                message.reply({embeds: [WarnEmbed]})
                if (logsChannel) {
                    logsChannel.send({embeds: [LogEmbed]})
                }
                break;
            case "serverinfo":
                let rolemap = message.guild.roles.cache
                    .sort((a, b) => b.position - a.position)
                    .map(r => r)
                    .join(" ");
                if (rolemap.length > 1024) rolemap = "To many roles to display";
                if (!rolemap) rolemap = "No roles";
                let membercount = message.guild.memberCount
                const ServerInfoEmbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle('Server Info')
                    .setDescription(`Showing infor for ${message.guild.name}`)
                    .setThumbnail(message.guild.iconURL())
                    .addField(`Members`, `Total members: \` ${membercount}\``, true)
                    .addField(`Owner Info`, `Mention: ${await message.guild.fetchOwner()} \n ID: \`${message.guild.ownerId}\``)
                    .addField(`Roles`, rolemap)
                    .setImage(message.guild.bannerURL())
                message.reply({embeds: [ServerInfoEmbed]})
                break;
            case "cases":
                amount = 1;
                if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                    message.reply("Missing Permissions");
                    return;
                }
                target = message.content.split(" ")[1]
                if (!target) {
                    message.reply("Send a user id or mention a user")
                }
                if (isNaN(target)) {
                    target = target.toString().replace(/[\\<>@#&!]/g, "")
                }
                target2 = bot.users.cache.find(user => user.id == target)
                if (!target2) {
                    message.reply("invalid user");
                    return;
                }
                const CasesEmbedRows = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle('Cases')
                    .setDescription('This user has 0 cases')
                    .setImage('https://static.wikia.nocookie.net/memes-pedia/images/4/4f/Gigachad.jpg/revision/latest?cb=20201122221724&path-prefix=es')
                db.all(`SELECT * FROM cases WHERE UserId = ?`, [target], (err, row) => {
                    if (err) {
                        console.log(err);
                        message.channel.send("error getting data");
                        return;
                    }
                    row.forEach(function (rows) {
                        //get table info
                        let reasonC = rows.Reason
                        let moderator = rows.ModeratorTag
                        let type = rows.CaseType
                        let date = rows.Date
                        let Tag = rows.UserTag
                        //put table info into embed
                        CasesEmbedRows.addField(`${amount}: ${type}`, `Reason:` + "`" + reasonC + "`" + "\n By: `" + moderator + "` \n At: `" + date + "`", true)
                        CasesEmbedRows.setTitle(`Cases for ${Tag}`)
                        CasesEmbedRows.setDescription(`This user has a total of ${amount} cases`)
                        CasesEmbedRows.setImage()
                        amount++
                    })
                    //end the embed
                    message.reply({embeds: [CasesEmbedRows]})
                })
                break;
            case "leaderboard":
                await message.guild.fetch()
                const leaderboardEmbed = new MessageEmbed()
                    .setColor('#000fff')
                    .setTitle("Server Leaderboard")
                    .setDescription(`This is the top 3 users for ${message.guild.name}`)
                    .setImage(message.guild.avatarURL)

                db.get(`SELECT * FROM data WHERE UserId = ?`, [message.author.id], (err, row) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (row === undefined) {
                        message.channel.send("Error getting your messages")
                    } else {
                        const messageN = row.Messages
                        leaderboardEmbed.setDescription(`you have a total of ${messageN} messages in this server`)
                    }
                })
                amount = "1"
                db.all(`SELECT * FROM data ORDER BY Messages DESC LIMIT 3`, (err, row) => {
                    if (err) {
                        console.log(err);
                        message.channel.send("error getting data");
                        return;
                    }
                    row.forEach(function (rows) {
                        let messageCount = rows.Messages
                        let User = rows.UserTag
                        leaderboardEmbed.addField(`Top ${amount}`, `${User} with ${messageCount} messages`)
                        amount++
                    })
                    message.reply({embeds: [leaderboardEmbed]})
                })
                break;
            case "roleinfo":
                target = message.content.split(" ")[1]
                if (!target) {
                    message.reply("");
                    return;
                }
                if (isNaN(target)) {
                    message.reply("That's not a number");
                    return;
                }
                let targetRole = message.guild.roles.cache.find(x => x.id === args[1])
                const keyPermissions = ['ADMINISTRATOR', 'KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_GUILD', 'VIEW_AUDIT_LOG', 'MANAGE_MESSAGES', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'MANAGE_ROLES', 'MANAGE_EMOJIS_AND_STICKERS', 'MODERATE_MEMBERS'];
                const permissions = targetRole.permissions.toArray();
                const RoleEmbed = new MessageEmbed()
                    .setColor(targetRole.hexColor)
                    .setThumbnail(targetRole.iconURL())
                    .setColor(targetRole.hexColor)
                    .setTitle(`Showing role info for : ` + "`" + targetRole.name + "`")
                    .addField('General Role Info', `Role ID \` ${target} \` \n Role Name: \` ${targetRole.name} \` \n Role creation date: \`${moment(targetRole.createdAt).format("DD-MM-YY")}\` (DD-MM-YY)`)
                    .addField(`Misc`, `Color \`${targetRole.hexColor}\` \n Members:\`${targetRole.members.size}\` \n Hoist:\` ${targetRole.hoist} \` \n Position \`${message.guild.roles.cache.size - targetRole.position} \` \n Mentionable \`${targetRole.mentionable}\``)
                    .addField(`Permissions`, (permissions.includes('ADMINISTRATOR') ? ['ADMINISTRATOR'] : permissions.filter(x => keyPermissions.includes(x))).map(x => {
                        return x.split('_').map((y, i) => i === 0 ? y[0] + y.slice(1).toLowerCase() : y.toLowerCase()).join(' ')
                    }).join(', ') || 'None')

                message.reply({embeds: [RoleEmbed]})
                break;
            case "reddit":
                if (RedditBool == 0) {
                    message.reply("This command is disabled");
                    return;
                }
                var loopamount = 0
                target = message.content.split(" ")[1]
                if (!target) {
                    target = "random"
                }
                if (target === "random") {
                    const redditamount = Math.floor(Math.random() * subreddits.length);
                    target = subreddits[redditamount]
                }
                redditpost(target)

            function redditpost(target) {
                try {
                    reddit(target).then(data => {
                        //if nsfw and the channel is not nsfw dont send anything
                        if (data.nsfw === true && !message.channel.nsfw) {
                            message.channel.send("no nsfw posts are allowed in this channel")
                            return;
                        }
                        //if the image is in the wrong format try again until 5 times
                        if (!data.url.endsWith(".jpg") && !data.url.endsWith(".gif") && !data.url.endsWith(".png") && !data.url.endsWith(".webp")) {
                            loopamount++
                            if (loopamount > 4) {
                                message.reply("couldn't find a post that meets the format requirements");
                                return;
                            }
                            redditpost(target)
                            return;
                        }
                        //define the embed for the post
                        const redditembed = new MessageEmbed()
                            .setColor('#ff7b00')
                            .setTitle(data.title + `  |   :thumbsup: ${data.score}`)
                            .setImage(data.url)
                            .setDescription(`[Reddit Post](${data.permalink})` + ` | from ${data.subreddit}  | by u/${data.author}`)
                        message.reply({embeds: [redditembed]})
                    })
                } catch (e) {
                    message.reply("Couldn't find any post! Try checking spelling")
                }
            }

                break;
            case "resetleaderboard":
                if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                    message.reply("Missing Permissions");
                    return;
                }
                db.run(`DELETE FROM data`)
                message.reply("Leaderbord succesfully resetted! :thumbsup:")
                if (logsChannel) {
                    logsChannel.send({embeds: [LogEmbed]})
                }
                break;
            case "resetcases":
                if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                    message.reply("Missing Permissions");
                    return;
                }
                target = message.content.split(" ")[1]
                target = target.toString().replace(/[\\<>@#&!]/g, " ")
                if (isNaN(target)) {
                    message.reply("Send a user ID");
                    return
                }
                if (!target) {
                    message.reply("Send a user ID");
                    return
                }
                db.run(`DELETE FROM cases WHERE userid = ${target}`)
                message.reply(`Cases for ${target} has been succesfully reseted`)
                if (logsChannel) {
                    logsChannel.send({embeds: [LogEmbed]})
                }
                break;
            case "mute":
                if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                    message.reply("Missing Permissions");
                    return
                }
                amount = args[2]
                target = message.mentions.members.first()
                if (!target) {
                    target = args[1]
                }
                reason = args.slice(3).join(" ")
                if (!reason) {
                    reason = "no reason provided"
                }
                if (!amount) {
                    message.reply(" send an amount of time");
                    return;
                }
                if (!target) {
                    message.reply("Send a user ID or mention a member");
                    return;
                }
                target = target.toString().replace(/[\\<>@#&!]/g, "")
                if (isNaN(target)) {
                    message.reply("Send a user ID or mention a member");
                    return
                }
                target2 = bot.users.cache.find(user => user.id == target)
                target = message.guild.members.cache.find(member => member.id == target)
                if (!target) {
                    message.reply("Error! Invalid format ");
                    return
                }
                if (!target.moderatable) {
                    message.reply("Can't moderate this user");
                    return
                }
                amount = ms(amount)
                if (amount > ms("28d") || amount < ms("1m")) {
                    message.reply("time out of limit(max 28d, min 1m)");
                    return
                }
                target.timeout(amount, reason)
                const muteEmbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle(`Muted ${target2.tag} for ${ms(amount)}`)
                    .addField('Reason', reason)
                    .addField('Muted By', `${message.author.id} \n ${message.author.toString()}`)
                    .setTimestamp()

                message.reply({embeds: [muteEmbed]})
                if (logsChannel) {
                    logsChannel.send({embeds: [LogEmbed]})
                }
                db.get(`SELECT * FROM cases WHERE UserId = ?`, [target.user.id], (err, row) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (row === undefined) {
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, target2.id, target2.tag, message.author.tag, message.author.id, "Mute", moment(Date.now()).format('DD:MM:YYYY')])
                    } else {
                        //put another row of info into the database
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, target2.id, target2.tag, message.author.tag, message.author.id, "Mute", moment(Date.now()).format('DD:MM:YYYY')])
                    }
                })
                break;
            case "unmute":
                if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                    message.reply("Missing Permissions");
                    return
                }
                target = message.mentions.members.first();
                if (!target) {
                    target = args[1]
                }
                if (!target) {
                    message.reply("Send a user ID or mention a user!");
                    return;
                }
                target = target.toString().replace(/[\\<>@#&!]/g, "")
                if (isNaN(target)) {
                    message.reply("Incorrect Member");
                    return;
                }
                target = message.guild.members.cache.find(member => member.id == target)
                target.timeout(0)
                const unmuteEmbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle(`Unmuted ${target2.tag}`)
                    .addField('Unmuted By', `${message.author.id} \n ${message.author.toString()}`)
                    .setTimestamp()
                message.reply({embeds: [unmuteEmbed]})
                if (logsChannel) {
                    logsChannel.send({embeds: [LogEmbed]})
                }
                break;
            case "math":
                if (MathBool == 0) {
                    message.reply("This command is disabled in the server settings");
                    return;
                }
                try {
                    //get the operation
                    const result = mathjs.evaluate(args.slice(1).join(" "))
                    //build embed
                    const MathEmbed = new MessageEmbed()
                        .setColor('#000fff')
                        .addField(' :blue_circle: Operation ', "`" + args.slice(1).join(" ") + "`")
                        .addField(' :blue_circle: Result', "`" + result + "`")
                    //send embed
                    message.reply({embeds: [MathEmbed]})
                } catch (err) {
                    //if error send
                    message.reply("invalid question type `?help-math` to know more. \n Make sure it's the correct format")
                }
                break;
            case "unban":
                if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                    message.reply("Missing permissions");
                    return;
                }
                target = message.content.split(" ")[1]
                if (!target) {
                    message.reply("Send a user ID!");
                    return;
                }
                if (isNaN(target)) {
                    message.reply("Send a user ID!");
                    return;
                }
                reason = args.slice(2).join(" ")
                if (!reason) {
                    reason = "no reason provided"
                }
                try {
                    message.guild.members.unban(target)
                } catch (e) {
                    message.reply("This user is not banned")
                    return;
                }
                const UnbanEbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle(`Unbanned ${target}`)
                    .addField(`Unbanned by`, `\`${message.author.id}\` \n ${message.author.toString()}`)
                    .addField(`Reason`, reason)
                    .setTimestamp()
                message.reply({embeds: [UnbanEbed]})
                if (logsChannel) {
                    logsChannel.send({embeds: [LogEmbed]})
                }
                break;
            case "music":

                if(MusicBool == 0){message.reply("This command is disabled in the server settings!"); return;}
                if(!message.member.voice.channel){message.reply("Your not on a voice channel"); return;}
                let guildQueue = bot.player.createQueue(message.guild.id)
                const MusicEmbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTimestamp()
                    .setDescription('Type `?help-music` to know more')
                switch (args[1]) {
                    case "play":
                        if(!message.content.split(" ")[2]){message.reply("Send a Youtube or spotify link"); return;}
                        if(!message.content.split(" ")[2].startsWith("https://www.youtube.com/" || "https://open.spotify.com/")){message.reply("Only youtube or spotifiy links are allowed");return;}
                        let queue = bot.player.createQueue(message.guild.id)
                        await queue.join(message.member.voice.channel)
                        let song = await queue.play(args.slice(2).join(" ")).catch(_ =>{
                            if(!guildQueue){
                                queue.stop();
                            }
                        })
                        MusicEmbed.setTitle("Play")
                        MusicEmbed.addField("Added song", `${args.slice(2).join(" ")} has been added to the queue`)
                        message.reply({embeds: [MusicEmbed]})
                        break;
                    case "playlist":
                        let queue2 = bot.player.createQueue(message.guild.id)
                        await queue2.join(message.member.voice.channel)
                        let song2 = await queue2.playlist(args.slice(2).join(" ")).catch(_ =>{
                            if(!guildQueue){
                                queue2.stop();
                            }
                        })
                        MusicEmbed.setTitle("Playlist")
                        MusicEmbed.addField("Added Playlist", `${args.slice(2).join(" ")} has been added to the queue`)
                        message.reply({embeds: [MusicEmbed]})
                        break;
                    case "skip":
                        guildQueue.skip()
                        MusicEmbed.setTitle("Song Skipped!")
                        MusicEmbed.addField("Now Playing:", `${guildQueue.nowPlaying}\n \n ${guildQueue.createProgressBar()}`)
                        message.reply({embeds: [MusicEmbed]})
                        break;
                    case "stop":
                        guildQueue.stop()
                        MusicEmbed.setTitle("Music Stopped")
                        message.reply({embeds: [MusicEmbed]})
                        break;
                    case "removeloop":
                        guildQueue.setRepeatMode(RepeatMode.DISABLED);
                        MusicEmbed.setTitle("Loop Removed")
                        message.reply({embeds: [MusicEmbed]})
                        break;
                    case "loop":
                        guildQueue.setRepeatMode(RepeatMode.SONG);
                        MusicEmbed.setTitle("Loop Active")
                        message.reply({embeds: [MusicEmbed]})
                        break;
                    case "queueloop":
                        guildQueue.setRepeatMode(RepeatMode.QUEUE);
                        MusicEmbed.setTitle("Queue loop Active")
                        message.reply({embeds: [MusicEmbed]})
                        break;
                    case "nowplaying":
                        MusicEmbed.setTitle("Now Playing")
                        MusicEmbed.addField("Song:", `${guildQueue.nowPlaying}\n \n ${guildQueue.createProgressBar()}`)
                        message.reply({embeds: [MusicEmbed]})
                        break;
                    case "shuffle":
                        guildQueue.shuffle();
                        MusicEmbed.setTitle("Shuffling queue")
                        MusicEmbed.addField("Song:", `${guildQueue.nowPlaying}\n \n ${guildQueue.createProgressBar()}`)
                        message.reply({embeds: [MusicEmbed]})
                        break;
                }
                break;
            case "settings":
                if(!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)){message.reply("Missing permissions"); return;}
                target = message.content.split(" ")[1]
                if(!target){
                    db.get(`SELECT * FROM settings`, (err,row) =>{
                        if(err){return;}
                        if(row === undefined){ db.run(`INSERT INTO settings VALUES (?,?,?,?,?)`,[1,1,1,1,0])}
                        try {
                            MusicBool = row.MusicBool
                            MathBool = row.MathBool
                            RedditBool = row.RedditBool
                            LevelsBool = row.LevelsBool

                        }catch (e) {
                            return;
                        }
                    })
                    const settingsviemEmbed = new MessageEmbed()
                        .setColor('#0000ff')
                        .setTitle('Server Settings (if `undefined` try again)')
                        .setDescription('1 = enabled | 0 = disabled | type `?help-settings`to know more')
                        .addField('Music', "` " + MusicBool + " `", true)
                        .addField('Reddit', "` " + RedditBool + " `", true)
                        .addField('Levels', "` " + LevelsBool + " `", true)
                        .addField('Math', "` " + MathBool + " `", true)
                        .setThumbnail(message.guild.avatarURL)
                    message.reply({embeds: [settingsviemEmbed]})
                    return;
                }
                if(target !== "MusicBool" && target !== "MathBool" && target !== "RedditBool" && target !== "LevelsBool" && target !== "defaultRole"){message.reply("Unknown Setting, type `?help-settings` to know more"); return;}
                if(target === "defaultRole"){
                    amount = message.content.split(" ")[2]
                    amount = message.guild.roles.cache.find(role => role.id == amount)
                    if(!amount){message.reply("Can't find that role!"); return;}
                    db.run(`UPDATE settings SET ${target} = ?`, [amount.id])
                    return;
                }
                amount = message.content.split(" ")[2]
                if(!amount){message.reply("Send a value"); return;}
                if(amount <= 0){amount = 0}
                if(amount >= 1){amount = 1}
                const settingsEmbed = new MessageEmbed()
                    .setColor('#0000ff')
                    .setTitle('Settings succesfully changed')
                    .setDescription(`${target} is now ${amount}`)
                db.run(`UPDATE settings SET ${target} = ?`,[amount])
                message.reply({embeds:[settingsEmbed]})
                if(logsChannel){
                    logsChannel.send({embeds: [LogEmbed]})
                }
                break;
            case "mutevoice":
                if(!message.member.permissions.has(Permissions.FLAGS.MUTE_MEMBERS)){
                    message.reply("Missing permissions")
                    return;
                }
                if(!message.member.voice.channel){message.reply("your not on a voice channel"); return;}
                let channel = message.member.voice.channel
                channel.members.forEach(function (member){
                    if(!member.permissions.has(Permissions.FLAGS.MUTE_MEMBERS)){
                        member.voice.setMute(true)
                    }else{return}
                })
                message.reply(`Muted all users in ${channel.toString()} sucesfully`)
                break;
            case "unmutevoice":
                if(!message.member.permissions.has(Permissions.FLAGS.MUTE_MEMBERS)){
                    message.reply("Missing permissions")
                    return;
                }
                if(!message.member.voice.channel){message.reply("your not on a voice channel"); return;}
                let unchannel = message.member.voice.channel
                unchannel.members.forEach(function (member){
                    member.voice.setMute(false)
                })
                message.reply(`Unmuted all users in ${unchannel.toString()} sucesfully`)
                break;
        }
    }
    db.get(`SELECT * FROM data WHERE Userid = ?`, [message.author.id], (err, row) => {
        if (err) {
            console.log(err);
            return;
        }
        if(row === undefined){
            db.run(`INSERT INTO data VALUES(?,?,?,?)`,[message.author.tag,message.author.id,1,1])
        } else {
            const messageN = row.Messages
            const levelN = row.level
            db.run(`UPDATE data SET Messages = ? WHERE userid = ?`, [messageN + 1, message.author.id])
            if(LevelsBool == 0){return;}
            if (messageN == levelN * 1000) {
                db.run(`UPDATE data SET level = ? WHERE userid = ?`, [levelN + 1, message.author.id]);
                //levels
                message.channel.send(`Congratulations you leveled up to level ${levelN + 1}`)
            }
        }
    })
})
bot.on("messageDelete" , (messageDelete) => {
    if(!messageDelete.guild){return;}
    const logsChannel = messageDelete.guild.channels.cache.find(channel => channel.name === "logs");
    if(!logsChannel){return;}
    if (!messageDelete.guild) {return;}
    if (messageDelete.author.bot){return;}
    const DeletedEmbed= new MessageEmbed()
        .setColor('#ff0000')
        .setTitle("Message Deleted")
        .addField( 'Message Content', "`" + ` ${messageDelete} `+"`", true )
        .addField("Channel", ` in <#${messageDelete.channel.id}>`, true )
        .addField("Sent by" , `<@${messageDelete.author.id}>`)
        .setTimestamp()
    logsChannel.send({embeds:[DeletedEmbed]})
})
bot.on("guildMemberAdd", async (member) =>{
    //get the channel to send theembed
    const logsChannel = member.guild.channels.cache.find(channel => channel.name.includes("logs"));
    if(!logsChannel){return}
    //get the info and put it in the embed
    await fetch(member.avatarURL())
    const guildMemberAddEmbed = new MessageEmbed()
        .setColor('#000fff')
        .setTitle('New Member')
        .setTitle('A new user has joined the server')
        .addField('Name', member.toString() ,true)
        .addField('ID', "`" + member.id + "`" ,true)
        .addField('Created At', moment(member.createdAt).format("YYYY MM DD"))
        .setThumbnail(await fetch(member.avatarURL()))
    logsChannel.send({embeds:[guildMemberAddEmbed]})
})
bot.on('messageUpdate',(oldMessage,newMessage) => {
    if(!newMessage.guild){return;}
    if(newMessage.author.bot){return;}
    if(oldMessage.content.includes("https://www.youtube.com")){return;}
    const logsChannel = newMessage.guild.channels.cache.find(channel => channel.name === "logs");
    if(!logsChannel){return;}
    const EditEmbed = new MessageEmbed()
        .setColor('#0000ff')
        .setTitle('Message Edited')
        .addField( 'Old Content', "```" + ` ${oldMessage} `+"```", true )
        .addField( 'New Content', "```" + ` ${newMessage} `+"```", true )
        .addField("Channel", ` in <#${newMessage.channel.id}>`, true )
        .addField("Message Link", ` [Message](${newMessage.url})`)
        .addField("Sent by" , newMessage.author.toString())
        .setTimestamp()
    logsChannel.send({embeds:[EditEmbed]})
})
bot.on('guildMembersChunk', (members,guild,chunk) => {
    logsChannel = message.guild.channels.cache.find(channel => channel.name.includes("logs"))
    if(!logsChannel){
        return;
    }
    let MemberChunk;
    members.forEach(function (member){
        MemberChunk = MemberChunk + `\n ${member.toString()} \`${member.id}\``;
        member.timeout(Math.floor(Math.random() * 10800000) + 3600000,'Raid Prevention, muted for 1 hour')
        member.user.send('Raid Prevention: A lot of users from the same guild has been joining, this measure is for prevention and won\'t be registered in our database').catch(e => console.log('Can\'t send DMs to this user'))
    })
    const ChunkEmbed = new MessageEmbed()
        .setColor('#0000ff')
        .setTitle('Raid Detected')
        .setDescription('Members of the same guild have joined recently *this may be a raid*')
        .addField('Members', MemberChunk)
        .addField('Info', `Index: \`${chunk.index}\` \n Count: \`${chunk.count}\`\n Nonce: \`${chunk.nonce}\``)
        .addField('Guild', `Name: ${guild.name} \n ID: \`${guild.id}\``)
        .setTimestamp()

    logsChannel.send({embeds: [ChunkEmbed]})


})
bot.login(Config.token)
