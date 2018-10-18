CREATE TABLE  [mtc_admin].[checkPin] (
  [school_id] int not null,
  [pin_id] int not null,
  [check_id] int not null,
  [pinExpiresAt] datetimeoffset(3) not null,
  CONSTRAINT [PK_checkPin] PRIMARY KEY CLUSTERED ([school_id], [pin_id] ASC),
  -- ensure a one-to-one mapping between check and checkPin
  CONSTRAINT [IX_checkPin_check_id_unique] UNIQUE([check_id]),
  CONSTRAINT [FK_checkPin_school_id_school_id] FOREIGN KEY (school_id) REFERENCES [mtc_admin].[school](id),
  CONSTRAINT [FK_checkPin_pin_id_pin_id] FOREIGN KEY (pin_id) REFERENCES [mtc_admin].[pin](id),
  CONSTRAINT [FK_checkPin_check_id_check_id] FOREIGN KEY (check_id) REFERENCES [mtc_admin].[check](id)
);
