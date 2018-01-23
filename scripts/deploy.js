'use strict';

const Config = require('../ftp_config.js');

var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();
    
ftpDeploy.deploy(Config, function(err) {
    if (err) console.log(err);
    else console.log('finished');
});