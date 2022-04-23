    const { SlashCommandBuilder } = require('@discordjs/builders');
    const { MessageEmbed } = require('discord.js');
    module.exports = {
        data: new SlashCommandBuilder()
            .setName('help')
            .setDescription('The mighty help command')
            .addStringOption(option =>
                option.setName('module')
                    .setDescription('The command module')
                    .addChoice('user',"user")
                    .addChoice('moderation', 'moderation')
                    .addChoice('math','math')
                    .addChoice('music', 'music')
                    .addChoice('settings', 'settings')),
        async execute(interaction,client) {

            await client.user.fetch
            const value = interaction.options.getString('module')
            if(!value) {
                const embed = new MessageEmbed()
                    .setColor('#38F20A')
                    .setTitle("Bostenbot")
                    .setURL('https://bostengard.github.io/BostenBot/index.html')
                    .setDescription("SlashCommands!")
                    .addField('Help Subcommands', `\`help user\`:\n Shows info for the commands that users without any permission can execute \n\n \`help moderation\`:\n Shows info for the commands that users with elevated permissions can execute \n\n  \`help math\`: \n Shows help for the math command\n\n \`help music\`\n Shows help for the music commands\n\n \`help settings\`: \n Shows help of the setting commands `, true)
                    .setTimestamp()
                    .setFooter({text: "bot created by Bostengard#4691",iconURL: client.user.avatarURL({format: "jpg",size:2048,dynamic: true}) || client.user.defaultAvatarURL})
                return await interaction.reply({embeds: [embed], ephemeral:false})
            } else if (value.toLowerCase() === "user"){
                const embed = new MessageEmbed()
                    .setColor('#38F20A')
                    .setTitle("User Commands!")
                    .setDescription(`\`aboutme\`: Shows info of a user\n \`random\`: says a random number \n \`leaderboard\`: Shows a message leaderboard of the server\n \`serverinfo\`: shows info of the server\n \`roleinfo\`: shows info for a role\n \`math\` resolves ur math operations\n \`reddit\`: searches a meme on reddit or on a specific subreddit of your choice\n`)
                    .setTimestamp()
                    .setFooter({text: "bot created by Bostengard#4691",iconURL: client.user.avatarURL({format: "jpg",size:2048,dynamic: true}) || client.user.defaultAvatarURL})
                return await interaction.reply({embeds: [embed], ephemeral: false})
            }else if (value.toLowerCase() === "moderation"){
                const embed = new MessageEmbed()
                    .setColor('#38F20A')
                    .setTitle("Moderation Commands!")
                    .setDescription(`\`delete\`: deletes an amount of messages
                                     \`warn\`: warns a user
                                     \`kick\`: kicks a user
                                     \`mute\`: mutes a user for a certain amount of time
                                     \`unmute\`: unmutes a mute user
                                     \`ban\`: bans a user
                                     \`unban\`: unbans a user
                                     \`slowmode\`: changes the slowmode on a channel
                                     \`cases\`: shows a users cases
                                     \`resetcases\`: resets the cases for a user
                                     \`resetleaderboard\`:resets the server leaderboard
                                     \`mute/unmutevoice\`: mutes/unmutes a voice channel
                                     \`serverconfig\`: shows the current server configuration
                                     \`poll\`: creates a poll of up to 10 options`)
                    .setFooter({text: "bot created by Bostengard#4691",iconURL: client.user.avatarURL({format: "jpg",size:2048,dynamic: true}) || client.user.defaultAvatarURL})
                    .setTimestamp()
                return await interaction.reply({embeds: [embed], ephemeral: false})
            } else if(value.toLowerCase() === "math"){
                const embed = new MessageEmbed()
                    .setColor('#38F20A')
                    .setTitle("Math Commands")
                    .addField('Basic Operations', "Plus: `x + y` Minus: `x - y` Multiply: `x * y` Divide: `X / y`  ")
                    .addField('Functions and constants', 'Round: `round( x , < decimals to round >)` \n Atan2:  `atan2(x,y)` \n Logarithm: `log(x)` \n Power: `pow( < base >, < power >` \n Square root: `sqrt(x)` \n Derivative: `derivative( x , y )`')
                    .addField('Unit change', ' `x < initial > to < final >` Example: `?math 10 inch to cm`')
                    .addField('Other Operations', 'Cos: `cos(x)` \n Tan: `tan(x)` \n Determinant: `det([matrix values])` Example: `det([-1, 2; 3, 1])` ')
                    .addField('Usefull Info', 'Number pi: `pi` Example : ` 1 * pi` \n Degree: `deg` Example: `cos(45 deg)` \n Simplify: `simplify(x)` Example: `simplify(3 + 2 / 4) = "7 / 2 "`')
                    .addField('Official documentation', "[Constants](https://mathjs.org/docs/reference/constants.html) , [Main Page](https://mathjs.org/docs/index.html)")
                    .setTimestamp()
                return await interaction.reply({embeds: [embed], ephemeral: false})
            } else if(value.toLowerCase() === "music"){
                const embed = new MessageEmbed()
                    .setColor('#38F20A')
                    .setTitle("Lord Bostengard's Commands")
                    .setDescription(`\`/music play\`: plays a song from youtube or spotify
                                     \`/music skip\`: skips the current song
                                     \`/music stop\`: stops playing music
                                     \`/music loop\`: loops the current song`)
                    .setTimestamp()
                    .setFooter({text: "bot created by Bostengard#4691",iconURL: client.user.avatarURL({format: "jpg",size:2048,dynamic: true}) || client.user.defaultAvatarURL})
                return await interaction.reply({embeds: [embed], ephemeral:false})
            }else if (value.toLowerCase() === "settings"){
                const embed = new MessageEmbed()
                    .setColor('#38F20A')
                    .setTitle("Server Settings")
                    .setDescription(`To personalize the bot in the server, do the command \`/server-settings\` then choose an option and copy the id of the channel/role or in case of being \`welcome-image\` paste the url of the image`)
                    .setFooter({text: "bot created by Bostengard#4691",iconURL: client.user.avatarURL({format: "jpg",size:2048,dynamic: true}) || client.user.defaultAvatarURL})
                return await interaction.reply({embeds: [embed], ephemeral:false})
            }else{
                return interaction.reply({content:`Couldn't find a module with the name \`${value}\`\n\n This are the available modules: \`User\` \`Moderation\` \`Math\` \`Music\` \`Settings\` `,ephemeral:true})
            }
        },
    };
