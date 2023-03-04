FROM node:16.13

WORKDIR /Backend
COPY package.json .
RUN npm install
RUN wget https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.3.3-amd64.deb
RUN dpkg -i filebeat-8.3.3-amd64.deb
RUN rm filebeat-8.3.3-amd64.deb
COPY . .
# COPY filebeat.yml /etc/filebeat/filebeat.yml
CMD npm start
