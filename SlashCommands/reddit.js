const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require('path')
const { reddit } = require(path.resolve('./Functions/reddit.js'))
let subreddits = ["196", "antimeme", "bikinibottomtwitter","dankmemes", "shitposting","shitpostcrusaders","leagueofmemes","apandah", "meme","memes", "whenthe","prequelmemes","terriblefacebookmemes","funny", "okbuddyretard","comedycemetery","wholesomememes","raimimemes","historymemes","comedyheaven"]
module.exports = {
    data: new SlashCommandBuilder()
        .setName('reddit')
        .setDescription('searches a meme')
        .addStringOption(option => option.setName('subreddit').setDescription('What subreddit would you like to search').setRequired(false)),
    async execute(interaction,client) {
        await interaction.deferReply()
        let subreddit = interaction.options.getString('subreddit')
        if(!subreddit){let a  = Math.floor(Math.random() * subreddits.length); subreddit = subreddits[a]}

        redditpost(subreddit)
        function redditpost(target) {
            try {
                reddit(target).then(data => {
                    let loopamount = 0
                    //if nsfw and the channel is not nsfw dont send anything
                    if (data.nsfw === true && !interaction.channel.nsfw) {
                        interaction.editReply({content:"no nsfw posts are allowed in this channel"})
                        return;
                    }
                    //if the image is in the wrong format try again until 5 times
                    if (!data.url.endsWith(".jpg") && !data.url.endsWith(".gif") && !data.url.endsWith(".png") && !data.url.endsWith(".webp")) {
                        loopamount++
                        if (loopamount > 4) {
                            interaction.editReply("couldn't find a post that meets the format requirements");
                            return;
                        }
                        redditpost(target)
                        return;
                    }
                    //define the embed for the post
                    const redditembed = new MessageEmbed()
                        .setColor('#ff7b00')
                        .setTitle(data.title + `  |   :thumbsup: ${data.score}`)
                        .setImage(data.url)
                        .setDescription(`[Reddit Post](${data.permalink})` + ` | from ${data.subreddit}  | by u/${data.author}`)
                    interaction.editReply({embeds: [redditembed]})
                })
            } catch (e) {
                message.reply("Couldn't find any post! Try checking spelling")
            }
        }


    },
};
