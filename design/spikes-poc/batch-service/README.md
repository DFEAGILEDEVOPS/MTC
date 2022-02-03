# Azure Batch Service Spike

1. Create the docker-worker container and push it up to an azure private repo

2. The batch service / batch pool / batch job and tasks were created using the portal.

## Notes

In order to run docker containers the batch pool must use the correct image produced
from MS : microsoft-azure-batch ubuntu-server-container 16-04-lts (latest).

You can view the remote docker images in Azure on the portal.

You can connect to Linux images by selecting the node in pool heat-map, clicking 'View node', then connect, then ssh'ing
to the user.  The password is only given once.

## Rules for Tasks

1. The task commandline is not parsed by a shell, so many things don't work:
    * `date && hostname` - only `date` will be executed
    * `docker login --username $USER ...` env variables will not be interpolated in the commandline (but will be
    available to the command once it is running.)
    * The `task user, admin` user can sudo and run docker.  If we want to run docker commands without sudo we will need
    to add the docker group to this user `azurebatch7`
2. Tasks do not appear to be editable (via the portal) once created
3. The `pool users` were not investigated
4. Once the node that ran the task has been deleted, the task cannot be 're-activated'
5. For the portal the only way of getting docker to login to the private repository was to provide the credentials in
   the commandline - see rule #1
6. The ubuntu image requires the docker daemon to be started.  It seemed to work by running this as a Start Task (that
   runs on OS startup. E.g.   `sudo service docker start` as the admin user.
7. The `Task autouser, Admin` user is something like `azurebatch7` which has sudo permission, and the non-admin user is
   something like `azurebatch8`.
8. Environment vars need to be added at a task level - very annoying
9. Possibly creating the container in the linked storage account the same as the job name would mean the stdout and
   stderr would be copied across.  Error message seen:
   'The job container 'job-dev-batch-job-mtc-container-example', does not exist in your linked storage account.'


## What has this proved?

This proves we can launch docker images on Azure Batch Service, that can connect to SQL Server.  We have also gained a
better understanding of Azure Batch Service.

## Further investigations

1. Script task creation
2. Secure Docker login
3. Making the container ENTRYPOINT capable of handling required signals (e.g. SIGHUP, SIGKILL)
4. Running docker securely (without sudo?)
5. How to integrating this into our CI pipeline

