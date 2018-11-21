# MTC Pupil API

Required environment variables

`AZURE_STORAGE_CONNECTION_STRING` - connection to azure storage account.

Optional environment variables
`ENVIRONMENT_NAME` - name of the environment this API is running in.

## Application healthcheck

**Endpoint**: GET - http://localhost:3003/ping

**Description**: Returns current server time.  
Also inclues last commit and build deployment details if generated during build. 


#### Header
```
{
}
```


#### Body
```
```

## Authentication and data collection

**Endpoint**: POST - http://localhost:3003/auth

**Description**: Used to authenticate a pupil logging in on the SPA and send back the SPA data required to take a check.

#### Header
```
{
	Content-Type: application/json
}
```


#### Body
```
{
	"pupilPin": "<some pin>",
	"schoolPin": "<some pin>"
}
```

