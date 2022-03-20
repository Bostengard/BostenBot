const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite = require('sqlite3')
const path = require('path')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Leaderboard of The server!'),
    async execute(interaction,client) {
        await interaction.deferReply({})
        let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
        db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
        db.run(`CREATE TABLE IF NOT EXISTS settings(MusicBool INTEGER DEFAULT 1, MathBool INTEGER DEFAULT 1, RedditBool INTEGER DEFAULT 1, LevelsBool INTEGER DEFAULT 1)`)
        await interaction.guild.fetch()
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle(`${interaction.guild.name}'s Leaderboard`)
            .setDescription('Top 3 Users')
            .setThumbnail(interaction.guild.iconURL({format:"png", dynamic: true, size:2048}))

        await db.get(`SELECT * FROM data WHERE UserID = ?`, [interaction.user.id], async (err,row) =>{
            if(err){return interaction.reply({content:"There was an error getting the leaderboard", ephemeral: true})}
            if(row === undefined){return interaction.reply}
            embed.setDescription('you have a total of ' + row.Messages + " messages")
        })
        await db.all(`SELECT * FROM data ORDER BY Messages DESC LIMIT 3`, async (err,row) => {
            if(err){return interaction.reply({content:"There was an error getting the leaderboard", ephemeral: true})}
            let amount = 1
            row.forEach(function (row){
                embed.addField(`Top ${amount}`, `${row.UserTag} with ${row.Messages}`)
                amount++
            })
            return interaction.editReply({embeds: [embed]})
        })
    },
};
