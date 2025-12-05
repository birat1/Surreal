### set up a .env inside /user-auth-service/
```
DATABASE_URL=postgresql+psycopg2://user:pass@db:5432/userauthdb
```
you can change the username, password, database name in docker-compose.yml

### Create a docker network if you haven't
```docker network create user-messaging```

### docker commands
```docker compose build``` - build

```docker compose up``` - run

```docker compose down``` - stop


