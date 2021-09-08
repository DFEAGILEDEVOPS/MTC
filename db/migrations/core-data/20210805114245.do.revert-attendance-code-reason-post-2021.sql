-- revert copy change post 2021
UPDATE mtc_admin.attendanceCode SET reason = 'Absent during check window' WHERE code = 'ABSNT';
