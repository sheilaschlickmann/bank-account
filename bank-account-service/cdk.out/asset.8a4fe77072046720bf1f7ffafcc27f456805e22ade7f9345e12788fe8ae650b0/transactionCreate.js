//const sqs = new AWS.SQS();
const { DynamoDB } = require('aws-sdk');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const SQS = new AWS.SQS();


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

          /*onst sqs = new AWS.SQS();
          const params = {
              // URL da sua fila do SQS
              QueueUrl: 'https://sqs.us-east-1.amazonaws.com/132949636437/BankAccountServiceStack-BalanceUpdateQueueF6832429-OYeDxxGAkX8D', // substitua pela URL da sua fila SQS, 
              MessageBody: JSON.stringify(transaction)
        };

        // Enviando a transação para a fila do SQS
        await sqs.sendMessage(params).promise();*/

          event.Records.forEach((record) => {
          const data = record.dynamodb.NewImage;
      
          // Send data to SQS queue
          const params = {
            MessageBody: JSON.stringify(data),
            QueueUrl: process.env.SQS_QUEUE_URL,
          };
      
          SQS.sendMessage(params, (err) => {
            if (err) {
              console.error('Failed to send message to SQS:', err);
            } else {
              console.log('Message sent to SQS successfully.');
            }
          });
        });

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
