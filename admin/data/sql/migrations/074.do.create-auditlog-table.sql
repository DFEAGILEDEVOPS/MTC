CREATE TABLE mtc_admin.auditLog
(
	id bigint identity primary key,
	rowData nvarchar(max) not null,
	tableName nvarchar(255) not null,
	operation nvarchar(20) not null,
	createdAt datetimeoffset default getutcdate() not null
)

create index auditLog_tableName_index
	on mtc_admin.auditLog (tableName)
