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
                .addChoice('level-channel','level-channel'))

        .addStringOption(option => option
            .setName('id')
            .setDescription('Id of the selected Setting')
            .setRequired(true)),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)){ interaction.reply({content:'Missing Permissions', ephemeral:true})}
        let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
        db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
        db.run(`CREATE TABLE IF NOT EXISTS ServerSettings(WelcomeChannel VARCHAR(64),LogsChannel VARCHAR(64),WelcomeRole VARCHAR(64), LevelChannel VARCHAR(64))`)
        let settingRaw = interaction.options.getString('setting')
        let setting = interaction.options.getString('setting')
        if(setting === "welcome-channel"){
            setting = "WelcomeChannel"
        }else if (setting === 'welcome-role'){
            setting = "WelcomeRole"
        }else if(setting === 'logs-channel'){
            setting = "LogsChannel"
        }else{
            setting = 'LevelChannel'
        }
        let ID = interaction.options.getString('id')
        db.run(`UPDATE ServerSettings SET ${setting} = ?`,[ID])
        return interaction.reply({content: `Sucessfully updated ${settingRaw}`})
    },
};
