-- Drop the unused cols and their indexes from the `check` table

drop index check_school_id_pin_checkStatus_id_uindex
  on [mtc_admin].[check];
go

-- school_id isn't needed on the check table, it was only introduced while we
-- had a unqiue index on (school_id, pin, checkStatus_id)
alter table [mtc_admin].[check] drop column pin, pinExpiresAt, school_id;
