const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  for (let record of event.Records) {
    // assumindo que o registro contém os detalhes da transação
    const transaction = JSON.parse(record.body);

    // calcular o saldo e atualizar a tabela BalanceTable
    const accountId = transaction.accountId;
    // Implemente aqui a lógica para calcular o saldo
    // ...
    
    // atualize o saldo na tabela BalanceTable
    await dynamodb.update({
      TableName: 'BalanceTable',
      Key: { accountId: accountId },
      UpdateExpression: 'set balance = :b',
      ExpressionAttributeValues: { ':b': balance }
    }).promise();
  }
};
