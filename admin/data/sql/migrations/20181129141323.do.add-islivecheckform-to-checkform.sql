ALTER TABLE [mtc_admin].checkForm
    ADD isLiveCheckForm bit
    CONSTRAINT isLiveCheckFormDefault DEFAULT 1 NOT NULL
