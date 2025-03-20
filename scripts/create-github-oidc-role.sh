#!/bin/bash

# Configuration
GITHUB_ORG="shearer"  # Replace with your GitHub organization/username
REPO_NAME="go-lambda-docker-cdk"  # Replace with your repository name
AWS_REGION="us-east-1"  # Replace with your AWS region
ROLE_NAME="GithubActionOIDCRole"
PROVIDER_URL="token.actions.githubusercontent.com"
AWS_PROFILE=${AWS_PROFILE:-"github-oidc-admin"}  # Use provided profile or default to github-oidc-admin

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Creating GitHub Actions OIDC Role using profile: ${AWS_PROFILE}${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Verify AWS profile
echo "Verifying AWS profile..."
if ! aws sts get-caller-identity --profile "${AWS_PROFILE}" &> /dev/null; then
    echo -e "${RED}Failed to use AWS profile '${AWS_PROFILE}'. Please check your credentials.${NC}"
    exit 1
fi

# Create OIDC Provider if it doesn't exist
echo "Checking if OIDC provider exists..."
if ! aws iam list-open-id-connect-providers --profile "${AWS_PROFILE}" | grep -q $(aws iam list-open-id-connect-providers --profile "${AWS_PROFILE}" | grep $PROVIDER_URL | awk '{print $2}'); then
    echo "Creating OIDC Provider..."
    aws iam create-open-id-connect-provider \
        --profile "${AWS_PROFILE}" \
        --url https://$PROVIDER_URL \
        --client-id-list "sts.amazonaws.com" \
        --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1"
fi

# Create trust policy
echo "Creating trust policy..."
cat << EOF > /tmp/trust-policy.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::$(aws sts get-caller-identity --profile "${AWS_PROFILE}" --query Account --output text):oidc-provider/$PROVIDER_URL"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringLike": {
                    "token.actions.githubusercontent.com:sub": "repo:${GITHUB_ORG}/${REPO_NAME}:*"
                }
            }
        }
    ]
}
EOF

# Create IAM role with trust policy
echo "Creating IAM role..."
aws iam create-role \
    --profile "${AWS_PROFILE}" \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file:///tmp/trust-policy.json

# Create policy for CDK deployment
echo "Creating CDK deployment policy..."
cat << EOF > /tmp/cdk-policy.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sts:AssumeRole",
                "cloudformation:*",
                "ecr:*",
                "lambda:*",
                "iam:*",
                "ec2:*",
                "ssm:*",
                "s3:*",
                "logs:*"
            ],
            "Resource": "*"
        }
    ]
}
EOF

# Create and attach the policy
echo "Attaching policy to role..."
aws iam put-role-policy \
    --profile "${AWS_PROFILE}" \
    --role-name $ROLE_NAME \
    --policy-name GithubActionsCDKPolicy \
    --policy-document file:///tmp/cdk-policy.json

# Clean up temporary files
rm /tmp/trust-policy.json /tmp/cdk-policy.json

echo -e "${GREEN}Successfully created OIDC role for GitHub Actions!${NC}"
echo -e "Role ARN: arn:aws:iam::$(aws sts get-caller-identity --profile "${AWS_PROFILE}" --query Account --output text):role/$ROLE_NAME"
echo -e "Please make sure to update your GitHub Actions workflow files with this Role ARN." 