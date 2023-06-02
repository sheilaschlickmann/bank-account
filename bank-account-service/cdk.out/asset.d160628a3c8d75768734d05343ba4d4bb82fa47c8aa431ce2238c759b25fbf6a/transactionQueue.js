//const sqs = new AWS.SQS();
const AWS = require('aws-sdk');
const SQS = new AWS.SQS();

    exports.handler = async function(event, context) {
      try {
        for (const record of event.record) {
          
          const data = record.dynamodb.NewImage;
          const params = {
            MessageBody: JSON.stringify(data),
            QueueUrl: process.env.QUEUE_URL,
          };

          console.log("VOU ENVIAR");
          await SQS.sendMessage(params).promise();
          console.log("URL" + process.env.QUEUE_URL);
          return {
            statusCode: 201,
            headers: { "Content-Type": "application/json" },
            body: 'Deu bom'
          };
        }
      } catch (error) {
        return console.log("Deu ruim");
      }
        /*
          await event.Records.forEach((record) => {
          const data = record.dynamodb.NewImage;
          console.log(data);
          // Send data to SQS queue
          const params = {
            MessageBody: JSON.stringify(data),
            QueueUrl: process.env.QUEUE_URL,
          };
          console.log("VOU ENVIAR");
          SQS.sendMessage(params).promise();
          console.log("URL" + process.env.QUEUE_URL);
          return {
            statusCode: 201,
            headers: { "Content-Type": "application/json" },
            body: 'Deu bom'
          };


          /*
          SQS.sendMessage(params, (err) => {
            if (err) {
              console.error('Failed to send message to SQS:', err);
            } else {
              console.log('Message sent to SQS successfully.');
            }
          });*/
  };
