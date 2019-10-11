
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

https://signin-pp-mng-as.azurewebsites.net/services/892DDEBF-8B35-4AE5-ADFB-73AE8A7D4C4A/organisations/23F20E54-79EA-4146-8E39-18197576F023/users/0025F1AF-192E-42CB-A8AA-43B79A42D7F7



https://signin-pp-mng-as.azurewebsites.net/services/892DDEBF-8B35-4AE5-ADFB-73AE8A7D4C4A/organisations/23F20E54-79EA-4146-8E39-18197576F023/users
