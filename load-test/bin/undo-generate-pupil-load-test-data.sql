
DELETE FROM mtc_admin.adminLogonEvent
DELETE FROM mtc_admin.pupilLogonEvent
UPDATE mtc_admin.school SET pin=NULL
DELETE FROM mtc_admin.[checkPin]
DELETE FROM mtc_admin.[check]
DELETE FROM mtc_admin.answer
DELETE FROM mtc_admin.checkResult
DELETE FROM mtc_admin.sessions
DELETE FROM mtc_admin.auditLog

