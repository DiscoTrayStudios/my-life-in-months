$(document).ready(function() {
  var goadrichdata = [
    { "name": "Bethlehem", "value":96},
    { "name": "Canvas", "value":96},
    { "name": "Gambier", "value":45},
    { "name": "Milwaukee", "value":3},
    { "name": "Madison", "value":21},
    { "name": "San Antonio", "value":7},
    { "name": "Madison II", "value":77},
    { "name": "Shreveport", "value":84},
    { "name": "Conway", "value":75}
  ];
  var goadrichrange = ["#008080", "#002855", "#4B2E84", "#008B2B", "#c5050c", "#0f52ba","#c5050c", "#8a2432", "#E96B10"];

  var originaldata = [
    { "name": "Childhood", "value":184},
    { "name": "High School", "value":45}
  ];
  var originalrange = ["#1f77b4", "#aec7e8"];

  var data = [];
  var range = [];
  var defaultColors = d3.scaleOrdinal(d3.schemeCategory10);
  var chart;

  function calculateData() {
    console.log("Recalculating...");
    data = []
    range = []
    var dataRows = $("#mainTable").find('tbody tr');
    dataRows.each(function () {
      var row = $(this);
      data.push({ "name": row.children().eq(0).text(),
                  "value":row.children().eq(1).text()});
      //console.log(row.find('input')[0].value);
      range.push(row.find('input')[0].value);
    });
    toggleFuture();
    //console.log(range);
  }

  function makeWaffleChart() {
    /* to color elements we use the class name ( slugigy(name) ) */
    var domain = data.map(function(d){ return slugify(d.name.concat(data.indexOf(d))); })
    var palette = d3.scaleOrdinal().domain(domain).range(range);

    chart = d3waffle()
        .colorscale(palette);

    d3.select("#waffle")
  			.datum(data)
  			.call(chart);
  }

  function getCurrentNumMonths() {
    var numMonths = 0;
    var dataRows = $("#mainTable").find('tbody tr');
    dataRows.each(function () {
      var row = $(this);
      numMonths += parseInt(row.children().eq(1).text());
    })
    console.log(numMonths);
    return numMonths;
  }

  // Help from https://stackoverflow.com/questions/44494447/generate-and-download-screenshot-of-webpage-without-lossing-the-styles
  $( "#camera" ).click(function() {
    domtoimage.toBlob(document.getElementById('capture'))
    .then(function (blob) {
        window.saveAs(blob, 'myLifeInMonths.png');
    });
  });

  $( "#twitter" ).click(function() {
    domtoimage.toPng(document.getElementById('capture'))
    .then(function (dataUrl) {
        url="https://twitter.com/share?ref_src=" + dataUrl;
        console.log(url);
        window.open(url);
    });
  });

  $( "#addGallery" ).click(function() {
    domtoimage.toPng(document.getElementById('capture'))
    .then (function (dataUrl) {
        var img = new Image();
        img.src = dataUrl;
        var galdiv = $("<div class='col-md-4'></div>").append(img);
        // how to make the image have a class fluid?
        galdiv.children(0).addClass("img-fluid");
        $("#gallery").prepend(galdiv);
          //img);
    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error);
    });
  });

  $( "#addrow" ).click(function() {
    var eventName = getRandomEventName();
    var dataRows = $("#mainTable").find('tbody tr');
    $('#mainTable tr:last').after('<tr>' +
          '<td>' + eventName+ '</td>' +
          '<td class="monthsevent">' + getRandomIntInclusive(12, 48) + '</td>' +
          '<td class="colorpick"><input type="color" value="' +
          defaultColors(eventName) +
          '"></td><td class="remove"><i class="fa fa-trash-o"></i></td></tr>');
    calculateData();
    makeWaffleChart();
    $('#mainTable').editableTableWidget().numericInputExample()
  });

  $( "#togglefuture" ).click(function() {
    calculateData();
    makeWaffleChart();
  });

  function toggleFuture() {
    var lifeExpectancy = 80
    var numMonths = getCurrentNumMonths();
    if ($('#togglefuture').prop('checked') && (lifeExpectancy * 12) > numMonths) {
      futureIndex = data.length;
      data.push({ "name": "Future",
                  "value": (lifeExpectancy * 12) - numMonths});
      range.push("#bfbfbf");
    }
  };

  function getRandomEventName(){
    events = ["Went backpacking", "Went to Mars", "Started pickle farm", "Went ghost hunting", "Studied", "Learned to unicycle", "Went to Antarctica",
    "Studied French", "Published a book", "Sculpted ice", "Entered the Olympics"];
    return events[Math.floor(Math.random() * events.length)];
  }

  // https://stackoverflow.com/questions/10834796/validate-that-a-string-is-a-positive-integer
  function isNormalPosInteger(str) {
      str = str.trim();
      if (!str) {
          return false;
      }
      str = str.replace(/^0+/, "") || "0";
      var n = Math.floor(Number(str));
      return n !== Infinity && String(n) === str && n > 0 && n <= 1200;
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
  }

  /* global $ */
  /* this is an example for validation and change events */
  $.fn.numericInputExample = function () {
  	'use strict';
  	var element = $(this);

    element.find('td').off('change').off('validate');

  	element.find('td').on('change', function (evt) {
      calculateData();
      makeWaffleChart();
  	}).on('validate', function (evt, value) {
  		var cell = $(this),
  			column = cell.index();
  		if (column === 0) {
  		  if (value.trim().length >= 20){
  		    $('#showAlertHere').html('<div class="alert alert-danger alert-dismissible show fade" role="alert" id="alert-event-name-length">' +
            '<strong>Warning!</strong> Event names must be less than 20 characters long!' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
            '  <span aria-hidden="true">&times;</span>' +
            '</button>' +
          '</div>');
        }
  			return !!value && value.trim().length > 0 && value.trim().length < 20;
  		} else if (column === 1){
  			return isNormalPosInteger(value);
  		} else {
        return false;
      }
  	});
  	return this;
  };

  // https://stackoverflow.com/questions/9205164/validate-html-text-input-as-its-typed
  $('#waffle-title-input').bind('input propertychange', function() {
    var text = $(this).val();
    //console.log($("#waffle-title").width());
    if (text.length > 30) {
      text = text.slice(0, -1);
      $(this).val(text);
    }
    $('#waffle-title').html(text.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
  });

  defaultColors("Childhood");
  defaultColors("High School");
  calculateData();
  makeWaffleChart();

  $( "#reset" ).click(function() {
    //resetChart(originaldata, originalrange);
  });

  function resetChart(data, range) {
    var tablebody = $("#mainTable").find('tbody');
    tablebody.html("");
    generateTable(data, range);
  }

  $( document ).on( "click", ".remove", function(){
    var dataRows = $("#mainTable").find('tbody tr');
    if (dataRows.length > 1) {
      $(this).parent("tr:first").remove();
      calculateData();
      makeWaffleChart();
    }
  });

  $('#mainTable').editableTableWidget().numericInputExample().find('td:first').focus();

  $(".alert").alert();
});
