const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

exports.handler = async (event) => {
  for (let record of event.Records) {
    // assumindo que o registro contém os detalhes da transação
    const transaction = JSON.parse(record.body);

    // armazene a transação no DynamoDB
    await dynamodb.put({
      TableName: 'TransactionsTable',
      Item: transaction
    }).promise();

    // envie a transação para a fila SQS
    await sqs.sendMessage({
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/132949636437/BankAccountServiceStack-BalanceUpdateQueueF6832429-OYeDxxGAkX8D', // substitua pela URL da sua fila SQS
      MessageBody: JSON.stringify(transaction)
    }).promise();
  }
};
