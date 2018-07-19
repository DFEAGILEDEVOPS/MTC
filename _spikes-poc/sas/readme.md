# Storage Queues with SAS

This POC has 3 components...

- *client*: browser based javascript app.  Logs in via server, gets SAS token, pushes messages onto queue.
- *server*: issues SAS token to client app via Login API.
- *worker*: polls queue for new messages, processes them into database.
