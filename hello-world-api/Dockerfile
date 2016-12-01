FROM node

ADD bin/            /app/bin
ADD app.js          /app/app.js
ADD package.json    /app/package.json

WORKDIR /app

RUN npm install

EXPOSE 3000

CMD npm start
