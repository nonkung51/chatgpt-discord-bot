export const splitMessages = (message) => {
	const maxLength = 2000;
	const strLength = message.length;

	const messages = [];

	for (let i = 0; i < strLength; i += maxLength) {
		const chunk = message.slice(i, i + maxLength);
		messages.push(chunk);
	}

	return messages;
}