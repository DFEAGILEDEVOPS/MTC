# Pupil-api API end-points

## Application healthcheck

**Endpoint**: GET - http://localhost:3003/ping

**Description**: Returns git details and the server time


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

