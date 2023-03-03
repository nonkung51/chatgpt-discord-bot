export default async (interaction) => {
  if (interaction.isButton() && interaction.customId === 'create-new-thread') {
    const thread = await interaction.channel.threads.create({
      name: `${interaction.user.username} created conversation at ${interaction.createdTimestamp}`,
      autoArchiveDuration: 60,
      reason: 'New thread for chatting with ChatGPT, Human\'s best friend!',
    });

    interaction.reply(`Done! new thread created name [${thread.name}]`);
  }
}
