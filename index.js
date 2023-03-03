import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
import mongoose from 'mongoose';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

import dotenv from 'dotenv'
dotenv.config()

import { ChatGPTAPI } from 'chatgpt';

const api = new ChatGPTAPI({
	apiKey: process.env.OPENAI_API_KEY,
})

// client.commands = new Collection();

client.once(Events.ClientReady, () => {
	console.log('Ready!');
});





client.on(Events.InteractionCreate, async interaction => {
	console.log(`Received interaction: "${interaction}" from ${interaction.user.tag}`)
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on(Events.MessageCreate, async (message) => {
	if (message.channel.parent.name === "bot" && !message.author.bot) {
		message.channel.sendTyping();
		const res = await api.sendMessage(message.content);
		message.channel.send(res.text);
	}
});

client.login(process.env.DISCORD_TOKEN);
