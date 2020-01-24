# builds, tags and pushes base function image to docker hub
# pre req is docker login

docker build . -t mtc-azure-functions-base
#  get image id
IMAGE_ID=$(docker images --filter=reference=mtc-azure-functions-base --format "{{.ID}}")
docker tag $IMAGE_ID baldy/mtc-azure-functions-base:latest
TODAY_ISO=$(date -u +"%Y%m%dT%H%M")
docker tag $IMAGE_ID baldy/mtc-azure-functions-base:$TODAY_ISO
docker push baldy/mtc-azure-functions-base
