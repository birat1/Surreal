### set up a .env inside /messaging-service/

```DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/messagedb```  
you can change the username, password, database name in docker-compose.yml

### docker commands

```docker compose up --build``` - build and run  
```docker compose down``` - stop  
```docker compose down -v``` - stop (delete the db too)  

### testing the chat

client.html is included so just open it while everything is running  
valid usernames are included in config.py file  
