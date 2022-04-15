const { SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
let sqlite = require('sqlite3')
const path = require("path");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverconfig')
        .setDescription('Shows the current settings for the server'),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)){
            return interaction.reply({content: "Missing permissions!", ephemeral: true})
        }
        client.CreateDatabase(interaction.guild.id)
        let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        db.get(`SELECT * FROM ServerSettings`, async (err,row) =>{
            if(err) return interaction.reply({content: "an unexpected error occurred!", ephemeral:true})
            if(row === undefined) return db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?,?)`, [0,0,0,0,"0"])
            //Channel
            let WelcomeChannel = row.WelcomeChannel
            WelcomeChannel = interaction.guild.channels.cache.get(WelcomeChannel)
            if(!WelcomeChannel){ WelcomeChannel = "`No Channel`"} else {WelcomeChannel  = WelcomeChannel.toString()}
            //logs
            let LogsChannel = row.LogsChannel
            LogsChannel = interaction.guild.channels.cache.get(LogsChannel)
            if(!LogsChannel){ LogsChannel = " `No channel`"} else {LogsChannel = LogsChannel.toString()}
            //Welcome Role
            let WelcomeRole = row.WelcomeRole
            WelcomeRole = interaction.guild.roles.cache.get(WelcomeRole)
            if(!WelcomeRole){WelcomeRole = "`No Role`"} else { WelcomeRole = WelcomeRole.toString()}
            //Levels
            let LevelsChannel = row.LevelChannel
            LevelsChannel = interaction.guild.channels.cache.get(LevelsChannel)
            if(!LevelsChannel){ LevelsChannel = "`no channel`"}{ LevelsChannel = LevelsChannel.toString()}
            //Image
            let WelcomeImage = row.WelcomeImage
            let a = WelcomeImage.toString()
            const Embed = new MessageEmbed()
                .setTitle('Server Settings')
                .setDescription(`Welcome Channel: ${WelcomeChannel}\n
                                 Logs Channel: ${LogsChannel}\n
                                 Welcome Role: ${WelcomeRole}\n
                                 Levels Channel: ${LevelsChannel}\n 
                                 Image:`)
                if(a.includes("http")){
                    Embed.setImage(WelcomeImage)
                }

            return interaction.reply({embeds:[Embed]})
        })
    },
};
