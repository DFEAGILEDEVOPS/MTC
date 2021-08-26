# Azure CLI scripts

Scripts to create a complete environment under one resource group for MTC via Azure CLI

## Usage

1. Execute `az accout set --subscription <subscription name>` to target the desired azure subscription

2. Execute `./_run.sh` which encapsulates all other scripts to create a complete environment and resource group.

## Current Limitations
- Does not configure front door
- Limited support for redundancy & replication



