# pupil-status - QueueTrigger - JavaScript

The `pupil-status` function reacts to messages on the `pupil-status` queue put there by 
services that handle pupil actions and need to notify a principal service about the event so the pupils status can be re-evaluated.  

Actions taken during function execution:
    * copies the message to the audit table `pupilEvent`
    * processes the pupil status transition as per business rules
    * updates the pupil status in the Admin DB and creates a record of the transition
    