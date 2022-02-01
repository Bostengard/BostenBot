//import libraries
const Discord = require('discord.js.old');
const config = require('./Config.json');
const dictionary = require('./dictionary.json')
const token = config.token;
const moment = require('moment');
const sqlite = require('sqlite3').verbose();
const fs = require('fs')
const {RichEmbed} = require('discord.js.old')
const { reddit } = require('@kindl3d/reddit.js');
const mathjs = require('mathjs')
const ytdl = require('discord-ytdl-core')
const path = require('path')
const logDir = path.resolve(`logs`)
const DatabaseDir = path.resolve(`Databases`)
var servers = {};
//global variables
const bot = new Discord.Client();
let reason = ""
let target = ""
let targetID = ""
let amount = ""
let cases = ""
let MusicBool,MathBool,RedditBool,LevelsBool;
let logsChannel;
let Bostengard = "https://bostengard.github.io/"
let subreddits = ["196", "antimeme", "bikinibottomtwitter","dankmemes", "shitposting","shitpostcrusaders","leagueofmemes","apandah", "meme","memes", "whenthe","prequelmemes","terriblefacebookmemes","funny", "okbuddyretard","comedycemetery","wholesomememes","raimimemes","historymemes","comedyheaven"]


//WHEN BOT IS READY LOG A MESSAGE IN CONSOLE AND IN .TXT LOGS
bot.on('ready',async () =>{
    amount = ""
    console.log(`Logged in as ${bot.user.tag} at ${moment(Date.now()).format("DD MM YYYY")}`)
    bot.user.setActivity("?help for info")


})

