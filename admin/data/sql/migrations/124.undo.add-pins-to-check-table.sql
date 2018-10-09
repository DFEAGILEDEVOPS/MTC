
drop index [check_school_id_pin_uindex] on [mtc_admin].[check];

alter table [mtc_admin].[check]
  drop column
  pin,
  pinExpiresAt,
  school_id;