module.exports = async function (context, req) {
  context.res = {
    status: 200,
    body: `MTC functions. running node ${process.version}`
  }
}
