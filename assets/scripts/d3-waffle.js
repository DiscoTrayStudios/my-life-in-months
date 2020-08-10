function d3waffle() {
  var margin = {top: 10, right: 10, bottom: 10, left: 20},
      scale = 1,
      cols = 12,
      colorscale = d3.scaleOrdinal(d3.schemeCategory10),
      appearancetimes = function(d, i){ return 100; },
      width = 200,
      magic_padding = 5;

  function chart(selection) {

    selection.each(function(data) {

      selection.selectAll("*").remove();

      /* setting parameters and data */
      //var idcontainer = selection[0][0].id; // I need to change thiz plz
      var total = d3.sum(data, function(d) { return d.value; });

      /* updating data */
      data.forEach(function(d, i){
        data[i].class = slugify(d.name);
        data[i].scalevalue = Math.round(data[i].value*scale);
        data[i].percent = data[i].value/total;
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
      var spots = data.length + 1;
      var legendHeight = spots * gridSize + spots * magic_padding / 2;

      /* setting the container */
      var svg = selection.append("svg")
            .attr("width",  (width + 200) + "px")
            .attr("height", Math.max(gridHeight, legendHeight) + "px")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .style("cursor", "default");

      // Create the scale (with help from https://www.d3-graph-gallery.com/graph/custom_axis.html)
      var maxyear = (rows - 1) - (rows - 1) % 10;
      var y = d3.scaleLinear()
          .domain([0, maxyear])
          .range([margin.top - 2, gridSize * maxyear + margin.top - 2]);

      // Draw the axis
      svg
        .append("g")
        .attr("transform", "translate(0,0)")
        .call(d3.axisLeft(y).tickSize(0).ticks(Math.floor(maxyear/10)))
        .select(".domain").remove();

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
