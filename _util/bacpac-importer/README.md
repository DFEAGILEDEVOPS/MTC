# Import SQL SERVER backups to a local docker container

## Dependencies

Docker > v18.0

## Usage

`./import-bacpac.sh /path/to/backup.bacpac`

A new docker container will be built that has the required `sql-package` utility and the
`dotnet` (v2) dependency.  The file will be imported into the new docker container.

## Notes

At some point MS will likely include `sql-package` into it's standard `microsoft/mssql-server-linux`
docker container.  Then the custom Dockerfile won't be needed.