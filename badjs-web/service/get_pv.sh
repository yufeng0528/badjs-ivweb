#!/bin/bash


# read nginx access log file

logs_path="/data/nginx_log/access/"
logs_path_log="/data/nginx_log/logaccess/"

logs_file=${logs_path}access_$(date -d "yesterday" +"%Y%m%d").log

logs_file_log=${logs_path_Log}access_$(date -d "yesterday" +"%Y%m%d").log

node /data/badjs-ivweb/badjs-web/service/handle_pv.js ${logs_file} $(date -d "yesterday" +"%Y%m%d")
node /data/badjs-ivweb/badjs-web/service/handle_pv_log.js ${logs_file_log} $(date -d "yesterday" +"%Y%m%d")

