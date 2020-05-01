# Hooks folder

The hooks folder is used by the [STA MTC docker hub](https://hub.docker.com/orgs/stamtc/repositories) to trigger the push of additional tags to the images on creation.  By default docker hub only adds the `latest` tag which has very limited meaning.

The `post_push` script adds the commit hash tag to ensure the set of MTC docker images can be explicitly sourced in the build pipeline.
