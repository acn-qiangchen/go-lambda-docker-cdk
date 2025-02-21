import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../lib/lambda-stack';
import { EcrStack } from '../lib/ecr-stack';

const app = new cdk.App();
new EcrStack(app, 'EcrStack',{
    repositoryPrefix: process.env.ECR_REPOSITORY_PREFIX || 'my-app', // Matches your GitHub Actions ECR_REPOSITORY_PREFIX
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
    },
  });
new LambdaStack(app, 'LambdaStack');
