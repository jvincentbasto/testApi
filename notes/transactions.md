# Setup Mongodb Transaction Locally

Install mongodb server
Download mongodb shell
Add (server and shell) bin paths to environment variable

```sh
# setup folders

# create folders and files
mkdir C:\data\db
mkdir C:\data\log

# create file
C:\data\mongod.cfg
```

```sh
# File: C:\data\mongod.cfg

storage:
  dbPath: C:\data\db

systemLog:
  destination: file
  path: C:\data\log\mongod.log
  logAppend: true

net:
  bindIp: 127.0.0.1
  port: 27017

replication:
  replSetName: rs0
```

```sh
# Enable Replication

# On Terminal 1
# temporary
mongod --replSet rs0
# permanent
mongod --config "C:\data\mongod.cfg" --install --serviceName MongoDB

# On Terminal 2
mongosh
rs.initiate()

# seed
npm run seed
```

```sh
# Reset

# terminate
net stop MongoDB # or
taskkill /F /IM mongod.exe 

# status
Get-Service MongoDB

# start
net start MongoDB
```
