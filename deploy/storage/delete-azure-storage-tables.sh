
STORAGE_ACCOUNT=$1
# clear down azure storage for prod 2020
az storage table delete --name checkResult --account-name $STORAGE_ACCOUNT
az storage table delete --name checkStartedEvents --account-name $STORAGE_ACCOUNT
az storage table delete --name preparedCheck --account-name $STORAGE_ACCOUNT
az storage table delete --name pupilEvent --account-name $STORAGE_ACCOUNT
az storage table delete --name pupilFeedback --account-name $STORAGE_ACCOUNT
az storage table delete --name receivedCheck --account-name $STORAGE_ACCOUNT
