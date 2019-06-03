/* global module */
/**
 * Created by chriscai on 2015/1/23.
 */

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const logger = log4js.getLogger();

const path = require('path');

const dbPath = path.join(__dirname, '..', 'project.db');

if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '{}', 'utf8');
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const ProjectService = function (clusters) {
    const dispatchCluster = function (data) {
        for (var i = 0; i < clusters.length; i++) {
            clusters[i].send(data);
        }
    };

    app.use('/getProjects', function (req, res) {
        var param = req.query;
        if (req.method === "POST") {
            param = req.body;
        }

        if (param.auth != 'badjsAccepter' || !param.projectsInfo) {

        } else {
            dispatchCluster({
                projectsInfo: param.projectsInfo
            });

            fs.writeFile(dbPath, param.projectsInfo || "", function () {
                logger.info('update project.db');
            });
        }

        res.writeHead(200);
        res.end();

    })
        .listen(9001);

    var info = fs.readFileSync(dbPath, 'utf-8');

    dispatchCluster({
        projectsInfo: info
    });
};


module.exports = ProjectService;
