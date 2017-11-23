# sudo docker run -it -v /app/node_modules -p 3000:3000 --name Surge surge:0.1
# sudo docker build -t surge:0.3 --rm .
# deploy using container

FROM ubuntu:14.04

WORKDIR /app

ADD . /app

RUN mkdir Music

RUN sudo apt-get update -yq && apt-get upgrade -yq build-essential -yq 

RUN sudo apt-get install python python-dev python-pip -yq && \
	sudo apt-get install -yq curl git

RUN curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash - && \
	sudo apt-get install -y nodejs

RUN sudo pip install youtube-dl

RUN npm install

RUN sudo apt-get install libav-tools -yq

RUN sudo locale-gen en_US.UTF-8

RUN sudo update-locale LANG=en_US.UTF-8

ENV LC_ALL="en_US.UTF-8"

CMD node server.js