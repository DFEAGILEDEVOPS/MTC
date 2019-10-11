
## DfE Signin dev notes

Once authenticated, req.user returns....

```json
{
  "sub": "0123F1AF-123E-45CB-A8AA-67B89A12345",
  "given_name": "John",
  "family_name": "Smith",
  "email": "john.smit@myorg.co.uk",
  "id": "0123F1AF-123E-45CB-A8AA-67B89A12345",
  "name": "0123F1AF-123E-45CB-A8AA-67B89A12345",
  "id_token": "xxxxx.yyyyy.zzzzz"
}
```
Then you call...

GET https://environment-url/services/{service-id}/organisations/{organisation-id}/users/{user-id}
Authorization: bearer {jwt-token}

