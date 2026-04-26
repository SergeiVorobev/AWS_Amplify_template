import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { etlAggregator } from './functions/etl-aggregator/resource';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

const backend = defineBackend({
  auth,
  data,
  etlAggregator,
});

// Get the Transaction DynamoDB table to attach a Stream trigger
const transactionTable = ((backend as any).data.resources.tables)["Transaction"];

// Get the ETL Lambda function instance
const etlLambda = (backend as any).etlAggregator.resources.lambda;

// Get the AggregateSale table and pass its name to Lambda via environment variable
const aggregateSaleTable = ((backend as any).data.resources.tables)["AggregateSale"];
etlLambda.addEnvironment(
  "AGGREGATE_SALE_TABLE_NAME",
  aggregateSaleTable.tableName
);

// Grant Lambda read/write permissions on the AggregateSale table
aggregateSaleTable.grantReadWriteData(etlLambda);

// Grant Lambda explicit permissions to query the GSI index
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

etlLambda.addToRolePolicy(new PolicyStatement({
  actions: ["dynamodb:Query"],
  resources: [
    `${aggregateSaleTable.tableArn}/index/aggregateSalesByAggregateKeyAndBranch`
  ],
}));

// Attach DynamoDB Stream as an event source trigger for the Lambda
etlLambda.addEventSource(
  new DynamoEventSource(transactionTable, {
    startingPosition: StartingPosition.LATEST,
    batchSize: 10,
  })
);
