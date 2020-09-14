// explanation fields
explain("size");
explain("success_rate");
explain("tail");
explain("sig_level");

// explanation fields
explain("size");
explain("success_rate");
explain("tail");
explain("sig_level");

// check size input
let size_A_form = document.getElementById("size_A");
size_A_form.addEventListener("change", function () { alert_value_too_small("size_A", size_A_form.value); });
let size_B_form = document.getElementById("size_B");
size_B_form.addEventListener("change", function () { alert_value_too_small("size_B", size_B_form.value); });


function update_results_table(uplift, Z_score, p_value) {
    $("#uplift").html(uplift);
    $("#Z_score").html(Z_score);
    $("#p_value").html(p_value);
}

function test_outcome(p_value, svg) {
    let displayed_sig_level = parseFloat($("#sig_level").val());
    let sig_level = displayed_sig_level / 100;
    let confidence_level = 1 - p_value;
    let displayed_confidence = confidence_level * 100;
    let difference = parseFloat($("#success_rate_A").val()) / 100 - parseFloat($("#success_rate_B").val()) / 100;
    let displayed_difference = Math.round(difference * 100);
    let conclusion = $("#result_caption");
    if (difference > 0) {
        var message = "<div class='border rounded p-5'> <div>• Variant A is " + displayed_difference + "% better than variant B with a " + displayed_confidence + "% confidence level.</div> ";
    } else {
        displayed_difference = - displayed_difference
        var message = "<div class='border rounded p-5'> <div> • Variant B is " + displayed_difference + "% better than variant A with a <span id = 'confidence'>" + displayed_confidence + "% confidence level. </span> </div>";
    };
    if (confidence_level >= sig_level) {
        message += "<div id = 'significance' > • These results are statistically significant within " + displayed_sig_level + "% significance level </div> </div>";
        conclusion.html(message);
        $("#significance").addClass("green");
        $("#confidence").addClass("green");
        $("#p_value").addClass("green");
        svg.select("#area_standard")
            .style("fill", "#009432")
    } else {
        message += "<div id = 'significance' > • These results are not statistically significant within " + displayed_sig_level + "% significance level </div> </div>";
        conclusion.html(message);
        $("#significance").addClass("red");
        $("#p_value").removeClass("green");
        $("#p_value").addClass("red");
        $("#confidence").addClass("red");
        svg.select("#area_standard")
            .style("fill", "#EA2027")
    };
}


const formButton = document.getElementById('submit');
formButton.addEventListener("click", function (event) {
    analyse_results().then(function (response) {
        manage_response(response)
            .then(function (json) {
                const Z_score = parseFloat(json.Z_score);
                const p_value = parseFloat(json.p_value);
                let uplift = Math.round(Math.abs(parseFloat($("#success_rate_A").val()) - parseFloat($("#success_rate_B").val())));
                update_results_table(uplift, Z_score, p_value);
                test_outcome(p_value, svg);
                let save_section = $("#save-section");
                save_section.removeClass("d-none");
            })
    }).catch(function (error) {
        console.log('There was an issue with the fetch operation ' + error.message);
    });
    event.preventDefault();
}
)


var app = angular.module("resultApp", []);

app.controller("ResultController", function ($scope, $http) {
    let config = dataiku.getWebAppConfig()
    let stat_entry = config["statistics_entry"];
    let dataset_name = config["statistics_dataset"];

    if (stat_entry === undefined && dataset_name === undefined) {
        alert("Please define how you want to input your statistics from the settings tab. After definining them, please click on the button Save and view web app. By default, manual setting is on.");
    }
    else if (stat_entry === undefined && dataset_name != undefined) {
        //load_values_from_df(dataset_name);
    }
    else if (stat_entry === "manual") {
        $scope.size_A = 1000;
        $scope.size_B = 1000;
        $scope.success_rate_A = 20;
        $scope.success_rate_B = 30;
    } else if (stat_entry === "input_dataset") {
        if (dataset_name === undefined) {
            alert("Please, specify the input dataset containing the statistics. It should be the output of the AB statistics recipe from the AB testing plugin.");
        }
        else {
            let formData = {name: dataset_name};
            $http.post(getWebAppBackendUrl("statistics"), formData).then(function(response){
                let response_data = response.data
                $scope.size_A = response_data.size_A;
                $scope.size_B = response_data.size_B;
                $scope.success_rate_A = response_data.success_rate_A;
                $scope.success_rate_B = response_data.success_rate_B;
            })
        };
    } else {
        alert("Please check the settings of the web ap")
    }



});


// set up canvas 
//const margin = { top: 20, right: 30, bottom: 30, left: 40 },
//    width = 700 - margin.left - margin.right,
//    height = 500 - margin.top - margin.bottom;
//let svg = set_up_canvas(margin, width, height);
//
//// init distributions
//let distribution = Random_normal_Dist(0, 1);
//
//// build axes
//let x = d3.scaleLinear().rangeRound([0, width]);
//let x_min = d3.min(distribution, function (distribution) { return distribution.x_coordinate; });
//let x_max = d3.max(distribution, function (distribution) { return distribution.x_coordinate;; });
//x.domain([x_min, x_max]).nice;
//
//let y_max = d3.max(distribution, function (distribution) { return distribution.y_coordinate; });
//let y = d3.scaleLinear().domain([0, y_max]).range([height, 0]);
//
//// draw plot
//draw_initial_x_axis(svg, x, height);
//let line = d3.line()
//    .x(function (distribution) { return x(distribution.x_coordinate); })
//    .y(function (distribution) { return y(distribution.y_coordinate); });
//
//svg.append("path")
//    .datum(Random_normal_Dist(0, 1))
//    .attr("class", "line")
//    .attr("d", line)
//    .attr("id", "plot")
//    .style("stroke-width", 2.5)
//    .style("stroke", "#718093")
//    .style("fill", "none");
//
//// draw IC
//let sig_level = parseFloat($("#sig_level").val()) / 100;
//let z_value = update_z_value(1);
//
//svg.append('line')
//    .style('stroke', '#7f8fa6')
//    .attr('x1', x(z_value))
//    .attr('y1', y(0))
//    .attr('x2', x(z_value))
//    .attr('y2', y(y_max))
//    .attr("id", "IC_right")
//    .style("stroke-dasharray", ("3, 3"));
//
//// update IC
//let area_defined = define_area(x_max, 0, z_value, x, y, 1);
//let area_sig_level = area_defined[0];
//let indexies = area_defined[1];
//draw_area(svg, area_sig_level, indexies, "#009432", "standard");
//
//// draw Z score
//let Z_score = 3.381;
//svg.append("rect").attr("x", x(Z_score))
//    .attr("y", y(0) - 15)
//    .attr("width", 6)
//    .attr("height", 30)
//    .attr("id", "plot_Z_score")
//    .style("fill", "rgb(54, 163, 158)");
//svg.append("text").attr("x", x(Z_score) + 3)
//    .attr("y", y(0) + 25)
//    .attr("class", "label_legend")
//    .text("Your A/B")
//    .attr("id", "label_z_score")
//    .style("text-anchor", "middle");
//
//function update_z_score(svg, x, Z_score) {
//    svg.select("#plot_Z_score")
//        .attr("x", x(Z_score));
//    svg.select("#label_z_score")
//        .attr("x", x(Z_score) + 3);
//};

