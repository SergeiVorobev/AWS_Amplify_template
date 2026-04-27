# Real-Time Sales Analytics Platform (AWS Amplify + Vue.js)

This repository contains a full-stack application for real-time sales tracking and data aggregation. It demonstrates a modern serverless architecture using AWS Amplify (Gen 2), automated ETL processes, and interactive data visualization.

## 🚀 Overview

The project is designed to handle high-frequency transaction data, automatically aggregate it via backend triggers, and present actionable insights through a responsive dashboard.

## 🛠 Tech Stack

- **Frontend**: Vue.js 3, Vite, PrimeVue (UI Components)
- **State Management**: Vue Router
- **Charts**: ECharts & vue-echarts
- **Backend**: AWS Amplify (Gen 2)
- **Database**: Amazon DynamoDB
- **Compute**: AWS Lambda (Node.js ETL)
- **Real-time**: DynamoDB Streams

## ✨ Key Features

- **Automated ETL Pipeline**: Every new transaction triggers a Lambda function via DynamoDB Streams, which calculates real-time aggregates (total revenue, average price, transaction count) by branch and category.
- **Dynamic Data Modeling**: Implementation of complex schemas with Secondary Indexes in `resource.ts` for optimized query performance.
- **Interactive Dashboard**:
  - Monthly Revenue Analysis (Bar Charts)
  - Category Distribution (Pie Charts)
  - Top Branch Performance (Horizontal Bar Charts)
- **Advanced Filtering**: Real-time data filtering by Year, Category, and Branch.
- **Secure API**: Managed GraphQL endpoint via AWS AppSync with API Key authorization.

## 🏗 Implementation Stages

1. **Data Modeling**: Defining `Transaction` and `AggregateSale` schemas in Amplify Gen 2.
2. **Serverless Logic**: Deploying Lambda functions that process stream events from DynamoDB.
3. **Frontend Development**: Building a robust transaction entry form with PrimeVue.
4. **Analytics**: Integrating ECharts for visual data representation and real-time updates.

## 🚀 Deployment

The project is configured for CI/CD with AWS Amplify Hosting. Any merge to the `main` branch triggers an automatic build and deployment of both the backend resources and the frontend assets.

For local development:
```bash
npm install
npx ampx sandbox
npm run dev
```

## 🔒 Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## 📄 License

This library is licensed under the MIT-0 License. See the LICENSE file.