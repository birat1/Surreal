### set up a .env inside /messaging-service/

```DATABASE_URL=mongodb://user:pass@db:27017/messagedb?authSource=admin```  
you can change the username, password, database name in docker-compose.yml
```USER_AUTH_SERVICE_URL=http://user-auth-service:8000```

# JWT
```JWT_SECRET=```
```JWT_ALGORITHM=```
```JWT_EXPIRY_MINUTES=```
SAME VALUES AS THE ONES IN USER-AUTH-SERVICE .ENV

### Create a docker network if you haven't
```docker network create user-messaging```

### docker commands

```docker compose up --build``` - build and run  
```docker compose down``` - stop  
```docker compose down -v``` - stop (delete the db too)  

### testing the chat

client.html is included so just open it while everything is running  
valid usernames are included in config.py file  
