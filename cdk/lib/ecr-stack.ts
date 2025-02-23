import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as fs from "fs";
import * as path from "path";
import { Construct } from "constructs";

interface EcrStackProps extends cdk.StackProps {
  repositoryPrefix: string; // Prefix for all repository names
}

// Read the config file (relative to the CDK execution context)
const env = process.env.ENV || "dev";
const configPath = path.join(__dirname, `../config.${env}.json`);
const configJson = JSON.parse(fs.readFileSync(configPath, "utf-8"));

export class EcrStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcrStackProps) {
    super(scope, id, props);

    // Access the lambda config
    const lambdaConfig = configJson.lambda;

    // Create ECR repositories dynamically
    lambdaConfig.forEach((config: any) => {
      const repository = new ecr.Repository(this, `${config.imageName}-repo`, {
        repositoryName: `${props.repositoryPrefix}/${config.imageName}`,
        removalPolicy: cdk.RemovalPolicy.RETAIN, // DESTROY for easy cleanup; use RETAIN for production
        imageScanOnPush: true, // Enable vulnerability scanning
      });

      // Optional: Add lifecycle rule to keep only the latest N images
      repository.addLifecycleRule({
        maxImageCount: config.lifecycleMaxImages || 10,
        rulePriority: 1,
        description: `Keep only the latest ${config.lifecycleMaxImages} images`,
      });

      // Output the repository URI for reference
      new cdk.CfnOutput(this, `${config.imageName}-uri`, {
        value: repository.repositoryUri,
        description: `URI for ${config.imageName} ECR repository`,
      });
    });
  }
}
