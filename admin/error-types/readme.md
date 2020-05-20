# MTC Error Types

The `mtcError` type is intended for use as a base class for more specific error types to indicate that a particular issue has occured.

The constructor takes 2 arguments - `message` and `userMessage`.

`message` is the standard error property, and is passed down to the base `Error` class - and should be populated with technical details useful for diagnosis.
`userMessage` is specific to MTC and will be rendered to the user on the standard error page if populated.  This can be used to communicate information about the issue that can help the user understand what actions may be taken to resolve the situation.

For example, `DsiSchoolNotFoundError` uses the `userMessage` property to inform the user logging on that their school does not exist in MTC.  They can then phone helpdesk to have this remediated.
