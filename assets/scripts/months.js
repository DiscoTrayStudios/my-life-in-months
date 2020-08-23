$(document).ready(function() {

  var obamadata = [
      { "name": "Hawaii", "value":72},
      { "name": "Jakarta", "value":45},
      { "name": "Hawaii", "value":96},
      { "name": "Occidental College", "value":24},
      { "name": "Columbia University", "value":21},
      { "name": "Business Int. Co.", "value":15},
      { "name": "NYPIRG", "value":5},
      { "name": "Chicago Comm. Org.", "value":38},
      { "name": "Harvard Law", "value":39},
      { "name": "U. Chicago Prof.", "value":60},
      { "name": "Illinois Senator", "value":96},
      { "name": "US Senator", "value":48},
      { "name": "President", "value":96},
      { "name": "Private Citizen", "value":44}
    ];

  var obamarange = ["#1f77b4", "#ff7f0e", "#1f77b4", "#2ca02c", "#d62728",
  "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
  "#d728a0", "#a9b9cb", "#0fffb7"];

  var data = [
    { "name": "Northampton, PA", "value":120},
    { "name": "Canvas, WV", "value":96},
    { "name": "Gambier, OH", "value":9},
    { "name": "Canvas, WV", "value":3},
    { "name": "Gambier, OH", "value":9},
    { "name": "Canvas, WV", "value":3},
    { "name": "Gambier, OH", "value":21},
    { "name": "Milwaukee, WI", "value":3},
    { "name": "Madison, WI", "value":21},
    { "name": "San Antonio, TX", "value":7},
    { "name": "Madison, WI", "value":77},
    { "name": "Shreveport, LA", "value":84},
    { "name": "Conway, AR", "value":75}
  ];

  var colormap = new Map();
  colormap.set("Northampton, PA", "#008080");
  colormap.set("Canvas, WV", "#002855");
  colormap.set("Gambier, OH", "#4B2E84");
  colormap.set("Milwaukee, WI", "#008B2B");
  colormap.set("Madison, WI", "#c5050c");
  colormap.set("San Antonio, TX", "#0f52ba");
  colormap.set("Shreveport, LA", "#8a2432");
  colormap.set("Conway, AR", "#E96B10");

  var isabelladata = [
    { "name": "childhood", "value":160},
    { "name": "high school", "value":46},
    { "name": "college", "value":48},
    { "name": "adulting", "value":30},
    { "name": "moved back to U.S.", "value":9},
    { "name": "time left", "value":559},
  ];

  var isabellarange = ["#EF476F","#FCA311","#FFD166","#0EAD69","#4ECDC4","#118AB2"];

  exampleData = [
    [
      { "name": "Bethlehem", "value": 96},
      { "name": "Canvas", "value": 96},
      { "name": "Gambier", "value": 45},
      { "name": "Milwaukee", "value": 3},
      { "name": "Madison", "value": 21},
      { "name": "San Antonio", "value": 7},
      { "name": "Madison II", "value": 77},
      { "name": "Shreveport", "value": 84},
      { "name": "Conway", "value": 75}
    ],
    [
      {"name": "Paris", "value": 57},
      {"name": "Warren", "value": 48},
      {"name": "Charleston", "value": 98},
      {"name": "Conway", "value": 24}
    ]
  ]

  var originaldata = [
    { "name": "Childhood", "value":184},
    { "name": "High School", "value":45}
  ];
  var originalrange = ["#1f77b4", "#aec7e8"];

  //var data = [];
  //var range = [];
  //var defaultColors = d3.scaleOrdinal(d3.schemeCategory10);
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
    //var domain = data.map(function(d){ return slugify(d.name.concat(data.indexOf(d))); })
    //var palette = d3.scaleOrdinal().domain(domain).range(range);

    chart = d3waffle()
        .title($("#waffle-title-input").val())
        .colorscale(colormap);

    d3.select("#waffle")
  			.datum(data)
  			.call(chart);

    // closest watermark yet.
/*    d3.xml("https://discotraystudios.github.io/my-life-in-months/assets/images/discotray.svg")
      .then(data => {
        d3.select("#watermark").node().append(data.documentElement)
      });*/
  }

  function linkEvents(event_id,colors_map, event_name) {
    let linked_color = colors_map[event_name];
    console.log(`Our linked color is ${linked_color}`);
    let current_id = $(event_id).attr('id').split('eventname-')[1];
    let colorpicker_id = "colorpick-" + current_id;
    console.log(colorpicker_id);
    //change the colorpicker's value to the desired color
    $(`#${colorpicker_id}`).val(linked_color);
    $(`#${colorpicker_id}`).css("display", "none");
    $(`#${colorpicker_id}`).prop("disabled", true);

    //Insert unlink icon
    let unlink_icon = `<i id="unlink-${current_id}" class="fa fa-link"></i>`
    $(`#${colorpicker_id}`).parent().append(unlink_icon);


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
    $(this).html("Processing");
    $(this).removeClass("btn-primary");
    $(this).addClass("btn-danger");
    console.log("Testing");
    var cameraClone = $("<div></div>").html($("#capture").html());
    cameraClone.css("width", "800px");
    cameraClone.attr("id", "captureClone");
    cameraClone.addClass("chart-area");
    $("body").append(cameraClone);

    setTimeout(function() {
      domtoimage.toBlob(document.getElementById('captureClone'))
      .then(function (blob) {
          window.saveAs(blob, 'my-life-in-months.png');
      }).finally(function (blob) {
          $("#captureClone").remove();
          $("#camera" ).html("Download <i class='fa fa-camera' aria-hidden='true'></i>");
          $("#camera" ).removeClass("btn-danger");
          $("#camera" ).addClass("btn-primary");
      });
    }, 500);
  });

  /* global $ */
  /* this is an example for validation and change events */
  $.fn.numericInputExample = function () {
  	'use strict';
  	var element = $(this);

    element.find('td').off('change').off('validate');

    $('.eventname').on('change', function (evt, event_name){
      //Events_list and colors_list are used to help set up the linking system.
      let events_list = $(".eventname").map(function(){return this.innerHTML;}).get();
      let colors_list = $(".colorpick").map(function(){return this.value;}).get();

      var colors_map = new Map();

      //For all events, if the event does not exist in the map, set the color to the first color in the list.
      var event_list_name;
      for (event_list_name in events_list){
        if(!colors_map.has(event_list_name)){
          colors_map[events_list[event_list_name]]=colors_list[events_list.indexOf(events_list[event_list_name])];
        }
      }
      //If the events_list contains more than 1 event with the same name, we should link the events
      if(events_list.filter(x=> x==event_name).length>1){
        linkEvents(this, colors_map, event_name);
      }

    });

  	element.find('td').on('change', function (evt) {
      calculateData();
      makeWaffleChart();
  	}).on('validate', function (evt, value) {

  		var cell = $(this),
  			column = cell.index();
  		if (column === 0) {
        if (!value){
  		    $('#showEventAlertHere').html(alertMaker("alert-event-name-length", "Event names must not be empty!"));
        }
        else if (value.trim().length == 0){
  		    $('#showEventAlertHere').html(alertMaker("alert-event-name-length", "Event names must be at least 1 character long!"));
        }
        else if (value.trim().length >= 25){
  		    $('#showEventAlertHere').html(alertMaker("alert-event-name-length", "Event names must be less than 25 characters long!"));
        } else {
          $("#alert-event-name-length").remove();
        }
  			return !!value && value.trim().length > 0 && value.trim().length < 25;
  		} else if (column === 1){
        if (!isNormalPosInteger(value)) {
          $('#showMonthsAlertHere').html(alertMaker("alert-event-month-length", "Events must be an integer greater than 0 and less than 1200 months long!"));
        } else {
          $("#alert-event-month-length").remove();
        }

  			return isNormalPosInteger(value);
  		} else {
        return false;
      }
  	});
  	return this;
  };

  function addNewEventRow(event, months, color, row) {
    var dataRows = $("#mainTable").find('tbody tr');
    var color_picker_id = `colorpick-${row}`;
    var eventname_id = `eventname-${row}`;
    var newRow = $('<tr>' +
          '<td id='+eventname_id+' class="eventname">' + event + '</td>' +
          '<td class="monthsevent">' + months + '</td>' +
          '<td class="color-col"><input id='+color_picker_id+' class="colorpick" type="color" value="' + color +
          '"></td><td class="remove"><i class="fa fa-trash-o"></i></td></tr>');
    $('#mainTable tr:last').after(newRow);
    calculateData();
    makeWaffleChart();
    newRow.editableTableWidget().numericInputExample()
  }

  function randomEventRow() {
    var eventNames = getRandomEventName(1);
    var m = getRandomIntInclusive(12, 48);
    var c = randomColor();
    var numRows = document.getElementById("mainTable").rows.length-1; //The headers add 1 row
    addNewEventRow(eventNames[0], m, c, numRows);
  }

  $( "#addrow" ).click(function() {
    randomEventRow();
  });

  $( ".exampleCharts" ).click(function() {
    var value = $(this).attr('value');
    var populateData = exampleData[parseInt(value)];
    populateTable(populateData);
    calculateData();
    makeWaffleChart();
    $('#mainTable').editableTableWidget().numericInputExample()
  });

  function populateTable(newData) {
    $("#mainTable").find("tbody").html("");
    var toAdd = "";
    newData.forEach(function(row) {
      toAdd += '<tr>' + '<td>' + row["name"] + '</td>' +
      '<td class="monthsevent">' + row["value"] + '</td>' +
      '<td class="colorpick"><input type="color" value="' +
      randomColor() +
      '"></td><td class="remove"><i class="fa fa-trash-o"></i></td></tr>';
    })
    $("#mainTable").find("tbody").html(toAdd);
    data = newData;
    range = goadrichrange;
  }

  $( "#togglefuture" ).click(function() {
    calculateData();
    makeWaffleChart();
  });

  function toggleFuture() {
    const lifeExpectancy = 80
    var numMonths = getCurrentNumMonths();
    if ($('#togglefuture').prop('checked') && (lifeExpectancy * 12) > numMonths) {
      futureIndex = data.length;
      data.push({ "name": "The Future",
                  "value": (lifeExpectancy * 12) - numMonths});
      range.push("#bfbfbf");
    }
  };

  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  /* Randomize array in-place using Durstenfeld shuffle algorithm */
  function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
      }
  }

  function getRandomEventName(count){
    events = ["Backpacked Andes", "Mars Vacation", "Started pickle farm", "Went ghost hunting",
    "Raised dinosaurs", "Learned to unicycle", "Surveyed Antarctica", "Studied arachnids",
    "Studied French", "Published a book", "Sculpted ice", "Entered the Olympics",
    "Composed an opera", "Busked in subway", "Perfected sourdough", "Shrunk to 1:12 size",
    "Robot uprising", "Developed vaccine", "Worked in Moria", "Unemployed", "Netflix binge",
    "Ant invasion", "Kaiju attacks", "The Long Nap", "Unexplained illness",
    "Worked three jobs", "Worked at Ponderosa", "Delivered mail", "Rescued lemurs",
    "Camino de Santiago", "Red Cross Volunteer", "Southwest Roadtrip", "Lived with squirrels"];

    shuffleArray(events);

    return events.slice(0, count);
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

  function alertMaker(id, text) {
    return '<div class="alert alert-danger alert-dismissible show fade" role="alert" id="' + id + '">' +
      '<strong>Warning!</strong> ' + text + ' ' +
      '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
      '  <span aria-hidden="true">&times;</span>' +
      '</button>' +
    '</div>'
  }

  // https://stackoverflow.com/questions/9205164/validate-html-text-input-as-its-typed
  $('#waffle-title-input').bind('input propertychange', function() {
    var text = $(this).val();
    //console.log($("#waffle-title").width());
    if (text.length > 30) {
      text = text.slice(0, 30);
      $(this).val(text);
      $('#showEventAlertHere').html(alertMaker("alert-event-name-length", "Title must be less than 30 characters long!"));
    } else {
      $("#alert-event-name-length").remove();
    }
    console.log($("waffle-title").text());
    $('#waffle-title').html(text.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
  });
  $("#waffle-title-input").bind("paste", function(){
    var text = $(this).val();
    //console.log($("#waffle-title").width());
    if (text.length > 30) {
      text = text.slice(0, 30);
      $(this).val(text);
      $('#showEventAlertHere').html(alertMaker("alert-event-name-length", "Title must be less than 30 characters long!"));
    } else {
      $("#alert-event-name-length").remove();
    }
    console.log($("waffle-title").text());
    $('#waffle-title').html(text.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
  });

  var eventNames = getRandomEventName(3);
  for (var i = 0; i < eventNames.length; i++) {
    var m = getRandomIntInclusive(12, 48);
    var c = randomColor();
    var numRows = document.getElementById("mainTable").rows.length-1; //The headers add 1 row
    //addNewEventRow(eventNames[i], m, c, numRows);
  }
  //calculateData();
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

  $('#mainTable').editableTableWidget().numericInputExample();

  $(".alert").alert();
});
