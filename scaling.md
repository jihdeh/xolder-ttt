## ***Scaling the application***

I've outlined the steps we would take when scaling an application from a small number of users to high volume of users.

#### 100 users per day

Let's say we start with a small service. We can have one server running on a linux environment, that hosts our application.

Users -> Server(1gb ram, 1 core processor)

This works fine for a load of 100 users per day, concurrently using the application.

### 1000 users per day.

Let's say our application grows beyond a 100 users and our users begin to complain that the platform is running slow or they can't access the application due to the load.

We could decide to scale vertically i.e increase the server capacity. from 1gb to 256gb and 8 core processors.

When the server goes down, this means the users have lost the state of their game, and they now have to start all over again once the server is rebooted.
To solve this we would need to introduce Strong consistency, this is because we want to automatically update the UI with the state the game was when they were playing before server went down.

In our case, we could introduce using a database or to store the plays by each oponents probably by timestamp and the data of the game. This data will be sent to the client and it can be parsed to display the game state.

We can use a database like Prometheus, because this offers saving data based on time.

Our table could contain data like this for example:

```json
  {
    "id": uuid,
    "plays": [{position: 1, player: "x"}, {position: 3, player: "o"}],
    "nextPlayerTurn: "x"
    "time": DateTime
  }
  
```

We would configure our client side to send a notification to our backend with the last timestamp when the connection to the websock was lost.
We would use the timestamp to check the latest result of the game, and send the updates to the UI via the websocket.

"Smart" Sharding
Since our timeseries data will be very large, we'll need to have some sharding in place.

The natural approach is to shard based on zone: we can have the biggest zones(e.g Asia) in their individual shards, and we can have smaller zones grouped together in other shards.

An important point to note here is that, over time, zones sizes will change. Some zones might double in size overnight, others might experience seemingly random surges of activity, etc.. This means that, despite our relatively sound sharding strategy, we might still run into hot spots, which is very bad considering the fact that we care about latency so much.

To handle this, we can add a "smart" sharding solution: a subsystem of our system that'll asynchronously measure zone activity and "rebalance" shards accordingly. This service can be a strongly consistent key-value store like Etcd or ZooKeeper, mapping gameIds to shards. Our server will communicate with this service to know which shard to route requests to.

### 1M users per day

Our application is now gaining a lot of traction, more than 1000 users per day, our app has been doing well so far, but all of a sudden, we have run back to the reason we had to scale for 1000 users.

We can't scale vertically at this point, because it's expensive, and doing that again doesn't scale well.

So what do we do?
***Scale horizontally.***

What this means, we have to add multiple servers to handle different requests, we need to distribute the workload between our servers.
These requests would be routed to these servers based on a strategy e.g round-robin.

In WS since we have a state to keep (the connected clients) we will need to use a load balancer(tool: Nginx) configured with sticky sessions, this means after the first request (the handshake) every connection between client and WS will use the same server.

Which bring us to that our load balancer must know the number of clients connected to each server to ensure the distribution of new users without overburden any server with more users than it could handle.

Once configured, our load balance could even automate the spin-up of new server if the current ones are reaching their limits of users.

When the traffic goes down again it could start to shutdown server, even server with low usage and force users reconnect to the rest of the server. This way we could save some money shutting down extra servers and only paying for what we need(tool: kubernetes).

In addition, the application might be divided into a zone per continent, i.e., Asia, Europe, America, Africa, Oceania, etc'.

Each of these zones might be divided further by country / state.
Some states might require multiple (sub) zones due to heavy traffic (a third layer of routing / redirection).

Each of these sub-zones will hold it's own (sub) domain, a load balancer and a number of machines that manage both the connections and the data for that zone.
A divide and conquer strategy(tool: AWS Elastic Load Balancing)

On the client side, we will want to implement an exponential backoff on the retry intervals to avoid overwhelming other nodes in the cluster (i.e [the thundering herd problem](https://en.wikipedia.org/wiki/Thundering_herd_problem)).

Pub/Sub System for Real-Time Behavior:

The behavior that we want to support:
Sending and receiving messages in real time.

We can rely on a Pub/Sub messaging system, which itself will rely on our previously described "smart" sharding strategy.

Every zone or group of zones will be assigned to a Kafka topic, and whenever a player in a game plays, our servers which handle speaking to our database, will also send a Pub/Sub message to the appropriate Kafka topic.

We'll then have a different set of servers who subscribe to the various Kakfa topics (probably one server cluster per topic), and our clients (Players) will establish websocket/tcp connections with these server clusters to receive Pub/Sub messages in real time.

We'll want a load balancer in between the clients and these servers, which will also use the "smart" sharding strategy to match clients with the appropriate servers, which will be listening to the appropriate Kafka topics.

When clients receive Pub/Sub messages, they'll handle them accordingly (e.g display if there's a winner or draw).

Since each Pub/Sub message comes with a timestamp, and since playing involves writing to our persistent storage, the Pub/Sub messages will effectively be idempotent operations.


Regards,
