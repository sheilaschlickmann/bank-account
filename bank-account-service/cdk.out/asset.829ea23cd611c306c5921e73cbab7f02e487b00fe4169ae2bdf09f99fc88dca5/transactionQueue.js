//const sqs = new AWS.SQS();
const AWS = require('aws-sdk');
const SQS = new AWS.SQS();

    exports.handler = async function(event, context) {
      try {
     
        for (const record of event.Records) {
          console.log("antes data");
          const data = record.dynamodb.NewImage;
          console.log("antes params");

          let attributes = {};
          for (let key in data) {
              attributes[key] = {
              DataType: 'String', // Ou 'Number' ou 'Binary', dependendo do tipo de dado
              StringValue: data[key] // Se DataType for 'Binary', use BinaryValue ao invés de StringValue
            };
          }

          const params = {
            MessageBody: 'tesste',//JSON.stringify(data),
            MessageAttributes: attributes,
            QueueUrl: process.env.QUEUE_URL
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

  };
