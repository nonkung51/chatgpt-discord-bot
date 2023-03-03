import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
import mongoose from 'mongoose';

import dotenv from 'dotenv'
dotenv.config()

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

import Conversation from './models/conversation.js';

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
		try {
			const existingConversation = await Conversation.findOne({ threadId: message.channelId });
			message.channel.sendTyping();

			if (existingConversation) {
				const res = await api.sendMessage(message.content, 
					{ parentMessageId: existingConversation.lastMessageId }
				);
				existingConversation.lastMessageId = res.id;
				existingConversation.save();
				const messages = splitMessages(res.text);

				for (const eachMessage of messages) {
					message.channel.send(eachMessage);
				}
			} else {
				const newConversation = new Conversation({ threadId: message.channelId });
				const res = await api.sendMessage(message.content);
				newConversation.lastMessageId = res.id;
				newConversation.save();
				const messages = splitMessages(res.text);

				for (const eachMessage of messages) {
					message.channel.send(eachMessage);
				}
			}
		} catch (error) {
			message.channel.send(`Something went wrong! ${error}`);
		}
	}
});

const splitMessages = (message) => {
	const maxLength = 2000;
	const strLength = message.length;

	const messages = [];

	for (let i = 0; i < strLength; i += maxLength) {
		const chunk = message.slice(i, i + maxLength);
		messages.push(chunk);
	}

	return messages;
}


client.login(process.env.DISCORD_TOKEN);
