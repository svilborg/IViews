var config = {
	debug: true,
	name: 'IViews',
	host: '127.0.0.1',
	port: 8080,
	data: __dirname + '/../../data',
	mongo: {
		username: '',
		password: '',
		host: '127.0.0.1',
		name: 'iviews'
	},
	session: {
		name: 'iviewss',
		secret: 'iviewss' + Math.random().toString(),
		key: 'iviewss'
	}
};

config.mongo.db = config.mongo.host + "/" + config.mongo.name;

exports.config = config;