var express = require('express');
var router = express.Router();
const formidable = require('formidable');

// if(window.getElementById("uploadBox").value != "") {
    // you have a file
    router.post('/visualise', (req, res) => {
        var form = new formidable.IncomingForm();
        form.parse(req);

        form.on('fileBegin', function (name, file) {
          //file.path = __dirname + '/../public/data-file/book1_book2.srt'; //+ file.name;
           file.path = __dirname + '/../public/data-file/'+ file.name;
           console.log(file) 
           
            
        });

        form.on('file', function (name, file) {
            if (file.name == "")
                res.render('index', {names: ""})
            else
                res.render('visualise', {names: file.name});
        });
       
     //res.redirect('/');
    });

    // router.get('/:filename', function (req, res, next) {
    //     console.log("req "+req.query('filename'));
    //     res.render('/dd');
    // });
    
// }
module.exports = router;
