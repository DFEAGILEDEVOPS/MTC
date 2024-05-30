#!/bin/sh
#set -x

# Run the tests locally in parallel
JOB_COUNT=6
PARALLEL_FEATURE_FILE=tags-parallel.txt
SERIES_FEATURE_FILE=tags-serial.txt
LOG_DIR=out
BIN=parallel

# Ensure we have a parallel binary
if ! type -p ${BIN} >/dev/null 2>/dev/null; then
  echo "${BIN} not found"
  echo ""
  echo "You can install it using homebrew:"
  echo '   `brew install parallel`'
  echo ""
  exit 1
fi

clean ()
{
  rm -rf $LOG_DIR
  mkdir $LOG_DIR
}

mybanner ()
{
  echo "+------------------------------------------+"
  printf "| %-40s |\n" "`date`"
  echo "|                                          |"
  printf "|`tput bold` %-40s `tput sgr0`|\n" "$@"
  echo "+------------------------------------------+"
}

# print to the console in RED
writeError ()
{
  MSG=$1
  echo -e "\033[31m ${MSG} \033[0m"
}

# print to the console in YELLOW
writeInfo ()
{
  MSG=$1
  echo -e "\033[33m ${MSG} \033[0m"
}

writeSuccess ()
{
    MSG=$1
  echo -e "\033[92m ${MSG} \033[0m"
}

test ()
{
  FILE=$1
  WORKERS=$2
  LOG_SUB_DIR=$3
  TOTAL_FEATURES=$(grep @ ${FILE} | wc -l)
  echo "Found ${TOTAL_FEATURES} features to test"
  time ${BIN} --progress --noswap --no-run-if-empty -j $WORKERS -a $FILE --group --results ${LOG_DIR}/${LOG_SUB_DIR}/job_{} 'rake features OPTS="--tags {}"'
  EXIT_CODE=$?

  if [[ ${EXIT_CODE} -eq 0 ]]; then
    writeSuccess "Test completed for $FILE: exit code was ${EXIT_CODE}"
  else
    writeError "Test completed for $FILE: exit code was ${EXIT_CODE}"
    writeError "$FILE tests had ${EXIT_CODE} failures"
    ERR_MSG=$(grep -5 'TEST SUITE FAILED' ${LOG_DIR}/${LOG_SUB_DIR}/*)
    writeInfo "$ERR_MSG"
  fi
}

mybanner "Cleaning $LOG_DIR"
clean

mybanner 'Admin series tests'
test ${SERIES_FEATURE_FILE} 1 'series'

mybanner 'Admin parallel tests'
test ${PARALLEL_FEATURE_FILE} ${JOB_COUNT} 'parallel'
