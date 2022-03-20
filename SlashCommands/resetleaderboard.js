const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require("path");
const sqlite = require('sqlite3').verbose()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-leaderboard')
        .setDescription('Shows all the cases for a user'),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({content:"Missing permissions", ephemeral: true})
        let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
        db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
        db.run(`CREATE TABLE IF NOT EXISTS settings(MusicBool INTEGER DEFAULT 1, MathBool INTEGER DEFAULT 1, RedditBool INTEGER DEFAULT 1, LevelsBool INTEGER DEFAULT 1)`)
        const user = interaction.options.getUser('user')
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('Resetted Leaderboard')

        db.run(`DELETE FROM data`)
        await interaction.reply({embeds: [embed]})

        let channel = interaction.guild.channels.cache.find(a=> a.name.includes("logs"))
        if(!channel){return;}
        const logEmbed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('Leaderboard Resetted')
            .addField('Resetted by', interaction.user.toString())
        return channel.send({embeds: [logEmbed]})

    },
};
