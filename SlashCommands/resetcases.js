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
        db.run(`CREATE TABLE IF NOT EXISTS ServerSettings(WelcomeChannel VARCHAR(64),LogsChannel VARCHAR(64),WelcomeRole VARCHAR(64), LevelChannel VARCHAR(64))`)
        const user = interaction.options.getUser('user')
        try{
            db.run(`DELETE FROM cases WHERE UserID = ${user.id}`)
        }catch{
            return interaction.reply({content:"An error happened while executing that command", ephemeral: true})
        }

        await interaction.reply({content:"User cases successfully resetted", ephemeral: true})
        if(client.logs === 0){return;}
        const Logembed = new MessageEmbed()
            .setTitle('User Cases Resetted')
            .addField('User', user.toString())
            .addField('Resetted by', interaction.user.toString())
        let ID;
        let channel;
        db.get(`SELECT * FROM ServerSettings`, async (err,row) =>{
            if(err) return interaction.reply({content: "There was an error while executing the command",ephemeral: true})
            if(row === undefined) return db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?)`,[0,0,0,0])
            ID = row.LogsChannel
            try{
                await interaction.guild.channels.fetch(`${ID}`)
                channel  = await interaction.guild.channels.cache.get(ID)
                channel.send({embeds: [logEmbed]})
            }
            catch{
            }
        })


    },
};
