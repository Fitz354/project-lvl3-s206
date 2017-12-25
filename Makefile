install:
	npm install

dev-server:
	rm -rf dist
	npm run webpack -- --env development
	npm run dev -- --env development

server:
	rm -rf dist
	npm run webpack -- -p --env production
	npm run babel-node -- server.js

test:
	npm test

lint:
	npm run eslint

publish:
	npm publish

deploy:
	git push heroku master
	heroku ps:scale web=1
	heroku open
