# Decision log for 2020 architecture changes

### Pupil Login function
- updates check table directly with logged in time
- submits pupil-status update message to queue

Should not influence pupil status, but should serve as a support element to acknowledge when pupil logged in.
illustrates the issue of combining the pupils current status with check status.
record in separate append only storage table for support use.  this will relieve pressure on pupil status situation.

### Check started function

implement version construct as per other functions
Q: restarts depend on a check-started being received - is this brittle?
Q: how could we record check-started in a non status related way? separate db / microservice?
