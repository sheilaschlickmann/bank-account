const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // assumindo que o evento contém o accountId
  /*const accountId = event.accountId;

  const result = await dynamodb.get({
    TableName: 'Balance',
    Key: { accountId: accountId }
  }).promise();


console.log('result.Item' + result.Item.value);
  return result.Item ? result.Item.value : 0;*/
};
