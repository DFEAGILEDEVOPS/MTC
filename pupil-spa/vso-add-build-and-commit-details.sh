#!/usr/bin/env bash

sed -i 's/#mtc.build#/'"$BUILD_BUILDNUMBER"'/' ./src/index.html
sed -i 's/#mtc.commit#/'"$BUILD_SOURCEVERSION"'/' ./src/index.html
