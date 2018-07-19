#!/bin/sh

set -e
set -x
PASSWORD="Mtc-D3v.5ql_S3rv3r"
DB="bacpac_restored"
IMAGE="bacpac"
CONTAINER_NAME="bacpac-restored"
DOCKER_RESTORE_PATH="/opt/downloads/restore.bacpac"
LOCAL_BACPAC_PATH="$1"
DOCKERFILE="Dockerfile"

function usage {
    echo "Import a bacpac file into a new linux sql server docker container, running on the standard port."
    echo "Please stop any existing sql server instances running on port 1433/1434."
	echo "Usage: $0 /path/to/backup.bacpac"
	exit 1
}

if [ ! -f "${LOCAL_BACPAC_PATH}" ]; then
	usage
fi

docker build -f "$DOCKERFILE" -t ${IMAGE} .
set +e
docker rm -f ${CONTAINER_NAME}
set -e
docker run -d -e 'ACCEPT_EULA=Y' -e "SA_PASSWORD=${PASSWORD}" -p 1433:1433 --name ${CONTAINER_NAME} ${IMAGE}
sleep 30

# DATABASE SETUP AND PREP
docker exec -it ${CONTAINER_NAME} /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "${PASSWORD}" -Q "CREATE DATABASE ${DB};"

# DB IMPORT
docker cp ${LOCAL_BACPAC_PATH} ${CONTAINER_NAME}:${DOCKER_RESTORE_PATH}
docker exec -it ${CONTAINER_NAME} /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "${PASSWORD}" -Q 'sp_configure "contained database authentication", 1; RECONFIGURE;'
docker exec -it ${CONTAINER_NAME} dotnet /opt/sqlpackage/sqlpackage.dll /tsn:localhost /tu:SA /tp:"${PASSWORD}" /A:Import /tdn:${DB} /sf:${DOCKER_RESTORE_PATH}
