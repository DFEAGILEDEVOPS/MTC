
drop index [mtc_admin].[checkFormAllocation].[checkFormAllocation_school_id_pin_uindex];

alter table [mtc_admin].[checkFormAllocation]
    drop column pin, school_id;



