import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../lib/lambda-stack';
import { EcrStack } from '../lib/ecr-stack';
import { SsmStack } from '../lib/ssm-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const repositoryPrefix = process.env.ECR_REPOSITORY_PREFIX || 'my-app';
const imageTag = process.env.IMAGE_TAG || 'latest';  // Fallback to 'latest' if not set

// Deploy stacks with dependencies
//const ssmStack = new SsmStack(app, 'SsmStack', { repositoryPrefix, env });
const ecrStack = new EcrStack(app, 'EcrStack', { repositoryPrefix, env });
//const lambdaStack = new LambdaStack(app, 'LambdaStack', { repositoryPrefix, imageTag, env });

//lambdaStack.addDependency(ssmStack)

// new EcrStack(app, 'EcrStack',{
//     repositoryPrefix: repositoryPrefix,
//     env: env,
//   });

// new LambdaStack(app, 'LambdaStack', {
//   repositoryPrefix: repositoryPrefix,
//   imageTag: imageTag,
//   env: env,
// });

// new SsmStack(app, 'SsmStack', {});

app.synth();