//on message
bot.on('message', async message =>{
    //if the message is send by a bot dont do anything
    if (message.author.bot){return;}
    if(message.guild === null){return;}
    //update the date
    //create a database and the tables if they don't exist with it
    let db = new sqlite.Database(path.join(DatabaseDir,`${message.guild.id}.db`) , sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE) // refresh database to avoid errors
        db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
        db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
        db.run(`CREATE TABLE IF NOT EXISTS settings(MusicBool INTEGER DEFAULT 1, MathBool INTEGER DEFAULT 1, RedditBool INTEGER DEFAULT 1, LevelsBool INTEGER DEFAULT 1)`)


    db = new sqlite.Database(path.join(DatabaseDir,`${message.guild.id}.db`) , sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE) // refresh database to avoid errors
    //get settings
    db.get(`SELECT * FROM settings`, (err,row) =>{
        if(err){return;}
        if(row === undefined){ db.run(`INSERT INTO settings VALUES (?,?,?,?)`,[1,1,1,1])}
        try {
            MusicBool = row.MusicBool
            MathBool = row.MathBool
            RedditBool = row.RedditBool
            LevelsBool = row.LevelsBool
        }catch (e) {
            return;
        }
    })

    //get the log channel
    logsChannel = message.guild.channels.find(channel => channel.name.includes("logs"));

    //check if the message is a command
    if (message.content.startsWith(config.prefix)){
        //split message
        let args = message.content.substring(config.prefix.length).split(" ")
        // define the standart logging embed don't care that logs are disabled or not cuse in case they're disabled it won't be used (more efficient than putting a condition ig)
        const LogEmbed = new RichEmbed()
            .setColor('#0000ff')
            .addField( 'Command', "`" + message.content + "`",true)
            .addField( 'Sent by', `<@${message.author.id}>`,true)
            .addField("Channel" ,`<#${message.channel.id}>`,true)
            .addField("Message",  message.url )
            .setTimestamp()
        //check what command is it with a switch of the args[0](first string after config.prefix(the prefix we assigned in the config.json))
        switch (args[0]){
            case "help":
                const HelpEmbed = new RichEmbed()
                    .setColor('#38F20A')
                    .setTitle("BostenBot")
                    .setURL(Bostengard)
                    .setDescription("prefix = ?")
                    .addField( ' :blue_circle: User', "User Commands\n `?help-user`",true)
                    .addField( ' :blue_circle: Mods', "Moderator Commands\n `?help-moderation`",true)
                    .addField( ' :blue_circle: Math', "Math commands\n `?help-math`",true)
                    .addField( ' :blue_circle: Music', "Music commands\n `?help-music`",true)
                    .addField( ' :blue_circle: Settings', "Bot Settings \n `?help-settings`", true)
                    .setTimestamp()
                //send message and log everything if logs are active
                message.channel.send(HelpEmbed)
                break;
            case "help-moderation":
                //define help embed
                const HelpmodEmbed = new RichEmbed()
                    .setColor('#38F20A')
                    .setTitle("Lord Bostengard's Commands")
                    .setDescription("prefix = ?")
                    .addField( ':blue_circle: delete', "deletes a custom amount(max:99)of messages in a channel`?delete < quantity >`")
                    .addField( ':blue_circle: Spam', "Sends a custom amount of messages in a channel (its slow) `?spam< quantity >`")
                    .addField( ':blue_circle: warn', "Warns a member and sends a dm to the user`?warn < mention >< reason >`")
                    .addField( ':blue_circle: kick', "Kicks a member and sends a dm to the user `?kick < mention >< reason >`")
                    .addField( ':blue_circle: Mute', "Mutes a mentioned membed `?mute < mention > < reason >")
                    .addField( ':blue_circle: UnMute', "UnMutes a mentioned membed `?mute < mention >")
                    .addField( ':blue_circle: ban', "Bans a member and sends a dm to the mentioned user `?ban < mention><reason>`")
                    .addField( ':blue_circle: slowmode', "Changes the slowmode in a channel `?slowmode < amount >< channel >`")
                    .addField( ':blue_circle: cases', "shows the cases for a person and their type`?cases < mention >`")
                    .addField( ':blue_circle: Reset leaderboard', "Resets the server leaderboard `?resetleaderboard`")
                    .addField( ':blue_circle: Reset Cases', "Resets a user leaderboard `?reset < mention/ID >`")
                    .setTimestamp()

                //send message and log everything if logs are enabled
                message.channel.send(HelpmodEmbed)
                break;
            case "help-user":
                //define help embed
                const HelpUserEmbed = new RichEmbed()
                    .setColor('#38F20A')
                    .setTitle("Lord Bostengard's Commands")
                    .setDescription("prefix = ?")
                    .addField( ' :blue_circle: aboutme', "Shows a full-of-info embed of yourself or in case of mentioning someone of that person `?aboutme < mention >`")
                    .addField(':blue_circle: leaderboard', 'shows the top 3 users for this server `?leaderboard`')
                    .addField(':blue_circle: Server Info', 'shows the info of the current server `?serverinfo`')
                    .addField(':blue_circle: Role Info', 'shows info of the role mentioned `?roleinfo < ID >`')
                    .addField(':blue_circle: math', 'solves your maths quations `?math < operation > `')
                    .setTimestamp()

                //send message and log everything if logs are enabled
                message.channel.send(HelpUserEmbed)
                break;
            case "help-music":
                //check if music is enabled if its not send a mesage and stop
                if(MusicBool == 0){message.channel.send("This command is disabled in the bot settings");return}
                //define help embed
                const HelpMusic = new RichEmbed()
                    .setColor('#38F20A')
                    .setTitle("Lord Bostengard's Commands")
                    .setDescription("usage = ?music <>")
                    .addField(':blue_circle: play', "Play a youtube video (send link) `?music play < link >`")
                    .addField(':blue_circle: skip', 'Skips to the next song in the queue `?music skip`')
                    .addField(':blue_circle: stop', 'Stops the music and resets the queue `?music stop`')
                    .setTimestamp()
                message.channel.send(HelpMusic);
                break;
            case "help-math":
                //checki f maths is enable in case its not send a message and stop
                if(MathBool == 0){message.channel.send("this command is disabled in the bot settings"); return;}
                //define the embed
                const HelpMathEmbed = new RichEmbed()
                    .setColor('#38F20A')
                    .setTitle("Lord Bostengard's Commands")
                    .setDescription("Usage = `?math < operation>`")
                    .addField( ' :blue_circle: Basic Operations', "Plus: `x + y` Minus: `x - y` Multiply: `x * y` Divide: `X / y`  ")
                    .addField(':blue_circle: Functions and constants', 'Round: `round( x , < decimals to round >)` \n Atan2:  `atan2(x,y)` \n Logarithm: `log(x)` \n Power: `pow( < base >, < power >` \n Square root: `sqrt(x)` \n Derivative: `derivative( x , y )`')
                    .addField(':blue_circle: Unit change', ' `x < initial > to < final >` Example: `?math 10 inch to cm`')
                    .addField(':blue_circle: Other Operations', 'Cos: `cos(x)` \n Tan: `tan(x)` \n Determinant: `det([matrix values])` Example: `det([-1, 2; 3, 1])` ')
                    .addField(':blue_circle: Usefull Info', 'Number pi: `pi` Example : ` 1 * pi` \n Degree: `deg` Example: `cos(45 deg)` \n Simplify: `simplify(x)` Example: `simplify(3 + 2 / 4) = "7 / 2 "`')
                    .addField('Official documentation', "[Constants](https://mathjs.org/docs/reference/constants.html) , [Main Page](https://mathjs.org/docs/index.html)")
                    .setTimestamp()
                message.channel.send(HelpMathEmbed)
                break;
            case "help-settings":
                const HelpSettingsEmbed = new RichEmbed()
                    .setColor('#38F20A')
                    .setTitle("Bostenbot Settings")
                    .setDescription("Usage = `?settings < setting > < amount>` 1(active) 0(inactive)")
                    .addField(':blue_circle: Music', '`?settings MusicBool < 0/1 >`')
                    .addField(':blue_circle: Math','`?settings MathBool < 0/1 >`')
                    .addField(':blue_circle: Reddit', '`?settings RedditBool < 0/1 >`')
                    .addField(':blue_circle: Levels', '`?settings LevelsBool < 0/1 >`')
                    .setTimestamp()
                message.channel.send(HelpSettingsEmbed)
                break;
            case "random":
                //get the amount and get the random number and check if its an actual number
                amount = message.content.split(" ")[1];
                if (isNaN(amount)){message.channel.send("Send a valid number"); return;}
                const number = Math.floor(Math.random() * amount)
                //define the embed
                const RandomNumberEmbed = new RichEmbed()
                    .setColor('#38F20A')
                    .setTitle(":blue_circle: RANDOM NUMBER")
                    .addField('Your Random Number is :', number)
                    .setTimestamp()
                //send the message and send an embed
                message.channel.send(RandomNumberEmbed);
                break;
            case "aboutme":
                //define the embed
                const AboutEmbed = new RichEmbed()
                    .setColor('#38F20A')
                    .setTitle("User Info")
                    .addField( ' :blue_circle:Created', moment(message.author.createdAt).format("YYYY MM DD"))
                    .addField( ' :blue_circle: User ID', message.author.id,true)
                    .addField(':blue_circle: Highest Role', "`" + message.member.highestRole.name+ "`",true)
                    .setThumbnail(message.author.avatarURL)
                    .setTimestamp()
                //send message and log
                message.channel.send(AboutEmbed)
                break;
            case "delete":
                //get amount
                amount = message.content.split(" ")[1];
                //check if its a number and if theres actually something and if its below 100 and permissions
                if (isNaN(amount)){message.channel.send("thats not a number"); return;}
                if (!amount){message.channel.send(" < amount >"); return;}
                if (amount > 99){message.channel.send("max 99"); return;}
                if (!message.member.hasPermission("MANAGE_MESSAGES")){message.channel.send("missing permissions"); return;}
                //define the embed
                const DeleteEmbed = new RichEmbed()
                    .setColor('#19ff00')
                    .addField( 'Deleted', amount)
                    .addField( 'Deleted by', message.author.tag)
                    .setTimestamp()
                // delete send and log if logs are enabled
                message.channel.bulkDelete(amount)
                message.channel.send(DeleteEmbed)
                if(logsChannel){
                    logsChannel.send(LogEmbed)
                }
                break;
            case "spam":
                //get amount
                amount = message.content.split(" ")[1]
                //check if its a number and if theres actually something
                if(isNaN(amount)){message.channel.send("thats not a number"); return;}
                if(!amount){message.channel.send("< amount >"); return;}
                if(amount > 50){message.channel.send("Max 50"); return;}
                //send messages
                for (let a = 0; a<amount; a++){
                    message.channel.send(`${amount - a - 1} messages missing`)
                }
                if(logsChannel){
                    logsChannel.send(LogEmbed)
                }
                break;
            case "kick":
                //check permissions
                if(!message.member.hasPermission("KICK_MEMBERS")){message.channel.send("u cant kick people") ; return;}
                //get targets info and check unviable options like if theres no target and if it has permission or not
                target = message.mentions.users.first();
                if(!target){message.channel.send("specify a user to kick"); return;}
                targetID = target.toString().replace(/[\\<>@#&!]/g , " ")
                reason = args.slice(2).join(' ')
                if(!reason){reason = "no reason provided"; return;}
                //define the embed
                const KickEmbed = new RichEmbed()
                    .setColor('#ff0000')
                    .addField( ':blue_circle: Kicked', target.tag,true)
                    .addField(':blue_circle: Reason', '`'+ reason + '`',true)
                    .addField( ':blue_circle: Kicked by', message.author.tag)
                    .setTimestamp()
                //try to send the message (with try cause user may not accept messages and it would crash the bot smh)
                target.send("you've been kicked from " + message.guild.name + " Reason : " + reason).catch(error => "")
                try{message.guild.members.get(targetID).kick()}catch (err){ console.log(err); message.channel.send(" Error!: couldn't kick"); return;}
                //send embed and log everything
                message.channel.send(KickEmbed)
                //update databse with new case and ingfo about it
                db.get(`SELECT * FROM cases WHERE UserId = ?`, [targetID], (err, row) => {
                    if(err){console.log(err); return;}
                    if(row === undefined){
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`,[reason,targetID,target.tag,message.author.tag, message.author.id, "kick",moment(Date.now()).format('DD:MM:YYYY')])
                    }

                    else {
                        //put another row of info into the database
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`,[reason,targetID,target.tag,message.author.tag, message.author.id, "kick",moment(Date.now()).format('DD:MM:YYYY')])
                    }
                })
                //if logs are enabled log everything
                if(logsChannel){
                    logsChannel.send("kicked " + target.tag + " || " + target.id )
                    logsChannel.send(LogEmbed)
                }
                break;
            case "ban":
                //check permissions
                if(!message.member.hasPermission("BAN_MEMBERS")){message.channel.send("missing permissions"); return;}
                //get target and info and check unviable option
                target = message.mentions.users.first();
                if(!target){message.channel.send("specify a user"); return;}
                targetID = target.toString().replace(/[\\<>@#&!]/g, "")
                reason = args.slice(2).join(' ')
                if(!reason){message.channel.send("specify a reason"); return;}
                //setup the embed
                const BanEmbed = new RichEmbed()
                    .setColor('#ff0000')
                    .addField( ':blue_circle: Banned', target.tag,true)
                    .addField(':blue_circle: Reason', reason,true)
                    .addField( ':blue_circle: Banned by', message.author.tag)
                    .setTimestamp()
                // send message and ban
                target.send("you've been banned from " + message.guild.name + ". Reason : " + reason).catch(error => "")
                try{message.guild.members.get(targetID).ban()}catch (err){message.channel.send(" Error!: couldn't Ban"); return;}
                message.channel.send(BanEmbed);
                // get data fomr cases table and update it
                db.get(`SELECT * FROM cases WHERE UserId = ?`, [targetID], (err, row) => {
                    if(err){console.log(err); return;}
                    if(row === undefined){
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, targetID, target.tag, message.author.tag, message.author.id, "Ban", moment(Date.now()).format('DD:MM:YYYY')])
                    }
                    else {
                        //put another row of info into the database
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, targetID, target.tag, message.author.tag, message.author.id, "Ban", moment(Date.now()).format('DD:MM:YYYY')])
                    }
                })
                // log everything if logs are active
                if(logsChannel){
                    logsChannel.send(LogEmbed)
                    logsChannel.send("Banned " + target.tag + " || " + target.id )
                }
                break;
            case "slowmode":
                //cehck permissiins
                if(!message.member.hasPermission("MANAGE_MESSAGES")){message.channel.send("missing permissions"); return;}
                // get the target info and the amount and check for invalid options
                amount = message.content.split(" ")[1]
                if(isNaN(amount)){message.channel.send("thats not a number")}
                target = message.mentions.channels.first()
                if(!target){target = message.channel}
                //embed setup
                const SlowmodeEmbed = new RichEmbed()
                    .setColor('#06ff00')
                    .addField( ':blue_circle: Slowmode changed to', amount + "s")
                    .addField( ':blue_circle: Changed by', message.author.tag)
                    .setTimestamp()
                //set slowmode and send message
                target.setRateLimitPerUser(amount)
                target.send(SlowmodeEmbed)
                //log everything if logs arew active
                if(logsChannel){
                    logsChannel.send(LogEmbed)
                }
                break;
            case "warn":
                //check permissions
                if(!message.member.hasPermission("KICK_MEMBERS")){message.channel.send("missing permissions"); return;}
                //get target info
                target = message.mentions.users.first()
                if(!target){message.channel.send("mention a user");return;}
                targetID = target.toString().replace(/[\\<>@#&!]/g, "")
                reason = args.slice(2).join(' ');
                if(!reason){reason = "no reason provided";}
                //setup the embed
                const WarnEmbed = new RichEmbed()
                    .setColor('#ff0000')
                    .addField( ':blue_circle: Warn', target.tag)
                    .addField(':blue_circle: Reason', reason,true)
                    .addField(':blue_circle: Warned By', message.author.tag , true)
                    .setTimestamp()
                // get cases and update it with the info of the case
                db.get(`SELECT * FROM cases WHERE UserId = ?`, [targetID], (err, row) => {
                    if(err){console.log(err); return;}
                    if(row === undefined) {
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, targetID, target.tag, message.author.tag, message.author.id, "Warn", moment(Date.now()).format('DD:MM:YYYY')])
                    }
                    else {
                        //put another row of info into the database
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, targetID, target.tag, message.author.tag, message.author.id, "Warn", moment(Date.now()).format('DD:MM:YYYY')])
                    }
                })
                //send message and log everything
                message.channel.send(WarnEmbed)
                target.send("you've been Warned in " + message.guild.name + ". Reason : " + reason).catch(error => "")
                if(logsChannel){
                    logsChannel.send(LogEmbed)
                    logsChannel.send("warned " + target.tag + " || " + target.id )
                }
                break;
            case "serverinfo":
                //get member count
                let membercount = message.guild.members.filter( member => !member.user.bot).size
                let onlinemembercount = message.guild.members.filter( member => !member.user.bot && member.presence.status !== "offline").size
                //setup the embed
                const ServerInfoEmbed = new RichEmbed()
                    .setColor("#000fff")
                    .setTitle("Server Info")
                    .setDescription(`showing info for ${message.guild.name}`)
                    .setThumbnail(message.guild.iconURL)
                    .addField(":blue_circle: Total members", membercount ,true)
                    .addField(":blue_circle: Online members", onlinemembercount, true)
                    .addField(":blue_circle: Owner" , `<@${message.guild.ownerID}>`,true)
                    .addField(":blue_circle: Server Banner ", `this is the server banner for ${message.guild.name} `)
                    .setImage(message.guild.bannerURL)

                //send and log
                message.channel.send(ServerInfoEmbed)
                break;
            case "cases":
                amount = 1
                //check unviable options and format target
                if(!message.member.hasPermission("MANAGE_MESSAGES")){message.channel.send("missing permissions"); return;}
                //get target
                target = message.content.split(' ')[1];
                if(!target){message.channel.send("Specify a user");return}

                if(isNaN(target)){target= target.toString().replace(/[\\<>@#&!]/g, "")}

                //set primary embed
                const CasesEmbedRows = new RichEmbed()
                    .setTitle("Cases")
                    .setColor('#000fff')

                //get info and send it
                db.all(`SELECT * FROM cases WHERE UserId = ?`, [target], (err, row) =>{
                    if(err){console.log(err);message.channel.send("error getting data"); return;}
                    row.forEach( function (rows){
                        //get table info
                        let reasonC = rows.Reason
                        let moderator = rows.ModeratorTag
                        let type = rows.CaseType
                        let date = rows.Date
                        let Tag = rows.UserTag
                        //put table info into embed
                        CasesEmbedRows.addField(`:blue_circle: ${amount}: ${type}`,`Reason:` + "`"+reasonC+"`" +"\n By: `" + moderator + "` \n At: `" + date + "`",true)
                        CasesEmbedRows.setTitle(`Cases for ${Tag}`)
                        CasesEmbedRows.setDescription(`This user has a total of ${amount} cases`)
                        amount++
                    })
                    //end the embed
                    message.channel.send(CasesEmbedRows)
                })
                break;
            case "leaderboard":
                //get the embed
                const leaderboardEmbed= new RichEmbed()
                    .setColor('#000fff')
                    .setTitle(":blue_circle: Leaderboard!")
                    .setDescription(`This is the top 3 users for ${message.guild.name}`)
                    .setImage(message.guild.avatarURL)

                //get info of the message author
                db.get(`SELECT * FROM data WHERE UserId = ?`,[message.author.id], (err, row) =>{
                    if (err) {console.log(err);return;}
                    if (row === undefined) {
                        message.channel.send("Error getting your messages")
                    } else {
                        const messageN = row.Messages
                        leaderboardEmbed.addField(":blue_circle: your messages",`you have a total of ${messageN} messages in this server`)
                    }
                })
                amount = "1"
                //get info of the top 3 by message
                db.all(`SELECT * FROM data ORDER BY Messages DESC LIMIT 3`, (err, row) =>{
                    if(err){console.log(err);message.channel.send("error getting data"); return;}
                    //setup an embed for each person and send it
                    row.forEach( function (rows){
                        //add a field for every person
                        let messageCount = rows.Messages
                        let User = rows.UserTag
                        leaderboardEmbed.addField(`:blue_circle: Top ${amount}`, `${User} with ${messageCount} messages`)
                        amount++
                    })
                    //send the message
                    message.channel.send(leaderboardEmbed)
                })

                break;
            case "roleinfo":
                //get the role id to input
                target = message.content.split(" ")[1]
                if(!target){message.channel.send("send a role id"); return;}
                if(isNaN(target)){message.channel.send("send a role ID"); return;}
                //get the role mention
                const TargetRole = message.guild.roles.find( role => role.id === target)
                //get the embed with the info
                const RoleEmbed = new RichEmbed()
                    .setColor(TargetRole.hexColor)
                    .setTitle(`Showing role info for : `+ "`" + TargetRole.name + "`")
                    .addField(':blue_circle: Created At', `Role created at ${moment(TargetRole.createdAt).format("DD:MM:YYYY")}`)
                    .addField(':blue_circle: Mentionable', "`" + TargetRole.mentionable + "`", true)
                    .addField(':blue_circle: ID', "`" + target + "`")
                    .addField(":blue_circle: Color", "`" + TargetRole.hexColor + "`")
                    .addField(":blue_circle: Mebers", "At least " + "`"+ TargetRole.members.size+"`")
                //send the embed
                message.channel.send(RoleEmbed)
                break;
            case "reddit":
                //check if reddit module is active
                if(RedditBool == 0){message.channel.send("This command is disabled"); return;}
                //get the subreddit
                var loopamount = 0
                target = message.content.split(" ")[1]
                if(!target){target = "random"}
                amount = message.content.split(" ")[2]

                //get the post with all the data
                if(target === "random"){const redditamount = Math.floor(Math.random() * subreddits.length); target = subreddits[redditamount]}
                //useless variable that i dont want ot remove
                if(!amount){amount = "hot"}
                redditpost(target)
                //define the fuction of getting the reddit post
                function redditpost(target) {
                    try {
                        reddit(target, amount).then(data => {
                            //if nsfw and the channel is not nsfw dont send anything
                            if (data.nsfw === true && !message.channel.nsfw) {
                                message.channel.send("no nsfw posts are allowed in this channel")
                                return;
                            }
                            //if the image is in the wrong format try again until 5 times
                            if (!data.url.endsWith(".jpg") && !data.url.endsWith(".gif") && !data.url.endsWith(".png") && !data.url.endsWith(".webp")) {
                                loopamount ++
                                if(loopamount > 4 ){message.channel.send("couldn't find a post that meets the format requirements"); return;}
                               redditpost(target)
                                return;
                            }
                            //define the embed for the post
                            const redditembed = new RichEmbed()
                                .setColor('#ff7b00')
                                .setTitle(data.title + `  |   :thumbsup: ${data.score}`)
                                .setImage(data.url)
                                .setDescription(`[Reddit Post](${data.permalink})` + ` | from ${data.subreddit}  | by u/${data.author}`)
                            message.channel.send(redditembed)
                        })
                    } catch (e) {
                        message.channel.send("Couldn't find any post! Try checking spelling")
                    }
                }
                break;
            case "resetleaderboard":
                //check permissions
                if(!message.member.hasPermission("ADMINISTRATOR")){message.channel.send("missing permissions"); return;}
                //delete data
                db.run(`DELETE FROM data`);
               //send message
                message.channel.send("Leaderbord succesfully resetted! :thumbsup:")
                if(logsChannel){
                    logsChannel.send(LogEmbed)
                }
                break;
            case "resetcases":
                //check permissions
                if(!message.member.hasPermission("ADMINISTRATOR")){message.channel.send("missing permissions"); return;}
                //check target
                target = message.content.split(" ")[1]
                //check targe
                if(!target){message.channel.send("send user ID");return;}
                targetID = target.toString().replace(/[\\<>@#&!]/g , " ")
                if(isNaN(targetID)){message.channel.send("Error!");return;}
                //delete
                db.run(`DELETE FROM cases WHERE userid = ${targetID}`)
                //get the embed
                const ResetCasesEmbed = new RichEmbed()
                    .setColor('#000fff')
                    .setTitle(`Reseted cases succesfully`)
                    .setDescription("this user now has 0 cases ")
                //send the embed
                message.channel.send(ResetCasesEmbed)
                if(logsChannel){
                    logsChannel.send(LogEmbed)
                }
                break;
            case "mute":
                //check permissions
                if(!message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")){message.channel.send("missing permissions"); return;}
                //get target and target 2(for embed purposes)
                target = message.mentions.members.first()
                const Target2 = message.mentions.users.first()
                if(!target){message.channel.send("Mention a user"); return;}
                if(target.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")){message.channel.send("can't mute that member");return;}
                targetID = target.toString().replace(/[\\<>@#&!]/g, "")
                //reason moment
                reason = args.slice(2).join(' ');
                if(!reason){reason = "no reason provided"}
                //get the role
                const muteRole = message.guild.roles.find(role => role.name === "Muted")
                if(!muteRole){message.channel.send('Theres no mute role, to use this command create a role with name "Muted"' );return;}
                //change permissions for all the channels to make people with taht role stay muted until oblivion
                message.guild.channels.forEach( function (channel){
                    channel.overwritePermissions(muteRole, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false
                    }).then()
                })

                // get cases and update it
                db.get(`SELECT * FROM cases WHERE UserId = ?`, [targetID], (err, row) => {
                    if(err){console.log(err); return;}
                    if(row === undefined){
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, targetID, Target2.tag, message.author.tag, message.author.id, "Mute", moment(Date.now()).format('DD:MM:YYYY')])
                        }
                    else {
                        //put another row of info into the database
                        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`, [reason, targetID, Target2.tag, message.author.tag, message.author.id, "Mute", moment(Date.now()).format('DD:MM:YYYY')])
                    }
                })

                //setup the embed
                const muteEmbed = new RichEmbed()
                    .setColor('#000fff')
                    .setTitle(`Muted ${message.mentions.users.first().tag}`)
                    .setDescription(`Muted by ${message.author.tag} `)
                    .setTimestamp()

                target.addRole(muteRole);
                message.channel.send(muteEmbed)
                //log everytihn if logs are active
                if(logsChannel){
                    logsChannel.send(LogEmbed)
                }
                break;
            case "unmute":
                //check permissions
                if(!message.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")){message.channel.send("missing permissions"); return;}
                //get the target
                target = message.mentions.members.first();
                if(!target){message.channel.send("Mention a user"); return;}
                //get the role
                const unmuteRole = message.guild.roles.find(role => role.name === "Muted")
                if(!unmuteRole){message.channel.send('Theres no mute role, to use this command create a role with name "Muted"' );return;}
                target.removeRole(unmuteRole);
                const unmuteEmbed = new RichEmbed()
                    .setColor('#000fff')
                    .setTitle(`UnMuted ${message.mentions.users.first().tag}`)
                    .setDescription(`UnMuted by ${message.author.tag} `)
                    .setTimestamp()
                message.channel.send(unmuteEmbed)
                if(logsChannel){
                    logsChannel.send(LogEmbed)
                }
                break;
            case "math":
                if(MathBool == 0){message.channel.send("This command is disabled in the bot settings"); return;}
                try{
                    //get the operation
                    const result = mathjs.evaluate(args.slice(1).join(" "))
                    //build embed
                    const MathEmbed = new RichEmbed()
                        .setColor('#000fff')
                        .addField(' :blue_circle: Operation ', "`" + args.slice(1).join(" ") + "`")
                        .addField(' :blue_circle: Result' , "`" + result + "`")
                    //send embed
                    message.channel.send(MathEmbed)
                }catch (err){
                    //if error send
                    message.channel.send("invalid question type `?help-math` to know more. \n Make sure it's the correct format")
                }
                break;
            case "unban":
                //check permissions
                if(!message.member.hasPermission("BAN_MEMBERS")){message.channel.send("pebbles can't unban (missing permissions)")}
                //get the user id
                target = message.content.split(" ")[1]
                if(!target){message.channel.send("Send a user id"); return;}
                if(isNaN(target)){message.channel.send("Send a user id"); return;}
                reason = args.slice(2).join(' ');
                if(!reason){reason = "no reason provided"}
                //seyup the embed
                const UnbanEmbed = new RichEmbed()
                    .setColor('#000fff')
                    .setTitle(`Unbanned ${target}`)
                    .addField(`Unbanned by`, message.member.toString())
                    .addField(`Reason`, reason)
                message.channel.guild.unban(target)
                message.channel.send(UnbanEmbed)
                if(logsChannel){
                    logsChannel.send(LogEmbed)
                }
                break;
            case "def":
                message.channel.send("work in progress")
                return;
                let dtarget = message.content.split(" ")[1]
                console.log(dtarget)
                if(!dtarget){message.channel.send("Send a word you moron"); return;}
                try {
                    const definition = dictionary.dtarget
                    console.log(definition)
                    message.channel.send(`${dtarget}: ${definition}`)
                }catch (err){
                    console.log(err)
                    message.channel.send("Couldn't find that word")
                }
                break;
            case "music":
                if(MusicBool == 0 ){message.channel.send("this command is disabled"); return;}
                switch (args[1]) {
                    case "play":
                        if (!args[2]) {
                            message.reply("Please provide a link")
                            return;
                        }
                        if (!message.member.voiceChannel) {
                            message.channel.send("You must be in a voice channel!")
                            return;
                        }
                        if (!servers[message.guild.id]) servers[message.guild.id] = {
                            queue: []
                        }
                        var server = servers[message.guild.id];
                        server.queue.push(args[2]);
                        const musicEmbed = new RichEmbed ()
                            .setColor('#00000f')
                            .setTitle(`Added to queue`)
                            .setDescription(`There's a total of ${server.queue.length} songs in the queue`)
                        message.channel.send(musicEmbed)
                        if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function (connection) {
                            play(connection, message);
                        });
                        break;
                    case "skip":
                        var server = servers[message.guild.id];

                        if (server.dispatcher) server.dispatcher.end();

                        break;

                    case "stop":
                        var server = servers[message.guild.id];

                        if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
                        break;
                }
                function play(connection, message) {
                    var server = servers[message.guild.id];
                    server.dispatcher = connection.playOpusStream(ytdl(server.queue[0], {
                        filter: "audioonly",
                        opusEncoded: true,
                        highWaterMark: 1<<25
                    }));
                    server.dispatcher.setVolume(3);
                    server.queue.shift();
                    server.dispatcher.on("end", function () {
                        if (server.queue[0]) {
                            play(connection, message);
                        } else {
                            connection.disconnect();
                            message.channel.send("queue ended");
                        }
                    });
                }
                break;
            case "settings":
                //check permissions
                if(!message.member.hasPermission("ADMINISTRATOR")){message.channel.send("missing permissions"); return;}
                //get target
                target = message.content.split(" ")[1]
                if(!target){message.channel.send("select a setting, type `?help-settings` to know more");return;}
                if(target !== "MusicBool" && target !== "MathBool" && target !== "RedditBool"){message.channel.send("Unknown Setting, type `?help-settings` to know more"); return;}
                amount = message.content.split(" ")[2]
                if(!amount){message.channel.send("Send a value"); return;}
                if(amount != 1 && amount != 0){message.channel.send("Send 1(active) or 0(inactive)");return}

                //setup the embed
                const settingsEmbed = new RichEmbed()
                    .setColor('#000fff')
                    .setTitle('Settings successfully changed')
                    .setDescription(`${target} is now ${amount}`)
                db.run(`UPDATE settings SET ${target} = ?`,[amount])
                message.channel.send(settingsEmbed);
                if(logsChannel){
                    logsChannel.send(LogEmbed)
                }
                break;
            case "view-settings":



                db.get(`SELECT * FROM settings`, (err,row) =>{
                    if(err){return;}
                    if(row === undefined){ db.run(`INSERT INTO settings VALUES (?,?,?,?)`,[1,1,1,1])}
                    try {
                        MusicBool = row.MusicBool
                        MathBool = row.MathBool
                        RedditBool = row.RedditBool
                        LevelsBool = row.LevelsBool

                    }catch (e) {
                        return;
                    }
                })
                const settingsviemEmbed = new RichEmbed()
                    .setColor('#0000ff')
                    .setTitle('Server Settings (if `undefined` try again)')
                    .setDescription('1 = enabled | 0 = disabled | type `?help-settings`to know more')
                    .addField('Music', "` " + MusicBool + " `", true)
                    .addField('Reddit', "` " + RedditBool + " `", true)
                    .addField('Levels', "` " + LevelsBool + " `", true)
                    .addField('Math', "` " + MathBool + " `", true)
                    .setThumbnail(message.guild.avatarURL)
                message.channel.send(settingsviemEmbed);
                break;

        }
    }
    //update the message count of the user  Get the row, the message count +1 and update it (sort by message author id)
    db.get(`SELECT * FROM data WHERE Userid = ?`, [message.author.id], (err, row) => {
        if (err) {
            console.log(err);
            return;
        }
        if(row === undefined){
            db.run(`INSERT INTO data VALUES(?,?,?,?)`,[message.author.tag,message.author.id,0,1])
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
bot.on('channelCreate', channel => {
    const muteRole = channel.guild.roles.find(role => role.name.toLowerCase() === "muted")
    if(!muteRole){return;}
    channel.guild.channels.forEach( function (channel){
        channel.overwritePermissions(muteRole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false
        }).then()
    })
})
bot.on('messageUpdate', (oldMessage, newMessage) => {
    if(!newMessage.guild){return;}
    if (newMessage.author.bot){return;}
    if(oldMessage.content.includes("https://www.youtube.com")){return;}


    const logsChannel = newMessage.guild.channels.find(channel => channel.name === "logs");
    if(!logsChannel){return;}
    //send embed with info
    if(newMessage.content !== oldMessage){
        const EditedEmbed= new RichEmbed()
            .setColor('#0000ff')
            .setTitle("Message Edited")
            .addField( 'Old Content', "```" + ` ${oldMessage} `+"```", true )
            .addField( 'New Content', "```" + ` ${newMessage} `+"```", true )
            .addField("Channel", ` in <#${newMessage.channel.id}>`, true )
            .addField("Message Link", ` [Message](${newMessage.url})`)
            .addField("Sent by" , `<@${newMessage.author.id}>`)
            .setTimestamp()
        logsChannel.send(EditedEmbed)
    }
});
bot.on("messageDelete" , (messageDelete) => {
    if(!messageDelete.guild){return;}
    const logsChannel = messageDelete.guild.channels.find(channel => channel.name === "logs");
    if(!logsChannel){return;}
    if (!messageDelete.guild) {return;}
    if (messageDelete.author.bot){return;}
    const DeletedEmbed= new RichEmbed()
        .setColor('#ff0000')
        .setTitle("Message Deleted")
        .addField( 'Message Content', "`" + ` ${messageDelete} `+"`", true )
        .addField("Channel", ` in <#${messageDelete.channel.id}>`, true )
        .addField("Sent by" , `<@${messageDelete.author.id}>`)
        .setTimestamp()
    logsChannel.send(DeletedEmbed)
})
bot.on("guildMemberAdd", (member) =>{
    //get the channel to send theembed
    const logsChannel = member.guild.channels.find(channel => channel.name.includes("logs"));
    if(!logsChannel){return}

    //get the info and put it in the embed
    const guildMemberAddEmbed = new RichEmbed()
        .setColor('#000fff')
        .setTitle('New Member')
        .setTitle('A new user has joined the server')
        .addField('Name', member.toString() ,true)
        .addField('ID', "`" + member.id + "`" ,true)
        .addField('Created At', moment(member.createdAt).format("YYYY MM DD"))
        .setThumbnail(member.avatarURL)
    logsChannel.send(guildMemberAddEmbed)
})
bot.on("guildDelete", guild => {
    fs.unlink(`./Databases/${guild.id}.db`, (name) => "")
    console.log("deleted")
})
bot.on("guildCreate", async guild => {
    let db  = new sqlite.Database(`./Databases/${guild.id}.db` , sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
    db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
    db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
    db.run(`CREATE TABLE IF NOT EXISTS settings(MusicBool INTEGER DEFAULT 1, MathBool INTEGER DEFAULT 1, RedditBool INTEGER DEFAULT 1, LevelsBool INTEGER DEFAULT 1)`)
    db.run(`INSERT INTO settings VALUES (?,?,?,?)`,[1,1,1,1])
    //check welcome channel and say hallo
    guild.channels.forEach( function (channel) {
        if(channel.type == "text" && channel.name.includes("general"||"bot"||"staff"|| "principal")){
            channel.send("Hey, this is BostenBot, type `?help` to know more about my commands")
            return;
        }else {
            return;
        }
    })
});
bot.login(token)


