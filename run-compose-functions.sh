#!/bin/bash
set -e


docker-compose -f docker-compose.yml -f docker-compose.functions.yml build

