#!/usr/bin/env node

if (process.argv.length < 5){
    console.log("USAGE: node test_loxapi.js <host> <username> <password>");
    process.exit(1);
}

var LoxoneAPI = require('node-lox-ws-api');
var lox = new LoxoneAPI(process.argv[2], process.argv[3], process.argv[4], true, 'AES-256-CBC' /*'Hash'*/);
var debug = true;

var interval;

function log_info(message) {
    console.log((new Date().toISOString())+' INFO : '+message);
}

function log_debug(message) {
    if (debug){
        console.log((new Date().toISOString())+' DEBUG: '+message);
    }
}

function limit_str(text, limit){
    limit = typeof limit !== 'undefined' ? limit : 100;
    text = ''+text;
    if (text.length <= limit){
        return text;
    }
    return text.substr(0, limit) + '...('+text.length+')';
}

lox.on('connected', function() {
    log_info("Loxone connected!");
});

lox.on('close', function() {
    //clearInterval(interval);
    log_info("Loxone closed!");
});

lox.on('abort', function() {
    log_info("Loxone aborted!");
    process.exit();
});

lox.on('close_failed', function() {
    log_info("Loxone close failed!");
    process.exit();
});

lox.on('connect_failed', function(error) {
    log_info('Loxone connect failed!');
});

lox.on('connection_error', function(error) {
    log_info('Loxone connection error: ' + error.toString());
});

lox.on('auth_failed', function(error) {
    log_info('Loxone auth error: ' + JSON.stringify(error));
});

lox.on('authorized', function() {
    log_info('Loxone authorized');
    //interval = setInterval(function(){ lox.send_control_command("0b52aa23-010a-16f3-ffff112233445566/AI1", 'on') }, 5000);
    //setTimeout(function(){ lox.send_command('jdev/sps/io/test_vstup_tl/on') }, 5000);
    //setTimeout(function(){ lox.send_control_command('test_vstup_tl', 'off') }, 5000);
    setTimeout(function(){ lox.send_command('jdev/cfg/version') }, 5000);
});

lox.on('keepalive', function(time) {
    log_info('Loxone keepalive - '+time+'ms');
});

lox.on('send', function(message) {
    log_info('Loxone send: '+message.toString());
});

lox.on('handle_message', function(message) {
    if (message.type === 'binary'){
        log_debug('Loxone binary message: '+message.binaryData.length+' bytes '+limit_str(message.binaryData.toString('hex'), 50));
    }else{
        log_debug('Loxone text message: '+limit_str(message.utf8Data, 150));
    }
});

lox.on('message_header', function(header) {
    log_debug('Loxone header received - '+header.next_state()+', length: '+header.len );
});

lox.on('message_event_table_values', function(messages) {
    log_debug('Loxone event table values - items: ' + messages.length );
});

lox.on('message_event_table_text', function(messages) {
    log_debug('Loxone event table text - items: ' + messages.length );
});

lox.on('message_event_table_daytimer', function(messages) {
    log_debug('Loxone event table daytimer - items: ' + messages.length );
});

lox.on('message_event_table_weather', function(messages) {
    log_debug('Loxone event table weather - items: ' + messages.length );
});

lox.on('update_event_value', function(uuid, evt) {
    log_info('Update event value: uuid='+uuid+', evt='+limit_str(evt, 100)+'');
});

lox.on('update_event_text', function(uuid, evt) {
    log_info('Update event text: uuid='+uuid+', evt='+limit_str(evt, 100)+'');
});

lox.on('message_text', function(message) {
    log_info('On message_text: '+JSON.stringify(message));
});

process.on('SIGINT', function () {
    lox.abort();
});

lox.connect();
