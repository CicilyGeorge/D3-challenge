// Setting chart width, height and margins
var svgWidth = 600;
var svgHeight = 460;

var margin = {top: 20, right: 20, bottom: 100, left: 100};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Creating an SVG wrapper
var svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
// appending an SVG group that will hold our chart and Shifting by left and top margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);




// Scale functions
// ==============================

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;
}
// function used for updating x-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8, 
      d3.max(healthData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

  return yLinearScale;
}



// render Axes functions
// ==============================
// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(700)
    .call(bottomAxis);

  return xAxis;
}
// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}



// Render Circles to update circles group function
// ==============================
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.selectAll("circle").transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  circlesGroup.selectAll("text").transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}



// Update Tooltip in circles group function
// ==============================
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}`);
    });

    // Create tooltip in the circles Group
    circlesGroup.call(toolTip);

    //Create event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

  return circlesGroup;
}



// Setting Initial axes
chosenXAxis = "poverty";
chosenYAxis =  "healthcare";



// Import Data
d3.csv("assets/data/data.csv").then(function(healthData, err) {
  
  if (err) throw err;
    // Parse Data/Cast as numbers
    healthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.smokes = +data.smokes;
      data.income = +data.income;
      data.obesity = +data.obesity;
    });

    // Calling xScale function to return xLinearScale
    var xLinearScale = xScale(healthData, chosenXAxis);

    // Calling yScale function to return yLinearScale
    var yLinearScale = yScale(healthData, chosenYAxis);


    // Create axis functions
    // var bottomAxis = renderXAxis(xLinearScale, bottomAxis);
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);


    // Appending Axes to the chart
    // append x axis
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);

      
    // Initial Circles
    var circlesGroup = chartGroup.selectAll("g.dot")
      .data(healthData)
      .enter()
      .append("g");
    circlesGroup.append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", "10")
      .attr("fill", "#6eabbf")
      .attr("opacity", ".8")
    circlesGroup.append("text")
      .text(d => d.abbr)
      .attr("dx", "-0.75em")
      .attr("dy", "0.35em")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("font-size", "9px")
      .attr("font-weight", "bold")
      .attr("fill", "#ffffff");


      
  // Create group for x-axis labels
  var xlabelsGroup = chartGroup.append("g");

    // Xaxis labels
    var povertyLabel = xlabelsGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText active")
      .attr("value", "poverty")
      .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 50})`)
      .attr("class", "axisText inactive")
      .attr("value", "age")
      .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 70})`)
      .attr("class", "axisText inactive")
      .attr("value", "income")
      .text("Hosehold Income (Median)");


    // Create group for x-axis labels
    var ylabelsGroup = chartGroup.append("g");

    // Yaxis labels
    var obesityLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 10)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText inactive")
      .attr("value", "obesity")
      .text("Obese (%)");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 30)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText inactive")
      .attr("value", "smokes")
      .text("Smokes (%)");

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 50)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText active")
      .attr("value", "healthcare")
      .text("Lacks Healthcare (%)");


  
  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text").on("click", function() {
      // get value of selection
      var xvalue = d3.select(this).attr("value");
      if (xvalue !== chosenXAxis){
        // replaces chosenXAxis with value
        chosenXAxis = xvalue;

        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);
        // yLinearScale = yScale(healthData, chosenYAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });

  // y axis labels event listener
  ylabelsGroup.selectAll("text").on("click", function() {
      // get value of selection
      var yvalue = d3.select(this).attr("value");
      if (yvalue !== chosenYAxis){
        // replaces chosenXAxis with value
        chosenYAxis = yvalue;

        // functions here found above csv import
        // updates x scale for new data
        // xLinearScale = xScale(healthData, chosenXAxis);
        yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });

  }).catch(function(error) {
    console.log(error);
  });


