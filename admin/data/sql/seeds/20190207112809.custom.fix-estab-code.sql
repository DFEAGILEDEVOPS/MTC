UPDATE mtc_admin.school SET estabCode=SUBSTRING(CAST(dfeNumber AS NVARCHAR),4,4) WHERE leaCode != 999
