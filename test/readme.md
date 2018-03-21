# Docker instructions

## Build Docker image

`docker build -t mtc-test .`

## Run container

Once the container image is built, execute the following command to run the tests, ensuring that the admin application, SQL Server and MongoDB are up and running first...

`docker run --network="host" mtc-test`