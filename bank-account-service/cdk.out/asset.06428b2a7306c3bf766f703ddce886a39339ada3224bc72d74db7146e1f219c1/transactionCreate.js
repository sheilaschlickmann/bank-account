//const sqs = new AWS.SQS();
const { DynamoDB } = require('aws-sdk');
const crypto = require('crypto');

  /*for (let record of event.Records) {
    // assumindo que o registro contém os detalhes da transação
    const transaction = JSON.parse(record.body);

    // armazene a transação no DynamoDB
    await dynamodb.put({
      TableName: 'TransactionsTable',
      Item: transaction
    }).promise();*/

    exports.handler = async function(event, context) {
      const transaction = {
          id: crypto.randomUUID(),
          ...JSON.parse(event.body)
      }
      try {
          console.log("Adding a new transaction: ", transaction);
          const docClient = new DynamoDB.DocumentClient();
          await docClient.put({
              TableName: 'Transaction',
              Item: transaction,
          }).promise();

          const sqs = new AWS.SQS();
          const params = {
              // URL da sua fila do SQS
              QueueUrl: 'https://sqs.us-east-1.amazonaws.com/132949636437/BankAccountServiceStack-BalanceUpdateQueueF6832429-OYeDxxGAkX8D', // substitua pela URL da sua fila SQS, 
              MessageBody: JSON.stringify(transaction)
        };

        // Enviando a transação para a fila do SQS
        await sqs.sendMessage(params).promise();

          return {
              statusCode: 201,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(transaction),
          };
      } catch (err) {
          console.log('DynamoDB error: ', err);
          return { statusCode: 500, body: 'Failed to add transaction' };
      }

  };
