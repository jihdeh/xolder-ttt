# Tic-Tac-Toe


###### HOW TO PLAY
 - If running in command line interface mode
    - open terminal and RUN `node tcp` to start TCP server
    - In another terminal window/session connect to TCP server as player 1 RUN `nc localhost 62001`
    - For player 2, open a new terminal window/session and RUN same command
    - Each block in a tic-tac-toe game can be linked to a number starting from 0 to 8.
    - In order to select a block to play as player 1, in the terminal write `PLAY (n)`. Where n is the number in the block (0-8)
    - To play as player 2, head over to the open terminal for player 2 and write `PLAY (n)`. Where n is the next available number in the block.
    
- If running in web broswer
   
    - RUN `npm install`
    - RUN `node ws`
    - Inside the `frontend` folder is an index.html file, you can either
        
        - Run the index.html on a port if you have python installed on your computer by running `python3 -m http.server 9000` or if on python 2 RUN `python -m simpleHTTPServer 9000`. After doing that you should be able visit the application in your browser by `localhost:9000`
        - Other option is to copy the path to the index.html file and paste in your browser.
        - `NOTE: You have to open two seperate browser windows to run in multiple sessions as multiple players X and O.`
    - You should see an interface to play the game in your broswer.

###### Test
 - RUN `npm test`

###### Environment
 
 This project was run on a Unix system, not tested on a windows computer. as this project doesn't run in docker.
 
###### Scaling the Tic-Tac-Toe Application

To scale an application like this, a number of implementations need to be done.

Horizontal Scaling.
1. Pub/Sub - Publish/Subscribe. Right now this project works fine with just one server.This is because on one server the server will be aware of all players and what numbers the players are playing next. But as the application grows larger in users, we would want to scale across multiple servers and we want to do this for sharing processing power, and redundancy. To achieve this we can use services like RabbitMQ, Kafka or Redis. Another benefit of using a pub/sub broker to coordinate our websocket application is that it’s makes it possible to easily handle failover.
2. Introduce load balancing to handle websocket requests routing by using a proxy to route requests to the right backend server. We assume we have multiple servers here(scaling horizontally). But there is a problem here, what if a request starts an instance from one server but ends up being rerouted to another server. Each socket connection is bound to a specific instance, so we need to make sure that all the requests from specific users are forwarded to a particular backend. Also when the server breaks, there will be re-connection and it should go to the same server again. We can resolve this state problem by using sticky sessions
3. Hyper scaling and cost-effective this means when there's alot of requests we should be able to horizontal scale-out and when there's not alot of requests we should be able to scale down gracefully. This can be achieved with kubenetes.


# Read more on scalability [here](scaling.md)