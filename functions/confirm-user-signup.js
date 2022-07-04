const DynamoDB = require('aws-sdk/clients/dynamodb')
const Chance = require('chance')
const DocumentClient = new DynamoDB.DocumentClient()
const chance = new Chance()
const { USERS_TABLE } = process.env;

// create user entry in UsersTable from Cognito
module.exports.handler = async (event) => {
	// event when cognito calls on lambda function, the event payload
	if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
		const name = event.request.userAttributes['name']; // passed from frontend, defined in schema Name: name
		const suffix = chance.string({
			length: 8,
			casing: 'upper',
			alpha: true,
			numeric: true,
		});
		const screenName = `${name.replace(/[⌃a-zA-Z0-9]/g, '')}${suffix}`;
		const user = {
			id: event.userName, // generated by cognito for new user
			name,
			screenName,
			//birthdate,
			createdAt: new Date().toJSON(),
			followersCount: 0,
			followingCount: 0,
			tweetsCount: 0,
			likesCounts: 0,
		};
		await DocumentClient.put({
			TableName: USERS_TABLE,
			Item: user,
			ConditionExpression: 'attribute_not_exists(id)', // prevents write duplicate user
		}).promise();
		return event;
	}
	return event;
};
