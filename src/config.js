var rc = require('rc');

var config = {
    host: '127.0.0.1',
    port: 3000,
    debug: false,
    no_static: false,
    ga_id: '',
    do_refcode: '',
    cdn_url: '',
    user_agent: function() {
        return 'Gistfy-App ' + require('../package.json').version;
    }()
};

module.exports = rc('gistfy', config);
