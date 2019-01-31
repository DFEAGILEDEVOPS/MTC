CREATE TABLE [mtc_admin].schoolScore
(
    id INT IDENTITY(1,1) NOT NULL,
    school_id int NOT NULL,
    checkWindow_id int NOT NULL,
    CONSTRAINT [PK_schoolScore] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_schoolScore_school_id_school_id] FOREIGN KEY (school_id) REFERENCES [mtc_admin].[school](id),
    CONSTRAINT [FK_schoolScore_checkWindow_id_checkWindow_id] FOREIGN KEY (checkWindow_id) REFERENCES [mtc_admin].[checkWindow](id),
)

CREATE TABLE [mtc_admin].nationalScore
(
    id INT IDENTITY(1,1) NOT NULL,
    checkWindow_id int NOT NULL,
    complete BIT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_nationalScore] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_nationalScore_checkWindow_id_checkWindow_id] FOREIGN KEY (checkWindow_id) REFERENCES [mtc_admin].[checkWindow](id),
)
