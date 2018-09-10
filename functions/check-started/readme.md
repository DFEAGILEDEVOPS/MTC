# check-started - QueueTrigger - JavaScript

The `check-started` QueueTrigger reacts to messages on the `check-started` queue put there by 
the Pupil SPA front-end client.  It indicates that the check identified by the `checkCode`  in
the message has been started.

Actions taken during function execution:
    * copies the message to the audit table `pupilEvents`
    * updates the Admin DB to mark the check as started
    * removes the entry in the `preparedCheck` table so the pupil can't login in again
    