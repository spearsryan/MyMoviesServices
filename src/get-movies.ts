import AWS from 'aws-sdk';
import { errorResponse } from './util/error-response';

exports.handler = async (event: any, context: any, callback: any) => {
	console.log('event', JSON.stringify(event));
	console.log('context', JSON.stringify(context));
	console.log('callback', JSON.stringify(callback));

	const origin = event.headers.Origin || event.headers.origin;

	try {
		var records = await getMovies();
		console.log('records: ', records);

		callback(null, {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Origin': origin,
			},
			body: JSON.stringify(records.Items),
		});
	} catch (err) {
		errorResponse(err.message, context.awsRequestId, callback, origin);
	}
}

function getMovies() {
	const ddb = new AWS.DynamoDB.DocumentClient();

	const params = {
		TableName: 'Movies'
	};

	return ddb.scan(params).promise();
}