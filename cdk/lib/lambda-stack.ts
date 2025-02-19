import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

interface LambdaStackProps extends cdk.StackProps {
  repositoryArn: string;
  repositoryUri: string;
}

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: LambdaStackProps) {
    super(scope, id, props);

    // Import the existing ECR repository by name
    const repositoryName = cdk.Fn.importValue('RepositoryName');
    const repository = ecr.Repository.fromRepositoryName(this, 'ImportedRepository', repositoryName);

    // Define the Lambda function using the ECR image
    const lambdaFunction = new lambda.Function(this, 'GoLambdaFunction', {
      code: lambda.Code.fromEcrImage(repository),
      handler: lambda.Handler.FROM_IMAGE,
      runtime: lambda.Runtime.FROM_IMAGE,
    });
    // API Gateway to expose Lambda function
    const api = new apigateway.LambdaRestApi(this, 'ApiGateway', {
      handler: lambdaFunction,
      proxy: true,
    });
  }
}