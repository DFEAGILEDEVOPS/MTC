# util-gen-ps-report-logs

generates fake log messages onto the `ps-report-log` service bus queue for the purpose of testing the log writer function (ps-report-log-writer).

You can override the default message count by providing the following request body in `JSON`...

```
{
  messageCount: 100000
}
```

Execute a `HTTP GET` at http://localhost:7071/api/util-gen-ps-report-logs to invoke the util function.
