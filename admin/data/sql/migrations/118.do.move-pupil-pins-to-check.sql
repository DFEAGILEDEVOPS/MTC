alter table [mtc_admin].[checkFormAllocation]
  add
  pin nvarchar(12),
  school_id int;

go

update cfa
set school_id = p.school_id
FROM [mtc_admin].[checkFormAllocation] cfa JOIN [mtc_admin].[pupil] p
         ON (p.id = cfa.pupil_id);

alter table [mtc_admin].[checkFormAllocation] alter column school_id int not null;

go

create unique index [checkFormAllocation_school_id_pin_uindex]
  on [mtc_admin].[checkFormAllocation] (school_id, pin)
  where pin is not null;

go

-- rename some oddities, note SQL SERVER is case insensitive though

EXEC sp_rename 'mtc_admin.checkFormAllocation.pupil_Id', 'pupil_id', 'COLUMN';
go

EXEC sp_rename 'mtc_admin.checkFormAllocation.checkForm_Id', 'checkForm_id', 'COLUMN';
go

EXEC sp_rename 'mtc_admin.checkFormAllocation.checkWindow_Id', 'checkWindow_id', 'COLUMN';
go



