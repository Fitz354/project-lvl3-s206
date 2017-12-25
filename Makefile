install:
	npm install

dev-server:
	rm -rf dist
	npm run webpack -- --env development
	npm run dev -- --env development

server:
	rm -rf dist
	npm run webpack -- -p --env production
	node server.js

test:
	npm test

lint:
	npm run eslint

publish:
	npm publish
