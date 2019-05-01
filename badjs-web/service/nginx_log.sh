#!/bin/bash
#author: http://www.nginx.cn

#!/bin/bash
logs_path="/data/nginx_log/access/"
logs_path_log="/data/nginx_log/logaccess/"
pid_path="/etc/nginx/logs/nginx.pid"

mv ${logs_path}default.log ${logs_path}access_$(date -d "yesterday" +"%Y%m%d").log
mv ${logs_path_log}default.log ${logs_path_log}access_$(date -d "yesterday" +"%Y%m%d").log

kill -USR1 `cat ${pid_path}`

find /data/nginx_log/access/ -mtime +0 -type f -name \*.log | xargs rm -f

find /data/nginx_log/logaccess/ -mtime +3 -type f -name \*.log | xargs rm -f
