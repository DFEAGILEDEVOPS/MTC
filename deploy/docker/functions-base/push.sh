# builds, tags and pushes base function image to docker hub
# pre req is docker login

docker build . -t mtc-azure-functions-base
#  get image id
IMAGE_ID=$(echo 'TODO: get image id')
docker tag $IMAGE_ID baldy/mtc-azure-functions-base:latest
TODAY_ISO=$(echo 'TODO: date in iso')
docker tag $IMAGE_ID baldy/mtc-azure-functions-base:$TODAY_ISO
docker push baldy/mtc-azure-functions-base
