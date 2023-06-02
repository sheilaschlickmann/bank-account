const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // assumindo que o evento contém o accountId
  const accountId = event.accountId;

  const result = await dynamodb.get({
    TableName: 'BalanceTable',
    Key: { accountId: accountId }
  }).promise();

  return result.Item ? result.Item.balance : null;
};
