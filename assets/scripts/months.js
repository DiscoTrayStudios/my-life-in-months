$(document).ready(function() {

  var gcolors_map = new Map();
  gcolors_map.set("Northampton, PA", "#008080");
  gcolors_map.set("Canvas, WV", "#002855");
  gcolors_map.set("Gambier, OH", "#4B2E84");
  gcolors_map.set("Milwaukee, WI", "#008B2B");
  gcolors_map.set("Madison, WI", "#c5050c");
  gcolors_map.set("San Antonio, TX", "#0f52ba");
  gcolors_map.set("Shreveport, LA", "#8a2432");
  gcolors_map.set("Conway, AR", "#E96B10");

  

  exampleData = [
    [
      { "name": "Bethlehem", "value": 96},
      { "name": "Canvas", "value": 96},
      { "name": "Gambier", "value": 45},
      { "name": "Milwaukee", "value": 3},
      { "name": "Madison", "value": 21},
      { "name": "San Antonio", "value": 7},
      { "name": "Madison", "value": 77},
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

  var data = [];
  var colors_map = new Map();
  //var defaultColors = d3.scaleOrdinal(d3.schemeCategory10);
  var chart;
  var chart_end_date = new Date();

  function calculateData() {
    console.log("Recalculating...");
    sortDatesAndNamesInTable();

    //Events_list and colors_list are used to help set up the linking system.
    let events_list = $(".eventname").map(function(){return this.innerHTML;}).get();
    let dates_list = $(".monthsevent").map(function(){return new Date(this.innerHTML);}).get();
    let months_list = getNumMonthsFromDatesList(dates_list);
    var colors_list = $(".colorpick").map(function(){return this.value;}).get();
    let dataRows = $(".color-col");
    data = []
    colors_map = new Map();

    //For all events, if the event does not exist in the map, set the color to the first color in the list.
    events_list.forEach((item, i) => {
      // should we slugify the event name? Why do we need to slugify things?
      data.push({ "name": events_list[i],
                  "value": months_list[i]});

      let color_td = dataRows[i];
      let cpick = $(color_td).find(".colorpick");
      let clink = $(color_td).find(".clink");

      if(!colors_map.has(item)){
        //console.log("found " + item + " " + colors_list[i]);
        colors_map.set(item, colors_list[i]);

        cpick.css("display", "initial");
        cpick.prop("disabled", false);

        //This bit of code is for the unlinking of events!
        if (clink.prop("disabled")===false){
          let new_color=randomColor();
          colors_list[i]=new_color;
          colors_map.set(item, colors_list[i]);
          cpick.val(colors_map.get(item));
        }

        clink.css("display", "none");
        clink.prop("disabled", true);
      } else {
        cpick.val(colors_map.get(item));
        cpick.css("display", "none");
        cpick.prop("disabled", true);

        //Insert unlink icon
        clink.css("display","initial");
        clink.prop("disabled", false);
      }
    });

    checkFuture();
    //console.log(colors_map);
    //console.log(data);
  }

  function sortDatesAndNamesInTable() {
    var events_list = $(".eventname").map(function(){return this.innerHTML;}).get();
    var dates_list = $(".monthsevent").map(function(){return new Date(this.innerHTML);}).get();
    var date_to_event_map = {};
    for (let index = 0; index < events_list.length; index++) {
      const element = events_list[index];
      const date = dates_list[index];
      date_to_event_map[date] = element;
    }
    dates_list = dates_list.sort((a, b) => a - b);
    console.log(dates_list);
    var index = 0;
    var event_names = $(".eventname");
    var dates_elements = $(".monthsevent");
    dates_elements.each(function() {
      $(this).html(getDateInputFormat(dates_list[index]));      
      index += 1;
    });
    index = 0;
    event_names.each(function() {
      $(this).html(date_to_event_map[dates_list[index]])
      index += 1;
    });
  }

  function makeWaffleChart() {
    chart = myLifeInMonths()
        .title($("#title-input").text())
        .colorscale(colors_map);

    d3.select("#waffle")
  			.datum(data)
  			.call(chart);
  }

  function getCurrentNumMonths() {
    var numMonths = 0;
    var dataRows = $("#mainTable").find('tbody tr');
    dataRows.each(function () {
      var row = $(this);
      if (!row.id == "end-date-row")
        numMonths += parseInt(row.children().eq(2).text());
    })
    console.log(numMonths);
    return numMonths;
  }

  function getNumMonthsFromDatesList(dates_list) {
    var months_list = [];
    for (let index = 0; index < dates_list.length; index++) {
      const element = dates_list[index];
      var previous = chart_end_date;
      if (!(index == dates_list.length - 1)) {
        previous = dates_list[index + 1];
      }
      months_list.push(calculateMonths(element, previous));
    }
    console.log(months_list);
    return months_list;
  }

  function setChartEndDate(new_end_date) {
    chart_end_date = new_end_date;
  }

  function getEndDateRow() {
    var end_month_input_format = getDateInputFormat(chart_end_date);
    var newRow = $('<tr id="end-date-row">' +
          '<td></td>' +
          '<td id="end-date-name">End Month</td>' +
          '<td class="monthsevent end-month-input" tabindex="1">' + end_month_input_format + '</td>' +
          '<td></td></tr>');
          return newRow;
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
          $("#camera" ).html("<i class='fa fa-camera' aria-hidden='true'></i> Download Image");
          $("#camera" ).removeClass("btn-danger");
          $("#camera" ).addClass("btn-primary");
      });
    }, 500);
  });

  $( "#csv-button" ).click(function() {
    var title = document.getElementById("title-input").textContent;
    download(title, convertDataToCSVFormat(data, colors_map));
  });

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // use the 1st file from the list
    f = files[0];
    var f_name = f.name.split(".")[0];

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {

          CSVFormatToData(e.target.result, f_name);
        };
      })(f);
      reader.readAsText(f);
    }

  document.getElementById('file-upload').addEventListener('change', handleFileSelect, false);

  function CSVFormatToData(csv_string, csv_name) {
    var rows = csv_string.split("\n");
    var dataToChange = [];
    var colorsMapToChange = new Map();
    if (rows[rows.length - 1] == "") {
      rows.splice(rows.length - 1, 1);
    }
    var isInvalid = false;
    rows.splice(0, 1);
    rows.forEach(element => {
      var columns = parseCSVRows(element);
      if (columns.length != 3 || !isNormalPosInteger(columns[1]) || !/^#[0-9A-F]{6}$/i.test(columns[2])) {
        isInvalid = true;
        return;
      }
      dataToChange.push({"name" : columns[0], "value" : columns[1]});
      if (!colorsMapToChange.has(columns[0])) {
        colorsMapToChange.set(columns[0], columns[2]);
      }
    });
    if (!isInvalid) {
      $( "#title-input" ).html(csv_name);
      populateTable(dataToChange, colorsMapToChange);
      calculateData();
      makeWaffleChart();
    }
    else {
      $('#showEventAlertHere').html(alertMaker("alert-event-name-length",
      "Your CSV file is not in the correct format! Please read our Uploading Format Guidlines."));
    }
    document.getElementById('file-upload').value = '';
  }

  function parseCSVRows(rowString) {
    var splitOnDoubleQuotes = rowString.split('\"');
    if (splitOnDoubleQuotes.length == 1) {
      var toReturn = rowString.split(",");
      if (toReturn.length != 3) {
        return []
      }
      return toReturn;
    }
    else if (splitOnDoubleQuotes.length != 3){
      return [];
    }
    console.log(splitOnDoubleQuotes);
    var first = splitOnDoubleQuotes[1];
    var lastTwo = splitOnDoubleQuotes[2].split(",");
    console.log(first + lastTwo);
    return [first, lastTwo[1], lastTwo[2]];
  }

  function convertDataToCSVFormat(dataToConvert, colorsMapToConvert) {
    var toReturn = "Life Event,Months,Color\n";
    dataToConvert.forEach(element => {
      toReturn += '"' + element["name"] + '"' + "," + element["value"] + "," + colorsMapToConvert.get(element["name"]) + "\n";
    });
    return toReturn
  }

  // Taken from https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename + ".csv");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  /* global $ */
  /* this is an example for validation and change events */
  $.fn.numericInputExample = function () {
  	'use strict';
  	var element = $(this);

    element.find('td').off('change').off('validate');

  	element.find('td').on('change', function (evt, value) {
      if (!$(this).hasClass( "radiocheck" )) {
        if ($(this).hasClass("end-month-input")) {
          if (!isEndMonthValid(value)) {
            return false;
          }
        }
        else if ($(this).hasClass("monthsevent")) {
          if (new Date(value) > new Date($(".end-month-input").eq(0).html())) {
            $('#showEventAlertHere').html(alertMaker("alert-month-before-end", "Months must not come after end date!"));
            return false;
          } else {$("#alert-month-before-end").remove();}
        }
        calculateData();
        makeWaffleChart();
      }
  	}).on('validate', function (evt, value) {
  		var cell = $(this),
  			column = cell.index();
		if( cell.attr("id") == "title-input") {
			if (!value){
				$('#showEventAlertHere').html(alertMaker("alert-event-name-length", "Charts need a title!"));
			}
			else if (value.trim().length == 0){
				$('#showEventAlertHere').html(alertMaker("alert-event-name-length", "Titles must be at least 1 character long!"));
			}
			else if (value.trim().length >= 30){
				$('#showEventAlertHere').html(alertMaker("alert-event-name-length", "Titles must be less than 30 characters long!"));
			} else {
				$("#alert-event-name-length").remove();
			}
			return !!value && value.trim().length > 0 && value.trim().length < 30;
		}
  		else if (column === 1) {
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
  		} else if (column === 2){
        if (!isDateValid(value)) {
          $('#showMonthsAlertHere').html(alertMaker("alert-event-date-format", "Dates must be in YYYY-MM format!"));
        } else {
          $("#alert-event-date-format").remove();
        }

  			return isDateValid(value);
  		} else {
        return false;
      }
    });

    
  	return this;
  };

  function isDateValid(date) {
    var yearMonth = date.trim().split("-");
    if (yearMonth[0].length != 4) {
      return false;
    }
    isValid = new Date(date);
    if (isValid == "Invalid Date") {
      return false;
    }
    if (yearMonth.length != 2) {
      return false;
    }
    if (!isNormalPosInteger(yearMonth[0]) || (!isNormalPosInteger(yearMonth[1]) && Number(yearMonth[1]) > 12)) {
      return false;
    }
    return true;
  }

  function isEndMonthValid(value) {
    if ($(".monthsevent").length > 1) {
      var end_date = new Date(value);
      var next_to_last_date = new Date($(".monthsevent").eq(-2).html());
      if (end_date < next_to_last_date) {
        $('#showEventAlertHere').html(alertMaker("alert-end-month-small", "End Month must be the latest month!"));
        return false;
      }
      else {
        $("#alert-end-month-small").remove();
        return true;
      }
    }
  }

  function addNewEventRow(event, dayStarted, color) {
    var dateInputFormat =  getDateInputFormat(dayStarted);
    var newRow = $('<tr>' +
          '<td class="radiocheck"><input class="rowcheck" type="checkbox"></td>' +
          '<td class="eventname" tabindex="1">' + event + '</td>' +
          '<td class="monthsevent" tabindex="1">' + dateInputFormat + '</td>' +
          '<td class="color-col"><input class="colorpick" type="color" value="' + color + '">' +
          '<span class="clink"><i class="fa fa-link"></i></span></td></tr>');
    if ($("#end-date-row").length) $("#end-date-row").before(newRow);
    else $('#mainTable').find("tbody").append(newRow);
    // https://github.com/mindmup/editable-table/issues/1
    newRow.numericInputExample();
    var box = $(newRow.children().eq(0).children().eq(0));
    box.click(function() {
      checkState()
    });
  }

  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function getDateInputFormat(date) {
    console.log(date);
    date = addDays(date, 1);
    console.log(date);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
  //  var day = date.getDate();
    var date_input_format = year + "-";
    date_input_format += ((month > 9) ? (month + "") : ("0" + month));//+ "-";
    //date_input_format += (day > 9) ? (day + "") : ("0" + day);
    return date_input_format;
  }

  function randomEventRow() {
    var eventNames = getRandomEventName(1);
    var day = getNextRandomDate();
    var c = randomColor();
    addNewEventRow(eventNames[0], day, c);
    calculateData();
    makeWaffleChart();
  }

  function calculateMonths(first, second) {
    return (second.getFullYear() * 12 + second.getMonth()) - (first.getFullYear() * 12 + first.getMonth());
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

  function populateTable(newData, colorsMapData) {
    $("#mainTable").find("tbody").html("");
    colors_map = colorsMapData;
    newData.forEach(function(row) {
      if (!colors_map.has(row["name"])) {
        let c = randomColor({seed:eventNames[i]});
        addNewEventRow(row["name"], row["value"], c);
        colors_map.set(row["name"], c);
      } else {
        addNewEventRow(row["name"], row["value"], colors_map.get(row["name"]));
      }
    })
    //data = newData;
  }

  $( "#togglefuture" ).click(function() {
    calculateData();
    makeWaffleChart();
  });

  function checkFuture() {
    const lifeExpectancy = 80
    var numMonths = getCurrentNumMonths();
    if ($('#togglefuture').prop('checked') && (lifeExpectancy * 12) > numMonths) {
      futureIndex = data.length;
      data.push({ "name": "The Future",
                  "value": (lifeExpectancy * 12) - numMonths});
      colors_map.set("The Future", "#bfbfbf");
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
      return n !== Infinity && String(n) === str && n > 0;
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

  function getLastEventDate() {
    var last_event_date = new Date("2000-01-01");
    if ($(".radiocheck").length ) {
      if($("#end-date-row").length)
        last_event_date = new Date($(".monthsevent").eq(-2).html());
      else
        last_event_date = new Date($( ".monthsevent" ).last().html());
    }
    return last_event_date;
  }

  function getNextRandomDate() {
    var last_event_date = getLastEventDate();
    var num_months_to_add = getRandomIntInclusive(10,30);
    var next_random_date = new Date(last_event_date.setMonth(last_event_date.getMonth() + num_months_to_add));
    return next_random_date;
  }

  var eventNames = getRandomEventName(5);
  for (var i = 0; i < eventNames.length; i++) {
    var day = getNextRandomDate();
    var c = randomColor();
    addNewEventRow(eventNames[i], day, c);
  }
  $('#mainTable').find("tbody").append(getEndDateRow());

  calculateData();
  makeWaffleChart();


  function getCurrentChecks() {
    var numChecks = 0;
    var dataRows = $("#mainTable").find('tbody tr');
    dataRows.each(function () {
      var row = $(this);
      var box = $(row.children().eq(0).children().eq(0));
      if(box.is(":checked")){
        numChecks++;
      };
    })
    console.log(numChecks);
    return numChecks;
  }

  function alterTable(func) {
    var dataRows = $("#mainTable").find('tbody tr');
    dataRows.each( function () {
      var row = $(this);
      var box = $(row.children().eq(0).children().eq(0));
      //https://www.tutorialrepublic.com/faq/how-to-check-a-checkbox-is-checked-or-not-using-jquery.php
      if(box.is(":checked")){
        func(row);
      };
    });
    checkState();
  }

  $( "#remove" ).click(function() {
    alterTable(function(row) {row.remove();});
    calculateData();
    makeWaffleChart();
  });

  $( "#moveup" ).click(function() {
    alterTable(function(row) {row.insertBefore(row.prev());})
    calculateData();
    makeWaffleChart();
  });

  $( "#movedown" ).click(function() {
    alterTable(function(row) {if (row.next().attr('id') != "end-date-row") row.insertAfter(row.next());})
    calculateData();
    makeWaffleChart();
  });

  $( "#repeat" ).click(function() {
    alterTable(function(row) {
      let c = row.clone();
      var box = $(c.children().eq(0).children().eq(0)); // need to remove the checkmark
      box.prop('checked', false); //https://stackoverflow.com/questions/13557623/remove-attribute-checked-of-checkbox
      addNewEventRow(row.find(".eventname").html(), getNextRandomDate(), "#FFFFFF");
      box.click(function() {
        checkState()
      });})
    calculateData();
    makeWaffleChart();
  });

  function checkState(){
    let check_count = getCurrentChecks();
    if (check_count == 0) {
      $( "#remove" ).prop('disabled', true);
      $( "#moveup" ).prop('disabled', true);
      $( "#movedown" ).prop('disabled', true);
      $( "#repeat" ).prop('disabled', true);
    } else if (check_count == 1) {
      $( "#remove" ).prop('disabled', false);
      $( "#moveup" ).prop('disabled', false);
      $( "#movedown" ).prop('disabled', false);
      $( "#repeat" ).prop('disabled', false);
    } else {
      $( "#remove" ).prop('disabled', false);
      $( "#moveup" ).prop('disabled', true);
      $( "#movedown" ).prop('disabled', true);
      $( "#repeat" ).prop('disabled', false);
    }
  }

  checkState();

  $('.rowcheck').click(function() {
    checkState()
  });

  $('#mainTable').editableTableWidget().numericInputExample();

  $(".alert").alert();

  document.getElementById("title-input").focus();
});
