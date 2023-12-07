# MTC Home Page Notifications

## High Level Overview
A feature to show alerts on the school user home page in scenarios where they need to address a concern regarding the state of pupil check(s).  There should only be one notification on the school home page at any time to indicate that there are one or more concerns that need to be addressed.  Clicking on the notification takes the user to the pupil status overview page where they can view detail on each issue, as well as a general overview of all pupils within their cohort.

A notification will remain on the school home page until such time that all concerns for that school have been remediated.

### Check processing failures
When a check is submitted it enters the MTC backend pipeline for validation and marking.  If the check fails either of these stages, any admin user (teacher) for the associated school should be shown a notification on their home page (school home).

#### Notification lifetime
The notification should exist until one of the following criteria are met…
-	A restart is created for a new check, essentially voiding the failed check
-	The pupil is given an attendance code

### Overdue Checks
An overdue check is one that has been logged into, but the check has not been received within a specified timeframe.  Prior to 2024 the specified timeframe was 30 minutes.  For 2024 this is to be reconfigured to something in the region of 24-48 hours, to allow more time for it be submitted by the school.

#### Notification lifetime
The notification should exist until one of the following criteria are met…
-	A restart is created for a new check, essentially voiding the overdue check
-	The pupil is given an attendance code
-	The check is received

## Technical Solution

### Notifications
The notifications should be stored in Redis cache, as the cache expiration policy can be utilised, and provides a fast efficient lookup for the teacher admin application.

The cache entry should be persisted with a key that allows it to be retrieved easily by the admin app so it can render a notification.  It will be looked up via the school UUID – “school.home.overdue:<school UUID>”. This must be added to the redis key service in both admin and tslib applications for consistent persistence and retrieval.

### Notification Schema
A JSON object containing the following properties
schoolUUID	Unique identifier for the school
dateTimeCreated	When notification created
processingErrorPupilUUIDs	List of pupil UUIDs who have checks with errors
overdueChecksUUIDs	List of check codes / UUIDs that are overdue


### Message example
```json
{
  "schoolUUID": "3d9cfbee-633d-4c4f-aa71-6e0bf027bd43",
  "dateTimeCreated": "2019-01-01T00:00:00.000Z",
  "processingErrorPupilUUIDs": [
    "3d9cfbee-633d-4c4f-aa71-6e0bf027bd43",
    "3j4t8tlj-34gf-y9ih-4ehh-6e0bf027bd65",
    "39gje4t8-08hl-4g38-w9uh-6e0bf027bd21"
  ],
  "overdueChecksUUIDs": [
    "3d9cfbee-633d-4c4f-aa71-6e0bf027bd43",
    "3j4t8tlj-34gf-y9ih-4ehh-6e0bf027bd65",
    "39gje4t8-08hl-4g38-w9uh-6e0bf027bd21"
  ]
}
```

### Check processing failures
Check processing failures are raised via a service bus message to the check notifier and have 2 publishers – check-validator function & check-marker function.  The queue message is of type ‘CheckNotificationType.checkInvalid’.

#### Creating a notification
The ‘checkInvalid’ message is handled by the batch check notifier, and it will create a redis entry for the notification that will be collected by the admin app for display on the home page of a user assigned to the specified school.

#### Destroying a notification

##### Idea 1
The pupil should be included in the school notification until one of the following events occur…
-	A restart is created (while also handling undo upon restart deletion)
-	An attendance code is assigned to the pupil

These events should trigger a task which removes the pupils UUID from the list in the school notification message, if one exists.

The problem with this solution is that it requires managing the notifications.  Looking them up in redis is expensive - why not just set a TTL?

##### Idea 2
When a notification is added to the redis cache, giving it a TTL that is slightly longer than the interval between the overall process will ensure that notifications are automatically purged.  Leaving us with a narrower set of concerns focused solely on ensuring those schools that need a notification have one.

### Overdue Checks
Overdue checks prior to 2024 were classed as any check that was logged into over 30 minutes ago that had not yet been received.  For 2024 this is to be reconfigured to something more like 24-48 hours.  A function should be executed periodically that runs a SQL query (see example below) to identify whi ch schools have active overdue checks.

#### SQL for overdue checks
```sql
DECLARE @minutesSinceCheckStarted INT = 30
SELECT DISTINCT s.urlSlug as [schoolUuid]
    FROM mtc_admin.[check] chk
INNER JOIN mtc_admin.[pupil] p ON p.currentCheckId = chk.id
INNER JOIN mtc_admin.[school] s ON s.id = p.school_id
WHERE (datediff(mi, getdate(), chk.pupilLoginDate) <= @minutesSinceCheckStarted
    AND chk.pupilLoginDate IS NOT NULL)
    AND chk.received = 0
    AND chk.isLiveCheck = 1
    AND p.attendanceId IS NULL
```
#### Process
The SQL query returns a dataset of schools that have at least one active overdue check.

We have 2 primary tasks…
-	Add ‘new’ overdue schools to Redis
-	Remove any schools already in Redis that are no longer in the latest dataset.

Step 1 – Delete the existing entries from Redis
Avoiding use of the redis KEYS command and utilising the pipeline command to reduce TCP overhead..

Step 2 – Add all new entries in the dataset
You would use a similar pattern for adding the new entries.

### Redis performance

See [index.js](./index.js) for the POC implementation to understand the complexity and overhead of maintaining a notification system for teachers that would alert them to any overdue and failed checks via the home page.  Clicking the notification takes them to the pupil status page where they can address the concerns.

There would be one notification per school so we are testing with 20K entries to just surpass the current 16k schools as of 2023.

Connected to an Azure redis cache instance at P1 scale...

```
$ node index.js
Redis is connected
starting exercise...
configured school count: 20000
noLongerOverdue: 9493
stillOverdue: 6206
newOverdue: 9524
exercise complete
fetch existing from redis: 32671.31ms (32.67s)
add new to redis: 58.16ms (0.06s)
set work duration: 11.79ms (0.01s)
overall duration: 32883.65ms (32.88s)
```

This does not include the overhead of executing the sql query to obtain the most recent overdue checks, nor does it include processing failures.
