# Developer Documentation

## Tooling

### [nvm](https://github.com/creationix/nvm)

We recommend using `nvm` to manage the `node` version.  The project has `.nvmrc` files to support `nvm`.

Documentation: https://github.com/creationix/nvm#nvmrc

Usage: `nvm use`

when first entering a particular project directory.

### [git-secrets](https://github.com/awslabs/git-secrets) 

It is highly recommended to install git-secrets to prevent security credentials from being committed to the repository.

Installation steps:

1.  ``git clone https://github.com/awslabs/git-secrets.git``
2.  ``sudo make install`` 

Configuration steps:

1. ``cd /path/to/my/repo``
2. ``git secrets --install``
3. ``git secrets --register-aws``
4. Add a git secret for Azure 
  - ``git secrets --add 'AccountName=[a-z0-9]{3,24}'``
  - ``git secrets --add 'AccountKey=[a-zA-Z0-9/=]{60,100}'``
  
Usage:

1. Scan for credentials:``git secrets --scan``
2. Scan for credentials including historical commits: ``git secrets --scan-history``
3. Attempts to commit any new code that matches the patterns will result in the commit failing.  



## Database Backup / restore

Occasionally it is useful for developers to be able to exchange database backups, perhaps to 
illustrate a data-dependent bug.

### Backup ms-sql server

1. Open Azure Data Studio
2. (Allow preview features)
2. Connect to the local dev database without specifying a connection
3. Right-click on the server and choose 'Manage'
4. Right-click on the db to back up from the databases chooser, and choose 'manage'
5. Select "Backup" from the "Tasks" section
6. Make a note of the docker file path where the backup will be placed
7. Select "Backup" and wait for it to complete
8. Copy the backup out of the docker container
    * E.g. `docker cp aae:/var/opt/mssql/data/mtc-2019117-9-30-19.bak .`
9. Compress the file before sending

### Restore the backup to your local docker container

1. Unzip the backup file to restore
2. Copy into docker container /tmp dir
   *  docker cp ~/Downloads/mtc-2019116-18-28-9.bak aae:/tmp/
3. In Azure Data Studio - go through the restore process:
    * select the backup file to restore: the file picker is using the docker file system 
    * in the General tab:
        * choose Restore from Backup file
        * choose the backup file path (e.g. find the file in the `/tmp/` directory)
        * you should check the target database is correct          
    * in the 'Options' tab 
        * tick 'overwrite existing database' checkbox
        * tick 'close existing connections to the server' checkbox
    * initiate the restore by clicking on the 'Restore' button
4. Wait for restore to complete
5. At this point the login user is not linked to the database user. You need to re-link 
   them:
   * ```SQL
      USE mtc; 
      GO
      EXEC sp_change_users_login 'Auto_Fix', 'mtcAdminUser';
      GO
      ```
   