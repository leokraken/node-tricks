FROM node

ADD package.json /package.json
RUN npm install
ADD index.js /index.js
ADD test/test.js /test/test.js
ADD app/* app/
