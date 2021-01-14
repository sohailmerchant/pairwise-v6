var express = require('express');
var router = express.Router();
var http = require('http');
var fs = require('fs');
var path = require('path')
const csv = require('csv-parser')

var results = [];
const baseUrl = "http://dev.kitab-project.org/passim01022020/"
const feb_run = "passim01022020"
const oct_run = "passim01022020"



/* GET home page. */



// var download = function (url, dest) {
//   var file = fs.createWriteStream(dest);
//   var request = http.get(url, function (response) {
//     response.pipe(file);
//     file.on('finish', function () {
//       //file.close(cb);  // close() is async, call cb after close completes.

//     });
//   }).on('error', function (err) { // Handle errors
//     fs.unlink(dest); // Delete the file async. (But we don't check the result)
//     if (cb) cb(err.message);
//   });
// };

// function cb() {
//   console.log('Closed');


// }


router.get('/', function (req, res, next) {
  res.render('index');

});

router.get('/bulkrenderSrt', function (req, res, next) {
  const results = [];
  res.render('bulksrtload', { csvObject: "" });
});


router.get('/bulkrenderSrt/q', function (req, res, next) {
  
  var pairname = req.query.fn
  book1 = pairname.split('_')[0] + "/"
  downloadURL = baseUrl + book1 + pairname
  tempfile = __dirname + '/../public/data-file/' + 'tempfile.csv'
  //tempfile = path.resolve(".") + '\\public\\data-file\\' + 'tempfile.csv'

  var file = fs.createWriteStream(tempfile);
  //console.log(dest)
  if (downloadURL.endsWith('csv')) {
    var request = http.get(downloadURL, function (response) {
      results = [];
      response.pipe(csv({ separator: '\t' }))
        .on('data', (data) => {
          results.push(data)
          // console.log(results)
        })
        .on('error', function (err) {
          fs.unlink(dest);
          if (cb) cb(err.message);
        })
        .on('finish', () => {
          res.render('bulksrtload', { csvObject: results });
        });

    });
  }

});


router.get('/visualise', function (req, res, next) {
  // The initial data file to start the page is "Shamela0035100_JK006838"
  // which is set as names variable. In the view template it's accessed through
  // var book_names = '<%= names %>'
  res.render('visualise', { names: "" });
  // if (res.names == "") {

  //     res.render('index', { title: 'root', names: '' });
  // } else {
  //     res.render('index', { title: 'Express', names: '' });

  // }
});

router.get('/visualise/q', function (req, res, next) {
  
  var pairname = req.query.fn

  var run_date = req.query.rd
  console.log(run_date)
  if (run_date!=null){
    
    downloadURL = baseUrl + passimRunDate + book1 + pairname

  }
  book1 = pairname.split('_')[0] + "/"
  downloadURL = baseUrl + book1 + pairname
  //console.log(fn)

  d = __dirname + '/../public/data-file/' + pairname
  //d = 'C:/Downloads/data-file-new/' + pairname

  var file = fs.createWriteStream(d);
  if (downloadURL.endsWith('csv')) {
    var request = http.get(downloadURL, function (response) {
      a = response.pipe(file);
        file.on('data', () => {
          console.log(a)
        })
        file.on('finish', function () {
          //file.close(cb);  // close() is async, call cb after close completes.
          res.render('visualise', { names: pairname });
        })
        file.on('end', () => {
         
        });

    });
  }

  //download(downloadURL, d)
  //res.render('visualise', { names: pairname });

});

router.get('/data', function (req, res, next) {
  res.render('datafile')
});

module.exports = router;
