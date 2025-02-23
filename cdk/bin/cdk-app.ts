import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../lib/lambda-stack';
import { EcrStack } from '../lib/ecr-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const repositoryPrefix = process.env.ECR_REPOSITORY_PREFIX || 'my-app';
const imageTag = process.env.IMAGE_TAG || 'latest';  // Fallback to 'latest' if not set


const ecrStack = new EcrStack(app, 'EcrStack', { repositoryPrefix, env });
const lambdaStack = new LambdaStack(app, 'LambdaStack', { repositoryPrefix, imageTag, env });

app.synth();
