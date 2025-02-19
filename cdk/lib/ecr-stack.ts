import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export class EcrStack extends cdk.Stack {
    public readonly repository: ecr.IRepository;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const repository = new ecr.Repository(this, 'LambdaRepository', {
        repositoryName: 'go-lambda-docker',
        removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep the repository even if the stack is deleted
        });
        
    // Export the repository name
    new cdk.CfnOutput(this, 'RepositoryName', {
        value: repository.repositoryName,
      });
  
      // Export the repository ARN
      new cdk.CfnOutput(this, 'RepositoryArn', {
        value: repository.repositoryArn,
      });
  
      this.repository = repository;
  }
}