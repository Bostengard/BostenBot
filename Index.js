const { ShardingManager } = require('discord.js');
const token = require('./Config.json').token
const manager = new ShardingManager('./bot.js', { token: token });
manager.on('shardCreate', async shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();