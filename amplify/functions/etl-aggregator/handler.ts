import type { DynamoDBStreamHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.AGGREGATE_SALE_TABLE_NAME!;

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    // Process only INSERT events, skip updates and deletes
    if (record.eventName !== "INSERT") continue;

    const newItem = record.dynamodb?.NewImage;
    if (!newItem) continue;
    
    // Extract fields from the DynamoDB Stream record
    const category     = newItem.category?.S ?? "";
    const branch       = newItem.branch?.S ?? "";
    const totalAmount  = parseFloat(newItem.totalAmount?.N ?? "0");
    const quantity     = parseInt(newItem.quantity?.N ?? "0");
    const createdAt    = newItem.createdAt?.S ?? new Date().toISOString();
    const yearMonth    = createdAt.substring(0, 7); // "2025-04"
    const aggregateKey = `${category}#${yearMonth}`;

    // Look up existing aggregate for this category+month and branch
    const existing = await client.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "aggregateSalesByAggregateKeyAndBranch",
      KeyConditionExpression: "aggregateKey = :ak AND branch = :br",
      ExpressionAttributeValues: { ":ak": aggregateKey, ":br": branch },
    }));

    if (existing.Items && existing.Items.length > 0) {
      // Aggregate exists — update totals and recalculate average price
      const item = existing.Items[0];
      const newTotalRevenue   = (item.totalRevenue ?? 0) + totalAmount;
      const newTotalQuantity  = (item.totalQuantity ?? 0) + quantity;
      const newCount          = (item.transactionCount ?? 0) + 1;
      const newAvgPrice       = newTotalRevenue / newTotalQuantity;

      await client.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: item.id },
        UpdateExpression: "SET totalRevenue = :tr, totalQuantity = :tq, transactionCount = :tc, avgPrice = :ap",
        ExpressionAttributeValues: {
          ":tr": newTotalRevenue,
          ":tq": newTotalQuantity,
          ":tc": newCount,
          ":ap": newAvgPrice,
        },
      }));
    } else {
      // Create a new aggregate
      await client.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id:               randomUUID(),
          aggregateKey,
          branch,
          totalRevenue:     totalAmount,
          totalQuantity:    quantity,
          avgPrice:         totalAmount / quantity,
          transactionCount: 1,
          createdAt:        new Date().toISOString(),
          updatedAt:        new Date().toISOString(),
        },
      }));
    }
  }
};