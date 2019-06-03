-- Store the config the admin app sent to the pupil

CREATE TABLE [mtc_admin].[checkConfig]
(
    [id] [int] IDENTITY (1,1) NOT NULL,
    [createdAt] [datetimeoffset](3) NOT NULL DEFAULT getutcdate(),
    [updatedAt] [datetimeoffset](3) NOT NULL DEFAULT getutcdate(),
    [version] [rowversion],
    [check_id] INT NOT NULL,
    [payload] [NVARCHAR](max) NOT NULL,
    CONSTRAINT [PK_checkConfig] PRIMARY KEY CLUSTERED
        (
         [id] ASC
        ) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
    CONSTRAINT [FK_checkConfig_check_id] FOREIGN KEY (check_id) REFERENCES [mtc_admin].[check](id)
);
