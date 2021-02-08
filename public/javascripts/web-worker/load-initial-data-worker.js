

var appversion;
onmessage = function (e) {
  var srtFileUrl = e.data[0];
  console.log(srtFileUrl)
  //console.log("url " + JSON.stringify(e.data[0]));
  var bookUris = e.data[1];
  //console.log("data1 " + JSON.stringify(e.data[1]));
  var config = e.data[2];
  //console.log(e.data);
  appversion = e.data[2]['appversion']
  //console.log("conf " + JSON.stringify(config));
  var output = [];


  loadXhr(srtFileUrl, onSrtTextLoaded);
  
   
  function onSrtTextLoaded(srtDataText) {
    var srtData;
    loadXhr(config.meta_data_path, function (metaDataText) {
      postMessage([srtData, parseMetaDataFile(metaDataText, config, bookUris)]);

    });""
    //console.log("SRT DATA " + srtDataText);

    srtData = parseSrtFile(srtDataText, config);

  }
}


function parseSrtFile(fileStr, config) {
  
  var data = [];


  var arr = fileStr.split("\n")[0].split('\t');
  var srt_data_mapping = [
    { key: 'book1_id', key2: 'book1_chunk', cell: arr.findIndex(el => el=='id1') , type: 'extract' },
    { key: 'book1_y1', cell: arr.findIndex(el => el=='bw1'), type: 'number' },
    { key: 'book1_y2', cell: arr.findIndex(el => el=='ew1'), type: 'number' },
    { key: 'book1_raw_content', cell: arr.findIndex(el => el=='s1'), type: 'string' },
    { key: 'book1_content', cell: arr.findIndex(el => el=='s1'), type: 'normalizedText' },

    { key: 'book2_id', key2: 'book2_chunk', cell: arr.findIndex(el => el=='id2'), type: 'extract' },
    { key: 'book2_y1', cell: arr.findIndex(el => el=='bw2'), type: 'number' },
    { key: 'book2_y2', cell: arr.findIndex(el => el=='ew2'), type: 'number' },
    { key: 'book2_raw_content', cell: arr.findIndex(el => el=='s2'), type: 'string' },
    { key: 'book2_content', cell: arr.findIndex(el => el=='s2'), type: 'normalizedText' }
  ];

  fileStr.split('\n').forEach(function (row) {

    if (row) {

      row = row.split('\t');
      if (config.appversion == 1) {
        data.push(extractRow(row, config.srt_data_mapping));
      }
      else
        // data.push(extractRow(row, config.srt_data_mappingV2));
        data.push(extractRow(row, srt_data_mapping));

    }
  });

  //remove header for new type of SRT files
  data = data.slice(1);
  return data;
}
function parseMetaDataFile(fileStr, config, bookUris) {
  
  var booksToFind = 2;
  var bookIdHash = {};
  config.bookSequence.forEach(function (bookName) {
    bookIdHash[bookUris[bookName]] = true;
  });

  fileStr.split('\n').some(function (row) {
    if (row) {
      //console.log(row)
      row = row.split('\t');
      var bookId = row[config.meta_data_book_id_cell];
      if (bookIdHash[bookId]) {
        console.log(bookIdHash[bookId])
        bookIdHash[bookId] = extractRow(row, config.meta_data_mapping);
        booksToFind--;
      }
    }
    return booksToFind <= 0;
  });

  return config.bookSequence.map(function (bookName) {
    return bookIdHash[bookUris[bookName]];
  });
}

function loadXhr(url, callback) {

  //url = "http://dev.kitab-project.org/passim01022020/JK000050-ara1.completed/JK000050-ara1.completed_JK000001-ara1.csv"
  var baseUrl = location.href.replace(location.pathname, '/');
  var xhr = new XMLHttpRequest();
  //console.log(url);
  xhr.open('GET', baseUrl + url, true);
  //xhr.open('GET', url, true);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(xhr.responseText);
      } else {
       // console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    //console.error(xhr.statusText);
  };
  xhr.send(null);
}

var typesForConversion = {
  'number': function (output, value, schema) { output[schema.key] = Number(value); },
  'string': function (output, value, schema) { output[schema.key] = value; },
  'normalizedText': function (output, value, schema) { output[schema.key] = deNormalizeItemText(value); },
  'extract': function (output, value, schema) {
    var extracts = extractIdAndMs(value);
    output[schema.key] = extracts[0];
    output[schema.key2] = Number(extracts[1]);
  },
  'ceil': function (output, value, schema) { output[schema.key] = Math.ceil(value / schema.use); }
};

function extractRow(row, mapping) {

  //console.log("r1: " + row)
  //console.log("m1: " + mapping)
  
  return mapping.reduce(function (output, schema) {
    //console.log(typesForConversion[schema.type])
    var process = typesForConversion[schema.type];
    //console.log("MAPPING:" + schema.cell);
    process(output, row[schema.cell], schema);
    //console.log(row)
    return output;
    
  }, {});
}

function extractIdAndMs(txtString) {
  if (appversion == 1) {
    var match = txtString.match(/(\w+)_(\d+)/);
  }
  else {
    // This regex ignore .completed/inProgress/mARkdown ignore
    //var match = txtString.match(/(\w+)-\w+?\.(\d+)/);
    var match = txtString.match(/(\w+)-ara1(?:\.\w+?)?\.ms(\d+)/);
    //console.log(match)
    //var match = txtString.match(/(\w+)-ara1\.ms(\d+)/);
  }

  if (match) {
    return [match[1], match[2]];   // [book_id, ms_id]
  } else {
    return [];
  }
}

function deNormalizeItemText(text) {
  text = text.replace(/-+/g, '');           // removes dashes
  text = text.replace(/ +/g, ' ').trim();   // remove possible double spaces
  // -------------------------------------

  var alifs = '[إأٱآا]';
  var alifRepl = '[إأٱآا]';
  // -------------------------------------
  var alifMaqsura = '[يى]';
  var alifMaqsuraRepl = '[يى]';
  // -------------------------------------
  var taMarbutas = 'ة';
  var taMarbutasRepl = '[هة]';
  // -------------------------------------
  var hamzas = '[ؤئء]';
  //var hamzasRepl  = '[ؤئءوي]';
  var hamzasRepl = '[يى]?[ؤئءوي]';
  // -------------------------------------

  // Applying deNormalization ::
  text = text.replace(new RegExp(alifs, 'g'), alifRepl);
  text = text.replace(new RegExp(alifMaqsura, 'g'), alifMaqsuraRepl);
  text = text.replace(new RegExp(taMarbutas, 'g'), taMarbutasRepl);
  text = text.replace(new RegExp(hamzas, 'g'), hamzasRepl);
  // -------------------------------------

  //text = text.replace(/ /g, '[\\s\\w\\#\\n\\@\\$\\|\\(\\)-]+');
  //text = text.replace(/ /g, '((\\W+(\\d+)?)?(Page\\w+)?)+');       // new from max
  text = text.replace(/ /g, '(\\W+(\\d+)?)?(note\\w+|Page\\w+)?');  // old from max
 // console.log(text)
  // text = text.replace(/ /g, '(\W+(\d+)?)?(note\w+|<[^<]+>|Page\w+)?');
  // -------------------------------------

  return new RegExp(text);
}