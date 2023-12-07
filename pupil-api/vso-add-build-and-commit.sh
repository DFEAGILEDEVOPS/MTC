#!/usr/bin/env bash

mkdir -p dist
BUILD_FILE="./build.txt"
touch $BUILD_FILE
echo "$BUILD_BUILDNUMBER" | tr '\n' ' ' > "$BUILD_FILE"
cat $BUILD_FILE

COMMIT_FILE="./commit.txt"
touch $COMMIT_FILE
echo "$BUILD_SOURCEVERSION" | tr '\n' ' ' > $COMMIT_FILE
cat $COMMIT_FILE
