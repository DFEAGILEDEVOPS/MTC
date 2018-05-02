"use strict";
const apiResponse = {
    unauthorised: (res) => {
        apiResponse.setJsonHeader(res);
        return res.status(401).json({ error: 'Unauthorised' });
    },
    badRequest: (res) => {
        apiResponse.setJsonHeader(res);
        return res.status(400).json({ error: 'Bad request' });
    },
    serverError: (res) => {
        apiResponse.setJsonHeader(res);
        return res.status(500).json({ error: 'Server error' });
    },
    sendJson: (res, obj, code = 200) => {
        apiResponse.setJsonHeader(res);
        res.status(code).json(obj);
    },
    setJsonHeader: (res) => {
        res.setHeader('Content-Type', 'application/json');
    }
};
module.exports = apiResponse;
