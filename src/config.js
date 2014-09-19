var rc = require('rc');

module.exports = rc('gistfy', {
    host: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    port: process.env.OPENSHIFT_NODEJS_PORT || 3000,
    base_url: function() {
        if (process.env.OPENSHIFT_APP_DNS) {
            return 'http://' + process.env.OPENSHIFT_APP_DNS;
        } else {
            return 'http://' + this.host + ':' + this.port;
        }
    },

    user_agent: function() {
        return 'Gistfy-App ' + require('../package.json').version;
    }(),

    type: 'js',
    theme: 'github',
    locale: 'en',
    branch: 'master'
});

