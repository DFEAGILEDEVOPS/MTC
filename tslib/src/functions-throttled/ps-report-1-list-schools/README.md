# Sync results to SQL (Throttled function)

This function runs from nightly timer trigger and will put a message per school on the `ps-report-schools` service 
bus queue.  Approximately 12K messages.

This function is run as a throttled function, where only a low number of  processes will run concurrently.

This function kicks off the Psychometric report.

## Inputs

* timer

## Outputs

* Service Bus queue `ps-report-schools`

## Data copied

* School name, school UUID

## Data transformed

* none

## Error handling

Messages will be re-reprocessed up to 10 times.

## Consumers

Data Team.


## Timing

Short-lived

## Notes

See the [architecture diagram:](../docs/diagrams/psychometric-report-generation.png) 