ALTER TABLE [mtc_admin].[checkWindow]
    ADD score DECIMAL(4,2)

ALTER TABLE [mtc_admin].[checkWindow]
    ADD complete BIT
    CONSTRAINT completeDefault DEFAULT 0 NOT NULL

CREATE TABLE [mtc_admin].[schoolScore]
(
    id INT IDENTITY(1,1) NOT NULL,
    school_id INT NOT NULL,
    checkWindow_id INT NOT NULL,
    score DECIMAL(4,2) NOT NULL,
    CONSTRAINT [PK_schoolScore] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
    CONSTRAINT [FK_schoolScore_school_id_school_id] FOREIGN KEY (school_id) REFERENCES [mtc_admin].[school](id),
    CONSTRAINT [FK_schoolScore_checkWindow_id_checkWindow_id] FOREIGN KEY (checkWindow_id) REFERENCES [mtc_admin].[checkWindow](id),
)
