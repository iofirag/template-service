FROM node:alpine
WORKDIR /service
# Cache part
COPY package*.json ./
COPY yarn.lock ./
RUN yarn config set "strict-ssl" false -g
RUN yarn
#
COPY . ./
CMD yarn start