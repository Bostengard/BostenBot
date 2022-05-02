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
                .addChoice('welcome-channel',"WelcomeChannel")
                .addChoice('welcome-role', 'WelcomeRole')
                .addChoice('logs-channel','LogsChannel')
                .addChoice('level-channel','LevelChannel')
                .addChoice('welcome-image', 'WelcomeImage'))
        .addStringOption(option => option
            .setName('id')
            .setDescription('Id of the selected Setting')
            .setRequired(true)),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)){ interaction.reply({content:'Missing Permissions', ephemeral:true})}
        client.CreateDatabase(interaction.guild.id)
        let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        let setting = interaction.options.getString('setting')
        let ID = interaction.options.getString('id')
        db.run(`UPDATE ServerSettings SET ${setting} = ?`,[ID])
        return interaction.reply({content: `Sucessfully updated ${setting}`})
    },
};
