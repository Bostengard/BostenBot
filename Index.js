//libraries
const Discord = require('discord.js.old');
const bot = new Discord.Client();
const config = require('./Config.json');
const token = config.token;
const moment = require('moment');


var date = new Date();
var FileLogDate = moment(date).format("YYYY.MM.DD")
const fs = require('fs');
const {RichEmbed} = require("discord.js.old");
const BadWords = ["nigga", "nigger" , "motherfucker", "cocksucker", "cock", "dick","rape"]

var logger = fs.createWriteStream(`./logs/logs${FileLogDate}.txt`, {
    flags: 'a' // 'a' means appending (old data will be preserved)
})
var writeLine = (line) => logger.write(`\n${line}`);


bot.on('ready', () => {



    var ReadyDate = moment(date).format('DD MM YYYY hh:mm:ss')
    console.log(`Logged in as ${bot.user.tag}!`);
    writeLine(ReadyDate +` Logged in as ${bot.user.tag}!`)

});


//             default log date and logging structure
//
//             Currentdate = new Date()
//             logDate = moment(Currentdate).format('DD MM YYYY hh:mm:ss')
//
//             writeLine(logDate + " Helping " + "||" + message.author.tag + "||" + message.guild.name)
//             bot.channels.get(logsChannelID).send( "Helping " + " | " + message.author.tag + " | " + message.guild.name);
//             console.log(logDate + " Helping " + "||" + message.author.tag + "||" + message.guild.name)





