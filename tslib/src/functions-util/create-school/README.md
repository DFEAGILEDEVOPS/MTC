# Test Support API

The test support API is designed to aid testing on the local development and Test environments.

## Routes
### Create a School
PUT: `http://localhost:7071/api/test-support/school`

JSON body: `{"leaCode":"999","estabCode":"1006","name":"A Town Primary School","urn":"89006"}`

### Create a User

Note: Only Teacher roles are supported.

PUT: http://localhost:7071/api/test-support/user

JSON body: `{"schoolUuid":"3EA09267-8C0A-412E-94FA-C833D095ED41","identifier":"new-user","password":"secretP3ssw0rd!","role":"teacher"}`

