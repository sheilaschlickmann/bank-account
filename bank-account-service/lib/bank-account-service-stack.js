const { Stack, RemovalPolicy, Duration } = require('aws-cdk-lib');
const {Table, AttributeType, StreamViewType } = require("aws-cdk-lib/aws-dynamodb");
const {Queue} = require("aws-cdk-lib/aws-sqs");
const { Function, Runtime, Code, StartingPosition} = require('aws-cdk-lib/aws-lambda');
const { SqsEventSource, DynamoEventSource } = require("aws-cdk-lib/aws-lambda-event-sources");
const { RestApi, LambdaIntegration  } = require('aws-cdk-lib/aws-apigateway');


class BankAccountServiceStack extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);
        
    const transactionDB = new Table(this, 'TransactionsTable', {
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
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

    const transactionCreate = new Function(this, 'CreateTransaction', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'transactionCreate.handler',
      code: Code.fromAsset('lambda'),
    });


    /*********** */
    const queue = new Queue(this, 'QueueTransaction', {
      visibilityTimeout: Duration.seconds(30),      
    });

    const sendToQueue = new Function(this, 'sendToQueue', {
      code: Code.fromAsset('lambda'),
      handler: 'transactionQueue.handler',
      runtime: Runtime.NODEJS_14_X,
      functionName: 'event-to-dynamodb',
      environment: {
        QUEUE_URL: queue.queueUrl,
      }
    });

    // Add lambda source
    sendToQueue.addEventSource(new DynamoEventSource(transactionDB, {
      startingPosition: StartingPosition.LATEST,
    }));

    //transactionDB.grantWriteData(sendToQueue);
/*
/************* */

    /*const balanceUpdater = new Function(this, 'BalanceUpdaterFunction', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'balanceUpdater.handler',
      code: Code.fromAsset('lambda'),
      events: [new SqsEventSource(sendToQueue)],
    });*/

    /*balanceUpdater.addEventSource(new SqsEventSource(queue, {
      startingPosition: StartingPosition.LATEST,
      batchSize: 5,
    }));*/

    transactionDB.grantReadWriteData(transactionCreate);
    //balanceDB.grantReadWriteData(balanceUpdater);
    
    queue.grantSendMessages(sendToQueue);
    //transactionsQueue.grantConsumeMessages(balanceUpdater);
    

    /*const balanceGetter = new Function(this, 'BalanceGetterFunction', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'balanceGetter.handler',
      code: Code.fromAsset('lambda'),
    });*/

    const api = new RestApi(this, 'BankAccountAPI', {
      restApiName: 'BankAccountAPI',
    });

    const transaction = api.root.addResource('transaction');
    transaction.addMethod('POST', new LambdaIntegration(transactionCreate));

    //balanceGetter.addEnvironment('BALANCE_TABLE_NAME', balanceTable.tableName);

    //balanceDB.grantReadData(balanceGetter);

  } 
}

module.exports = { BankAccountServiceStack };
