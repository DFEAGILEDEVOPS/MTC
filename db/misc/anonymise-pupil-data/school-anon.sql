UPDATE mtc_admin.school SET
    [name]=CAST(NEWID() AS VARCHAR(255)),
    leaCode=id,
    estabCode=id,
    urn=id,
    dfeNumber=CAST(CAST(leaCode AS NVARCHAR) + CAST(estabCode AS NVARCHAR) AS int)
