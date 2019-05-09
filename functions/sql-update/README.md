# sql-update - QueueTrigger - JavaScript

The `sql-update` QueueTrigger reacts to messages on the `sql-update` queue put there by the Admin client.
It indicates a data update which has been performed immediately in Redis and now needs performed in the `mtc_admin` SQL schema.

Actions taken during function execution:
    * Updates records in the specified `table`, with the key of the `data` object being `table.id`.
    e.g. `{ table: 'foo', data: { 123: { foo: 'bar' }}}`
    