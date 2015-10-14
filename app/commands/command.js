'use strict';

//params
var params = {};
if ( process.argv.length >= 4 ) {
    var commandName = process.argv[4];

    process.env.NODE_ENV = process.argv[2];
    process.env.THEME = process.argv[3];

    //preserve only command parameters
    process.argv.splice(0, 3);

    console.dir(process.env);


    var mongoose = require('mongoose');
    var chalk = require('chalk');
    var config = require('../../config/config');

    console.log(config.db);
    var db = mongoose.connect(config.db, function(err) {
        if (err) {
            console.error(chalk.red('Could not connect to MongoDB!'));
            console.log(chalk.red(err));
        }else {


            console.log(process.argv);
            var Command = require('./' + commandName + 'Command.server.command');
            var command = new Command();
            command.execute.apply   (command, process.argv);
        }


    });
}else{
    console.log('No Command found');
}