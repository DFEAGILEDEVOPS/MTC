ALTER TABLE [mtc_admin].[pupilFeedback] ADD checkFormAllocation_id INT,
  CONSTRAINT [FK_checkFormAllocation_id_checkFormAllocation_id]
    FOREIGN KEY (checkFormAllocation_id) REFERENCES [mtc_admin].[checkFormAllocation](id);
