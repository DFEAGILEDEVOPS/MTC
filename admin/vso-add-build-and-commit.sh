#!/usr/bin/env bash

BUILD_FILE="./public/build.txt"
touch $BUILD_FILE
echo "$BUILD_BUILDNUMBER" | tr '\n' ' ' > "$BUILD_FILE"
cat $BUILD_FILE

COMMIT_FILE="./public/commit.txt"
touch $COMMIT_FILE
echo "$BUILD_SOURCEVERSION" | tr '\n' ' ' > $COMMIT_FILE
cat $COMMIT_FILE
