var config = {
	name: process.env.OPENSHIFT_APP_NAME,
	host: process.env.OPENSHIFT_NODEJS_IP,
	port: process.env.OPENSHIFT_NODEJS_PORT,
	data: process.env.OPENSHIFT_DATA_DIR + 'uploads',
	mongo: {
		username: process.env.OPENSHIFT_MONGODB_DB_USERNAME,
		password: process.env.OPENSHIFT_MONGODB_DB_PASSWORD,
		host: process.env.OPENSHIFT_MONGODB_DB_HOST,
		port: process.env.OPENSHIFT_MONGODB_DB_PORT
	}
};

/*    var dataDir = process.env.OPENSHIFT_DATA_DIR;

    if (typeof dataDir === 'undefined') {
        dataDir = __dirname + '/../../data';
    }
    else {
        dataDir = dataDir + 'uploads';
    }*/
config.mongo.db = config.mongo.username + ':' + config.mongo.password + '@' + config.mongo.host + ':' + config.mongo.port + '/' + config.name;

exports.config = config;