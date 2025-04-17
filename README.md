# SMVS Youth App
## Video 
https://youtu.be/uiHFWNFx3Uc

## Running the repo
1. Add in the two env files. One in the root and one in /frontend
2. `docker-compose up --build`
3. use docker ps to get the name of your backend container
4. Run: `docker exec -it <python-backend-container-name> /bin/bash -c "flask db upgrade"` to seed your DB
5. Go to `http://localhost:3000/login` and click sign up. Use your real email address
6. Verify your email address (check your inbox) and you are done! 

## Modify Postgres table
1. Exec into the DB container `docker exec -it <db-container-name> /bin/bash`
2. Access the postgres DB `psql -U postgres -d scv2`