bot.on('message', message => {

    var Currentdate = new Date()
    var logDate = moment(Currentdate).format('DD MM YYYY hh:mm:ss')

    const logsChannel = message.guild.channels.find(channel => channel.name.includes("logs"));
    const logsChannelID = logsChannel.id;

    if (message.author.bot){return;}

    if (!message.member.hasPermission("ADMINISTRATOR")) {
        for (var i = 0; i < BadWords.length; i++) {
            if (message.content.includes(BadWords[i])) {

                message.delete()
                message.channel.send("that words is not acccepted")
                bot.channels.get(logsChannelID).send(logDate + " message deleted: " + "`" + message + "`" + " contained " + "`" + BadWords[i] + "`" + " in " + `<#${message.channel.id}>`)
                return;
            }
        }
    }




    if(message.content.includes(config.prefix)){
    let args = message.content.substring(config.prefix.length).split(" ");

    switch (args[0]) {

        case "help":
            Currentdate = new Date()
            logDate = moment(Currentdate).format('DD MM YYYY hh:mm:ss')

            const HelpEmbed = new RichEmbed()
                .setColor('#38F20A')
                .setTitle("Lord Bostengard's Commands")
                .addField( 'Aboutme', "Shows a full-of-info embed of yourself or in case of mentioning someone of that person `?aboutme < mention >`")
                .addField( 'Delete', "deletes a custom amount(max 100) of messages in a channel `?delete < quantity >`")
                .addField( 'Spam', "Sends a custom amount of messages in a channel (its slow) `?spam < quantity >`")
                .addField( 'warn', "Warns a member and sends a dm to the mentioned user `?warn < mention > < reason >`")
                .addField( 'kick', "Kicks a member and sends a dm to the mentioned user `?kick < mention > < reason >`")
                .addField( 'softban', "Bans and unbans a member and sends a dm to the mentioned user `?softban < mention > < reason >`")
                .addField( 'ban', "Bans a member and sends a dm to the mentioned user `?ban < mention > < reason >`")
                .addField( 'Slowmode', "Changes the slowmode in a channel `?slowmode < #channel > < reason >`")
                .setTimestamp()

            message.channel.send(HelpEmbed).catch(console.error)
            writeLine(logDate + " Helping " + "||" + message.author.tag + "||" + message.guild.name)
            bot.channels.get(logsChannelID).send(logDate +  " Helping " + " | " + message.author.tag + " | " + message.guild.name + `<#${message.channel.id}>`).catch(console.error)
            console.log(logDate + " Helping " + "||" + message.author.tag + "||" + message.guild.name)
            break;

        case "random":
            Currentdate = new Date()
            logDate = moment(Currentdate).format('DD MM YYYY hh:mm:ss')

            const amount = message.content.split(" ")[1];
            const Number = Math.floor(Math.random() * amount)

            const RandomNumberEmbed = new RichEmbed()
                .setColor('#38F20A')
                .setTitle("RANDOM NUMBER")
                .addField('Your Random Number is :', Number)
                .setTimestamp()
            if(isNaN(amount)){
                message.reply("thats not a number")
                return;
            }else{
                message.channel.send(RandomNumberEmbed);
                writeLine(logDate + " Random " + amount + " || " + message.author.tag + " || " + message.guild.name)
                bot.channels.get(logsChannelID).send(logDate +  " Random " + amount +  " | " + message.author.tag + " | " + message.guild.name + `<#${message.channel.id}>`).catch(console.error)
                console.log(logDate + " Random " + amount + " || " + message.author.tag + " || " + message.guild.name)
            }

            break;

        case "aboutme":
            Currentdate = new Date()
            logDate = moment(Currentdate).format('DD MM YYYY hh:mm:ss')
            const AboutmeTarget = message.mentions.users.first()
            const HighestRole = message.member.highestRole.id

            const AboutEmbed = new RichEmbed()
                .setColor('#38F20A')
                .setTitle("User Info")
                .addField( 'Created', message.author.createdAt)
                .addField( 'User ID', message.author.id,true)
                .addField('Highest Role', `<@&${HighestRole}>`,true)
                .addField( 'Avatar',"here's your avatar")
                .setImage(message.author.avatarURL)
                .setTimestamp()

            const AboutNoEmbed = new RichEmbed()
                .setColor('#38F20A')
                .setTitle("User Info")
                .addField( 'Created', AboutmeTarget.createdAt)
                .addField( 'User ID', AboutmeTarget.id,true)
                .addField( 'Avatar',"here's your avatar")
                .setImage(AboutmeTarget.avatarURL)
                .setTimestamp()


            writeLine(logDate + " About me "  + " || " + message.author.tag + " || " + message.guild.name)
            bot.channels.get(logsChannelID).send(logDate +  " About me " + " | " + message.author.tag + " | " + message.guild.name + " | " + `<#${message.channel.id}>`).catch(console.error)
            console.log(logDate + " About me"  + " || " + message.author.tag + " || " + message.guild.name)

            if(!AboutmeTarget){
                message.channel.send(AboutEmbed);
            } else {message.channel.send(AboutNoEmbed)}
            break;

        case "delete":
            Currentdate = new Date()
            logDate = moment(Currentdate).format('DD MM YYYY hh:mm:ss')

            const Delamount = message.content.split(" ")[1];

            const DeleteEmbed = new RichEmbed()
                .setColor('#19ff00')
                .addField( 'Deleted', Delamount)
                .addField( 'Deleted by', message.author.tag)
                .setTimestamp()
            if(isNaN(Delamount)){
                message.reply("thats not a number")
                return;
            }
            if(!Delamount)
            {
                message.reply(`<amount>`);
                return;
            }
            if(!message.member.hasPermission("MANAGE_MESSAGES"))
            {
                message.channel.send('You have no permissions to do that');

                return;
            }
            message.channel.bulkDelete(Delamount)
            message.channel.send(DeleteEmbed)
            writeLine(logDate + " Deleted "  + Delamount + " || " + message.author.tag + " || " + message.guild.name)
            bot.channels.get(logsChannelID).send(logDate +  " Deleted " + Delamount +  " | " + message.author.tag + " | " + message.guild.name + " | " + `<#${message.channel.id}>`).catch(console.error)
            console.log(logDate + " Deleted "  + Delamount +  " || " + message.author.tag + " || " + message.guild.name)

            break;

        case "spam":
            Currentdate = new Date()
            logDate = moment(Currentdate).format('DD MM YYYY hh:mm:ss')

            const Spamamount = message.content.split(" ")[1];
            if (isNaN(Spamamount)) {
                message.reply("that's not a number")
                return;
            }else {
                if (!Spamamount) {
                    message.reply(`<amount>`);
                    return;
                }
                if (!message.member.hasPermission("MANAGE_MESSAGES")) {
                    message.channel.send('You have no permissions to do that');
                    return;
                }
                for (let a = 0; a < Spamamount; a++) {
                    message.channel.send("spamming cause " + message.author.tag + " said it mad?")
                }
            }


            writeLine(logDate + " Spammed "  + Spamamount + " || " + message.author.tag + " || " + message.guild.name)
            bot.channels.get(logsChannelID).send(logDate +  " Spammed " + Spamamount +  " | " + message.author.tag + " | " + message.guild.name + " | " + `<#${message.channel.id}>`).catch(console.error)
            console.log(logDate + " Spammed "  + Spamamount +  " || " + message.author.tag + " || " + message.guild.name)

            break;

        case "kick":
            Currentdate = new Date()
            logDate = moment(Currentdate).format('DD MM YYYY hh:mm:ss')

            const target = message.mentions.users.first();
            const reason = args.slice(2).join(' ');


            const KickEmbed = new RichEmbed()
                .setColor('#ff0000')
                .addField( 'Kicked', target.tag)
                .addField( 'Kicked by', message.author.tag)
                .setTimestamp()

            const NoKickEmbed= new RichEmbed()
                .setColor('#ff0000')
                .addField( 'Cant kick', 'u don\'t have permission to do that')
                .setTimestamp()

            if (message.member.hasPermission("KICK_MEMBERS")) {
                if (target) {
                    const memberTarget = message.guild.members.get(target.id);
                    memberTarget.send( "you've been kicked from " + message.guild.name + ". Reason : " + reason).catch(console.error)
                    memberTarget.kick().catch(console.error);

                    message.channel.send(KickEmbed).catch(console.error);
                } else {
                    message.channel.send(NoKickEmbed).catch(console.error);

                }
            }

            writeLine(logDate + " Kicked "  + target.tag + " || " + message.author.tag + " || " + message.guild.name + " || " + reason )
            bot.channels.get(logsChannelID).send(logDate +  " Kicked "  + target.tag + " | " + message.author.tag + " | " + message.guild.name + " | " + `<#${message.channel.id}>` + " || " + reason ).catch(console.error)
            console.log(logDate + " Kicked "  + target.tag +  " || " + message.author.tag + " || " + message.guild.name + reason )
            break;

        case "ban":
            Currentdate = new Date()
            logDate = moment(Currentdate).format('DD MM YYYY hh:mm:ss')

            const Bantarget = message.mentions.users.first();
            const Banreason = args.slice(2).join(' ');

            const BanEmbed = new RichEmbed()
                .setColor('#ff0000')
                .addField( 'Banned', Bantarget.tag)
                .addField( 'Banned by', message.author.tag)
                .setTimestamp()

            const NoBanEmbed= new RichEmbed()
                .setColor('#ff0000')
                .addField( 'Can\' t ban', 'u don\'t have permission to do that')
                .setTimestamp()

            if (message.member.hasPermission("BAN_MEMBERS")) {
                if (Bantarget) {
                    const memberTarget = message.guild.members.get(Bantarget.id);
                    memberTarget.send( "you've been Banned " + message.guild.name + ". Reason : " + Banreason).catch(console.error)
                    memberTarget.ban().catch(console.error);
                    message.channel.send(BanEmbed);

                    writeLine(logDate + " Banned "  + Bantarget.tag + " || " + message.author.tag + " || " + message.guild.name + " || " + Banreason )
                    bot.channels.get(logsChannelID).send(logDate +  " Banned "  + Bantarget.tag + " | " + message.author.tag + " | " + message.guild.name + " | " + `<#${message.channel.id}>` + " || " + Banreason ).catch(console.error)
                    console.log(logDate + " Banned "  + Bantarget.tag +  " || " + message.author.tag + " || " + message.guild.name + Banreason )

                } else {
                    message.channel.send(NoBanEmbed);

                }
            }

            break;

        case "softban":
            const SoftBantarget = message.mentions.users.first();
            const SoftBanreason = args.slice(2).join(' ');

            const SoftBanEmbed = new RichEmbed()
                .setColor('#ff0000')
                .addField( 'Banned', SoftBantarget.tag)
                .addField( 'Banned by', message.author.tag)
                .setTimestamp()

            const SoftNoBanEmbed= new RichEmbed()
                .setColor('#ff0000')
                .addField( 'Can\' t softban', 'u don\'t have permission to do that')
                .setTimestamp()

            if (message.member.hasPermission("BAN_MEMBERS")) {
                if (SoftBantarget) {
                    const memberTarget = message.guild.members.get(SoftBantarget.id);
                    memberTarget.send( "you've been SoftBanned " + message.guild.name + ". Reason : " + SoftBanreason).catch(console.error)
                    memberTarget.ban().catch(console.error);
                    message.guild.unban(memberTarget).catch(console.error);
                    message.channel.send(SoftBanEmbed);

                    writeLine(logDate + " SoftBanned "  + SoftBantarget.tag + " || " + message.author.tag + " || " + message.guild.name + " || " + SoftBanreason )
                    bot.channels.get(logsChannelID).send(logDate +  " SoftBanned "  + SoftBantarget.tag + " | " + message.author.tag + " | " + message.guild.name + " | " + `<#${message.channel.id}>` + " || " + SoftBanreason ).catch(console.error)
                    console.log(logDate + " SoftBanned "  + SoftBantarget.tag +  " || " + message.author.tag + " || " + message.guild.name + SoftBanreason )

                } else {
                    message.channel.send(SoftNoBanEmbed);

                }
            }
            break;

        case "slowmode" :
            Currentdate = new Date()
            logDate = moment(Currentdate).format('DD MM YYYY hh:mm:ss')
            const slowmodeChannel = message.mentions.channels.first()
            const Slowmodeamount = message.content.split(" ")[1];

            const SlowmodeEmbed = new RichEmbed()
                .setColor('#06ff00')
                .addField( 'Slowmode changed to', Slowmodeamount + "s")
                .addField( 'Changed by', message.author.tag)
                .setTimestamp()

            const NoSlowmodeEmbed= new RichEmbed()
                .setColor('#ff0000')
                .addField( 'Can\'t change slowmode', 'u don\'t have permission to do that')
                .setTimestamp()
            if (isNaN(Slowmodeamount)){
                message.reply("only numbers are allowed")
                return;
            }
            if (message.member.hasPermission("MANAGE_CHANNELS")) {

                if (!slowmodeChannel) {
                    message.channel.setRateLimitPerUser(Slowmodeamount);
                    message.channel.send(SlowmodeEmbed);

                    writeLine(logDate + " Slowmode changed: " + Slowmodeamount + "s" + " || " + message.author.tag + " || " + message.guild.name + " || " + message.channel.name)
                    bot.channels.get(logsChannelID).send(logDate + " Slowmode changed: " + Slowmodeamount + "s" + " | " + message.author.tag + " | " + message.guild.name + " | " + `<#${message.channel.id}>` + " || ").catch(console.error)
                    console.log(logDate + " Slowmode changed: " + Slowmodeamount + "s" + " || " + message.author.tag + " || " + message.guild.name + " || " + message.channel.name)
                } else{
                    slowmodeChannel.setRateLimitPerUser(Slowmodeamount)
                    message.channel.send(SlowmodeEmbed);
                    slowmodeChannel.send(SlowmodeEmbed)

                    writeLine(logDate + " Slowmode changed: " + Slowmodeamount + "s" + " || " + message.author.tag + " || " + message.guild.name + " || " + slowmodeChannel.name)
                    bot.channels.get(logsChannelID).send(logDate + " Slowmode changed: " + Slowmodeamount + "s" + " | " + message.author.tag + " | " + message.guild.name + " | " + `<#${slowmodeChannel.id}>` + " || ").catch(console.error)
                    console.log(logDate + " Slowmode changed: " + Slowmodeamount + "s" + " || " + message.author.tag + " || " + message.guild.name + " || " + slowmodeChannel.name)

                }
            } else {
                message.channel.send(NoSlowmodeEmbed)
            }
            break;

        case "warn":
            Currentdate = new Date()
            logDate = moment(Currentdate).format('DD MM YYYY hh:mm:ss')

            const Warntarget = message.mentions.users.first();
            const Warnreason = args.slice(2).join(' ');

            const WarnEmbed = new RichEmbed()
                .setColor('#ff0000')
                .addField( 'Warned', Warntarget.tag)
                .addField( 'Warned by', message.author.tag)
                .setTimestamp()

            const NoWarnEmbed= new RichEmbed()
                .setColor('#ff0000')
                .addField( 'Can\' t Warn', 'u don\'t have permission to do that')
                .setTimestamp()

            if (message.member.hasPermission("MANAGE_MESSAGES")) {
                if (Warntarget) {
                    message.channel.send(WarnEmbed);
                    Warntarget.send("you've been Warned in " + message.guild.name + ". Reason : " + Warnreason).catch(console.error)

                    writeLine(logDate + " Warned: "  + Warntarget.tag  + " || " + message.author.tag + " || " + message.guild.name + " || " + message.channel.name + " || " + Warnreason)
                    bot.channels.get(logsChannelID).send(logDate +  " Warned: "  + Warntarget.tag + " | " + message.author.tag + " | " + message.guild.name + " | " + `<#${message.channel.id}>` + " || " + Warnreason).catch(console.error)
                    console.log(logDate + " Warned: "  + Warntarget.tag + " || " + message.author.tag + " || " + message.guild.name + " || " + message.channel.name + " || " + Warnreason)

                }else {
                    message.channel.send("you forgot to mention a user")
                }


            } else {
                message.channel.send(NoWarnEmbed)
            }
            break;

        case "servercount":

            message.channel.send(`Currently in ${bot.guilds.size} servers`)
            break;

        case "membercount":
            var memberCount = message.guild.members.filter(member => !member.user.bot).size;
            message.channel.send(`${message.guild.name} has ${memberCount} members!`);
    }}

});
bot.on('messageUpdate', (oldMessage, newMessage) => {
    if (!newMessage.guild) return;
    if (newMessage.author.bot){return;}
    const Currentdate = new Date()
    const logDate = moment(Currentdate).format('DD MM YYYY hh:mm:ss')

    const logsChannel = newMessage.guild.channels.find(channel => channel.name === "logs");
    const logsChannelID = logsChannel.id;
    if (!newMessage.member.hasPermission("ADMINISTRATOR")) {
        for (var i = 0; i < BadWords.length; i++) {
            if (newMessage.content.includes(BadWords[i])) {

                newMessage.delete()
                newMessage.channel.send("that words is not acccepted")
                bot.channels.get(logsChannelID).send(logDate + " message deleted: " + "`" + newMessage + "`" + " contained " + "`" + BadWords[i] + "`" + " in " + `<#${newMessage.channel.id}>`)
                return;
            }
        }
    }

    if(newMessage.content != oldMessage){
        const EditedEmbed= new RichEmbed()
            .setColor('#0000ff')
            .setTitle("Message Edited")
            .addField( 'Old Content', "```" + ` ${oldMessage} `+"```", true )
            .addField( 'New Content', "```" + ` ${newMessage} `+"```", true )
            .addField("Channel", ` in <#${newMessage.channel.id}>`, true )
            .addField("Message Link", newMessage.url)
            .addField("Sent by" , `<@${newMessage.author.id}>`)
            .setTimestamp()


        bot.channels.get(logsChannelID).send(EditedEmbed).catch(console.error)

    }
});

bot.on("messageDelete" , (messageDelete) => {

    const logsChannel = messageDelete.guild.channels.find(channel => channel.name === "logs");
    const logsChannelID = logsChannel.id;
    if (!messageDelete.guild) return;
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

bot.login(token);