const { Stack, RemovalPolicy, Duration } = require('aws-cdk-lib');
const {Table, AttributeType, StreamViewType } = require("aws-cdk-lib/aws-dynamodb");
const {Queue} = require("aws-cdk-lib/aws-sqs");
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { SqsEventSource, DynamoEventSource} = require("aws-cdk-lib/aws-lambda-event-sources");
const { RestApi, LambdaIntegration  } = require('aws-cdk-lib/aws-apigateway');


class BankAccountServiceStack extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);
        
    const transactionDB = new Table(this, 'TransactionsTable', {
      stream: StreamViewType.NEW_IMAGE,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'Transaction',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const balanceDB = new Table(this, 'BalanceTable', {
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'Balance',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    /*const transactionsQueue = new Queue(this, 'BalanceUpdateQueue', {
      visibilityTimeout: Duration.seconds(100)
    });*/



    const transactionCreate = new Function(this, 'CreateTransaction', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'transactionCreate.handler',
      code: Code.fromAsset('lambda'),
    });


    /*********** */
    const queue = new Queue(this, 'QueueTransaction', {
      visibilityTimeout: Duration.seconds(30),      
      receiveMessageWaitTime: Duration.seconds(20), 
    });

    const sendToQueue = new Function(this, 'SendToQueue', {
      // Lambda function configurations
      runtime: Runtime.NODEJS_14_X,
      handler: 'transactionCreate.handler',
      code: Code.fromAsset('lambda'),
    });
    
   

    transactionCreate.addEventSource(new DynamoEventSource(transactionDB, {
      startingPosition: 0,
      batchSize: 100,
      //bisectBatchOnError: true,
      //onFailure: new SqsDlq(queue),
      retryAttempts: 10,
    }));

    // Grant necessary permissions to the Lambda function
    transactionDB.grantReadData(sendToQueue);
    queue.grantSendMessages(sendToQueue);

    // Set up DynamoDB as the trigger for the Lambda function
    sendToQueue.addEventSource('MyTransaction', {
      eventSourceArn: transactionDB.tableStreamArn
    });

/************* */

    const balanceUpdater = new Function(this, 'BalanceUpdaterFunction', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'balanceUpdater.handler',
      code: Code.fromAsset('lambda'),
      events: [new SqsEventSource(sendToQueue)],
    });

    transactionDB.grantReadWriteData(transactionCreate);
    balanceDB.grantReadWriteData(balanceUpdater);
    
    /*transactionsQueue.grantSendMessages(transactionCreate);
    transactionsQueue.grantConsumeMessages(balanceUpdater);*/
    

    const balanceGetter = new Function(this, 'BalanceGetterFunction', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'balanceGetter.handler',
      code: Code.fromAsset('lambda'),
    });

    const api = new RestApi(this, 'BankAccountAPI', {
      restApiName: 'BankAccountAPI',
    });

    const transaction = api.root.addResource('transaction');
    transaction.addMethod('POST', new LambdaIntegration(transactionCreate));

    //balanceGetter.addEnvironment('BALANCE_TABLE_NAME', balanceTable.tableName);

    balanceDB.grantReadData(balanceGetter);

  } 
}

module.exports = { BankAccountServiceStack };
