CREATE TABLE [mtc_admin].[attendanceCodeRolePermission] (
    [id]               INT IDENTITY (1, 1) NOT NULL,
    [attendanceCodeId] INT NOT NULL,
    [roleId]           INT NOT NULL,
    CONSTRAINT [PK_attendanceCodeRolePermission] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_attendanceCodeRolePermission_attendanceCode] FOREIGN KEY ([attendanceCodeId]) REFERENCES [mtc_admin].[attendanceCode] ([id]),
    CONSTRAINT [FK_attendanceCodeRolePermission_role] FOREIGN KEY ([roleId]) REFERENCES [mtc_admin].[role] ([id])
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [IX_attendanceCodeRole_UQ]
    ON [mtc_admin].[attendanceCodeRolePermission]([attendanceCodeId] ASC, [roleId] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Junction table to store a map of AttendanceCodes and the Roles allow to use them', @level0type = N'SCHEMA', @level0name = N'mtc_admin', @level1type = N'TABLE', @level1name = N'attendanceCodeRolePermission';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'FK to role table', @level0type = N'SCHEMA', @level0name = N'mtc_admin', @level1type = N'TABLE', @level1name = N'attendanceCodeRolePermission', @level2type = N'COLUMN', @level2name = N'roleId';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Synthetic ID', @level0type = N'SCHEMA', @level0name = N'mtc_admin', @level1type = N'TABLE', @level1name = N'attendanceCodeRolePermission', @level2type = N'COLUMN', @level2name = N'id';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'FK to attendanceCode', @level0type = N'SCHEMA', @level0name = N'mtc_admin', @level1type = N'TABLE', @level1name = N'attendanceCodeRolePermission', @level2type = N'COLUMN', @level2name = N'attendanceCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Unique index to ensure role/attendance combos only appear once each. ', @level0type = N'SCHEMA', @level0name = N'mtc_admin', @level1type = N'TABLE', @level1name = N'attendanceCodeRolePermission', @level2type = N'INDEX', @level2name = N'IX_attendanceCodeRole_UQ';

