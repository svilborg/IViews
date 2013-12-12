var config, config_file = './' + (process.env.OPENSHIFT_MONGODB_DB_PASSWORD ? 'production' : 'development') + '.js';

try {
	config = require(config_file);
} catch (err) {
	if (err.code && err.code === 'MODULE_NOT_FOUND') {
		console.error('No config file found : ' + config_file);
		process.exit(1);
	} else {
		console.error('Config Error : ' + err.code);
		throw err;
	}
}

module.exports = config.config;