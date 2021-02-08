(function (exports) {
  'use strict';
  //var IsColorMasking = false;
  var workerConfig = utils.pick([
    'page_chunk_count', 'forward_chunk_count', 'backward_chunk_count',
    'page_string_format', 'book_content_url', 'bookSequence'
  ], {}, config);
  var myWorker = new Worker(config.web_worker_path.load_chunks);

  myWorker.onmessage = workerMessage;

  var selectedMatchData, loadedChunkRange = {};
  var completedDataCount = 0;

  exports.loadBackwardContent = loadBackwardContent;
  exports.loadForwardContent = loadForwardContent;
  exports.loadBooks = loadBooks;
  //exports.IsColorMasking = IsColorMasking;

  function pickWorkerData() {
   
    return utils.pick([
      'book1_id', 'book1_chunk', 'book1_fn', 'book2_id', 'book2_chunk', 'book2_fn'
    ], {}, selectedMatchData);
   
  }
  function loadBackwardContent(bookName) {
    var workerArgs = {
      bookName: bookName,
      start_chunk: loadedChunkRange[bookName][0] - config.load_more_count,
      end_chunk: loadedChunkRange[bookName][0] - 1,
    };

    var workerData = pickWorkerData();
    
    myWorker.postMessage(['load_backward_book', workerData, workerConfig, workerArgs]);
  }
  function loadForwardContent(bookName) {
    var workerArgs = {
      bookName: bookName,
      start_chunk: loadedChunkRange[bookName][1] + 1,
      end_chunk: loadedChunkRange[bookName][1] + config.load_more_count,
    };

    var workerData = pickWorkerData();
    
    myWorker.postMessage(['load_forward_book', workerData, workerConfig, workerArgs]);
  }

  function loadBooks(_selectedMatchData) {
    
    completedDataCount = 0;
    selectedMatchData = _selectedMatchData;

    config.bookSequence.forEach(function (bookName) {
      d3.select('#' + bookName + 'Loader').style('display', null);
      d3.select('#' + bookName + 'Content').style('display', 'none');
      d3.selectAll('.' + bookName + '.loader-btn').style('display', 'none');
      d3.select('#' + bookName + 'Content').html(null);
      d3.select('#' + bookName + 'RawContent').text(null);
    });

    var workerData = pickWorkerData();

    console.log(workerData)
    myWorker.postMessage(['load_new_book', workerData, workerConfig]);
  }
  
  function workerMessage(e) {
    var taskName = e.data[0];
    var status = e.data[1];
    var textObj = e.data[2];
    var bookName = e.data[3];
    

    
    
    var selectedChunkId = selectedMatchData[bookName + '_chunk'];
    var contentNodeD3 = d3.select('#' + bookName + 'Content');
    var prependReferenceD3;

    if (taskName === 'load_new_book') {
      loadedChunkRange[bookName] = e.data[4];
      
      
    }
    else if (taskName === 'load_backward_book') {
      loadedChunkRange[bookName][0] = e.data[4][0];
      prependReferenceD3 = contentNodeD3.select('div')
        .attr('class', 'prepend-reference');
    }
    else if (taskName === 'load_forward_book') {
      loadedChunkRange[bookName][1] = e.data[4][1];
    }

    d3.select('#' + bookName + 'Content').style('display', null);

    for (var chunkId in textObj) {
      var chunkText = textObj[chunkId];
      chunkText = parseBookIntoHtml(chunkText);

      var paraLabel;
      var currentPara;
      if (prependReferenceD3) {
        paraLabel = contentNodeD3.insert('span', 'div.prepend-reference');
        currentPara = contentNodeD3.insert('div', 'div.prepend-reference');
      } else {
        paraLabel = contentNodeD3.append('span').attr('class', 'book-text');
        currentPara = contentNodeD3.append('div').attr('class', 'book-text');
      }

      paraLabel.attr('class', 'label-chunk milestone-id')
        .html('MilestoneID: ' + chunkId);

      currentPara.html(chunkText);;

      chunkId = Number(chunkId);
      if (chunkId === selectedChunkId) {
        selectPara(bookName, currentPara, chunkText, paraLabel);
      }
    }
    if (prependReferenceD3) {
      prependReferenceD3.attr('class', null);
    }

    if (status === 'complete') {
      d3.select('#' + bookName + 'Loader').style('display', 'none');
      d3.selectAll('.' + bookName + '.loader-btn').style('display', null);

      if (++completedDataCount >= 2) {
        markDashes();
      }
    }

  }
  function parseBookIntoHtml(text) {
    text = text.replace(/\(@\)/g, "\n");
    text = text.replace(/\(@@\)/g, "\n \n");
    text = text.replace(/\~~\)/g, "");
    //text = text.replace(/(PageV\d{2}\w\d{3}?\s)/g, "<br/><a class='page-number' title='archive.org' href='https://archive.org/' target='_blank'>$1</a> <br/>")
    text = pageNumberFormat(text);
    text = quranVerseFormat(text);

    //text = text.replace(/\w+(ms\d{1,}\w+)/g,"<span class='milestone-id'> $1<span>");
    //text = text.replace(/\#(\w+)\#/g, "<p>$1</p>");
    return text;
  }

  function pageNumberFormat(text) {

    var re = /(Page)(V\d{2})(P\d+\s)/g;
    var match = re.exec(text);
    //Vol. 5, p.22 
    if (match) {
      var volnumber = parseInt(match[2].replace('V', ''), 10);
      var pagenumber = parseInt(match[3].replace('P', ''), 10);
    }
    text = text.replace(re, "<br/><a class='page-number' title='archive.org' href='https://archive.org/' target='_blank'>" +
      "Vol." + volnumber + ", p." + pagenumber + "</a> <br/>");

      return text;
  }

  function quranVerseFormat(text){
    var re = /@QB@(.*)@QE@/g;
    var match = re.exec(text);
    if(match){
      text = text.replace(re, "<span class='quran-verse'>$1</span>");

    }
    return text;

  }


  function selectPara(bookName, currentPara, content, paraLabel) {
    var itemText = selectedMatchData[bookName + '_content'];
    //console.log("iii" + itemText)

    paraLabel.attr('class', 'milestone-id selected')
    currentPara.attr('class', 'selection-chunk');

    content = content.replace(itemText, '<selection>$&</selection>');
    currentPara.html(parseBookIntoHtml(content));

    setTimeout(function () {
      paraLabel.node().scrollIntoView();
      setTimeout(function () {
        var contentNodeD3 = d3.select('#' + bookName + 'Content');
        var selectionNodeD3 = contentNodeD3.select('selection');
        if (!selectionNodeD3.node()) {
          return;
        }

        var scrollTop = selectionNodeD3.property('offsetTop') - contentNodeD3.property('offsetTop');
        contentNodeD3.property('scrollTop', scrollTop);
        utils.selectText(selectionNodeD3.node());
      }, 0);
    }, 0);
  }


  function markDashes() {
    //console.log(selectedMatchData);

    // if (IsColorMasking = true){
    var b1MilestoneID = '<div class="milestone">Book 1: MilestoneID ' + selectedMatchData['book1_chunk'] + '</div>'
    d3.select('#b1MilestoneID').html(b1MilestoneID);
    var rawContent = window.processColoring(selectedMatchData['book1_raw_content'], selectedMatchData['book2_raw_content'], 'difference-deletion')
    // + '<br/><br/>'
    //+ selectedMatchData['book1_raw_content'];

    //   var rawContent = ''
    //   + window.processColoring(selectedMatchData['book1_raw_content'], selectedMatchData['book2_raw_content'], 'difference-deletion')
    //  // + '<br/><br/>'
    //   //+ selectedMatchData['book1_raw_content'];

    d3.select('#book1RawContent').html(rawContent);
    var b2MilestoneID = '<div class="booktitle">Book 2: MilestoneID ' + selectedMatchData['book2_chunk'] + '</div>'
    d3.select('#b2MilestoneID').html(b2MilestoneID);
    var rawContent = window.processColoring(selectedMatchData['book2_raw_content'], selectedMatchData['book1_raw_content'], 'difference-addition')
    // + '<br/><br/>'
    //+ selectedMatchData['book2_raw_content'];

    //   var rawContent = '<div class="booktitle">book2 (ms' + selectedMatchData['book2_chunk'] + ')</div>'
    //   + window.processColoring(selectedMatchData['book2_raw_content'], selectedMatchData['book1_raw_content'], 'difference-addition')
    //  // + '<br/><br/>'
    //   //+ selectedMatchData['book2_raw_content'];

    d3.select('#book2RawContent').html(rawContent);
    //  }
    //else
    //{
    selectedMatchData['book1_raw_content'];
    selectedMatchData['book2_raw_content'];
    // d3.select('#book1RawContent').attr("class", 'padding10 bookalignments data-source-string="'+ selectedMatchData['book1_raw_content']);
    //}
  }


})(window.dataLoader = {});