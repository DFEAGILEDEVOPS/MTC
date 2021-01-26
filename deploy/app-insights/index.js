/*
Create a release annotation via the App insights API
This is necessary due to the limitation of the Azure DevOps build task being windows only 🤨

Script Parameters
=================
1: App Insights Api Application Id
2: App Insights Api Key
3: Release Name
4: Release Description
5: Release Author
*/
const axios = require('axios')

