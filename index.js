import { 
	Client, 
	Events, 
	GatewayIntentBits, 
	EmbedBuilder, 
	ButtonBuilder, 
	ButtonStyle 
} from 'discord.js';

import { ActionRowBuilder } from '@discordjs/builders';

import mongoose from 'mongoose';
import Conversation from './models/conversation.js';

import { ChatGPTAPI } from 'chatgpt';
import Keyv from 'keyv'

import dotenv from 'dotenv'
dotenv.config()

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.MessageContent
	] 
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

const keyv = new Keyv(process.env.MONGO_URI);
const api = new ChatGPTAPI({
	apiKey: process.env.OPENAI_API_KEY,
	messageStore: keyv
});


/// Bot Logic

client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

client.on(Events.MessageCreate, async (message) => {
	if (message.channel.name === "bot" && !message.author.bot) {
		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('ChatGPT')
			.setURL('https://chat.openai.com/')
			.setDescription('Create a new thread to interact with ChatGPT!')
			.setTimestamp()

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('create-new-thread')
					.setLabel('Create new Thread')
					.setStyle(ButtonStyle.Primary),
			);

		message.channel.send({ embeds: [exampleEmbed], components: [row] });
	}

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

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isButton() && interaction.customId === 'create-new-thread') {
		const thread = await interaction.channel.threads.create({
			name: `${interaction.user.username} created conversation at ${interaction.createdTimestamp}`,
			autoArchiveDuration: 60,
			reason: 'New thread for chatting with ChatGPT, Human\'s best friend!',
		});

		interaction.reply(`Done! new thread created name [${thread.name}]`);
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
