import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'; // Import the 'apigateway' module
import * as ssm from 'aws-cdk-lib/aws-ssm'; // Import the 'ssm' module
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as fs from "fs";
import * as path from "path";
import { Construct } from 'constructs';

interface LambdaStackProps extends cdk.StackProps {
  repositoryPrefix: string;  // Matches ECR repository prefix
  imageTag: string;          // Tag of the ECR images (e.g., commit SHA)
  vpcStackName: string;  // Name of the VPC stack for cross-stack references
}

// Read the config file (relative to the CDK execution context)
const env = process.env.ENV || "dev";
const configPath = path.join(__dirname, `../config.${env}.json`);
const configJson = JSON.parse(fs.readFileSync(configPath, "utf-8"));

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Get the first two AZs from the region
    const azs = cdk.Stack.of(this).availabilityZones.slice(0, 2);

    // Import VPC using cross-stack reference
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'ImportedVPC', {
      vpcId: cdk.Fn.importValue(`${props.vpcStackName}-VpcId`),
      availabilityZones: azs,
      privateSubnetIds: [
        cdk.Fn.importValue(`${props.vpcStackName}-PrivateSubnet1Id`),
        cdk.Fn.importValue(`${props.vpcStackName}-PrivateSubnet2Id`),
      ],
    });

    // Create a single API Gateway for all Lambda functions
    const api = new apigateway.RestApi(this, 'LambdaApi', {
      restApiName: 'LambdaServicesApi',
      description: 'API Gateway for Lambda functions deployed from ECR images',
      deployOptions: {
        stageName: 'prod',  // Deployment stage
      },
    });

    // Access the lambda config
    const lambdaConfig = configJson.lambda;

    lambdaConfig.forEach((config : any) => {
      // get Image tag from SSM
      const imageTag = ssm.StringParameter.valueForStringParameter(this, `/${env}/${props.repositoryPrefix}/${config.imageName}/image-tag`);
      console.log(`****imageTag=${imageTag}`)
      // get the ECR repository 
      const repository = ecr.Repository.fromRepositoryName(this, `${config.functionName}-repo`, `${env}/${props.repositoryPrefix}/${config.imageName}`);
      // Create Lambda function with VPC configuration
      const fn = new lambda.DockerImageFunction(this, config.functionName, {
        code: lambda.DockerImageCode.fromEcr(repository, { tagOrDigest: imageTag || 'latest' }),
        functionName: config.functionName,
        memorySize: config.memorySize,
        timeout: cdk.Duration.seconds(config.timeoutSeconds),
        environment: config.environment || {},
        vpc: vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          onePerAz: true  // Ensure subnet selection across all AZs
        },
        allowPublicSubnet: false
      });

      // Create API resource and method
      const resource = api.root.addResource(config.path);
      resource.addMethod('GET', new apigateway.LambdaIntegration(fn));  // Add GET endpoint

      // Output Lambda ARN and API endpoint
      new cdk.CfnOutput(this, `${config.functionName}-arn`, {
        value: fn.functionArn,
        description: `ARN for ${config.functionName}`,
      });

      new cdk.CfnOutput(this, `${config.functionName}-endpoint`, {
        value: `${api.url}${config.path}`,
        description: `API endpoint for ${config.functionName}`,
      });
    });

    // Output the base API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'Base URL for the API Gateway',
    });
  }
}