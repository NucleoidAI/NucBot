#!/bin/sh
echo NucBot: Pulling

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 533052815932.dkr.ecr.us-east-1.amazonaws.com

docker pull 533052815932.dkr.ecr.us-east-1.amazonaws.com/nuc:nucleoid-com
docker pull 533052815932.dkr.ecr.us-east-1.amazonaws.com/nuc:docs
docker pull 533052815932.dkr.ecr.us-east-1.amazonaws.com/nuc:ide
docker pull 533052815932.dkr.ecr.us-east-1.amazonaws.com/nuc:service
docker pull 533052815932.dkr.ecr.us-east-1.amazonaws.com/nuc:ide-test

docker system prune -f
