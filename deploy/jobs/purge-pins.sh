
/opt/mssql-tools/bin/sqlcmd -S $1 -U $2 -P $3 -d $4 -i purge-pins.sql -I