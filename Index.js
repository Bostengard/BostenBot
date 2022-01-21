//import libraries
const Discord = require('discord.js.old');
const config = require('./Config.json');
const token = config.token;
const moment = require('moment');
const sqlite = require('sqlite3').verbose();
const fs = require('fs')
const {RichEmbed} = require('discord.js.old')
const { reddit } = require('@kindl3d/reddit.js');


//global variables
const bot = new Discord.Client();
let FileLogDate = moment(new Date()).format("DD MM YYYY")
let logger = fs.createWriteStream(`./logs/logs${FileLogDate}.txt`, {flags: 'a'})  //data will be preserved //writes the file and creates if it doesnt exist
let WriteLine = (line) => logger.write(`\n${line}`);
let reason = ""
let target = ""
let targetID = ""
let amount = ""
let cases = ""
let Bostengard = "https://bostengard.github.io/"
let subreddits = ["196", "antimeme", "bikinibottomtwitter","dankmemes", "shitposting", "meme","memes", "whenthe","prequelmemes","terriblefacebookmemes","funny", "okbuddyretard","comedycemetery","wholesomememes","raimimemes","historymemes","comedyheaven"]


//WHEN BOT IS READY LOG A MESSAGE IN CONSOLE AND IN .TXT LOGS
bot.on('ready', () =>{
    amount = ""
    console.log(`Logged in as ${bot.user.tag} at ${FileLogDate}`)
    WriteLine(FileLogDate + `Logged in as ${bot.user.tag}`)

})

