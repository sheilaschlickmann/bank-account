const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async function () {
  var balance = 0;
  const results = await dynamodb.scan({
    TableName: 'Balance',
    ProjectionExpression: 'value' // Retorna apenas a coluna 'value'
  }).promise();

  // results.Items agora é uma lista de todos os itens retornados pela varredura.
  // Cada item é um objeto que contém apenas a coluna 'value'.
  /*for (const item of results.Items) {
    
  }*/
  console.log('entrou no balance');
  if (results.data > 0) {
    balance = item.value;
  }


  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(balance),
}



}
