
STORAGE_ACCOUNT=$1
# create storage for prod 2020
az storage table create --name checkResult --account-name $STORAGE_ACCOUNT
az storage table create --name checkStartedEvents --account-name $STORAGE_ACCOUNT
az storage table create --name connectionTests --account-name $STORAGE_ACCOUNT
az storage table create --name pupilEvent --account-name $STORAGE_ACCOUNT
az storage table create --name pupilFeedback --account-name $STORAGE_ACCOUNT
az storage table create --name receivedCheck --account-name $STORAGE_ACCOUNT

