const randomBytes = require('crypto').randomBytes;
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
	console.log('event', JSON.stringify(event));
	console.log('context', JSON.stringify(context));
	console.log('callback', JSON.stringify(callback));

	// The body field of the event in a proxy integration is a raw string.
	// In order to extract meaningful values, we need to first parse this string
	// into an object. A more robust implementation might inspect the Content-Type
	// header first and use a different parsing strategy based on that value.
	const requestBody = typeof event.body === 'object' ? event.body : JSON.parse(event.body);
	console.log(requestBody);

	let username = null;

	if (requestBody.Username) {
		username = requestBody.Username;
	} else if (event.requestContext.authorizer) {
		// Because we're using a Cognito User Pools authorizer, all of the claims
		// included in the authentication token are provided in the request context.
		// This includes the username as well as other attributes.
		username = event.requestContext.authorizer.claims['cognito:username'];
	} else if (!event.requestContext.authorizer) {
		errorResponse('Authorization not configured', context.awsRequestId, callback);
		return;
	}

	if (!requestBody.MovieName) {
		errorResponse('Incomplete body: ', context.awsRequestId, callback);
	}

	const movieId = toUrlString(randomBytes(16));
	console.log('Received event (', movieId, '): ', event);

	saveMovie(movieId, username, requestBody.MovieName).then(() => {
		// You can use the callback function to provide a return value from your Node.js
		// Lambda functions. The first parameter is used for failed invocations. The
		// second parameter specifies the result data of the invocation.

		// Because this Lambda function is called by an API Gateway proxy integration
		// the result object must use the following structure.
		callback(null, {
			statusCode: 201,
			body: JSON.stringify({
				MovieId: movieId,
				MovieName: requestBody.MovieName,
				OtherData: 'Here is other data',
				Requester: username
			}),
			headers: {
				'Access-Control-Allow-Origin': '*',
			}
		});
	}).catch((err) => {
		console.log(err);

		// If there is an error during processing, catch it and return
		// from the Lambda function successfully. Specify a 500 HTTP status
		// code and provide an error message in the body. This will provide a
		// more meaningful error response to the end client.
		errorResponse(err.message, context.awsRequestId, callback);
	});
}

function saveMovie(movieId, username, movieName) {
	return ddb.put({
		TableName: 'Movies',
		Item: {
			MovieId: movieId,
			User: username,
			MovieName: movieName,
			RequestTime: new Date().toISOString()
		}
	}).promise();
}

function toUrlString(buffer) {
	return buffer.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

function errorResponse(errorMessage, awsRequestId, callback) {
	callback(null, {
		statusCode: 500,
		body: JSON.stringify({
			Error: errorMessage,
			Reference: awsRequestId,
		}),
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
	});
}