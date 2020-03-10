# School-Import

Public data can be downloaded from https://get-information-schools.service.gov.uk/Downloads  

E.g. 'All Establishment Data', choose establishment fields CSV (around 54MB).

Steps to upload:

1. Create a new Blob container in Azure Storage called `school-import`
2. Upload the Blob manually to the container (e.g. using Azure Storage Explorer)


Job output, both stderr and stdout, will be placed in the container.
