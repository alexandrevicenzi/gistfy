var rc = require('rc');

var config = {
    host: '127.0.0.1',
    port: 3000,

    user_agent: function() {
        return 'Gistfy-App ' + require('../package.json').version;
    }(),

    type: 'js',
    style: 'github',
    locale: 'en',
    branch: 'master'
};

config.base_url = (function() {
    return '//' + this.host + ':' + this.port;
}).call(config);

module.exports = rc('gistfy', config);