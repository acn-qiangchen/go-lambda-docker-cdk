import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'; // Import the 'apigateway' module

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
        path: 'function1',
        memorySize: 256,
        timeout: cdk.Duration.seconds(15),
        imageTag: props.imageTag,
      },
      {
        name: 'lambda-function2',
        ecrRepo: `${props.repositoryPrefix}/image2`,
        path: 'function2',
        memorySize: 256,
        timeout: cdk.Duration.seconds(15),
        imageTag: props.imageTag,
      },
      {
        name: 'lambda-function3',
        ecrRepo: `${props.repositoryPrefix}/image3`,
        path: 'function3',
        memorySize: 256,
        timeout: cdk.Duration.minutes(15),
        imageTag: props.imageTag,
      },
    ];

    // Create a single API Gateway for all Lambda functions
    const api = new apigateway.RestApi(this, 'LambdaApi', {
      restApiName: 'LambdaServicesApi',
      description: 'API Gateway for Lambda functions deployed from ECR images',
      deployOptions: {
        stageName: 'prod',  // Deployment stage
      },
    });

    lambdaFunctions.forEach((config) => {

      // get the ECR repository 
      const repository = ecr.Repository.fromRepositoryName(this, `${config.name}-repo`, config.ecrRepo);

      const fn = new lambda.DockerImageFunction(this, `${config.name}`, {
        code: lambda.DockerImageCode.fromEcr(repository, { tagOrDigest: `${config.imageTag}` }),
        functionName: config.name,
        memorySize: config.memorySize,
        timeout: config.timeout,
      });

      // Create API resource and method
      const resource = api.root.addResource(config.path);
      resource.addMethod('GET', new apigateway.LambdaIntegration(fn));  // Add GET endpoint

      // Output Lambda ARN and API endpoint
      new cdk.CfnOutput(this, `${config.name}-arn`, {
        value: fn.functionArn,
        description: `ARN for ${config.name}`,
      });

      new cdk.CfnOutput(this, `${config.name}-endpoint`, {
        value: `${api.url}${config.path}`,
        description: `API endpoint for ${config.name}`,
      });
    });

    // Output the base API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'Base URL for the API Gateway',
    });
  }
}