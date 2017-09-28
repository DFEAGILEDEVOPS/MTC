#!/bin/bash -x

cd api_tests
BASE_URL=https://pupil-as-dev-mtc.azurewebsites.net rspec -t @azure_spa
