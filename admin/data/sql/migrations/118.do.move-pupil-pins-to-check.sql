alter table [mtc_admin].[checkFormAllocation]
  add
  pin nvarchar(12),
  school_id int not null;

go

create unique index [checkFormAllocation_school_id_pin_uindex]
  on [mtc_admin].[checkFormAllocation] (school_id, pin)
  where pin is not null;

