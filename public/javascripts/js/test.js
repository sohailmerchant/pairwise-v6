// var http = require('http');

// var options = {
//     host: 'http://dev.kitab-project.org',
//     path: '/passim01022020/JK000050-ara1.completed/JK000050-ara1.completed_JK000001-ara1.csv'
// }
// var request = http.request(options, function (res) {
//     var data = '';
//     res.on('data', function (chunk) {
//         data += chunk;
//     });
//     res.on('end', function () {
//         console.log(data);

//     });
// });
// request.on('error', function (e) {
//     console.log(e.message);
// });
// request.end();

// var request = require('request');
// request.get('http://dev.kitab-project.org/passim01022020/JK000050-ara1.completed/JK000050-ara1.completed_JK000001-ara1.csv', function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         var csv = body;
//         // Continue with your processing here.
//         console.log(csv)
//     }
// });



var http = require('http');
var fs = require('fs');

url = "http://dev.kitab-project.org/passim01022020/JK000050-ara1.completed/JK000050-ara1.completed_JK000481-ara1.completed.csv"
dest = 'file.csv'
var download = function(url, dest) {
  var file = fs.createWriteStream(dest);
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

download(url,dest);