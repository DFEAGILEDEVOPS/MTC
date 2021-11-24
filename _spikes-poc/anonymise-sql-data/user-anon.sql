DECLARE @defaultPassword NVARCHAR(MAX) = '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK'

UPDATE mtc_admin.[user] SET
  identifier='teacher' + CAST(id AS NVARCHAR),
  passwordHash=@defaultPassword,
  displayName=CAST(NEWID() AS VARCHAR(255))

UPDATE mtc_admin.[hdf] SET
  jobTitle='job title-' + CAST(NEWID() AS VARCHAR(255)),
  fullName='fullName-' + (id AS NVARCHAR)

UPDATE mtc_admin.[pupilAccessArrangements] SET
  retroInputAssistantFirstName='assist-' + CAST(id AS NVARCHAR),
  retroInputAssistantLastName='assist-' + CAST(id AS NVARCHAR)
WHERE retroInputAssistantFirstName IS NOT NULL
