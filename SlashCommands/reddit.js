const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed} = require('discord.js');
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
                console.log(e)
                interaction.editReply("Couldn't find any post! Try checking spelling")
            }
        }


    },
};
const axios = require('axios').default;
function time(unixtime) {
    const u = new Date(unixtime * 1000);
    return u.toISOString().replace('T', ' ').replace('Z', '');
}

function formatObject(data) {
    return {
        title: data.title,
        text: data.selftext,
        flairText: data.link_flair_text,
        author: data.author,
        subreddit: `r/${data.subreddit}`,
        url: data.url,
        permalink: `http://reddit.com${data.permalink}`,
        created: time(parseInt(data.created, 10)),
        created_utc: time(parseInt(data.created_utc, 10)),
        nsfw: data.over_18,
        score: data.score
    };
}



async function reddit(subreddit) {
    return new Promise((resolve, reject) => {
        axios({
            method: "get",
            url: `https://www.reddit.com/r/${subreddit}.json?sort=new&t=day&limit=30`,
        }).then(function (resp) {
            let body = resp.data.data;
            let data = body.children;
            const rand = Math.floor(Math.random() * Math.floor(data.length));
            const obj = formatObject(data[rand].data);
            resolve(obj);
        }).catch(e => {
            reject(e);
        });
    });
}
