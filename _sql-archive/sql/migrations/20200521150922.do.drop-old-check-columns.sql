ALTER TABLE [mtc_admin].[check] DROP
    COLUMN IF EXISTS [mark],
    COLUMN IF EXISTS [maxMark],
    COLUMN IF EXISTS [markedAt];
