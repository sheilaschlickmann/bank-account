//const sqs = new AWS.SQS();
const AWS = require('aws-sdk');
const SQS = new AWS.SQS();

    exports.handler = async function(event, context) {

          event.Records.forEach((record) => {
          const data = record.dynamodb.NewImage;
          console.log(data);
          // Send data to SQS queue
          const params = {
            MessageBody: JSON.stringify(data),
            QueueUrl: 'process.env.QueueUrl',
          };
      
          SQS.sendMessage(params, (err) => {
            if (err) {
              console.error('Failed to send message to SQS:', err);
            } else {
              console.log('Message sent to SQS successfully.');
            }
          });
        });
  };
