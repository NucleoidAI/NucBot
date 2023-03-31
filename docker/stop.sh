#!/bin/sh
echo NucBot: Stopping

docker kill $(docker ps -q)
