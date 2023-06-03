const { DynamoDB } = require('aws-sdk');
const crypto = require('crypto');
const AWS = require('aws-sdk');

exports.handler = async function(event) {
    const transaction = {
        id: crypto.randomUUID(),
        ...JSON.parse(event.body)
    }

    if (transaction.type !== 'DEBIT' && transaction.type !== 'CREDIT') {
        return { 
          statusCode: 400, 
          body: `Invalid transaction type. Must be either 'DEBIT' or 'CREDIT'.`
        };
    }

    if (transaction.value <= 0) {
        return { 
          statusCode: 400, 
          body: `Value cannot be greater than or equal to zero.'.`
        };
    }

    try {
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
    } catch (error) {
        console.error(`Error creating transaction: ${error}`);
        return { 
        statusCode: 500, 
        body: `Failed to add transaction`
    };
    }
  };
