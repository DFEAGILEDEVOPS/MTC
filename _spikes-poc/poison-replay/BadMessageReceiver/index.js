
module.exports = async function(context, message) {
    throw new Error(`throwing error to force message mtcId:${message.mtcId} onto the poison queue`)
};
