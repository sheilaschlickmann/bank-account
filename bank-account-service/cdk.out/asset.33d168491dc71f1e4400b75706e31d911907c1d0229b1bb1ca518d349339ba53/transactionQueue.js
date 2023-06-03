const AWS = require('aws-sdk');
const SQS = new AWS.SQS();

    exports.handler = async function(event, context) {
      try {
        for (const record of event.Records) {
          const data = record.dynamodb.NewImage;         
          const params = {
            MessageBody: JSON.stringify(data),
            QueueUrl: process.env.QUEUE_URL
          };
          await SQS.sendMessage(params).promise();
        }
      } catch (error) {
        console.error(`Error sending message to SQS queue: ${error}`);
      }
  };
