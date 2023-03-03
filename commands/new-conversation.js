const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('new-conversation')
		.setDescription('Add new thread for conversation'),
	async execute(interaction) {
		await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);

    const thread = await interaction.channel.threads.create({
      name: 'food-talk',
      autoArchiveDuration: 60,
      reason: 'Needed a separate thread for food',
    });
    
    console.log(`Created thread: ${thread.name}`);
  },
};