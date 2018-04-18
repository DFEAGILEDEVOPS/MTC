CREATE TABLE mtc_admin.auditLog
(
	id int identity primary key,
	rowData nvarchar(max) not null,
	tableName nvarchar(255) not null,
	operation nvarchar(20) not null,
	createdAt datetimeoffset default getutcdate() not null
)
