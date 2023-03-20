# /bin/bash
chown root /etc/filebeat/filebeat.yml
nohup filebeat -e > /Backend/filebeat.log 2>&1 &
npm start