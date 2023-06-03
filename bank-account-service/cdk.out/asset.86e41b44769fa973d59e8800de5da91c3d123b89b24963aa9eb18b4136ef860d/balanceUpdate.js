const { DynamoDB } = require('aws-sdk');
const crypto = require('crypto');

exports.handler = async (event) => {
    try {
        const docClient = new DynamoDB.DocumentClient();
        const data = await docClient.scan({
            TableName: 'Balance',}).promise();

        for (const item of event.Records) {
            const message = JSON.parse(item.body);
            var id = crypto.randomUUID();
            var valueMessage = message.value.N;
            const typeMessage = message.type.S;
            
            if (data.Count > 0) {
                valueMessage = typeMessage == "DEBIT" ? (Number(data.Items[0].value) - Number(valueMessage)) : (Number(data.Items[0].value) + Number(valueMessage))
                id = data.Items[0].id;
            } else {
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
        }
    } catch (error) {
        console.error(`Error updating balance: ${error}`);
    }
};