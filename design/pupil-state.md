# Pupil State Events

With the introduction of the pupilState table we will have to keep this up to date with the latest
references when related events occur.  For example - when a pin is generated for a pupil it creates a check record.  This will require the check_id being inserted into the pupilState table.

## States required

- can take check: can have a pin & check activated by a teacher
- taking check: pin & check allocated
- check received: submitted check received, awaiting processing
- complete: check is valid and marked.  no further action necessary
- processing failed: submitted check could not be processed
- restart available: teacher has activated restart for pupil, not yet consumed
- restart consumed: pupil logged in and collected the check made available by restart
  - is this essential? could we not allow a restart even if not logged in? as recording login to sql is expensive
- not attending: pupil will not be taking the check


## System Events

- pin generation.  creates a new check
- restart. creates a new restart
- non-attendance recorded.  creates a reason for not taking the check
