const { DynamoDB } = require('aws-sdk');
const crypto = require('crypto');

exports.handler = async (event) => {
    try {
        const docClient = new DynamoDB.DocumentClient();
        const data = await docClient.scan({
            TableName: 'Balance',}).promise();

        for (const record of event.Records) {
            const message = JSON.parse(record.body);
            var id = crypto.randomUUID();
            var valueMessage = message.value.N;
            const typeMessage = message.type.S;

            console.log('valor ' + message.value.N);
            console.log('type ' + message.type.S);
            console.log('data.Count ' + data.Count);
            
            if (data.Count > 0) {
                console.log('entrou no if' + Number(data.Items[0].value));
                valueMessage = typeMessage == "DEBIT" ? (Number(data.Items[0].value) - Number(valueMessage)) : (Number(data.Items[0].value) + Number(valueMessage))
                id = data.Items[0].id;
            }else {
                console.log('entrou no else');
                valueMessage = Number(valueMessage);
            }

            const params = {
                TableName: 'Balance',
                Item: {
                    id: id,
                    value: valueMessage,
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