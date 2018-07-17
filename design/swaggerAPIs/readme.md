## Working with Swagger to define API specs

The cleanest way to work with the local swagger instance is to run version 2.x within a docker image.
Version 3 has known issues, which are yet to be resolved.

1. Pull and run the docker image...

`docker pull swaggerapi/swagger-editor`
`docker run -p 80:8080 swaggerapi/swagger-editor`

2. Browse to http://localhost
3. Load swagger yaml file from `design/swaggerAPIs/` into editor via file menu
4. Make your edits
5. Download YAML via file menu, or copy directly from the editor and paste into the relevant project file
