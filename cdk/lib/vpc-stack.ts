import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly lambdaSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC with public and private subnets
    this.vpc = new ec2.Vpc(this, 'MainVpc', {
      maxAzs: 2,  // Use 2 Availability Zones
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
      natGateways: 1,  // Add a NAT Gateway for private subnets
    });

    // Create Security Group for Lambda functions
    this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Lambda functions',
      allowAllOutbound: true,  // Allow outbound traffic for Lambda to access internet through NAT
      securityGroupName: `${id}-lambda-sg`,
    });

    // Add ingress rules for Lambda security group
    // By default, no inbound traffic is allowed
    // We'll allow traffic between Lambda functions in the same security group
    this.lambdaSecurityGroup.addIngressRule(
      this.lambdaSecurityGroup,
      ec2.Port.allTcp(),
      'Allow traffic between Lambda functions'
    );

    // Export the VPC for cross-stack reference
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: `${this.stackName}-VpcId`,
    });

    // Export private subnet IDs
    this.vpc.privateSubnets.forEach((subnet, index) => {
      new cdk.CfnOutput(this, `PrivateSubnet${index + 1}Id`, {
        value: subnet.subnetId,
        description: `Private Subnet ${index + 1} ID`,
        exportName: `${this.stackName}-PrivateSubnet${index + 1}Id`,
      });
    });

    // Export Lambda security group ID
    new cdk.CfnOutput(this, 'LambdaSecurityGroupId', {
      value: this.lambdaSecurityGroup.securityGroupId,
      description: 'Security Group ID for Lambda functions',
      exportName: `${this.stackName}-LambdaSecurityGroupId`,
    });
  }
} 