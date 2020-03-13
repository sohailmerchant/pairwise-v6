const fs = require('fs');
const zlib = require('zlib');
const readline = require('readline');

export function ungzfile(filepath) {
    let lineReader = readline.createInterface({
        input: fs.createReadStream(filepath)
            .pipe(zlib.createGunzip().on('data', function (data) {
                console.log("Got data:", data.toString());
                return data.toString();
            }))


    });
};

//console.log(lineReader);

// let n = 0;
// lineReader.on('line', (line) => {
//   n += 1
//  // console.log("line: " + n);
//   console.log(line);

// });