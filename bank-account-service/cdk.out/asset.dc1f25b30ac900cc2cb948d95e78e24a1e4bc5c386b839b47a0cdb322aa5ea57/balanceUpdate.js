const { DynamoDB } = require('aws-sdk');
const crypto = require('crypto');

exports.handler = async (event, context) => {
    try {
        const docClient = new DynamoDB.DocumentClient();
        const data = await docClient.scan({
            TableName: 'Balance',
        }).promise();

        for (const record of event.Records) {
            const message = JSON.parse(record.body);
            var idTeste = crypto.randomUUID();
            var valorTeste = JSON.stringify(message.value.N);
            const tipoTeste = JSON.stringify(message.type.S);

            console.log('valor ' + JSON.stringify(message.value.N));
            console.log('type ' + JSON.stringify(message.type.S));

            console.log('data items ' + data.Items[0].value.N);

            if (data.Count > 0) {
                valorTeste = tipoTeste == "DEBIT" ? (data.Items[0].value.N - valorTeste) : (data.Items[0].value.N + valorTeste)
                idTeste = data.Items[0].id;
            }
            const params = {
                TableName: 'Balance',
                Item: {
                    id: idTeste,
                    value: valorTeste,
                }
            };
            await docClient.put(params).promise();
            console.log('Saldo inserido no DynamoDB:', params.Item);
        }

        return {
            statusCode: 200,
            body: 'Mensagens da fila SQS processadas com sucesso.'
        };
    } catch (error) {
        console.error('Ocorreu um erro:', error);
        return {
            statusCode: 500,
            body: 'Erro ao processar a função Lambda.'
        };
    }
};