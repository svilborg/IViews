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
		secret: 'iviews',
		key: 'iviewss'
	}
};

config.mongo.db = config.mongo.host + "/" + config.mongo.name;
config.session.secret = require('crypto').createHash('md5').update(config.session.secret).digest("hex");

exports.config = config;