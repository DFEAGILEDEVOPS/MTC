CREATE FUNCTION dbo.ufnCalcCheckStatusID (@checkId int)
    RETURNS int
AS
BEGIN
    DECLARE
        @checkTimeLimit tinyint,
        @complete bit,
        @isLiveCheck bit,
        @pinExpiresAt datetimeoffset,
        @processingFailed bit,
        @pupilLoginDate datetimeoffset,
        @receivedByServerAt datetimeoffset,
        @ret int,
        @startedAt datetimeoffset
    ;

    SELECT
        TOP 1
            @checkTimeLimit = checkTimeLimit
      FROM
          [mtc_admin].[settings];

    SELECT
            @complete = complete,
            @isLiveCheck = isLiveCheck,
            @ret = checkStatus_id, -- set the return val to the current status
            @pinExpiresAt = pinExpiresAt,
            @processingFailed = processingFailed,
            @pupilLoginDate = pupilLoginDate,
            @receivedByServerAt = receivedByServerAt,
            @startedAt = startedAt
      FROM
          [mtc_admin].[check] c LEFT OUTER JOIN
          [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
     WHERE
             c.id = @checkId;

    -- NEW
    IF (@pupilLoginDate IS NULL AND
        @startedAt IS NULL AND
        @receivedByServerAt IS NULL AND
        @pinExpiresAt IS NOT NULL AND
        @pinExpiresAt > GETUTCDATE())
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'NEW';
            RETURN @ret;
        END

    -- EXPIRED
    IF ((@startedAt IS NULL OR
         @startedAt IS NOT NULL AND @isLiveCheck = 0) AND
        @receivedByServerAt IS NULL AND
        @complete = 0)
        BEGIN
            IF (@pinExpiresAt IS NULL OR
                @pinExpiresAt <= GETUTCDATE())
                BEGIN
                    SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'EXP';
                    RETURN @ret;
                END
        END

    -- COLLECTED
    IF (@pupilLoginDate IS NOT NULL AND
        @startedAt IS NULL AND
        @receivedByServerAt IS NULL AND
        @pinExpiresAt IS NOT NULL AND
        @pinExpiresAt > GETUTCDATE() AND
        GETUTCDATE() < DATEADD(minute, @checkTimeLimit, @pupilLoginDate))
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'COL';
            RETURN @ret;
        END

    -- STARTED
    -- TODO: remove this status once no business logic is depending on it.
    IF (@pupilLoginDate IS NOT NULL AND
        @startedAt IS NOT NULL AND
        @pinExpiresAt IS NOT NULL AND
        @pinExpiresAt > GETUTCDATE() AND
        ((@isLiveCheck = 1 AND
          @receivedByServerAt IS NULL AND
          DATEADD(minute, @checkTimeLimit, @startedAt) > GETUTCDATE()) OR
         (@isLiveCheck = 0)))
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'STD';
            RETURN @ret;
        END

    -- COMPLETE
    IF (@isLiveCheck = 1 AND
        @pupilLoginDate IS NOT NULL AND
        @receivedByServerAt IS NOT NULL AND
        @complete = 1 AND
        @processingFailed = 0)
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'CMP';
            RETURN @ret;
        END

    -- NOT RECEIVED
    IF (@isLiveCheck = 1 AND
        @pupilLoginDate IS NOT NULL AND
        DATEADD(minute, @checkTimeLimit, @pupilLoginDate) < GETUTCDATE())
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'NTR';
            RETURN @ret;
        END

    -- If none of the IF conditions were met this will return the original
    -- check status id.
    RETURN @ret;
END;
