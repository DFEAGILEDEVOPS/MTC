
-- Drop the `pin` col from the `check` table
drop index check_school_id_pin_checkStatus_id_uindex
  on [mtc_admin].[check];
go

alter table [mtc_admin].[check] drop column pin;