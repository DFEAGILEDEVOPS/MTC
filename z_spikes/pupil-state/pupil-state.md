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
- not received: the pupil logged in but a submitted check was never received. (allows 24 hours for a submitted check to be processed and marked as received) requires a restart.
- check expired: no login was recorded.  the check was never used.  does not require a restart

## check expiry & restart counts

the expiry service runs out of school hours to expire checks that appear to not have been used, submitted or received.
a situation could arise where submitted checks are still being processed after 4pm so we can use the pupilLogin storage table to
determine whether an outstanding check was consumed.  This is key, because we do not want to expire a submitted check that is not yet processed.
Another valid situation is where a pupil logged in and did not complete the check.  We have journeys within the SPA to recover checks, but the back end
must still accommodate this.  Therefore, the expiry service will consider checks from previous day that are still marked as not received to ensure enough
time is given to process it overnight.

1. teacher generates pin, doesn't use it
2. 4pm passes, expiry service examines ALL incomplete checks (this could include previous days that were not received)
3. expiry service finds no corresponding login event.
4. marks check as expired, removes 'current check' from pupil record. -> END
5. expiry service finds login event.
6. check could still be processing.  END
7. next
