const { Stack, RemovalPolicy, Duration } = require('aws-cdk-lib');
const {Table, AttributeType} = require("aws-cdk-lib/aws-dynamodb");
const {Queue} = require("aws-cdk-lib/aws-sqs");
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { SqsEventSource} = require("aws-cdk-lib/aws-lambda-event-sources");
const { RestApi, LambdaIntegration  } = require('aws-cdk-lib/aws-apigateway');

class BankAccountServiceStack extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);
        
    const transactionDB = new Table(this, 'TransactionsTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'Transaction',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const balanceDB = new Table(this, 'BalanceTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'Balance',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const transactionsQueue = new Queue(this, 'BalanceUpdateQueue', {
      visibilityTimeout: Duration.seconds(300)
    });

    const transactionCreate = new Function(this, 'CreateTransaction', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'transactionCreate.handler',
      code: Code.fromAsset('lambda'),
    });

    const balanceUpdater = new Function(this, 'BalanceUpdaterFunction', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'balanceUpdater.handler',
      code: Code.fromAsset('lambda'),
      events: [new SqsEventSource(transactionsQueue)],
    });

    /*transactionProcessor.addEnvironment('TRANSACTIONS_TABLE_NAME', transactionsTable.tableName);
    transactionProcessor.addEnvironment('BALANCE_UPDATE_QUEUE_URL', transactionsQueue.queueUrl);
    balanceUpdater.addEnvironment('BALANCE_TABLE_NAME', balanceTable.tableName);*/

    transactionDB.grantReadWriteData(transactionCreate);
    balanceDB.grantReadWriteData(balanceUpdater);
    transactionsQueue.grantSendMessages(transactionCreate);
    transactionsQueue.grantConsumeMessages(balanceUpdater);

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
