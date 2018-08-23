# Developer Documentation

## Tooling

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
