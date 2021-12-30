export const errorResponse: any = (errorMessage: any, awsRequestId: any, callback: any, origin: any) =>  {
	console.log('Error: ', errorMessage);

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