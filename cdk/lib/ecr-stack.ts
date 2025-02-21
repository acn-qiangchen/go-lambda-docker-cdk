import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

interface EcrStackProps extends cdk.StackProps {
  repositoryPrefix: string; // Prefix for all repository names
}

export class EcrStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcrStackProps) {
    super(scope, id, props);

    // Define your repositories here
    const repositories = [
      { name: `${props.repositoryPrefix}/image1`, lifecycleMaxImages: 10 },
      { name: `${props.repositoryPrefix}/image2`, lifecycleMaxImages: 10 },
      { name: `${props.repositoryPrefix}/image3`, lifecycleMaxImages: 10 },
    ];

    // Create ECR repositories dynamically
    repositories.forEach((repoConfig) => {
      const repository = new ecr.Repository(this, `${repoConfig.name}-repo`, {
        repositoryName: repoConfig.name,
        removalPolicy: cdk.RemovalPolicy.RETAIN, // DESTROY for easy cleanup; use RETAIN for production
        imageScanOnPush: true, // Enable vulnerability scanning
      });

      // Optional: Add lifecycle rule to keep only the latest N images
      repository.addLifecycleRule({
        maxImageCount: repoConfig.lifecycleMaxImages,
        rulePriority: 1,
        description: `Keep only the latest ${repoConfig.lifecycleMaxImages} images`,
      });

      // Output the repository URI for reference
      new cdk.CfnOutput(this, `${repoConfig.name}-uri`, {
        value: repository.repositoryUri,
        description: `URI for ${repoConfig.name} ECR repository`,
      });
    });
  }
}