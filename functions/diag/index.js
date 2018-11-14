module.exports = async function (context, req) {
  const con = process.env.AZURE_STORAGE_CONNECTION_STRING
  let conType = 'not found'
  if (con.toLower().startsWith('usedevelopment')) {
    conType = 'dev'
  } else if (con.toLower().startsWith('DefaultEndpoints')) {
    conType = 'connection'
  }

  context.res = {
    status: 200,
    body: `MTC functions. running node ${process.version}. 
            Storage Connection Type: ${conType}`
  }
}
