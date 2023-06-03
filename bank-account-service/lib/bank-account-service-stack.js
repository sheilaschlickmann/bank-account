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

    const balanceUpdate = new Function(this, 'BalanceUpdate', {
      code: Code.fromAsset('lambda'), 
      handler: 'balanceUpdate.handler', 
      runtime: Runtime.NODEJS_14_X,
      environment: {
        QUEUE_URL: queue.queueUrl, 
      },
    });

    const getBalance = new Function(this, 'GetBalance', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'balanceGetter.handler',
      code: Code.fromAsset('lambda'),
    });

    sendToQueue.addEventSource(new DynamoEventSource(transactionDB, {
      startingPosition: StartingPosition.LATEST,
    }));
    balanceUpdate.addEventSource(new SqsEventSource(queue));

    transactionDB.grantReadWriteData(transactionCreate);
    transactionDB.grantReadData(sendToQueue);
    queue.grantSendMessages(sendToQueue);
    queue.grantConsumeMessages(balanceUpdate);
    balanceDB.grantReadWriteData(balanceUpdate);
    balanceDB.grantReadData(getBalance);

    const api = new RestApi(this, 'BankAccountAPI', {
      restApiName: 'BankAccountAPI',
    });

    const transaction = api.root.addResource('transaction');
    transaction.addMethod('POST', new LambdaIntegration(transactionCreate));

    const balance = api.root.addResource('balance');
    balance.addMethod('GET', new LambdaIntegration(getBalance));

  } 
}
module.exports = { BankAccountServiceStack };
