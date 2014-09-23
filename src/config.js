var rc = require('rc');

var config = {
    host: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    port: process.env.OPENSHIFT_NODEJS_PORT || 3000,

    user_agent: function() {
        return 'Gistfy-App ' + require('../package.json').version;
    }(),

    type: 'js',
    style: 'github',
    locale: 'en',
    branch: 'master'
};

config.base_url = (function() {
    if (process.env.OPENSHIFT_APP_DNS) {
        return 'http://www.gistfy.com';
    } else {
        return 'http://' + this.host + ':' + this.port;
    }
}).call(config);

module.exports = rc('gistfy', config);