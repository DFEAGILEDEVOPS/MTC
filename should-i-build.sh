#!/usr/bin/env bash
# checks for existence of buildme.txt, returns non zero exit code if not found
if [ -f "./buildme.txt" ]
then
	exit 0
else
	exit 1
fi