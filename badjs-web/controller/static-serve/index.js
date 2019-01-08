const express = require('express'); 
const router = express.Router(); 

module.exports = router; 

// GLOBAL.pjconfig.QQConnect
router.use(express.static(
    GLOBAL.pjconfig.http_public || __dirname
)); 

