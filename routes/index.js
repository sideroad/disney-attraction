var express = require('express');
var router = express.Router();
var jsdom = require("jsdom");
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
            attractions = [];

        attractions = $('#wait section.theme.active .run.midArw').map(function(index, elem){
          var $item = $(elem),
              name;

          if($.trim($item.find('.run').text()) !== '運営中'){
            return;
          }

          name = $item.find('h3').text();
          return {
            name: name,
            wait: Number($item.find('.waitTime').text().replace(/分/,'')||0)
          };
        }).get();

        attractions.reverse();


        res.set({
          'Access-Control-Allow-Origin':'*',
          'Access-Control-Allow-Methods':'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers':'*'
        });

        res.json({
          attractions: attractions
        });
        res.end();
      }
    );
  } catch(err){
    console.log(err);
  }

});

module.exports = router;
