import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../lib/lambda-stack';
import { EcrStack } from '../lib/ecr-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const repositoryPrefix = process.env.REPOSITORY_PREFIX || 'my-app';
const imageTag = process.env.IMAGE_TAG || 'latest';  // Fallback to 'latest' if not set

new EcrStack(app, 'EcrStack',{
    repositoryPrefix: repositoryPrefix,
    env: env,
  });

new LambdaStack(app, 'LambdaStack', {
  repositoryPrefix: repositoryPrefix,
  imageTag: imageTag,
  env: env,
});
