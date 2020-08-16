function d3waffle() {
  var margin = {top: 30, right: 20, bottom: 20, left: 30, title: 35, footer: 15},
      scale = 1,
      title = "My Life in Months",
      cols = 12,
      colorscale = d3.scaleOrdinal(d3.schemeCategory10),
      appearancetimes = function(d, i){ return 100; },
      width = 200,
      magic_padding = 5;

  function chart(selection) {

    selection.each(function(data) {

      selection.selectAll("*").remove();

      /* setting parameters and data */
      var total = d3.sum(data, function(d) { return d.value; });

      /* updating data */
      data.forEach(function(d, i){
        data[i].class = slugify(d.name);
        data[i].scalevalue = Math.round(data[i].value*scale);
        data[i].class_index = d.class.concat(i);
      });

      var totalscales = d3.sum(data, function(d){ return d.scalevalue; })
      var rows = Math.ceil(totalscales/cols);
      var griddata = cartesianprod(d3.range(rows), d3.range(cols));
      var detaildata = [];

      data.forEach(function(d){
        d3.range(d.scalevalue).forEach(function(e){
          detaildata.push({ name: d.name, class: d.class, class_index: d.class_index})
        });
      });

      // detailData is for the squares
      detaildata.forEach(function(d, i){
        detaildata[i].row = griddata[i][0];
        detaildata[i].col = griddata[i][1];
      })


      var gridSize = ((width - margin.left - margin.right) / cols)
      var gridHeight = margin.top + margin.bottom + gridSize * rows;
      var spots = data.length + 2;
      var legendHeight = margin.top + spots * gridSize + spots * magic_padding / 2;

      /* setting the container */
      var svg = selection.append("svg")
            //.attr("width",  (width + 200) + "px")
            //.attr("height", Math.max(gridHeight, legendHeight) + "px")
            // Made the svg responsive
            // https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
            .classed("svg-content-responsive", true)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + (width + 200) + " " + (margin.title + margin.footer + Math.max(gridHeight, legendHeight)))
            .style("background-color", "#fafafa")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + (margin.top + margin.title) + ")")
            .style("cursor", "default");

      // Create the scale (with help from https://www.d3-graph-gallery.com/graph/custom_axis.html)
      var maxyear = (rows - 1) - (rows - 1) % 10;
      var y = d3.scaleLinear()
          .domain([0, maxyear])
          .range([margin.top - 23, gridSize * maxyear + margin.top - 23]);

      // Draw the Y axis
      svg
        .append("g")
        .attr("transform", "translate(0,0)")
        .call(d3.axisLeft(y).tickSize(0).ticks(Math.max(1, Math.floor(maxyear/10))))
        .style("font", "10px 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif")
        .select(".domain").remove();

        // Add title:
        svg.append("text")
            .attr("id", "waffle-title")
            .attr("text-anchor", "start")
            .attr("x", -20)
            .attr("y", -35)
            .text(title)
            .style("font", "24px 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif")
            .style("font-weight", "bold");

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", gridSize * cols / 2)
            .attr("y", -5)
            .text("1 year")
            .style("font", "10px 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif");

        // Y axis label:
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left+24)
          .attr("x", getYPosForAgeLabel(rows))
          .text("age")
          .style("font", "10px 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif");

          // Add footer label:
          svg.append("text")
              .attr("text-anchor", "start")
              .attr("x", 0)
              .attr("y", Math.max(gridHeight, legendHeight) - margin.top)
              .text("https://discotraystudios.github.io/my-life-in-months")
              .style("font", "10px 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif")
              .style("opacity", "0.5");


      var nodes = svg.selectAll(".node")
            .data(detaildata)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + (d.col)*gridSize + "," + (d.row)*gridSize  + ")"; });

      nodes.append("rect")
            .style('fill', function(d){ return colorscale(d.class_index); })
            .attr('class', function(d){ return d.class; })
            .style("stroke", "white")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("opacity", 0)
            .transition()
            .duration(appearancetimes)
            .style("opacity", 1);

      var legend = svg.selectAll('.legend')
          .data(data)
          .enter().append('g')
          .attr('class', function(d){ return "legend" + " " + d.class; })
          .attr("transform", function(d) { return "translate(" + (cols*gridSize + magic_padding) + "," + magic_padding + ")"; })

      legend.append("rect")
            .attr('x', gridSize)
            .attr('y', function(d, i){ return i * gridSize + i * magic_padding / 2;})
            .style('fill', function(d){ return colorscale(d.class_index); })
            .attr('class', function(d){ return d.class; })
            .style("stroke", "white")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("opacity", 0)
            .transition()
            .duration(appearancetimes)
            .style("opacity", 1);

      legend.append('text')
            .attr('x', 1.5*gridSize + magic_padding)
            .attr('y', function(d, i){ return i * gridSize + i * magic_padding / 2;})
            .style("font", "12px 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif")
            .style("opacity", 1)
            .html(function(d){ return d.name; })
            .attr('class', function(d){ return "waffle-legend-text" + " " + d.class; })
            .attr("transform", function(d) { return "translate(" + gridSize/2 + "," + 5/6*gridSize  + ")"; })

    });
  }

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.cols = function(_) {
    if (!arguments.length) return cols;
    cols = _;
    return chart;
  };

  chart.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return chart;
  };

  chart.colorscale = function(_) {
    if (!arguments.length) return colorscale;
    colorscale = _;
    return chart;
  };

  chart.appearancetimes = function(_) {
    if (!arguments.length) return appearancetimes;
    appearancetimes = _;
    return chart;
  };

  return chart;

}

function slugify(text){
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .trim();                        // Trim - from end of text
}

function getYPosForAgeLabel(rows) {
  var ageLabelYPosition;
      if (rows <= 4 && rows >= 1) {
        ageLabelYPosition = -20;
      }
      else if (rows < 10 && rows > 4) {
        ageLabelYPosition = (-10 * rows) / 2;
      }
      else {
        ageLabelYPosition = -60;
      }
    return ageLabelYPosition;
}

/* http://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript */
function cartesianprod(paramArray) {

  function addTo(curr, args) {

    var i, copy,
        rest = args.slice(1),
        last = !rest.length,
        result = [];

    for (i = 0; i < args[0].length; i++) {

      copy = curr.slice();
      copy.push(args[0][i]);

      if (last) {
        result.push(copy);

      } else {
        result = result.concat(addTo(copy, rest));
      }
    }

    return result;
  }


  return addTo([], Array.prototype.slice.call(arguments));
}
