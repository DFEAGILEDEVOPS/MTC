# Dependencies

1. (Packer)[https://packer.io/]
2. (VirtualBox)[https://virtualbox.]


# Example build instructions
`packer build --force  --var 'cpus=2' --var 'memory=4096' ubuntu-18.04-amd64.json`

This will take 20 mins or so to build a new VM and export it to the build directory.

# Installation

Double-click on the `*.ovf` file will raise a prompt from VirtualBox  to install the 
appliance.