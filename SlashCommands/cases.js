const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions, MessageActionRow, MessageButton,} = require('discord.js');
const path = require("path");
const sqlite = require('sqlite3').verbose()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cases')
        .setDescription('Shows all the cases for a user')
        .addUserOption(option => option.setName('user').setDescription('Who would you like to investigate').setRequired(true)),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {return  interaction.reply({content: "missing permissions",ephemeral: true})}
        client.CreateDatabase(interaction.guild.id)
        let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)

        const BackID = "back"
        const ForwardID = `forward`
        const BackButton = new MessageButton({
            style: 'PRIMARY',
            label: 'Back',
            emoji: '⬅️',
            customId: BackID
        })
        const ForwardButton = new MessageButton({
            style: 'PRIMARY',
            label: 'Forward',
            emoji: '➡️',
            customId: ForwardID
        })

        const user = interaction.options.getUser('user')

        await db.all(`SELECT * FROM cases WHERE UserID = ?`,[user.id], async (err,row) =>{
            if(err){return interaction.editReply('An error happened *(cry about it)*')}
            if(row === undefined){
                return interaction.editReply("this user has no cases")
            }
            let gEmbed = async (start) =>{
                const current = row.slice(start,start + 7)
                return new MessageEmbed({
                    title: `Showing ${user.tag}'s cases`,
                    fields: await Promise.all(
                        current.map(async punishment =>({
                            name: `**${punishment.CaseType}**`,
                            value: `Reason: ${punishment.Reason}\nBy: ${punishment.ModeratorTag}\n At: ${punishment.Date}`
                        }))
                    ),
                })
                    .setFooter({text:`Viewing Cases ${start + 1}-${start + current.length} out of ${row.length})`})
            }

            const canFitOnOnePage = row.length <= 10
            const embedMessage =  await interaction.reply({embeds: [await gEmbed(0)], components: canFitOnOnePage ? [] : [new MessageActionRow({components: [ForwardButton]})], fetchReply: true})

            if(canFitOnOnePage) return;

            const collector = embedMessage.createMessageComponentCollector({filter: ({user}) => user.id === interaction.user.id})

            let currentIndex = 0;

            collector.on('collect', async interaction => {
                interaction.customId === BackID ? (currentIndex -= 10) : (currentIndex += 10)
                await interaction.update({
                    embeds: [await gEmbed(currentIndex)],
                    components: [new MessageActionRow({
                        components: [
                            ...(currentIndex ? [BackButton] : []),
                            ...(currentIndex + 10 < row.length ? [ForwardButton] : [])
                        ]
                    })]
                })
            })

        })
    },
};
