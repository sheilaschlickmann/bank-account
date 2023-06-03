const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // assumindo que o evento contém o accountId
  const id = event.id;

  const result = await dynamodb.get({
    TableName: 'Balance',
    Key: { id: id }
  }).promise();


  console.log('entrou no balance com valor de ' + result.Item.value);
  return result.Item ? result.Item.value : 0;

  
};
