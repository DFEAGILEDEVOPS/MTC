# Psychometric report pipeline #2 (throttled)

This is the second function in the psychometric report pipeline.  It extracts the pupil data and places the results on another service bus queue `ps-report-staging`.

## Incoming message - school entity

```typescript
{ 
	name: string
	uuid: string
}
```



## Processing

The function extracts a lot of data for each pupil from the SQL Server.

## Inputs

Azure service bus queue trigger `ps-report-schools`

## Output

Azure service bus queue `ps-report-staging` queue. See [the models](./models.ts)



## Data extracted

Data is read from SQL Server: School, Pupil, Check, CheckConfig, Answer, Device, Events, UserInputs



## Error handling

Individual pupil records may throw and be logged. The error is caught so that other pupils can still be updated.



## Consumers

Data Team, Psychometric Team



## Notes

Further optimisation is likely required to reduce identical lookups (school, checkForm, ...)





