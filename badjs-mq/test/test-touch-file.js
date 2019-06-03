const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'project.db');

if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '{}', 'utf8');
}
