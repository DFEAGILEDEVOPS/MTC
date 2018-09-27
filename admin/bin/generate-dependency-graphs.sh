#!/usr/bin/env bash

set +x
set -e

output=dependency-graphs

interestingFolders="controllers services"
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd $dir/..

for folder in $interestingFolders; do
   mkdir -p $output/$folder
   for path in $(ls $folder/*.js); do
        echo "Processing $path"
        file=$(basename $path)
        madge -i $output/$folder/${file}.png -x '(monitor|config)\.js' $path
    done;
done;
