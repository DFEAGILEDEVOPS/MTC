CREATE TABLE [mtc_admin].[pupilAgeReason] (
  id int IDENTITY (1,1) NOT NULL,
  pupil_id INT NOT NULL,
  reason NVARCHAR(MAX) NOT NULL,
  CONSTRAINT [PK_pupilAgeReason] PRIMARY KEY CLUSTERED ([id] ASC)
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      IGNORE_DUP_KEY = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON
    ),
  CONSTRAINT [pupilAgeReason_pupil_id_uindex] UNIQUE([pupil_id])
)

ALTER TABLE [mtc_admin].[pupilAgeReason] WITH CHECK ADD CONSTRAINT [FK_pupilAgeReason_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [mtc_admin].[pupil] ([id])

ALTER TABLE [mtc_admin].[pupil] ADD pupilAgeReason_id int NULL
ALTER TABLE [mtc_admin].[pupil]
ADD CONSTRAINT FK_pupil_pupilAgeReason_id
FOREIGN KEY (pupilAgeReason_id) REFERENCES [mtc_admin].pupilAgeReason (id)
