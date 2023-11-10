# Overdue Check Notifications

POC work to understand the complexity and overhead of maintaining a notification system for teachers that would alert them to any overdue and failed checks via the home page.  Clicking the notification takes them to the pupil status page where they can address the concerns.

There would be one notification per school so we are testing with 20K entries to just surpass the current 16k schools as of 2023.

## Timings

Connected to an Azure redis cache instance at P1 scale...

```
yarn run v1.22.19
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
