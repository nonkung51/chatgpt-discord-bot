import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
  },
  threadId: {
    type: String,
  },
  lastMessageId: {
    type: String,
  },
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;