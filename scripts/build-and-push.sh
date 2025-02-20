#!/bin/bash
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

#build docker image in parallel
docker compose -f scripts/docker-compose.yml build --parallel

#for IMAGE in image1 image2 image3; do
for IMAGE in image1; do
    ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE"
    docker tag "$IMAGE:latest" "$ECR_URI:latest"
    docker push "$ECR_URI:latest"
done

echo "✅ All images pushed successfully!"