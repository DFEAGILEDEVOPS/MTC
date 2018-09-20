
drop index [mtc_admin].[checkFormAllocation].[checkFormAllocation_school_id_pin_uindex];

alter table [mtc_admin].[checkFormAllocation]
    drop column pin, school_id;

-- undo the column renaming

EXEC sp_rename 'mtc_admin.checkFormAllocation.pupil_id', 'pupil_Id', 'COLUMN';
go

EXEC sp_rename 'mtc_admin.checkFormAllocation.checkForm_id', 'checkForm_Id', 'COLUMN';
go

EXEC sp_rename 'mtc_admin.checkFormAllocation.checkWindow_id', 'checkWindow_Id', 'COLUMN';
go
