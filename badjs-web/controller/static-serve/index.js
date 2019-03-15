const express = require('express');
const router = express.Router();

module.exports = router;

// global.pjconfig.QQConnect
router.use(express.static(
    global.pjconfig.http_public || __dirname
));

