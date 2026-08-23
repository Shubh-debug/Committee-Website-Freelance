import serverless from 'serverless-http';
import app from '../../src/app.js';

const expressHandler = serverless(app);

export const handler = (event, context) => {
	const functionPrefix = '/.netlify/functions/api';
	const eventPath = event.path || event.rawPath || '/';
	const normalizedPath = eventPath.startsWith(functionPrefix)
		? eventPath.slice(functionPrefix.length) || '/'
		: eventPath;
	if (!normalizedPath.startsWith('/api')) {
		if (event.version === '2.0') event.rawPath = `/api${normalizedPath}`;
		else event.path = `/api${normalizedPath}`;
	}
	return expressHandler(event, context);
};