//on message
bot.on('message', message =>{

    //if the message is send by a bot dont do anything
    if (message.author.bot){return;}
    if(message.guild === null){return;}

    //update the date
    FileLogDate = moment(new Date()).format("DD MM YYYY hh:mm:ss")

    //create a database and the tables if they don't exist with it
    let db  = new sqlite.Database(`./Databases/${message.guild.id}.db` , sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE) // one database per guild
    db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL, Cases INTEGER NOT NULL, Messages INTEGER NOT NULL)`) // data table : 4 rows
    db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL )`) //cases table 6 rows

    // create basic database functions
    let insertdata = db.prepare(`INSERT INTO data VALUES(?,?,?,?)`)
    let insertcases = db.prepare(`INSERT INTO cases VALUES(?,?,?,?,?,?)`)
    let dataquery = `SELECT * FROM data WHERE UserId = ?`;
    let casesquery = `SELECT * FROM cases WHERE UserId = ?`;
    let leaderboardquery = `SELECT * FROM data ORDER BY Messages DESC LIMIT 3`


    //update the message count of the user  Get the row, the message count +1 and update it (sort by message author id)
    db.get(dataquery,[message.author.id], (err, row) =>{
        if (err) {console.log(err);return;}
        if (row === undefined) {
            insertdata.run(message.author.tag, message.author.id,"0","1")
        } else {
            const messageN = row.Messages
            db.run(`UPDATE data SET Messages = ? WHERE userid = ?`, [messageN + 1, message.author.id])
        }

    })

    //get the logs channel w/ id
    const logsChannel = message.guild.channels.find(channel => channel.name.includes("logs"));
    const logsChannelID = logsChannel.id;

    //check if the message is a command
    if (message.content.startsWith(config.prefix)){

        //if theres no log channel send a message and stop
        if(!logsChannel){message.channel.send('There is no logs channel, create a channel with the name "logs" to start using this bot '); return;}

        //split message
        let args = message.content.substring(config.prefix.length).split(" ")

        // define the standart logging embed

        const LogEmbed = new RichEmbed()
            .setColor('#0000ff')
            .addField( 'Command', "`" + message.content + "`",true)
            .addField( 'Sent by', `<@${message.author.id}>`,true)
            .addField("Channel" ,`<#${message.channel.id}>`,true)
            .addField("Message",  message.url )
            .setTimestamp()

        //check what command is it with a switch args

        switch (args[0]){



            case "help":
                const HelpEmbed = new RichEmbed()
                    .setColor('#38F20A')
                    .setTitle("Lord Bostengard's Lobby")
                    .setURL(Bostengard)
                    .setDescription("prefix = ?")
                    .addField( ' :blue_circle: User', "User Command `?help-user`",true)
                    .addField( ' :blue_circle: Mods', "Moderator Commands `?help-moderation`",true)
                    .setThumbnail(bot.avatarURL)



                //send message and log everything
                message.channel.send(HelpEmbed)
                WriteLine(FileLogDate + "Help " + " || " +  message.author.tag + " || " + message.guild.name)
                bot.channels.get(logsChannelID).send(LogEmbed)
                console.log(FileLogDate + " Helping  " + "||" + message.author.tag + "||" + message.guild.name)
                break;

                break;
            //if its help
            case "help-moderation":
                //define help embed
                const HelpmodEmbed = new RichEmbed()
                    .setColor('#38F20A')
                    .setTitle("Lord Bostengard's Commands")
                    .setDescription("prefix = ?")
                    .addField( ' :blue_circle: delete', "deletes a custom amount(max:99)of messages in a channel`?delete < quantity >`")
                    .addField( ' :blue_circle: Spam', "Sends a custom amount of messages in a channel (its slow) `?spam< quantity >`")
                    .addField( ' :blue_circle:  warn', "Warns a member and sends a dm to the user`?warn < mention >< reason >`")
                    .addField( ':blue_circle:  kick', "Kicks a member and sends a dm to the user `?kick < mention >< reason >`")
                    .addField( ':blue_circle:  ban', "Bans a member and sends a dm to the mentioned user `?ban < mention><reason>`")
                    .addField( ':blue_circle:  slowmode', "Changes the slowmode in a channel `?slowmode < amount >< channel >`")
                    .addField( ':blue_circle: cases', "shows the cases for a person and their type`?cases < mention >`")
                    .setTimestamp()

                //send message and log everything
                message.channel.send(HelpmodEmbed)
                WriteLine(FileLogDate + "Help mod " + " || " +  message.author.tag + " || " + message.guild.name)
                bot.channels.get(logsChannelID).send(LogEmbed)
                console.log(FileLogDate + " Helping mods " + "||" + message.author.tag + "||" + message.guild.name)
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
                    .addField(':blue_circle: Reddit', 'seaches a reddit post (if random selects a random meme) \n`?reddit < subreddit/random >`')
                    .setTimestamp()

                //send message and log everything
                message.channel.send(HelpUserEmbed)
                WriteLine(FileLogDate + "Help user" + " || " +  message.author.tag + " || " + message.guild.name)
                bot.channels.get(logsChannelID).send(LogEmbed)
                console.log(FileLogDate + " Helping users " + "||" + message.author.tag + "||" + message.guild.name)
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
                WriteLine(FileLogDate + " Random " + amount + " || " + message.author.tag + " || " + message.guild.name)
                bot.channels.get(logsChannelID).send(LogEmbed).catch(console.error)
                console.log(FileLogDate + " Random " + amount + " || " + message.author.tag + " || " + message.guild.name)
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
                WriteLine(FileLogDate + " About me "  + " || " + message.author.tag + " || " + message.guild.name)
                bot.channels.get(logsChannelID).send(LogEmbed).catch(console.error)
                console.log(FileLogDate + " About me"  + " || " + message.author.tag + " || " + message.guild.name)
                break;

            case "delete":

                //get amount
                amount = message.content.split(" ")[1];
                //check if its a number and if theres actually something and if its below 100 and permissions
                if (isNaN(amount)){message.channel.send("thats not a number"); return;}
                if (!amount){message.channel.send(" < amount >"); return;}
                if (amount > 99){message.channel.send("max 99"); return;}
                if (!message.member.hasPermission("MANAGE_MESSAGES")){;message.channel.send("missing permissions"); return;}

                //define the embed
                const DeleteEmbed = new RichEmbed()
                    .setColor('#19ff00')
                    .addField( 'Deleted', amount)
                    .addField( 'Deleted by', message.author.tag)
                    .setTimestamp()

                // delete send and log

                message.channel.bulkDelete(amount)
                message.channel.send(DeleteEmbed)
                WriteLine(FileLogDate + " Deleted "  + amount + " || " + message.author.tag + " || " + message.guild.name)
                bot.channels.get(logsChannelID).send(LogEmbed)
                console.log(FileLogDate + " Deleted "  + amount +  " || " + message.author.tag + " || " + message.guild.name)

                break;

            case "spam":

                //get amount
                amount = message.content.split(" ")[1]
                //check if its a number and if theres actually something
                if(isNaN(amount)){message.channel.send("thats not a number"); return;}
                if(!amount){message.channel.send("< amount >"); return;}
                //send messages
                for (let a = 0; a<amount; a++){
                    message.channel.send(`${amount - a - 1} messages missing`)
                }
                break;

            case "kick":

                //get targets info and check unviable option
                target = message.mentions.users.first();
                if(!target){message.channel.send("specify a user to kick"); return;}
                targetID = target.toString().replace(/[\\<>@#&!]/g , " ")
                reason = args.slice(2).join(' ')
                if(!reason){message.channel.send("specify a reason"); return;}

                //check permissions
                if(!message.member.hasPermission("KICK_MEMBERS")){message.channel.send("u cant kick people") ; return;}

                //define the embed
                const KickEmbed = new RichEmbed()
                    .setColor('#ff0000')
                    .addField( ':blue_circle: Kicked', target.tag,true)
                    .addField(':blue_circle: Reason', '`'+ reason + '`',true)
                    .addField( ':blue_circle: Kicked by', message.author.tag)
                    .setTimestamp()

                //det cases nº data and update id from database


                //try to send the message (with try cause user may not accept messages
                try{target.send("you've been kicked from " + message.guild.name + " Reason : " + reason).catch(console.error)}catch (err){}
                try{message.guild.members.get(targetID).kick()}catch (err){ console.log(err); message.channel.send(" Error!: couldn't kick"); return;}

                //send embed and log everything
                message.channel.send(KickEmbed)
                WriteLine(FileLogDate + " Kicked "  + target.tag + " || " + message.author.tag + " || " + message.guild.name + " || " + reason )
                bot.channels.get(logsChannelID).send(LogEmbed ).catch(console.error)
                bot.channels.get(logsChannelID).send("kicked " + target.tag + " || " + target.id ).catch(console.error)
                console.log(FileLogDate + " Kicked "  + target.tag +  " || " + message.author.tag + " || " + message.guild.name + reason )
                db.get(dataquery, [message.author.id], (err, row) =>{
                    if(err){console.log(err); return;}
                    if (row === undefined){message.channel.send("Error!: couldn't add data to the database")}
                    else {
                        //get cases and update the number
                        cases = row.Cases
                        db.run(`UPDATE data SET Cases = ? WHERE UserID = ?`, [cases + 1, targetID])
                    }
                })
                //get the cases table and put info
                db.get(casesquery, [targetID], (err, row) => {
                    if(err){console.log(err); return;}
                    if(row === undefined){insertcases.run(reason,targetID,target.tag,message.author.tag,message.author.id,"kick")}
                    else {
                        //put another row of info into the database
                        insertcases.run(reason,targetID,target.tag,message.author.tag, message.author.id, "kick")
                    }
                })
                break;

            case "ban":

                //get target and info and check unviable option
                target = message.mentions.users.first();
                if(!target){message.channel.send("specify a user"); return;}
                targetID = target.toString().replace(/[\\<>@#&!]/g, "")
                reason = args.slice(2).join(' ')
                if(!reason){message.channel.send("specify a reason"); return;}
                if(!message.member.hasPermission("BAN_MEMBERS")){message.channel.send("missing permissions"); return;}

                //setup the embed
                const BanEmbed = new RichEmbed()
                    .setColor('#ff0000')
                    .addField( ':blue_circle: Banned', target.tag,true)
                    .addField(':blue_circle: Reason', reason,true)
                    .addField( ':blue_circle: Banned by', message.author.tag)
                    .setTimestamp()

                //get data from data table
                db.get(dataquery, [message.author.id], (err, row) =>{
                    if(err){console.log(err); return;}
                    if (row === undefined){message.channel.send("Error!: couldn't add data to the database")}
                    else {
                        //get cases and update the number
                        cases = row.Cases
                        db.run(`UPDATE data SET Cases = ? WHERE UserID = ?`, [cases + 1, targetID])
                    }
                })
                // get data fomr cases table and update it
                db.get(casesquery, [targetID], (err, row) => {
                    if(err){console.log(err); return;}
                    if(row === undefined){insertcases.run(reason,targetID,target.tag,message.author.tag,message.author.id,"ban")}
                    else {
                        //put another row of info into the database
                        insertcases.run(reason,targetID,target.tag,message.author.tag, message.author.id, "ban")
                    }
                })
                // send message and ban
                try{target.send("you've been banned from " + message.guild.name + ". Reason : " + reason).catch(console.error)}catch (err){}
                try{message.guild.members.get(targetID).kick()}catch (err){ console.log(err); message.channel.send(" Error!: couldn't kick"); return;}
                message.channel.send(BanEmbed);

                // log everything
                WriteLine(FileLogDate + " Banned "  + target.tag + " || " + message.author.tag + " || " + message.guild.name + " || " + reason )
                bot.channels.get(logsChannelID).send(LogEmbed).catch(console.error)
                bot.channels.get(logsChannelID).send("Banned " + target.tag + " || " + target.id ).catch(console.error)
                console.log(FileLogDate + " Banned "  + target.tag +  " || " + message.author.tag + " || " + message.guild.name + reason )
                break;

            case "slowmode":

                // get the target info and the amount
                amount = message.content.split(" ")[1]
                if(isNaN(amount)){message.channel.send("thats not a number")}
                target = message.mentions.channels.first()
                if(!target){target = message.channel}
                if(!message.member.hasPermission("MANAGE_MESSAGES")){message.channel.send("missing permissions"); return;}

                //embed setup
                const SlowmodeEmbed = new RichEmbed()
                    .setColor('#06ff00')
                    .addField( ':blue_circle: Slowmode changed to', amount + "s")
                    .addField( ':blue_circle: Changed by', message.author.tag)
                    .setTimestamp()

                //set slowmode and send message
                target.setRateLimitPerUser(amount)
                target.send(SlowmodeEmbed)

                WriteLine(FileLogDate + " Slowmode changed: " + amount + "s" + " || " + message.author.tag + " || " + message.guild.name + " || " + message.channel.name)
                bot.channels.get(logsChannelID).send(LogEmbed).catch(console.error)
                console.log(FileLogDate + " Slowmode changed: " + amount + "s" + " || " + message.author.tag + " || " + message.guild.name + " || " + message.channel.name)

                break;

            case "warn":

                //get target info
                target = message.mentions.users.first()
                if(!target){message.channel.send("mention a user");return;}
                targetID = target.toString().replace(/[\\<>@#&!]/g, "")
                reason = args.slice(2).join(' ');
                if(!reason){message.channel.send("specify a reason");return;}
                if(message.member.hasPermission("KICK_MEMBERS")){}
                //setup the embed
                const WarnEmbed = new RichEmbed()
                    .setColor('#ff0000')
                    .addField( ':blue_circle: Warn', target.tag)
                    .addField(':blue_circle: Reason', reason,true)
                    .addField(':blue_circle: Warned By', message.author.tag , true)
                    .setTimestamp()


                //send message and log everything
                message.channel.send(WarnEmbed)
                target.send("you've been Warned in " + message.guild.name + ". Reason : " + reason).catch(console.error)
                WriteLine(FileLogDate + " Warned: "  + target.tag  + " || " + message.author.tag + " || " + message.guild.name + " || " + message.channel.name + " || " + reason)
                bot.channels.get(logsChannelID).send(LogEmbed).catch(console.error)
                bot.channels.get(logsChannelID).send("warned " + target.tag + " || " + target.id ).catch(console.error)
                console.log(FileLogDate + " Warned: "  + target.tag + " || " + message.author.tag + " || " + message.guild.name + " || " + message.channel.name + " || " +reason)

                //get data and update
                db.get(dataquery, [message.author.id], (err, row) =>{
                    if(err){console.log(err); return;}
                    if (row === undefined){message.channel.send("Error!: couldn't add data to the database")}
                    else {
                        //get cases and update the number
                        cases = row.Cases
                        db.run(`UPDATE data SET Cases = ? WHERE UserID = ?`, [cases + 1, targetID])
                    }
                })
                // get cases and update it
                db.get(casesquery, [targetID], (err, row) => {
                    if(err){console.log(err); return;}
                    if(row === undefined){insertcases.run(reason,targetID,target.tag,message.author.tag,message.author.id,"Warn")}
                    else {
                        //put another row of info into the database
                        insertcases.run(reason,targetID,target.tag,message.author.tag, message.author.id, "Warn")
                    }
                })

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
                bot.channels.get(logsChannelID).send(LogEmbed)
                break;

            case "cases":
                amount = 1
                //check unviable options and format target
                if(!message.member.hasPermission("MANAGE_MESSAGES")){message.channel.send("missing permissions"); return;}
                target = message.mentions.users.first();
                if(!target){message.channel.send("Specify a user")}
                target = target.toString().replace(/[\\<>@#&!]/g, "")


                //set primary embed
                const CasesEmbedRows = new RichEmbed()
                    .setColor('#000fff')
                    .setTitle(`This are the cases for ${message.mentions.users.first().tag}`)
                    .setThumbnail(targetID.avatarURL)
                //get info and send it
                db.all(casesquery, [target], (err, row) =>{
                    if(err){console.log(err);message.channel.send("error getting data"); return;}

                    row.forEach( function (rows){
                        let reasonC = rows.Reason
                        let moderator = rows.ModeratorTag
                        let type = rows.CaseType


                        CasesEmbedRows.addField(`:blue_circle: ${amount}: ${type}`,`Reason:  `+"`  " +reasonC+"  `" +"  By:   `  " + moderator + "  `")
                        amount++

                    })

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



                //get info
                db.get(dataquery,[message.author.id], (err, row) =>{
                    if (err) {console.log(err);return;}
                    if (row === undefined) {
                        message.channel.send("Error getting your messages"); return;
                    } else {
                        const messageN = row.Messages
                        leaderboardEmbed.addField(":blue_circle: your messages",`you have a total of ${messageN} messages in this server`)


                    }

                })
                amount = "1"

                db.all(leaderboardquery, (err, row) =>{
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
                //get the role mention
                const TargetRole = message.guild.roles.find( role => role.id == target)

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


                //get the subreddit
                target = message.content.split(" ")[1]
                amount = message.content.split(" ")[2]

                //get the post with all the data
                if(target == "random"){
                    const redditamount = Math.floor(Math.random() * subreddits.length)
                    target = subreddits[redditamount]
                }

                if(!amount){
                    amount = "hot"
                }


                reddit(target, amount).then(data =>{

                    //if nsfw and the channel is not nsfw dont send anything
                    if(data.nsfw === true && !message.channel.nsfw){
                        message.channel.send("no nsfw posts are allowed in this channel")
                        return;
                    }
                    if(!data.url.endsWith(".jpg") && !data.url.endsWith(".gif") && !data.url.endsWith(".png") && !data.url.endsWith(".webp")){
                        const redditembed = new RichEmbed ()
                            .setColor('#ff7b00')
                            .setTitle(data.title + `  |   :thumbsup: ${data.score}`)
                            .setDescription(`[Reddit Post](${data.permalink})` + ` || from ${data.subreddit}`)
                        message.channel.send(redditembed)
                        message.channel.send(data.url)
                        return;
                    }
                    //define the embed for the post
                    const redditembed = new RichEmbed ()
                        .setColor('#ff7b00')
                        .setTitle(data.title + `  |   :thumbsup: ${data.score}`)
                        .setImage(data.url)
                        .setDescription(`[Reddit Post](${data.permalink})` + ` | from ${data.subreddit}  | by u/${data.author}`)
                    message.channel.send(redditembed)})
                break;

            case "resetleaderboard":

                //check permissions
                if(!message.member.hasPermission("ADMINISTRATOR")){message.channel.send("missing permissions"); return;}

                //delete data
                db.run(`DELETE FROM data`);
                //send message
                message.channel.send("Leaderbord succesfully resetted! :thumbsup:")
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
                break;


        }
    }

})
//on a person editing a message
bot.on('messageUpdate', (oldMessage, newMessage) => {
    if(!newMessage.guild){return;}
    if (newMessage.author.bot){return;}


    const logsChannel = newMessage.guild.channels.find(channel => channel.name === "logs");
    if(!logsChannel){return;}
    const logsChannelID = logsChannel.id;
    //send embed with info
    if(newMessage.content != oldMessage){
        const EditedEmbed= new RichEmbed()
            .setColor('#0000ff')
            .setTitle("Message Edited")
            .addField( 'Old Content', "```" + ` ${oldMessage} `+"```", true )
            .addField( 'New Content', "```" + ` ${newMessage} `+"```", true )
            .addField("Channel", ` in <#${newMessage.channel.id}>`, true )
            .addField("Message Link", ` [Message](${newMessage.url})`)
            .addField("Sent by" , `<@${newMessage.author.id}>`)
            .setTimestamp()


        bot.channels.get(logsChannelID).send(EditedEmbed).catch(console.error)

    }
});
bot.on("messageDelete" , (messageDelete) => {

    const logsChannel = messageDelete.guild.channels.find(channel => channel.name === "logs");
    if(!logsChannel){return;}
    const logsChannelID = logsChannel.id;
    if (!messageDelete.guild) {return;}
    if (messageDelete.author.bot){return;}
    const DeletedEmbed= new RichEmbed()
        .setColor('#ff0000')
        .setTitle("Message Deleted")
        .addField( 'Message Content', "`" + ` ${messageDelete} `+"`", true )
        .addField("Channel", ` in <#${messageDelete.channel.id}>`, true )
        .addField("Sent by" , `<@${messageDelete.author.id}>`)
        .setTimestamp()

    bot.channels.get(logsChannelID).send(DeletedEmbed).catch(console.error)


})
bot.on("guildMemberAdd", (member) =>{

    //get the channel to send theembed
    const logsChannel = member.guild.channels.find(channel => channel.name.includes("logs"));
    const logsChannelID = logsChannel.id;

    //get the info and put it in the embed
    const guildMemberAddEmbed = new RichEmbed()
        .setColor('#000fff')
        .setTitle('New Member')
        .setTitle('A new user has joined the server')
        .addField('Name', "`" + member.name + "`" ,true)
        .addField('ID', "`" + member.id + "`" ,true)
        .addField('Created At', moment(member.createdAt).format("YYYY MM DD"))
        .setThumbnail(member.avatarURL)

    member.guild.channels.get(logsChannelID).send(guildMemberAddEmbed)

})

bot.login(token)


