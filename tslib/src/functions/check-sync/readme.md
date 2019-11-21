# Check Sync service

## v1 process

receives a storage queue message containing a checkCode
finds check codes of all active checks
for each check...
- gets the preparedCheck from table storage
- gets the pupil access arrangements from database
- updates preparedCheck.config with new access arrangements
  - deletes existing fontSizeCode
  - deletes existing colourContrastCode
  - creates default config with nothing enabled
  - if no new arrangements found, returns default config
  - seek fontsize setting
  - seek contrast setting
  - construct array of ids for codes
  - get array of codes from database *this could use redis*
  - loops codes to initialise the following settings in default config
    - audible sounds flag
    - input assistance flag
    - numpad removal flag
    - font size flag
    - font size detail
    - colour contrast flag
    - colour contrast detail
    - question reader flag
    - next button flag
  - merges new config with existing config
- updates preparedCheck with new config
- persists preparedCheck back to table storage







## v2 process
receives a sb queue message containing a pupilUUID

v1
