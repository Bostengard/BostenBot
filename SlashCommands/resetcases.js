const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require("path");
const sqlite = require('sqlite3').verbose()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-cases')
        .setDescription('Delets all the cases for a user')
        .addUserOption(option => option.setName('user').setDescription('the innocent person').setRequired(true)),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) return  interaction.reply({content: "missing permissions", ephemeral: true})
        let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
        db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
        const user = interaction.options.getUser('user')
        try{
            db.run(`DELETE FROM cases WHERE UserID = ${user.id}`)
        }catch{
            return interaction.reply({content:"An error happened while executing that command", ephemeral: true})
        }

        return interaction.reply({content:"User cases successfully resetted", ephemeral: false})



    },
};
