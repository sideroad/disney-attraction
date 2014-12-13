var express = require('express');
var router = express.Router();
var jsdom = require("jsdom");
var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
var superagent = require('superagent');
var async = require('async');
var _ = require('lodash');

router.get('/:park/', function(req, res) {  
  try {

    var url = 'http://s.tokyodisneyresort.jp/'+req.params.park+'/atrc_list.htm?waitShorter=true&noFst=true';
    console.log(url);

    jsdom.env(
      url,
      ['http://code.jquery.com/jquery.js'],
      function (errors, window) {
        var $ = window.$,
            atractions = [];

        atractions = $('#wait section.theme.active .run.midArw').map(function(index, elem){
          var $item = $(elem);

          if($.trim($item.find('.run').text()) == '終日運営休止'){
            return;
          }

          return {
            name: $item.find('h3').text(),
            wait: Number($item.find('.waitTime').text().replace(/分/,'')||0)
          };
        }).get();

        atractions.reverse();

        res.set({
          'Access-Control-Allow-Origin':'*',
          'Access-Control-Allow-Methods':'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers':'*'
        });

        res.json({
          atractions: atractions
        });
        res.end();
      }
    );
  } catch(err){
    console.log(err);
  }

});

module.exports = router;