import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface SsmStackProps extends cdk.StackProps {
  repositoryPrefix: string;  // Matches ECR repository prefix
}

export class SsmStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SsmStackProps) {
    super(scope, id, props);

    // Define Lambda configurations
    const lambdaConfigs = [
      {
        name: 'lambda-function1',
        config: {
          memorySize: 256,
          timeoutSeconds: 20,
          path: 'function1',
          environment: { ENV: 'prod' },
          ecrRepo: `${props.repositoryPrefix}/image1`,
        },
      },
      {
        name: 'lambda-function2',
        config: {
          memorySize: 256,
          timeoutSeconds: 20,
          path: 'function2',
          environment: { DB_HOST: 'example.com' },
          ecrRepo: `${props.repositoryPrefix}/image2`,
        },
      },
      {
        name: 'lambda-function3',
        config: {
          memorySize: 256,
          timeoutSeconds: 20,
          path: 'function3',
          environment: {},
          ecrRepo: `${props.repositoryPrefix}/image3`,
        },
      },
    ];

    // Create SSM parameters for each Lambda config
    lambdaConfigs.forEach(({ name, config }) => {
      new ssm.StringParameter(this, `${name}-config-param`, {
        parameterName: `/lambda/${name}/config`,
        stringValue: JSON.stringify(config),
        description: `Configuration for ${name}`,
      });

      // Placeholder for ARN (updated by LambdaStack later)
      new ssm.StringParameter(this, `${name}-arn-param`, {
        parameterName: `/lambda/${name}/arn`,
        stringValue: 'placeholder',  // Initial value, updated post-deployment
        description: `ARN for ${name} (updated by LambdaStack)`,
      });
    });
  }
}