# prepare-check - JavaScript

The prepare-check function is triggered from the prepare-check queue.  Message on the queue are validated and written
to to Table Storage, prepareCheck table.

The prepareCheck table is used to provide a low-latency high-performance table for pupils to authenticate against.  This
is essentially a derived table with the authoritative source being the SQL Server Database.  You can think of it like a
cache.

## Testing

Run `yarn test` from the main `functions` folder to run all function tests.

