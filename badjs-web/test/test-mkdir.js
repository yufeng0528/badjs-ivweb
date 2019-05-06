const path = require('path');

const { mkdirsSync, mkdirs } = require('../utils/mkdir');

mkdirsSync(path.join(__dirname, '../static/img/tmp'));
mkdirs(path.join(__dirname, '../static/scoreimg'), () => {
    console.log('mkdir success');
});
