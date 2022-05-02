const { SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed,Permissions } = require('discord.js');
const path = require('path')
const sqlite = require('sqlite3').verbose()


module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Deletes a number (max99) of messages')
        .addIntegerOption(option => option.setName('messages').setDescription('the message to be deleted').setRequired(true)),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return interaction.reply({content: "Missing Permissions", ephemeral: true})
        interaction.deferReply()
        let value = interaction.options.getInteger('messages')
        if(value > 99){return interaction.reply({content: "Max 99 Messages", ephemeral: true})}

        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle(`Deleted ${value} messages`)
            .addField(`Deleted By`, `${interaction.user.toString()}`)
            .setTimestamp()
        try{
            await interaction.channel.bulkDelete(value)
        }catch {
            return await interaction.editReply("Messages are to old to be deleted")
        }
        interaction.editReply({embeds: [embed]})
        client.CreateDatabase(interaction.guild.id)
        let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        let ID;
        let channel;
        db.get(`SELECT * FROM ServerSettings`, async (err,row) =>{
            if(err) return interaction.reply({content: "There was an error while executing the command",ephemeral: true})
            if(row === undefined) return db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?,?)`,[0,0,0,0,0])
            ID = row.LogsChannel
            try{
                await interaction.guild.channels.fetch(`${ID}`)
                channel  = await interaction.guild.channels.cache.get(ID)
                channel.send({embeds: [embed]})
            }
            catch{
                return false;
            }
        })
    },
};
