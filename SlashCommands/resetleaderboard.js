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
        client.CreateDatabase(interaction.guild.id)
        let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        const user = interaction.options.getUser('user')
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('Resetted Leaderboard')

        db.run(`DELETE FROM data`)
        await interaction.reply({embeds: [embed]})

        const logEmbed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('Leaderboard Resetted')
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
