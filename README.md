# nodejs-docker-api-gateway-example
Example of a lightweight and extensible NodeJS based API gateway implementation using Docker.

# Requirements
- Docker
- Docker-compose version 1.6.0+

# Deploying locally
- Clone the repo
- Ensure docker daemon is running
- ```cd nodejs-docker-api-gateway-example/```
- ```docker-compose up -d```
- The api-gateway and hello-world-api should now be running and accessible at [localhost:3000](http://localhost:3000) and [localhost:3000/api/helloapi/hello](http://localhost:3000/api/helloapi/hello)
    - Note: If you want to access the hello-world-api directly:
        - ```docker ps```
        - Take note of the port that the hello-world-api is running on, i.e. in ```0.0.0.0:32771->3000/tcp``` it would be 32771
        - Go to [localhost:<hello-world-api-port>/api/v1/hello](http://localhost:<hello-world-api-port>/api/v1/hello)

# Deploying in Swarm Mode
Deploying in Docker Swarm Mode will vary based on your setup however you can follow the general guidelines below assuming you have a swarm set up and your docker engine is pointing to that swarm:
- Build the api-gateway and hello-world-api images
- Push those images to your docker swarm's image repository
- Create a network on your docker swarm
    - ```docker network create my-net --driver overlay```
- Deploy hello-world-api to the swarm using the network you created
    - ```docker service create --name helloapi --replicas 1 --network my-net <your -docker image repository>/helloapi```
- Deploy api-gateway to the swarm using the network you created
    - ```docker service create -p 3000:3000 --name api-gateway --replicas 1 --network my-net <your docker image repository>/api-gateway```
    - Note: api-gateway should expose a port accessible through the swarm i.e. ```-p 3000:3000```


# Documentation
In this section we will explore how the API Gateway works and how it can be used.

### The Hello World API
The Hello World API is just a simple Express-based REST API that exposes the endpoint "/api/v1/hello" to all HTTP methods.

The Hello World API is comprised of 2 files:
- bin/www
    - This file imports app.js, sets up the server and runs the server
- app.js
    - This file sets up the Express-based app with a single REST endpoint "/api/v1/hello" available to all HTTP methods


The following code snippet shows the REST endpoint exposed by the service:
```javascript
app.all('/api/v1/hello', function(req, res) {
  const response = {
    message: 'hello',
    query: req.query,
    body: req.body,
  };

  let gatewayMsg = req.headers['gateway-message'];
  if(gatewayMsg) {
    response['gateway-message'] = JSON.parse(gatewayMsg);
  }

  res.json(response);
});
```
As you can see, it creates a resonse comprised of the request's query paramaters, body (for POST requests) and a message 'hello'.
It also checks to see if there is an HTTP header 'gateway-message' and appends it to the response if so.

### The API Gateway
At it's core, the API Gateway is a simple Express-based REST API that acts as a reverse proxy that is extensible and lets you manipulate or react to requests before they reach their destination.
It allows the use of middleware to add functionality and makes use of the NPM module [http-proxy](https://www.npmjs.com/package/http-proxy) to redirect requests to their destination.

The API Gateway is comprised mainly by the following 3 files:
- bin/www
    - This file imports app.js, sets up the server and runs the server
- app.js
    - This file imports the settings from services.json in order to bootstrap the proxy.
- services.json
    - This file is where you define your services and what middleware they should use

#### The Bootstrapping Process (app.js)
As mentioned above, the purpose of app.js is to set up the server to proxy requests. It does this by reading in the contents of services.json which should contain an array of services (as described below) and then configuring a REST endpoint at "/api/{service name}"

For example: The name of our Hello World API is "helloapi", thus when going through the API Gateway we will access the Hello World API through the endpoint "/api/helloapi"


#### Configuring Your Services (services.json)
This is where you define your services. It should contain a JSON array of objects each corresponding to an individual service. This object should contain the following parameters:
- name
    - The name of your service. This is used to set up the endpoint on the API Gateway that will redirect requests to the actual service.
- host
    - What host to proxy the requests to
- port
    - What port to proxy the requests to
- protocol
    - what protocol to use when proxying the request (default: http)
- rootPath
    - The root path to proxy requests to on the service (default: "")
    - For example:
        - The rootPath of the Hello World API is "api/v1". If we omit this from our services.json file then in order to reach the "api/v1/hello" endpoint on the Hello World API from the API Gateway we would have to use the endpoint "/api/helloapi/api/v1/hello" instead of "/api/helloapi/hello"
- middleware
    - An array of strings corresponding to the name of a javascript file inside the "middleware/" directory. This is how you specify what middleware a service should use.
    - Note: middleware will be applied in the order that it appears in the array

#### Middleware (middleware/*.js)
The "middleware/" directory is used to hold your custom Express middleware to apply onto the requests before they are proxied. For example, let's take a look at the example middleware "middleware/SayHello.js":
```javascript
module.exports = function(req, res, next) {
  const message = { message: 'Hello from the API Gateway!' };
  req.headers['gateway-message'] = JSON.stringify(message);
  next();
};
```
The role of this middleware is to append the HTTP header "gateway-message" to the request before it is proxied.

If you are unfamiliar with middleware or how it is used in NodeJS/Express I highly recommend reading [Using Express middleware](http://expressjs.com/en/guide/using-middleware.html) or doing some research on your on.

### Docker
Discussing what Docker is and how it works is beyond the scope of this tutorial, however in this section I will briefly discuss why Docker works well with this implementation of an API Gateway.

Docker's networking features whether on a single machine using [Docker Compose](https://docs.docker.com/compose/) or on a [Docker Swarm](https://docs.docker.com/engine/swarm/) allow you to use simple "host" names when defining your services in the API Gateway's "services.json" file. This is because Docker allows you to access other containers on the same [Docker netowork](https://docs.docker.com/engine/userguide/networking/) via their container/service name.

For example:
In our "docker-compose.yml" file we called our components "gateway" and "helloapi". This allows us to use the host name "helloapi" in our "services.json" file because requests to "helloapi" from "gateway" will automatically route to the appropriate Docker container running "helloapi".

When running on a Docker swarm, where you can have multiple instances of the same service, this comes with the added benefits of automatically load balancing your requests across those instances.

### Summary
This implementation of an API Gateway is meant to illustrate how you can easily build a flexible yet powerful API Gateway using NodeJS/Express and Docker. In short, this implementation uses Express middleware and the NPM module [http-proxy](https://www.npmjs.com/package/http-proxy) to create a reverse proxy in which you can add functionality to modify and react to requests before they are sent to their intended destination.

#### Disclaimer
I would not recommend using this exact implementation in a critical production enviroment since it has not yet been thoroughly tested in such an environment, however you are free to use and modify the code as you wish.

#### Final Thoughts / Future Development
- It may be worthwile to use something like [Apache Zookeeper](https://zookeeper.apache.org/) to configure the services instead of the "services.json" file.
- Other types of protocols aside from "http" and "https" still need to be tested. I am especially interested in seeing if I am able to proxy a request to connect to a websocket server or other two-way communication servers and maintain that connection between the client/server.
