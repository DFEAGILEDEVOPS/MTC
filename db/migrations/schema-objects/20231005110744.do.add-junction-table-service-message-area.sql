IF NOT EXISTS(
	SELECT
		*
	FROM
		INFORMATION_SCHEMA.TABLES
	WHERE
		TABLE_NAME = 'serviceMessageServiceMessageArea'
		AND TABLE_SCHEMA = 'mtc_admin'
) BEGIN
	CREATE TABLE mtc_admin.serviceMessageServiceMessageArea (
		serviceMessageId INT NOT NULL,
		serviceMessageAreaLookupId INT NOT NULL,
		CONSTRAINT PK_serviceMessageServiceMessageArea PRIMARY KEY (
			serviceMessageId, serviceMessageAreaLookupId
		),
		CONSTRAINT [FK_serviceMessageId] FOREIGN KEY (serviceMessageId) REFERENCES mtc_admin.serviceMessage (id),
		CONSTRAINT [FK_serviceMessageAreaLookupId] FOREIGN KEY (serviceMessageAreaLookupId) REFERENCES mtc_admin.serviceMessageAreaLookup (id)
	);
END
