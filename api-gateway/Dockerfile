FROM node

ADD bin/            /app/bin
ADD lib/            /app/lib
ADD middleware/     /app/middleware
ADD app.js          /app/app.js
ADD package.json    /app/package.json
ADD services.json   /app/services.json

WORKDIR /app

RUN npm install

EXPOSE 3000

CMD npm start
