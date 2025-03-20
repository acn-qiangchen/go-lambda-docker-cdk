#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first:${NC}"
    echo -e "For macOS: brew install awscli"
    echo -e "For Linux: sudo apt-get install awscli"
    exit 1
fi

# Configuration
PROFILE_NAME="github-oidc-admin"
AWS_REGION="us-east-1"  # Default region, can be changed

echo -e "${YELLOW}Setting up AWS CLI profile for GitHub OIDC setup...${NC}"
echo -e "This script will create a new AWS CLI profile named '${PROFILE_NAME}'"
echo -e "You will need your AWS access key and secret key with administrator privileges."
echo

# Prompt for AWS credentials
read -p "Enter AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -sp "Enter AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
echo
read -p "Enter AWS Region [${AWS_REGION}]: " INPUT_REGION
AWS_REGION=${INPUT_REGION:-$AWS_REGION}

# Configure AWS CLI profile
echo -e "\nConfiguring AWS CLI profile..."
aws configure set aws_access_key_id "${AWS_ACCESS_KEY_ID}" --profile "${PROFILE_NAME}"
aws configure set aws_secret_access_key "${AWS_SECRET_ACCESS_KEY}" --profile "${PROFILE_NAME}"
aws configure set region "${AWS_REGION}" --profile "${PROFILE_NAME}"
aws configure set output "json" --profile "${PROFILE_NAME}"

# Verify the configuration
echo -e "\nVerifying AWS credentials..."
if aws sts get-caller-identity --profile "${PROFILE_NAME}" &> /dev/null; then
    echo -e "${GREEN}AWS CLI profile '${PROFILE_NAME}' has been successfully configured!${NC}"
    echo -e "\nYou can now use this profile to create the GitHub OIDC role using:"
    echo -e "AWS_PROFILE=${PROFILE_NAME} ./scripts/create-github-oidc-role.sh"
else
    echo -e "${RED}Failed to verify AWS credentials. Please check your input and try again.${NC}"
    exit 1
fi 