import { randomBytes } from 'crypto';
import AWS from 'aws-sdk';

const origin = 'http://localhost:8080';

exports.handler = async (event: any, context: any, callback: any) => {
	console.log('event', JSON.stringify(event));
	console.log('context', JSON.stringify(context));
	console.log('callback', JSON.stringify(callback));

	try {
		var items = await getMovies();
		console.log('items: ', items);

		callback(null, {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Origin': origin,
			},
			body: JSON.stringify(items.Items),
		});
	} catch (err) {
		errorResponse(err.message, context.awsRequestId, callback);
	}
}

function getMovies() {
	const ddb = new AWS.DynamoDB.DocumentClient();

	const params = {
		TableName: 'Movies'
	};

	return ddb.scan(params).promise();
}

function errorResponse(errorMessage: any, awsRequestId: any, callback: any) {
	console.log(errorMessage);

	callback(null, {
		statusCode: 500,
		body: JSON.stringify({
			Error: errorMessage,
			Reference: awsRequestId,
		}),
		headers: {
			'Access-Control-Allow-Origin': origin,
		},
	});
}