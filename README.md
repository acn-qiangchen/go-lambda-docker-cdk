# Deploying Go Lambda with Docker using AWS CDK

## Prerequisites
- Install [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-typescript.html)
- Install [AWS CLI](https://aws.amazon.com/cli/)
- Install Node.js and TypeScript
- Install Go

## Steps to Deploy
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/go-lambda-docker-cdk.git
   cd go-lambda-docker-cdk/cdk
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Bootstrap AWS CDK (if first time using CDK in your AWS account):
   ```sh
   cdk bootstrap
   ```
4. Deploy the stack:
   ```sh
   cdk deploy
   ```
5. Get the API Gateway endpoint from the output and test:
   ```sh
   curl -X GET <API_GATEWAY_URL>
   ```