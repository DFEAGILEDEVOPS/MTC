# services

This folder is for services that are common to MTC domain, such as...

- Check Window Service
- Check Form Service

Do not put any services in here which are part of a vertical slice, as they should go in the same folder as the function that consumes it.
For example, the check-allocator function has a check-allocation service.  This does not belong in here, because it is
check allocation specific.  The check-allocator uses the check window service, but that is also referenced by other functions/services, so
rightly belongs in here.

If in doubt, create the service alongside the function, and move it here when a requirement emerges for another function to utilise it,
providing its implementation is not function specific.
