const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed,Permissions } = require('discord.js');
const path = require('path')
const sqlite = require('sqlite3').verbose()
module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-settings')
        .setDescription('Change the servers settings')
        .addStringOption(option =>
            option.setName('setting')
                .setRequired(true)
                .setDescription('The setting you want to change')
                .addChoice('welcome-channel',"welcome-channel")
                .addChoice('welcome-role', 'welcome-role')
                .addChoice('logs-channel','logs-channel')
                .addChoice('level-channel','level-channel')
                .addChoice('welcome-image', 'welcome-image'))
        .addStringOption(option => option
            .setName('id')
            .setDescription('Id of the selected Setting')
            .setRequired(true)),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)){ interaction.reply({content:'Missing Permissions', ephemeral:true})}
        client.CreateDatabase(interaction.guild.id)
        let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        let settingRaw = interaction.options.getString('setting')
        let setting = interaction.options.getString('setting')
        if(setting === "welcome-channel"){
            setting = "WelcomeChannel"
        }else if (setting === 'welcome-role'){
            setting = "WelcomeRole"
        }else if(setting === 'logs-channel'){
            setting = "LogsChannel"
        }else if(setting === 'level-channel'){
            setting = 'LevelChannel'
        }else{
            setting = 'WelcomeImage'
        }
        let ID = interaction.options.getString('id')
        db.run(`UPDATE ServerSettings SET ${setting} = ?`,[ID])
        return interaction.reply({content: `Sucessfully updated ${settingRaw}`})
    },
};
