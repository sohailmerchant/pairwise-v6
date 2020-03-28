var express = require('express');
var router = express.Router();


var http = require('http');
var fs = require('fs');

url = "http://dev.kitab-project.org/passim01022020/JK000050-ara1.completed/JK000050-ara1.completed_JK000481-ara1.completed.csv"
dest = 'file.csv'
var download = function(url, dest) {
  var file = fs.createWriteStream(dest);
  console.log(dest)
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

function cb(){
    console.log('Closed');

}
/* GET home page. */
router.get('/', function (req, res, next) {
    // The initial data file to start the page is "Shamela0035100_JK006838"
    // which is set as names variable. In the view template it's accessed through
    // var book_names = '<%= names %>'
    
    if (res.names == "") {

        res.render('index', { title: 'Express', names: '' });
    } else {
        res.render('index', { title: 'Express', names: '' });

    }

});

router.get('/bulkrenderSrt', function (req, res, next) {
    res.render('bulksrtload');
});


router.get('/q', function (req, res, next) {
    //console.log(req.query.fn)
    var pairname = req.query.fn
    book1 = pairname.split('_')[0]+ "/"
    base = "http://dev.kitab-project.org/passim01022020/"
    //console.log(fn.split('/')[1]);
    downloadURL = base + book1 + pairname

    //console.log(fn)
    d = __dirname + '/../public/data-file/' + pairname
    download(downloadURL, d  )
    //localStorage.setItem('urlparamexists',pairname)
    res.render('index',{names: pairname});
});









module.exports = router;
