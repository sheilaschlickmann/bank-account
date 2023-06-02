//const sqs = new AWS.SQS();
const AWS = require('aws-sdk');
const SQS = new AWS.SQS();

    exports.handler = async function(event, context) {

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
      /*} catch (err) {
          console.log('DynamoDB error: ', err);
          return { statusCode: 500, body: 'Failed to add transaction' };
      }*/

  };
