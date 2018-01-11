ALTER TABLE [mtc_admin].[checkForm] ADD checkWindow_id INT NULL
ALTER TABLE [mtc_admin].[checkForm]
ADD CONSTRAINT [FK_checkForm_checkWindow_id]
FOREIGN KEY (checkWindow_id) REFERENCES [mtc_admin].[checkWindow] (id)