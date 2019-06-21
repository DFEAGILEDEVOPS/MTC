-- Copy all duplicates into a new table

SELECT *
INTO [mtc_admin].[checkResultDuplicates]
FROM
    (
        SELECT
            *,
            -- sort ASC so rank 1 will be first result
            ROW_NUMBER() OVER (PARTITION BY check_id ORDER BY id ASC) as rank
        FROM
            mtc_admin.checkResult
        WHERE
                check_id IN (
                SELECT
                    check_id
                FROM
                    mtc_admin.checkResult
                GROUP BY
                    check_id
                HAVING
                    COUNT(*) > 1
            )
    ) as t1
WHERE rank <> 1;
