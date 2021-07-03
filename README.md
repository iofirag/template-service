example service:
config, probe, server, Dockerfile, logger, eslint, dependency-injection, nodemon, launch with F5, swagger-ui, yarn, prettier,

run local with docker:
$ docker build -t foo . && docker run -it --env-file test/.env foo


unused scripts:  
    "start-manual-prod": "set NODE_ENV=production&& yarn start",
    "build-config": "node --inspect --nolazy services/configCreatorService.js",
    "start:build-run": "yarn build-config && yarn start",
    "start:build-run-like-prod": "yarn build-config && yarn start-manual-prod",
    "nodemon": "nodemon index.js"



todo:
- rabbitmqService
- docker (port 80)
- getAll from index
V- tracerService
V- archiveService
V- example1Archive

RUN:
run in bash/sh restart-services.sh