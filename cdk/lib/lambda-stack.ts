import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

interface LambdaStackProps extends cdk.StackProps {
  repositoryPrefix: string;  // Matches ECR repository prefix
  imageTag: string;          // Tag of the ECR images (e.g., commit SHA)
}

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Define Lambda functions using ECR images
    const lambdaFunctions = [
      {
        name: 'lambda-function1',
        ecrRepo: `${props.repositoryPrefix}/image1`,
        memorySize: 256,
        timeout: cdk.Duration.seconds(15),
        imageTag: props.imageTag,
      },
      {
        name: 'lambda-function2',
        ecrRepo: `${props.repositoryPrefix}/image2`,
        memorySize: 256,
        timeout: cdk.Duration.seconds(15),
        imageTag: props.imageTag,
      },
      {
        name: 'lambda-function3',
        ecrRepo: `${props.repositoryPrefix}/image3`,
        memorySize: 256,
        timeout: cdk.Duration.minutes(15),
        imageTag: props.imageTag,
      },
    ];

    lambdaFunctions.forEach((config) => {

      // get the ECR repository 
      const repository = ecr.Repository.fromRepositoryName(this, `${config.name}-repo`, config.ecrRepo);

      const fn = new lambda.DockerImageFunction(this, `${config.name}`, {
        code: lambda.DockerImageCode.fromEcr(repository, { tag: `${config.imageTag}` }),
        functionName: config.name,
        memorySize: config.memorySize,
        timeout: config.timeout,
      });

      // Output the Lambda ARN for reference
      new cdk.CfnOutput(this, `${config.name}-arn`, {
        value: fn.functionArn,
        description: `ARN for ${config.name}`,
      });
    });
  }
}