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
        client.CreateDatabase(interaction.guild.id)
        let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
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
