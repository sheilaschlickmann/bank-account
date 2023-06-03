const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async function () {
  var balance = 0;
  const results = await dynamodb.scan({
    TableName: 'Balance',
    ProjectionExpression: 'value' // Retorna apenas a coluna 'value'
  }).promise();

  console.log('entrou no balance');
  if (results.data > 0) {
    balance = results.Items;
  }


  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(balance),
}



}
