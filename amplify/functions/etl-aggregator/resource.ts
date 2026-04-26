import { defineFunction } from "@aws-amplify/backend";

export const etlAggregator = defineFunction({
  name: "etl-aggregator",
  entry: "./handler.ts",
});