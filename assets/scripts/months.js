$(document).ready(function() {

  //https://codepen.io/JacobLett/pen/xqpEYE
  var $videoSrc;
  $('.video-btn').click(function() {
    $videoSrc = $(this).data( "src" );
  });
  $('#myModal').on('shown.bs.modal', function (e) {

  // set the video src to autoplay and not to show related video. Youtube related video is like a box of chocolates... you never know what you're gonna get
    $("#video").attr('src',$videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0" );
  });

  // stop playing the youtube video when I close the modal
  $('#myModal').on('hide.bs.modal', function (e) {
    // a poor man's stop video
    $("#video").attr('src',$videoSrc);
  });


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
  var month_picker_on = true;
  var current_start_month = "2000-01";
  var current_end_month = getDateInputFormat(new Date());

  function calculateData() {
    console.log("Recalculating...");
    if (month_picker_on) sortDatesAndNamesInTable();
    current_end_month = month_picker_on ? $("#end-month-input").html() : current_end_month;
    //Events_list and colors_list are used to help set up the linking system.
    let events_list = $(".eventname").map(function(){return this.innerHTML;}).get();
    let months_or_dates_list = $(".monthsevent").map(function(){
      return month_picker_on ? new Date(this.innerHTML) : this.innerHTML;
    }).get();
    let months_list = month_picker_on ? getNumMonthsFromDatesList(months_or_dates_list) : months_or_dates_list;
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
  }

  function makeWaffleChart() {
    chart = myLifeInMonths()
        .title($("#title-input").text())
        .colorscale(colors_map);

    d3.select("#waffle")
  			.datum(data)
  			.call(chart);
  }

  function setChartEndDate(new_end_date) {
    chart_end_date = new_end_date;
  }

  // Help from https://stackoverflow.com/questions/44494447/generate-and-download-screenshot-of-webpage-without-lossing-the-styles
  $( "#camera" ).click(function() {
    $(this).html("Processing");
    $(this).removeClass("btn-primary");
    $(this).addClass("btn-danger");
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
    let events_list = $(".all-event-names").map(function(){return this.innerHTML;}).get();
    let months_or_dates_list = $(".monthsevent").map(function(){
      return this.innerHTML;
    }).get();
    download(title, convertDataToCSVFormat(events_list, months_or_dates_list, colors_map));
  });

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // use the 1st file from the list

    f = files[0];
    var file_list = f.name.split(".");
    var f_name = file_list[0];

    var reader = new FileReader();
    if (file_list[1] != "csv") {
      csvAlert(true);
    }
    else {
      csvAlert(false);
      // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {

        CSVFormatToData(e.target.result, f_name);
      };
    })(f);
    reader.readAsText(f);
    }

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
    var upload_is_month_picker;
    rows.forEach((element, i) => {

      var columns = parseCSVRows(element);
      if (i === 0 && isDateValid(columns[1])) upload_is_month_picker = true;
      else if (i === 0) upload_is_month_picker = false;
      var is_end_row = upload_is_month_picker && (i === rows.length - 1);
      if (columns.length != 3 || (!/^#[0-9A-F]{6}$/i.test(columns[2]) && !is_end_row)) {
        isInvalid = true;
        return;
      } else if ((upload_is_month_picker && !isDateValid(columns[1]))
      || (!upload_is_month_picker && !isNormalPosInteger(columns[1]))) {
        isInvalid = true;
        return;
      }
      dataToChange.push({"name" : columns[0], "value" : columns[1]});
      if (!colorsMapToChange.has(columns[0])) {
        colorsMapToChange.set(columns[0], columns[2]);
      }
    });
    if (!isInvalid && upload_is_month_picker) {
      var dates = [];
      dataToChange.forEach((element) => {
        dates.push(element["value"]);
      });
      isInvalid = !areAllDatesUnique(dates);
    }
    if (!isInvalid) {
      $( "#title-input" ).html(csv_name);
      if ((month_picker_on && !upload_is_month_picker) || (!month_picker_on && upload_is_month_picker))
        $("#toggle-month-picker").click();
      csvAlert(false);
      populateTable(dataToChange, colorsMapToChange);
      calculateData();
      makeWaffleChart();
    }
    else {
      csvAlert(true);
    }
    document.getElementById('file-upload').value = '';
  }

  function parseCSVRows(rowString) {
    var splitOnDoubleQuotes = rowString.trim().split('\"');
    if (splitOnDoubleQuotes.length == 1) {
      var toReturn = rowString.trim().split(",");
      if (toReturn.length != 3) {
        return []
      }
      return toReturn;
    }
    else if (splitOnDoubleQuotes.length != 3){
      return [];
    }
    var first = splitOnDoubleQuotes[1];
    var lastTwo = splitOnDoubleQuotes[2].split(",");
    return [first, lastTwo[1], lastTwo[2]];
  }

  function csvAlert(isActivating) {
    if (isActivating) {
      $('#showEventAlertHere').html(alertMaker("alert-csv",
      "Your CSV file is not in the correct format! Please read our Uploading Format Guidlines."));
    }
    else {
      $("#alert-csv").remove();
    }
  }

  function convertDataToCSVFormat(names, months_or_dates, colorsMapToConvert) {
    var toReturn = "Life Event,Months,Color\n";
    names.forEach((name, i)=> {
      toReturn += '"' + name + '"' + "," + months_or_dates[i] + "," + colorsMapToConvert.get(name) + "\n";
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
        if (month_picker_on && !areAllDatesUnique($(".monthsevent").map(function(){return this.innerHTML;}).get())) {
          $('#showEventAlertHere').html(alertMaker("alert-month-repeated", "You can't use the same date for more than one event!"));
          return false;
        } else {$("#alert-month-repeated").remove();}
        if ($(this).hasClass("end-month-input")) {
          if (!isEndMonthValid(value)) {
            return false;
          }
        }
        else if (month_picker_on && $(this).hasClass("monthsevent")) {
          if (new Date(value) > new Date($(".end-month-input").eq(0).html())) {
            $('#showEventAlertHere').html(alertMaker("alert-month-before-end", "Months must not come after end date!"));
            return false;
          }
          else {$("#alert-month-before-end").remove();}
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
        return month_picker_on ? pickerValidation(value) : monthIntegerValidation(value);
  		} else {
        return false;
      }
    });


  	return this;
  };

  function pickerValidation(value) {
    if (!isDateValid(value)) {
      $('#showMonthsAlertHere').html(alertMaker("alert-event-date-format", "Dates must be in YYYY-MM format!"));
    } else {
      $("#alert-event-date-format").remove();
    }
    return isDateValid(value);
  }

  function monthIntegerValidation(value) {
    if (!isNormalPosInteger(value)) {
      $('#showMonthsAlertHere').html(alertMaker("alert-event-month-length", "Events must be an integer greater than 0 and less than 1200 months long!"));
    } else {
      $("#alert-event-month-length").remove();
    }
    return !!isNormalPosInteger(value);
  }

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
    if (yearMonth[1].length != 2) {
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

  function areAllDatesUnique(dates_to_check) {
    var dates_seen = [];
    var is_repeated = false;
    dates_to_check.forEach((element) => {
      if (dates_seen.indexOf(element) > -1) {
        is_repeated = true;
      }
      dates_seen.push(element);
    });
    return !is_repeated;
  }

  function addNewEventRow(event, monthOrDate, color) {
    var dateInputFormat =  month_picker_on ? getDateInputFormat(monthOrDate) : monthOrDate;
    if (month_picker_on && $("#end-month-input").length) {
      var endDate = $("#end-month-input").html();
      if (calculateInputMonths(dateInputFormat, endDate) > 0) {
        $("#end-month-input").html(dateInputFormat);
        dateInputFormat = endDate;
      }
    }
    var newRow = $('<tr>' +
          '<td class="radiocheck"><input class="rowcheck" type="checkbox"></td>' +
          '<td class="eventname all-event-names" tabindex="1">' + event + '</td>' +
          '<td class="monthsevent" tabindex="1">' + dateInputFormat + '</td>' +
          '<td class="color-col"><input class="colorpick" type="color" value="' + color + '">' +
          '<span class="clink"><i class="fa fa-link"></i></span></td></tr>');
    if ($("#end-date-row").length) $("#end-date-row").before(newRow);
    else $('#mainTable').find("tbody").append(newRow);
    // https://github.com/mindmup/editable-table/issues/1
    newRow.numericInputExample();
    var box = $(newRow.children().eq(0).children().eq(0));
    box.click(function() {
      checkState();
    });
  }

  function randomEventRow() {
    var eventNames = getRandomEventName(1);
    var month = getRandomMonthOrDate();
    var c = randomColor();
    addNewEventRow(eventNames[0], month, c);
    calculateData();
    makeWaffleChart();
  }

  function getRandomMonthOrDate() {
    return month_picker_on ? getNextRandomDate() : getRandomIntInclusive(10, 30);
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
    newData.forEach((row, i) => {
      var is_end_date_row = (i === newData.length - 1) && month_picker_on;
      if (is_end_date_row) {
        current_end_month = row["value"];
        appendEndDateRow();
      }
      else if (!colors_map.has(row["name"])) {
        let c = randomColor({seed:eventNames[i]});
        addNewEventRow(row["name"], row["value"], c);
        colors_map.set(row["name"], c);
      } else {
        addNewEventRow(row["name"], row["value"], colors_map.get(row["name"]));
      }
    });
    //data = newData;
  }

  $( "#togglefuture" ).click(function() {
    calculateData();
    makeWaffleChart();
  });

  function checkFuture() {
    const lifeExpectancy = 80
    var numMonths = getCurrentNumMonths();
    if ($('#togglefuture').prop('checked') && (lifeExpectancy * 12) >= numMonths) {
      futureIndex = data.length;
      data.push({ "name": "The Future",
                  "value": (lifeExpectancy * 12) - numMonths});
      colors_map.set("The Future", "#bfbfbf");
    }
  };

  $("#toggle-month-picker").click(function() {
    console.log("Why?");
    if (month_picker_on) {
      month_picker_on = false;
      $("#chart-month-label").html("Months");
      showMoveButtons()
      removeEndDateRow();
    } else {
      month_picker_on = true;
      $("#chart-month-label").html("Start Month");
      hideMoveButtons();
      appendEndDateRow();
    }
    toggleMonthPicker();
    calculateData();
    makeWaffleChart();
  })

  function showMoveButtons() {
    $("#moveup").show();
    $("#movedown").show();
  }

  function hideMoveButtons() {
    $("#moveup").hide("hidden", "true");
    $("#movedown").hide("hidden", "true");
  }

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
    var random_date_input_format = getDateInputFormat(next_random_date);
    var current_months = $(".monthsevent").map(function(){
      return this.innerHTML;
    }).get();
    if (current_months.indexOf(random_date_input_format) != -1) {
      return getNextRandomDate();
    }
    return next_random_date;
  }

  var eventNames = getRandomEventName(5);
  for (var i = 0; i < eventNames.length; i++) {
    var day = getRandomMonthOrDate();
    var c = randomColor();
    addNewEventRow(eventNames[i], day, c);
  }

  if (month_picker_on) appendEndDateRow();
  hideMoveButtons();
  calculateData();
  makeWaffleChart();


  function getCurrentChecks() {
    var numChecks = [];
    var dataRows = $("#mainTable").find('tbody tr');
    var prevCheck = false;
    dataRows.each(function (index, value) {
      var row = $(this);
      var box = $(row.children().eq(0).children().eq(0));
      if(box.is(":checked")){
        if (!prevCheck) {
          numChecks.push([]);
        }
        numChecks[numChecks.length - 1].push(index);
        prevCheck = true;
      } else {
        prevCheck = false;
      }
    });
    return numChecks;
  }

  function alterTable(func, reverse) {
    var dataRows = $("#mainTable").find('tbody tr');
    if (reverse) {
      dataRows = $(dataRows.get().reverse());
    }
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
    alterTable(function(row) {row.remove();}, false);
    calculateData();
    makeWaffleChart();
  });

  $( "#moveup" ).click(function() {
    let checks = getCurrentChecks();
    if (checks[0][0] != 0) {
      alterTable(function(row) {row.insertBefore(row.prev());}, false)
      calculateData();
      makeWaffleChart();
    }
  });

  $( "#movedown" ).click(function() {
    let checks = getCurrentChecks();
    var dataRows = $("#mainTable").find('tbody tr');
    if (checks[0][checks[0].length - 1] != dataRows.length - 1) {
      alterTable(function(row) {row.insertAfter(row.next());}, true)
      calculateData();
      makeWaffleChart();
    }
  });

  $( "#repeat" ).click(function() {
    alterTable(function(row) {
      let c = row.clone();
      var box = $(c.children().eq(0).children().eq(0)); // need to remove the checkmark
      box.prop('checked', false); //https://stackoverflow.com/questions/13557623/remove-attribute-checked-of-checkbox
      addNewEventRow(row.find(".eventname").html(), month_picker_on ? getNextRandomDate() : getRandomIntInclusive(10,30), "#FFFFFF");
        // fix to be the same length as before
      box.click(function() {
        checkState()
      });}, false)
    calculateData();
    makeWaffleChart();
  });

  function checkState(){
    let check_count = getCurrentChecks();
    if (check_count.length == 0) {
      $( "#remove" ).prop('disabled', true);
      $( "#moveup" ).prop('disabled', true);
      $( "#movedown" ).prop('disabled', true);
      $( "#repeat" ).prop('disabled', true);
    } else if (check_count.length == 1) {
      $( "#remove" ).prop('disabled', false);
      $( "#moveup" ).prop('disabled', false);
      $( "#movedown" ).prop('disabled', false);
      $( "#repeat" ).prop('disabled', false);
    } else {
      $( "#remove" ).prop('disabled', false);
      $( "#moveup" ).prop('disabled', true);
      $( "#movedown" ).prop('disabled', true);
      $( "#repeat" ).prop('disabled', true);
    }
  }

  function sortDatesAndNamesInTable() {
    var events_list = $(".eventname").map(function(){return this.innerHTML;}).get();
    var dates_list = $(".monthsevent").map(function(){return new Date(this.innerHTML);}).get();
    var colors_list = $(".colorpick").map(function(){return this.value;}).get();
    //console.log(colors_list);
    var date_to_event_map = {};
    for (let index = 0; index < events_list.length; index++) {
      const element = events_list[index];
      const date = dates_list[index];
      const color = colors_list[index];
      date_to_event_map[date] = [element, color];
    }
    //console.log(date_to_event_map);
    dates_list = dates_list.sort((a, b) => a - b);
    var index = 0;
    var event_names = $(".eventname");
    var dates_elements = $(".monthsevent");
    var color_elements = $(".colorpick")
    dates_elements.each(function() {
      $(this).html(getDateInputFormat(dates_list[index]));
      index += 1;
    });
    index = 0;
    event_names.each(function() {
      console.log(date_to_event_map[dates_list[index]], dates_list[index]);
      $(this).html(date_to_event_map[dates_list[index]][0]);
      index += 1;
    });
    index = 0;
    color_elements.each(function() {
      //console.log(this);
      this.value = date_to_event_map[dates_list[index]][1];
      //console.log(date_to_event_map[dates_list[index]][1]);
      index += 1;
    });
  }

  function getDateInputFormat(date) {
    date = addDays(date, 1);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var date_input_format = year + "-";
    date_input_format += ((month > 9) ? (month + "") : ("0" + month));//+ "-";
    return date_input_format;
  }

  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function getEndDateRow() {
    var newRow = $('<tr id="end-date-row">' +
          '<td></td>' +
          '<th id="end-date-name" class="all-event-names">End Month</th>' +
          '<td id="end-month-input" class="monthsevent end-month-input" tabindex="1">' + current_end_month + '</td>' +
          '<td></td></tr>');
    newRow.numericInputExample();
          return newRow;
  }

  function appendEndDateRow() {
    $('#mainTable').find("tbody").append(getEndDateRow());
  }

  function removeEndDateRow() {
      $("#end-date-row").remove();
  }

  function toggleMonthPicker() {
      let months_or_dates_list = $(".monthsevent").map(function(){
        return month_picker_on ? this.innerHTML : new Date(this.innerHTML);
      }).get();
      var replacement_list = month_picker_on ? getDatesFromNumMonthsList(months_or_dates_list) : getNumMonthsFromDatesList(months_or_dates_list);
      replaceMonthRow(replacement_list);
  }

  function getNumMonthsFromDatesList(dates_list) {
    var months_list = [];
    current_start_month = getDateInputFormat(dates_list[0]);
    for (let index = 0; index < dates_list.length; index++) {
      const element = dates_list[index];
      var previous = new Date(current_end_month);
      if (!(index == dates_list.length - 1)) {
        previous = dates_list[index + 1];
      }
      months_list.push(calculateMonths(element, previous));
    }
    return months_list;
  }

  function calculateMonths(first, second) {
    return (second.getFullYear() * 12 + second.getMonth()) - (first.getFullYear() * 12 + first.getMonth());
  }

  function calculateInputMonths(first, second) {
    var firstArray = first.split("-");
    var secondArray = second.split("-");
    var toReturn = 0;
    toReturn += (firstArray[0] - secondArray[0]) * 12;
    toReturn += firstArray[1] - secondArray[1];
    return toReturn;
  }

  function getDatesFromNumMonthsList(months_list) {
      var dates_list = [];
      var current_date = current_start_month;
      for (let index = 0; index < months_list.length; index++) {
        const element = months_list[index];
        dates_list.push(current_date);
        current_date = addMonths(current_date, element);
      }
      return dates_list;
  }

  function addMonths(date, num_months) {
    var year_month = date.split("-");
    var old_month = parseInt(year_month[1]);
    var new_month = (parseInt(old_month) + parseInt(num_months)) % 12;
    var old_year = parseInt(year_month[0]);
    var new_year = parseInt(old_year) + Math.floor((parseInt(old_month) + parseInt(num_months)) / 12);
    if (new_month === 0) {new_month = 12; new_year--;}
    return parseInt(new_year) + "-" + (parseInt(new_month) > 9 ? "" : "0") + parseInt(new_month);
  }

  function getCurrentNumMonths() {
    var numMonths = 0;
    var month_or_date_list = $(".monthsevent").map(function(){
      return month_picker_on ? new Date(this.innerHTML) : this.innerHTML;
    }).get();
    month_or_date_list = month_picker_on ? getNumMonthsFromDatesList(month_or_date_list) : month_or_date_list;
    month_or_date_list.forEach(element => {
        numMonths += parseInt(element);
    });
    return numMonths;
  }

  function replaceMonthRow(replacement_list) {
      var rows = $("#mainTable").find('tbody tr');
      var index = 0;
      rows.each(function () {
          var row = $(this);
          var replacement = replacement_list[index]
          row.children().eq(2).html(month_picker_on ? replacement : replacement);
          index += 1;
      })
  }

  checkState();

  $('.rowcheck').click(function() {
    checkState();
  });

  $('#mainTable').editableTableWidget().numericInputExample();

  $(".alert").alert();

  //document.getElementById("title-input").focus();
});
