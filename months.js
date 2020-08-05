$(document).ready(function() {
  var data = [
{ "name": "Pennsylvania", "value":96},
{ "name": "West Virginia", "value":96},
{ "name": "Kenyon", "value":45},
{ "name": "Milwaukee", "value":3},
{ "name": "UW Madison - M.S.", "value":21},
{ "name": "San Antonio - SWRI", "value":7},
{ "name": "UW Madison - Ph.D.", "value":77},
{ "name": "Centenary College", "value":84},
{ "name": "Hendrix College", "value":75}
    ]
  var range = ["#008080", "#002855", "#4B2E84", "#008B2B", "#c5050c", "#0f52ba","#c5050c", "#8a2432", "#E96B10"]
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
      console.log(row.find('input')[0].value);
      range.push(row.find('input')[0].value);
    });
    console.log(range);
  }

  function makeWaffleChart() {
    /* to color elements we use the class name ( slugigy(name) ) */
    var domain = data.map(function(d){ return slugify(d.name); })
    var palette = d3.scale.ordinal().domain(domain).range(range);

    chart = d3waffle()
        .rows(12)
        .colorscale(palette)
        .adjust(.99);

    d3.select("#waffle")
  			.datum(data)
  			.call(chart);
  }

  $( "#shrink" ).click(function() {
    chart.height(150);
    d3.select("#waffle").call(chart);
  });

  // Help from https://stackoverflow.com/questions/44494447/generate-and-download-screenshot-of-webpage-without-lossing-the-styles
  $( "#camera" ).click(function() {
    domtoimage.toBlob(document.getElementById('capture'))
    .then(function (blob) {
        window.saveAs(blob, 'myLifeInMonths.png');
    });
  });

  $( "#addrow" ).click(function() {
    var dataRows = $("#mainTable").find('tbody tr');
    $('#mainTable tr:last').after('<tr><td>Event' + (dataRows.length + 1) + '</td><td>12</td><td class="colorpick"><input type="color" value="#e66465"></td><td class="remove"><i class="fa fa-trash-o"></i></td></tr>');
    calculateData();
    makeWaffleChart();
    $('#mainTable').editableTableWidget().numericInputExample()
  });

  // https://stackoverflow.com/questions/10834796/validate-that-a-string-is-a-positive-integer
  function isNormalPosInteger(str) {
      str = str.trim();
      if (!str) {
          return false;
      }
      str = str.replace(/^0+/, "") || "0";
      var n = Math.floor(Number(str));
      return n !== Infinity && String(n) === str && n > 0;
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
  			return !!value && value.trim().length > 0 && value.trim().length < 22;
  		} else if (column === 1){
  			return isNormalPosInteger(value);
  		} else {
        return false;
      }
  	});
  	return this;
  };

  calculateData();
  makeWaffleChart();

  $( document ).on( "click", ".remove", function(){
    var dataRows = $("#mainTable").find('tbody tr');
    if (dataRows.length > 1) {
      $(this).parent("tr:first").remove();
      calculateData();
      makeWaffleChart();
    }
  });

  $('#mainTable').editableTableWidget().numericInputExample().find('td:first').focus();
});
