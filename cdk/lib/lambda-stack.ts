import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define Lambda function using Docker image
    const lambdaFunction = new lambda.DockerImageFunction(this, 'GoLambdaFunction', {
      code: lambda.DockerImageCode.fromImageAsset('../lambda', {
        platform: cdk.aws_ecr_assets.Platform.LINUX_AMD64,
      }),
    });

    // API Gateway to expose Lambda function
    const api = new apigateway.LambdaRestApi(this, 'ApiGateway', {
      handler: lambdaFunction,
      proxy: true,
    });
  }
}