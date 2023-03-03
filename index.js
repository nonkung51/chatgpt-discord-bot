import { 
	Client, 
	Events, 
	GatewayIntentBits,
} from 'discord.js';
import interactionCreate from './handler/interactionCreate.js';
import messageCreate from './handler/messageCreate.js';

import mongoose from 'mongoose';

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
client.on(Events.MessageCreate, messageCreate(api));
client.on(Events.InteractionCreate, interactionCreate);

client.login(process.env.DISCORD_TOKEN);
