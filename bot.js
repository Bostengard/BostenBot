const fs = require('node:fs');
const path = require('path')
const { Client, Collection, Intents, MessageEmbed, MessageAttachment} = require('discord.js');
const token  = require(path.resolve('./Config.json')).token;
const { Player } = require('discord-music-player')
const moment = require('moment')
const client = new Client({ intents: new Intents(32767) });
const sqlite = require('sqlite3').verbose()
const player = new Player(client, {
	leaveOnEmpty:true,
	timeout: 1000,
})
const Canvas = require('canvas')
const { CreateDatabase } = require(path.resolve('./Functions/CreateDatabase.js'))
client.CreateDatabase = CreateDatabase
client.player = player
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.resolve('./SlashCommands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(path.resolve(`./SlashCommands/${file}`));
	client.commands.set(command.data.name, command);
}
client.once('ready', async () => {
	console.log('Bostenbot Ready!');
	
});
client.on('interactionCreate', async interaction => {
	await CreateDatabase(interaction.guild.id)
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction,client);
	} catch (error) {
		console.error(error);
	}
});
let levels = [20,40,70,130,190,250,310,400,640,1000,1650,2500,5000,8000,13000,19000,27000,40000,60000,850000,100000]
client.on('messageCreate', async message => {
	if(message.author.bot)return;
	if(!message.guild) return;
	if(message.webhookId) return;
	if(message.mentions.users.first()){
        if(message.mentions.users.first().id === client.user.id){
            const embed = new MessageEmbed()
			.setTitle('`/help` to know more about me')
		return message.channel.send({embeds: [embed]})
        }
		
	}
	await CreateDatabase(message.guild.id)
	let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${message.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	await db.get(`SELECT * FROM data WHERE UserID = ${message.author.id}`, async (err,row) => {
		if(err){
			return console.log("First Time Message Table created");
		}
		if(row === undefined){
			return db.run(`INSERT INTO data VALUES (?,?,?,?)`,[message.author.tag,message.author.id,1,1])
		}else {
			db.run(`UPDATE data SET Messages = ? WHERE UserID = ?`,[row.Messages + 1, message.author.id])
			for (let i = 0; i < levels.length; i++){
				if(row.Messages === levels[i]){
					let ID;
					await db.get(`SELECT * FROM ServerSettings`, async (err,row) =>{
						if(err) return;
						if(row === undefined){return db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?,?)`,[0,0,0,0,0])}
						ID = row.LevelsChannel
						try{
							await message.guild.channels.fetch(`${ID}`)
						}catch{
							return;
						}
						let channel = await message.guild.channels.cache.get(ID)
						channel.send({content: `Congratulations ${message.author.toString()} You reached Level ${i+1}!`})
					})
				}
			}
		}
	})
	await db.get(`SELECT * FROM ServerSettings`, async (err,row) => {
		if(err) return;
		if(row === undefined){
			db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?,?)`,[0,0,0,0,0])
		}
	})

})
client.on('messageUpdate',async(oldMessage,newMessage) => {
	if(newMessage.author.bot){
		return;
	}
	if(!newMessage.guild){return;}
	if(oldMessage.content.includes("https")){return;}
	await CreateDatabase(newMessage.guild.id);
	let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${newMessage.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	let logsChannel;
	await db.get(`Select * FROM ServerSettings`,async (err,row) =>{
		if(err) return;
		if(row === undefined) db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?,?)`,[0,0,0,0,0])
		const ID = row.LogsChannel
		try{
			await newMessage.guild.channels.fetch(`${ID}`)
		}catch{
			return;
		}
		logsChannel = await newMessage.guild.channels.cache.get(ID)
		const embed = new MessageEmbed()
			.setTitle('Message Edited')
			.setTimestamp()
			.addField('Old Message', `\`\`\`${oldMessage.content}\`\`\``,true)
			.addField('New Message', `\`\`\`${newMessage.content}\`\`\``,true)
			.addField('Message Info', `Channel: ${newMessage.channel.toString()}\n Author: ${newMessage.author.toString()}\n Link: [Message](${newMessage.url})`,true)
		try {
			return logsChannel.send({embeds: [embed]})
		}catch (e) {
			console.log(e)
		}
	})



})
client.on('messageDelete', async messageDelete =>{
	if(messageDelete.author.bot){return;}
	if(!messageDelete.guild){return;}
	await CreateDatabase(messageDelete.guild.id)
	let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${messageDelete.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	let logsChannel;
	await db.get(`Select * FROM ServerSettings`,async (err,row) =>{
		if(err) return;
		if(row === undefined) db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?,?)`,[0,0,0,0,0])
		const ID = row.LogsChannel
		try{
			await messageDelete.guild.channels.fetch(`${ID}`)
		}catch {
			return;
		}
		logsChannel = await messageDelete.guild.channels.cache.get(ID)
		if(!logsChannel){ return }
		const embed = new MessageEmbed()
			.setTitle('Message Deleted')
			.addField('Message', `\`\`\`${messageDelete.content}\`\`\``,true)
			.addField('Info', `Channel: ${messageDelete.channel.toString()}\n Author: ${messageDelete.author.toString()}`)
			.setTimestamp()
		try {
			if(messageDelete.attachments.first()) {
				const file = new MessageAttachment(messageDelete.attachments.first().url, "File")
				return logsChannel.send({embeds: [embed],files: [file]})
			}
			return logsChannel.send({embeds: [embed]})
		}catch (e) {
			console.log('UNEXPECTED ERROR -----> \n' + e)
		}
	})
})
client.on('messageDeleteBulk', async (messages) =>{
	await CreateDatabase(messages.first().guild.id)
	let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${messages.first().guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	await db.get(`Select * FROM ServerSettings`,async (err,row) =>{
		if(err) return;
		let logsChannel;
		if(row === undefined) db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?,?)`,[0,0,0,0,0])
		const ID = row.LogsChannel;
		try {
			await messages.first().guild.channels.fetch(`${ID}`)
		}catch {
			return ;
		}
		logsChannel = await messages.first().guild.channels.cache.get(ID)
		console.log(logsChannel)
		let texto = "";
		messages.forEach((e) =>{
			texto += `${e.author.tag}: ${e.content}\n`
		})
		if(!texto.toString().length >4096){
			texto.splice(4096,texto.length-4096)
		}
		const embed = new MessageEmbed()
			.setTitle(`${messages.size + 1} Messages Deleted`)
			.setDescription(`\`\`\`${texto}\`\`\``)
			.setTimestamp()
		try {
			return logsChannel.send({embeds: [embed]})
		}catch (e) {
			console.log(e)
		}
	})

})
const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');
	let fontSize = 70;

	do {
		context.font = `${fontSize -= 10}px Poppins`;
	} while (context.measureText(text).width > canvas.width - 300);

	return context.font;
};
client.on('guildMemberAdd', async member =>{
	await CreateDatabase(member.guild.id)
	let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${member.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	let role;
	let logsChannel;
	let welcomeChannel
	await member.guild.roles.fetch()
	await db.get(`Select * FROM ServerSettings`,async (err,row) =>{
		if(err) return;
		if(row === undefined){return db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?,?)`,[0,0,0,0,0])}
		const roleId = row.WelcomeRole
		const ID = row.LogsChannel;
		const WelcomeID = row.WelcomeChannel
		const image = row.WelcomeImage
		//get the logschannel and send message
		if(ID !== 0){
			try{await member.guild.channels.fetch(`${ID}`)}catch{
			}
			logsChannel = await member.guild.channels.cache.get(ID)
			try {
				await member.fetch
				const embed = new MessageEmbed()
					.setTitle('User Joined')
					.addField('User Info', `Mention: ${member.toString()}\n ID: ${member.id.toString()}\n Account Creation Date: \`${moment(member.user.createdAt).format('DD/MM/YYYY hh:mm:ss')}\` ${moment(member.user.createdTimestamp).fromNow()} `)
					.setTimestamp()
					.setThumbnail(member.avatarURL())
				await logsChannel.send({embeds: [embed]})
			}catch{
			}
		}
		if(roleId !== 0){
			//get the role
			try{await  member.guild.roles.fetch(`${roleId}`)}catch {
			}
			role = await member.guild.roles.cache.get(roleId)
			//add role
			try{
				await member.roles.add(role)
			}catch(e){
			}
		}
		if(WelcomeID !== 0){
			//get the welcome channel
			try{await member.guild.channels.fetch(`${WelcomeID}`)}catch{

			}
			welcomeChannel = await member.guild.channels.cache.get(WelcomeID)
			try{
				const canvas = Canvas.createCanvas(700, 250);
				const context = canvas.getContext('2d');
				let background;
				try{
					background = await Canvas.loadImage(image);
				}catch(e) {
					background = await Canvas.loadImage(path.resolve('./Background.png'))
				}

				context.drawImage(background, 0, 0, canvas.width, canvas.height);

				context.strokeStyle = '#0099ff';
				context.strokeRect(0, 0, canvas.width, canvas.height);

				context.font = '28px Poppins';
				context.fillStyle = '#ffffff';
				context.fillText('Welcome!', canvas.width / 2.5, canvas.height / 3.5);

				context.font = applyText(canvas, `${member.displayName}!`);
				context.fillStyle = '#ffffff';
				context.fillText(`${member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);

				context.beginPath();
				context.arc(125, 125, 100, 0, Math.PI * 2, true);
				context.closePath();
				context.clip();

				const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
				context.drawImage(avatar, 25, 25, 200, 200);

				const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');

				await welcomeChannel.send({content: `${member.toString()} welcome to ${member.guild.name}!`,files: [attachment]})
			}
			catch (e){
			}
		}




	})
})
client.on('guildMemberRemove', async member =>{
	await CreateDatabase(member.guild.id)
	let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${member.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	let logsChannel;
	await db.get(`Select * FROM ServerSettings`,async (err,row) => {
		if (err) return;
		if (row === undefined) return db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?,?)`,[0,0,0,0,0])
		const ID = row.LogsChannel
		try{
			await member.guild.channels.fetch(`${ID}`)
		}catch {
			return
		}
		logsChannel = await member.guild.channels.cache.get(`${ID}`)
		if(!logsChannel) return;
		const embed = new MessageEmbed()
			.setTitle('User Left')
			.addField('User Info', `Mention: ${member.toString()}\n ID: ${member.id.toString()}\n Account Creation Date: \`${moment(member.user.createdAt).format('DD/MM/YYYY hh:mm:ss')}\` ${moment(member.user.createdTimestamp).fromNow()}\n Joined Date: \`${moment(member.joinedAt).format('DD/MM/YYYY hh:mm:ss')}\` ${moment(member.joinedTimestamp).fromNow()}`)
			.setTimestamp()
		try {
			return logsChannel.send({embeds: [embed]})
		} catch (e) {}
	})

})
client.on('guildCreate', async guild =>{
	await CreateDatabase(guild.id)
	console.log('+1 :)')
})
client.on('guildDelete', async guild =>{
	await fs.unlinkSync(path.join(path.resolve('./Databases/'), `${guild.id}.db`))
	console.log('-1 :(')
})
client.login(token);
