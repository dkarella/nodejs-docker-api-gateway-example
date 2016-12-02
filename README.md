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
        - Go to [localhost:port/api/v1/hello](http://localhost:<hello-world-api-port>/api/v1/hello)

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

[WIP]
