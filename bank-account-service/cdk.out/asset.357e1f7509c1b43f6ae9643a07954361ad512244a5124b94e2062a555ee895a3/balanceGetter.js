const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async function () {
  var balance = 0;
  try {
  const results = await dynamodb.scan({
    TableName: 'Balance'// Retorna apenas a coluna 'value'
  }).promise();

  console.log('entrou no balance');
  console.log('items ' + results.Items);
  console.log('items value ' + results.Items.value);
  if (results.Count > 0) {
    balance = results.Items.value;
  }


  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(balance),
  }

  } catch (err) {
    console.log('DynamoDB error: ', err);
    return { statusCode: 500, body: 'Failed to get Balance' };
}

}
