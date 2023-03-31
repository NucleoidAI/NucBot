#!/bin/sh
echo NucBot: Starting

docker run -d -p 8001:80 533052815932.dkr.ecr.us-east-1.amazonaws.com/nuc:nucleoid-com
docker run -d -p 8002:80 533052815932.dkr.ecr.us-east-1.amazonaws.com/nuc:docs
docker run -d -p 8003:80 533052815932.dkr.ecr.us-east-1.amazonaws.com/nuc:ide
docker run -d -p 8004:80 533052815932.dkr.ecr.us-east-1.amazonaws.com/nuc:service
docker run -d -p 80:80 533052815932.dkr.ecr.us-east-1.amazonaws.com/nuc:ide-test
