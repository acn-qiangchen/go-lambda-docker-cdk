#!/bin/bash
COMPOSE_FILE="lambda/docker-compose.yml"
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

#build docker image in parallel
docker compose -f $COMPOSE_FILE build --parallel

#list all images in the compose file
IMAGES=$(docker compose -f $COMPOSE_FILE services --quiet)
echo "to push images: $IMAGES"

for IMAGE in $IMAGES; do
    ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE"
    docker tag "$IMAGE:latest" "$ECR_URI:latest"
    docker push "$ECR_URI:latest"
done

echo "✅ All images pushed successfully!"
