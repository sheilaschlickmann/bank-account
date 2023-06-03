const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' }); // Atualize para a sua região

const sqs = new AWS.SQS();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const params = {
    QueueUrl: process.env.QUEUE_URL, // URL da sua fila
    MaxNumberOfMessages: 10, // Pode variar de 1 a 10
    VisibilityTimeout: 10,
    WaitTimeSeconds: 0
};

async function receiveAndDeleteAllMessages() {
    let isQueueEmpty = false;

    while (!isQueueEmpty) {
        const data = await sqs.receiveMessage(params).promise();

        if (!data.Messages) {
            isQueueEmpty = true;
        } else {
            for (let message of data.Messages) {
                const body = JSON.parse(message.Body);

                const updateParams = {
                    TableName: 'Balance', // Nome da tabela DynamoDB
                    Key: { id: 1 }, // Chave do registro a ser atualizado
                    UpdateExpression: 'SET saldo = saldo + :val',
                    ExpressionAttributeValues: {
                        ':val': body.tipo === 'CREDIT' ? body.valor : -body.valor
                    },
                    ReturnValues: 'UPDATED_NEW'
                };

                try {
                    const updateResult = await dynamoDB.update(updateParams).promise();
                    console.log(updateResult.Attributes);

                    const deleteParams = {
                        QueueUrl: params.QueueUrl,
                        ReceiptHandle: message.ReceiptHandle
                    };

                    //await sqs.deleteMessage(deleteParams).promise();
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }

    console.log("Todas as mensagens foram processadas e deletadas.");
}

exports.handler = async function(event, context) {
    await receiveAndDeleteAllMessages();
}
