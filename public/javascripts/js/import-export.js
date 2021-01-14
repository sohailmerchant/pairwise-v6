// to turn off skip header: remove line with comment id ##1 in this script
// to remove drop down: remove lines and para with comment id ##2 in this script and index.html as well

(function (window) {

  'use strict';
  window.loadCSV = loadCSV;
  window.loadCSVObject = loadCSVObject;
  window.exportCSV = exportCSV;
  window.toggleMarking = toggleMarking;
  window.isMarkingsOn = true;
  window.currentText = undefined;

  var dataTable = "";
  var tableBody = "";
  const sum = (accumulator, currentValue) => accumulator + currentValue;

  var aggregatedTotals = {
    totalWordMatch: [],
    someotherTotal: []

  };
  function ConvertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') line += '\t'

        line += array[i][index];
      }

      str += line + '\r\n';
    }

    return str;
  }

  function loadCSVObject(csvobj) {
     
    window.currentText = undefined;
    //window.currentText = csvobj;
    window.currentText = ConvertToCSV(csvobj)
    //console.log('DataURL:', window.currentText);
    d3.select('#dataTable').style('display', 'none');
    
    setTimeout(function () {
      
      loadCurrentTextOnToDom();

    });
  }


  function loadCSV(input) {

    var reader = new FileReader();
    reader.onloadend = function () {
      //console.log(reader.result);
      window.currentText = reader.result;
      //console.log(window.currentText)
      //d3.select('#bulkLoader').style('display', null);
      d3.select('#dataTable').style('display', 'none');
      setTimeout(function () {
        loadCurrentTextOnToDom();
        //d3.select('#bulkLoader').style('display', 'none');
      });
    }

    reader.readAsText(input.files[0], 'utf-8')

  }
  function toggleMarking() {
    window.isMarkingsOn = !window.isMarkingsOn;

    d3.select('#dataTable').style('display', 'none');
    setTimeout(function () {
      loadCurrentTextOnToDom();

    });
  }


  function loadCurrentTextOnToDom() {
    
     // var inputRows = d3.csvParseRows(inputText);
    //document.querySelectorAll('#rowTemplate').forEach(el => el.remove());
    
    dataTable = document.getElementById('dataTable'); 
    tableBody = dataTable.querySelector('tbody');
    
    //tableBody.remove();
    //var inputRows = d3.csvParseRows(window.currentText);
    var inputRows = d3.tsvParseRows(window.currentText);
    
    
    if (localStorage.getItem('version') == 1) {
      var col = {
        name1: 8,
        name2: 9,
        content1: 14,
        content2: 15

      };

    }
    // aggregated
    else if (localStorage.getItem('version') == 2) {

      var col = {
        //name1: 0,
        //name2: 10,
        //content1: 8,
        //content2: 18
        name1: 12,
        name2: 13,
        content1: 18,
        content2: 19,
        wordmatched: 27

      };

    } else {

      var col = {
        name1: 12,
        name2: 13,
        content1: 18,
        content2: 19,
        b1: 0

      };

    }

    d3.selectAll('#dataTable #test tr:not(#rowTemplate)').remove();

    if (localStorage.getItem('version') == 2 || localStorage.getItem('version') == 3) {
       processRow(inputRows.shift(), true);    // ##1 line deals first row as header
    }
    inputRows.forEach(function (dataRow) {
      
      processRow(dataRow, window.isMarkingsOn);
      aggregatedTotals.totalWordMatch.push(parseInt(dataRow[col.b1]));
    });

    d3.select('#dataTable').style('display', null);
    
    function processRow(dataRow, isMarkingOn) {

      var nodeClone = document.getElementById('rowTemplate').cloneNode(true);

      //console.log(nodeClone)
      nodeClone.removeAttribute('id');
      

      var params = {
        book1Name: dataRow[col.name1],
        book2Name: dataRow[col.name2],
        wordmatched: dataRow[col.wordmatched]


      };
      if (isMarkingOn) {
        params.book1Content = window.processColoring(dataRow[col.content1], dataRow[col.content2], 'difference-deletion');
        params.book2Content = window.processColoring(dataRow[col.content2], dataRow[col.content1], 'difference-addition');
        
      } else {
        params.book1Content = dataRow[col.content1];
        params.book2Content = dataRow[col.content2];

      }


      nodeClone.querySelectorAll('td').forEach(function (td) {
        //console.log(nodeClone)
        td.innerHTML = replaceParams(td.innerHTML, params);

      });
      nodeClone.removeAttribute('hidden');
      
      tableBody.append(nodeClone);
    }
    //might be useful. showing aggregated totals...
    //console.log(aggregatedTotals.totalWordMatch.reduce(sum))


    d3.select('.srt-details').selectAll('p').remove();
    var test = d3.select('#test').selectAll('tr');
    d3.select('.srt-details').append('p')
    .text("Number of records (aligned pairs) - " + inputRows.length);
    inputRows="";


    // d3.selectAll('.srt-details').append('p')
    // .text("Total Word Matched Book 1 to Book 2 - " + aggregatedTotals.totalWordMatch.reduce(sum));

  }

  function exportCSV() {
    if (document.getElementById('fileInput').files.length === 0) {
      return;
    }
    var csvOutputArray = [];

    d3.selectAll('#dataTable tr:not(#rowTemplate)')

      .each(function () {
        var outputRow = [];
        this.querySelector('.questioner select').value  // ##2 line drop down value
        d3.select(this).selectAll('td:not(.questioner)')
          .each(function () {
            outputRow.push(this.textContent);
          });
        csvOutputArray.push(outputRow);
      });

    var blob = new Blob([d3.csvFormatRows(csvOutputArray)], {
      encoding: "UTF-8",
      type: "text/csv;charset=UTF-8"
    });
    var fileName = document.getElementById('fileInput').files[0].name.replace(/\.csv$/, '_output.csv');
    window.saveAs(blob, fileName);
  }

  function replaceParams(str, replacements) {

    for (const paramName in replacements) {
      str = str.replace('{{' + paramName + '}}', replacements[paramName]);

    }
    return str;
  }
})(window);