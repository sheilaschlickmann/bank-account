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
