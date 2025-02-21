import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'; // Import the 'apigateway' module
import * as ssm from 'aws-cdk-lib/aws-ssm'; // Import the 'ssm' module

interface LambdaStackProps extends cdk.StackProps {
  repositoryPrefix: string;  // Matches ECR repository prefix
  imageTag: string;          // Tag of the ECR images (e.g., commit SHA)
}

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const lambdaNames = [
      'lambda-function1', 
      'lambda-function2', 
      'lambda-function3'
    ];

    // Create a single API Gateway for all Lambda functions
    const api = new apigateway.RestApi(this, 'LambdaApi', {
      restApiName: 'LambdaServicesApi',
      description: 'API Gateway for Lambda functions deployed from ECR images',
      deployOptions: {
        stageName: 'prod',  // Deployment stage
      },
    });

    lambdaNames.forEach((name) => {
      // Fetch config from SSM
      // const configParam = ssm.StringParameter.fromStringParameterName(
      //   this,
      //   `${name}-config-param`,
      //   `/lambda/${name}/config`
      // );

      const stringValue = ssm.StringParameter.valueFromLookup(this, `/lambda/${name}/config`);

      // console.log(`Config for ${name}: ${configParam.stringValue}`);
      // const config = JSON.parse(configParam.stringValue);
      const config = JSON.parse(stringValue);

      // get the ECR repository 
      const repository = ecr.Repository.fromRepositoryName(this, `${name}-repo`, config.ecrRepo);

      // Create Lambda function
      const fn = new lambda.DockerImageFunction(this, name, {
        code: lambda.DockerImageCode.fromEcr(repository, { tagOrDigest: `${config.imageTag}` || 'latest' }),
        functionName: name,
        memorySize: config.memorySize,
        timeout: cdk.Duration.seconds(config.timeoutSeconds),
        environment: config.environment || {},
      });

      // Update ARN in SSM
      new ssm.StringParameter(this, `${name}-arn-param`, {
        parameterName: `/lambda/${name}/arn`,
        stringValue: fn.functionArn,
        description: `ARN for ${name}`,
      });

      // Create API resource and method
      const resource = api.root.addResource(config.path);
      resource.addMethod('GET', new apigateway.LambdaIntegration(fn));  // Add GET endpoint

      // Output Lambda ARN and API endpoint
      new cdk.CfnOutput(this, `${name}-arn`, {
        value: fn.functionArn,
        description: `ARN for ${name}`,
      });

      new cdk.CfnOutput(this, `${name}-endpoint`, {
        value: `${api.url}${config.path}`,
        description: `API endpoint for ${name}`,
      });
    });

    // Output the base API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'Base URL for the API Gateway',
    });
  }
}