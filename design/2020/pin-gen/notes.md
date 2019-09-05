# overnight pin generation

## function apps
- update tsconfig.json, add tslint, add jasmine
- how do we share ts files across multiple function libraries to avoid duplication

## check allocation

### table storage
- delete and recreate table unsuitable due to deletion returning early and still running.  blocking name from being reused
- could be time consuming to purge.  Prove this with batch delete (TODO)

### redis
- use TTL on allocations, no delete required 🎖
- takes ~25 minutes to generate 1.25 million check allocations.  the poc procedure uses a pre-fetched static check
