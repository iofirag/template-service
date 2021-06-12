unused scripts:  
    "start-manual-prod": "set NODE_ENV=production&& yarn start",
    "build-config": "node --inspect --nolazy services/configCreatorService.js",
    "start:build-run": "yarn build-config && yarn start",
    "start:build-run-like-prod": "yarn build-config && yarn start-manual-prod",
    "nodemon": "nodemon index.js"