# Deploying Go Lambda with Docker using AWS CDK

## Prerequisites
- Install [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-typescript.html)
- Install [AWS CLI](https://aws.amazon.com/cli/)
- Install Node.js and TypeScript
- Install Go

## Steps to Deploy
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/go-lambda-docker-cdk.git
   cd go-lambda-docker-cdk/cdk
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Bootstrap AWS CDK (if first time using CDK in your AWS account):
   ```sh
   cdk bootstrap
   ```
4. Deploy the stack:
   ```sh
   cdk deploy
   ```
5. Get the API Gateway endpoint from the output and test:
   ```sh
   curl -X GET <API_GATEWAY_URL>
   ```

## Steps to setup AWS WebIdentity federation for Github action
1. open AWS console and create role
2. select "web identity" as trust entity
3. trust entity type : web identity
4. create github identity provider : 
   ```
   provider URL: https://token.actions.githubusercontent.com
   Audience: sts.amazonaws.com
   ```
5. choose the idp and audience created above
6. input the github organization name ( or account name). 
7. add permission to role created. (choose AdministratorAccess for test use)
   ```
   {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sts:AssumeRoleWithWebIdentity"
            ],
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                    "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USER/YOUR_REPO:ref:refs/heads/master"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": [
                "ecr:*",
                "lambda:*",
                "apigateway:*",
                "cloudformation:*",
                "s3:*",
                "iam:*",
                "ssm:*",
            ],
            "Resource": "*"
        }
    ]
   }
   ```