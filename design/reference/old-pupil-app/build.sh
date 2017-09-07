#!/bin/bash

# Build script to ensure static assets are built and copied
# to the correct places
# A working person's version of gulp.js 

MAGENTA="\033[1;35m"
RED="\033[1;31m"

# Colourise
function color_prompt() {
  prompt="$1"
  echo -e -n "\033[1;32m"
  echo -e -n "------- BUILD ---------"
  echo -e -n '\n\n'
  echo -e -n "\033[0;32m$prompt"
  echo -e -n '\033[0m'
  echo -e -n '\n\n'
}

function delete_node_modules() {
  color_prompt "$RED Deleting $MAGENTA node_modules directory"
  rm -rf node_modules
}

function install_modules() {
  color_prompt "Installing $MAGENTA node modules"
  npm install
}

function copy_assets() {
  color_prompt "$RED Deleting public/govuk_template"
  rm -rf public/govuk_template
  color_prompt "Copying node_modules/govuk_template_ejs/assets into public/govuk_template"
  mkdir public/govuk_template
  cp -r node_modules/govuk_template_ejs/assets/* public/govuk_template
  color_prompt "Copying node_modules/govuk_frontend_toolkit/images into public/govuk_template/stylesheet/images"
  cp  -r node_modules/govuk_frontend_toolkit/images/* public/govuk_template/stylesheets/images
  color_prompt "The contents of public/govuk_template now looks like"
  ls -lahR public/govuk_template
}

function copy_templates() {
  color_prompt "$RED Deleting views/layout.ejs"
  rm views/layout.ejs
  color_prompt "Copying template from /node_modules/govuk_template_ejs/views/layouts/govuk_template.html"
  cp node_modules/govuk_template_ejs/views/layouts/govuk_template.html views/
  mv views/govuk_template.html views/layout.ejs
}

function add_local_vars_to_content_partial() {
  color_prompt "Adding local variables to content partial"

  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' -e "s|<%- partial('partials/_content') %>|<%- partial('partials/_content', {body: body}) %>|g" views/layout.ejs
  else
    sed -i "s|<%- partial('partials/_content') %>|<%- partial('partials/_content', { body: body }) %>|g" -- views/layout.ejs
  fi
}

function compile_scss() {
  color_prompt "Compiling SASS files to CSS"
  ./node_modules/node-sass/bin/node-sass  "assets/stylesheets/application.scss" "public/stylesheets/application.css"
}


main () {
  delete_node_modules
  install_modules
  copy_assets
  copy_templates
  add_local_vars_to_content_partial
  compile_scss
}

main

