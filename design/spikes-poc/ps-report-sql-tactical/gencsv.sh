#!/bin/bash

# $1 - number of lines to append to the csv
# $2 - csv file to source the line from
# $3 - csv file to append them to

lines=$1
sourceFile=$2
destFile=$3

x=1
while [ $x -le $lines ]
do
  sed -n '2p' $2 >> $3
  x=$(( $x + 1 ))
done
