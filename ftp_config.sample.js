'use strict';

const config = {
    username: 'admin@hooverville.biz',
    // password: 'password', //optional, prompted if none given
    host: 'ftp.hooverville.biz',
    port: 21,
    localRoot: __dirname + '/dist',
    remoteRoot: '/treerock/test-sq-basic/',
    // include: ['build/version.txt'],
    // exclude: ['.git', '.idea', 'tmp/*', 'build/*']
};
module.exports = config;