var config = {
	debug: false,
	name: process.env.OPENSHIFT_APP_NAME,
	host: process.env.OPENSHIFT_NODEJS_IP,
	port: process.env.OPENSHIFT_NODEJS_PORT,
	data: process.env.OPENSHIFT_DATA_DIR + 'uploads',
	mongo: {
		username: process.env.OPENSHIFT_MONGODB_DB_USERNAME,
		password: process.env.OPENSHIFT_MONGODB_DB_PASSWORD,
		host: process.env.OPENSHIFT_MONGODB_DB_HOST,
		port: process.env.OPENSHIFT_MONGODB_DB_PORT
	},
	session: {
		name: 'iviewss',
		secret: process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "|" + process.env.OPENSHIFT_MONGODB_DB_USERNAME,
		key: 'iviewss'
	}
};

config.mongo.db = config.mongo.username + ':' + config.mongo.password + '@' + config.mongo.host + ':' + config.mongo.port + '/' + config.name;
config.session.secret = require('crypto').createHash('md5').update(config.session.secret).digest("hex");

exports.config = config;