var express = require('express');
var router = express.Router();
const formidable = require('formidable');

// if(window.getElementById("uploadBox").value != "") {
    // you have a file
    router.post('/', (req, res) => {
        var form = new formidable.IncomingForm();

        form.parse(req);

        form.on('fileBegin', function (name, file) {
          //  file.path = __dirname + '/../public/data-file/book1_book2.srt'; //+ file.name;
            file.path = __dirname + '/../public/data-file/'+ file.name;
        });

        form.on('file', function (name, file) {
            if (file.name == "" || file.name.split('.').pop() != 'srt')
                res.render('index', {names: "Shamela0026039_JK000467.srt"})
            else
                res.render('index', {names: file.name});
        });
       
     //res.redirect('/');
    });
// }
module.exports = router;
