import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../lib/lambda-stack';
import { EcrStack } from '../lib/ecr-stack';
import { VpcStack } from '../lib/vpc-stack';
import { IamStack } from '../lib/iam-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const repositoryPrefix = process.env.ECR_REPOSITORY_PREFIX || 'my-app';
const imageTag = process.env.IMAGE_TAG || 'latest';  // Fallback to 'latest' if not set

const vpcStack = new VpcStack(app, 'VpcStack', { env });
const iamStack = new IamStack(app, 'IamStack', { env });
const ecrStack = new EcrStack(app, 'EcrStack', { repositoryPrefix, env });
const lambdaStack = new LambdaStack(app, 'LambdaStack', { 
  repositoryPrefix, 
  imageTag, 
  env,
  vpcStackName: vpcStack.stackName,
  iamStackName: iamStack.stackName
});

// Add dependencies to ensure proper deployment order
lambdaStack.addDependency(vpcStack);
lambdaStack.addDependency(iamStack);
lambdaStack.addDependency(ecrStack);

app.synth();
