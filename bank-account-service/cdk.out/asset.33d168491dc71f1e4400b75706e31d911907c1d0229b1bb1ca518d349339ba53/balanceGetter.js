const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async function () {
  try {
    const results = await dynamodb.scan({
      TableName: 'Balance'
    }).promise();
    let balance = results.Count > 0 ? results.Items[0].value : 0;

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(balance),
    }
    
  } catch (error) {
    console.error(`Error getting balance: ${error}`);
    return { 
      statusCode: 500, 
      body: 'Failed to get Balance' 
    };
  }
}
