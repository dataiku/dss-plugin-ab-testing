////Functions

//Check form inputs
function check_form_input(form_field) {
    let form_element = document.getElementById(form_field);
    form_element.addEventListener("change", function () { alert_invalid_value(form_field, form_element.value, 0, 100); });
}

function alert_invalid_value(form_field, value, lower_bound, upper_bound) {
    if (out_of_bound(value, lower_bound, upper_bound)) {
        $("#" + "alert_" + form_field).html("Please enter a value between 0 and 100")
    } else {
        $("#" + "alert_" + form_field).html("")
    }
}

function invalid_form(lower_bound, upper_bound) {
    let bcr = $("#bcr").val();
    let mde = $("#mde").val();
    let sig_level = $("#sig_level").val();
    let power = $("#power").val();
    let ratio = $("#ratio").val();
    let reach = $("#reach").val();
    if (reach) {
        var invalid_output = (out_of_bound(bcr, lower_bound, upper_bound) || out_of_bound(mde, lower_bound, upper_bound) || out_of_bound(sig_level, lower_bound, upper_bound) || out_of_bound(power, lower_bound, upper_bound) || out_of_bound(ratio, lower_bound, upper_bound) || out_of_bound(reach, lower_bound, upper_bound));
    } else {
        var invalid_output = (out_of_bound(bcr, lower_bound, upper_bound) || out_of_bound(mde, lower_bound, upper_bound) || out_of_bound(sig_level, lower_bound, upper_bound) || out_of_bound(power, lower_bound, upper_bound) || out_of_bound(ratio, lower_bound, upper_bound));
    }
    return invalid_output
}

function out_of_bound(value, lower_bound, upper_bound) {
    const input = parseFloat(value);
    return (input > upper_bound || input < lower_bound);
}

function too_small(value, lower_bound) {
    const input = parseFloat(value);
    return (input < lower_bound);
}

function missing_values() {
    const bcr = $("#bcr").val();
    const mde = $("#mde").val();
    const sig_level = $("#sig_level").val();
    const power = $("#power").val();
    const ratio = $("#ratio").val();
    return (bcr === "" || mde === "" || sig_level === "" || power === "" || ratio === "");
}

function alert_sample_size(display_message, log_message) {
    $("#alert_size").html(display_message);
    $("#sample_size_A").html("");
    $("#sample_size_B").html("");
    console.log("value error: " + log_message);
}

//Compute sample size

function update_sample_size(response) {
    const size_A = parseInt(response.n_A);
    const size_B = parseInt(response.n_B);
    $("#sample_size_A").html(size_A);
    $("#sample_size_B").html(size_B);
    $("#alert_size").html("");
}


function manage_response(response) {
    if (response.ok) {
        return response.json();
    } else {
        console.log('Invalid response from the network');
    }
}

function query_backend() {
    let formData = new FormData(document.getElementById('form_data'));
    const data = new URLSearchParams(formData);
    let headers = new Headers();
    let init = {
        method: 'POST',
        headers: headers,
        body: data
    };
    const url = getWebAppBackendUrl('/sample_size');
    let promise = fetch(url, init);
    return promise;
}



// Display or hide elements (fields, explanations...)
function display(hide, button_name, text_name, change_button, button_text_on, button_text_off) {
    const button = $("#" + button_name);
    let optional_text = $("#" + text_name);
    if (hide) {
        if (change_button) {
            button.html(button_text_off);
        }
        optional_text.removeClass('d-none');
        hide = false;
    } else {
        if (change_button) {
            button.html(button_text_on);
        }
        optional_text.addClass('d-none');
        hide = true
    };
    return hide;
}

function explain(parameter) {
    const info_button = document.getElementById('info_' + parameter);
    let hide = true;
    info_button.addEventListener('click', function (event) {
        hide = display(hide, "info_" + parameter, "explanation_" + parameter, true, "[Info]", "[Hide]");
        event.preventDefault();
    });
}

//// Execution


//default values
document.getElementById("bcr").defaultValue = "30";
document.getElementById("mde").defaultValue = "5";
document.getElementById("sig_level").defaultValue = "95";
document.getElementById("power").defaultValue = "80";
document.getElementById("ratio").defaultValue = "100";
document.getElementById("reach").defaultValue = "100";


// check input
check_form_input("bcr");
check_form_input("mde");
check_form_input("sig_level");
check_form_input("power");
check_form_input("ratio");
check_form_input("reach");


// show / hide optional parameters
let hide_parameters = true;
const advancedButton = document.getElementById('more');
advancedButton.addEventListener('click', function (event) {
    hide_parameters = display(hide_parameters, "more", "optional_fields", true, "More parameters", "Less parameters");
    event.preventDefault();
});


// show / hide explanations
//explain("intro");
explain("bcr");
explain("mde");
explain("sig_level");
explain("power");
explain("ratio");
explain("tail");


let hide_derivation = true;
const computation = document.getElementById('size_derivation');
computation.addEventListener('click', function (event) {
    hide_derivation = display(hide_derivation, "size_derivation", "derivation_text", true, "<div class='extra'> How is the sample size computed? </div>", "<div class='extra'> Hide </div>");
    event.preventDefault();
});



//Submit form 
const formButton = document.getElementById('submit_button');
let hide_duration = true;

formButton.addEventListener('click', function (event, hide_duration) {
    let traffic = $("#traffic").val()
    if (missing_values()) {
        alert_sample_size("A field is empty, please fill all of them", "missing value");
    } else if (invalid_form(0, 100)) {
        alert_sample_size("Invalid input, please check the values defined above", "invalid input");
    } else {
        query_backend()
            .then(function (response) {
                manage_response(response)
                    .then(function (json) {
                        update_sample_size(json);
                        update_plots_with_new_sd();
                        update_rejection_zone(event);
                        update_legend("Power", $("#power").val(), "label_power", true);
                        hide_duration = manage_duration(hide_duration);
                    })
            }).catch(function (error) {
                console.log('There was an issue with the fetch operation ' + error.message);
            });
    };
    event.preventDefault();
});

// visualization
function Random_normal_Dist(mean, sd) {
    let data = [];
    for (var i = mean - 4 * sd; i < mean + 4 * sd; i += 1 / 1000) {
        let x_coordinate = i
        let y_coordinate = jStat.normal.pdf(i, mean, sd);
        let arr = {
            "x_coordinate": x_coordinate,
            "y_coordinate": y_coordinate
        }
        data.push(arr);
    };
    return data;
}


function build_x_axis(distribution_A, distribution_B, width) {
    let x_A = d3.min(distribution_A, function (distribution) { return distribution.x_coordinate; });
    let x_B = d3.min(distribution_B, function (distribution) { return distribution.x_coordinate; });
    let x_min = d3.min([x_A, x_B]);

    x_A = d3.max(distribution_A, function (distribution) { return distribution.x_coordinate;; });
    x_B = d3.max(distribution_B, function (distribution) { return distribution.x_coordinate; });
    let x_max = d3.max([x_A, x_B]);

    let x = d3.scaleLinear()
        .rangeRound([0, width]);
    x.domain([x_min, x_max]).nice;
    return x;
}

function get_ymax(distribution_A, distribution_B) {
    let y_A = d3.max(distribution_A, function (distribution) { return distribution.y_coordinate; });
    let y_B = d3.max(distribution_B, function (distribution) { return distribution.y_coordinate; });
    let y_max = d3.max([y_A, y_B]);
    return y_max;
}

function build_y_axis(distribution_A, distribution_A, height) {
    let y_max = get_ymax(distribution_A, distribution_B);
    let y = d3.scaleLinear().domain([0, y_max])
        .range([height, 0]);
    return y;
}


// init visualization

const margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let n_A = parseFloat($("#sample_size_A").html());
let n_B = parseFloat($("#sample_size_B").html());

let bcr_val = parseFloat($("#bcr").val()) / 100;
let std = get_std(n_A, n_B, bcr_val);

let distribution_A = Random_normal_Dist(0, std);
let distribution_B = Random_normal_Dist(0.05, std);

let x = build_x_axis(distribution_A, distribution_B, width);

let y_max = get_ymax(distribution_A, distribution_B);
let y = build_y_axis(distribution_A, distribution_B, height);

let svg = d3.select(".plot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


let gX = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .attr("id", "x_axis")
    .call(d3.axisBottom(x));


let line = d3.line()
    .x(function (distribution) { return x(distribution.x_coordinate); })
    .y(function (distribution) { return y(distribution.y_coordinate); });

let bcr_plot = parseFloat(d3.select("#bcr").node().value);
let mde_plot = parseFloat(d3.select("#mde").node().value);


// plot IC
svg.append('line')
    .style('stroke', '#7f8fa6')
    .attr('x1', x(0.034))
    .attr('y1', y(0))
    .attr('x2', x(0.034))
    .attr('y2', y(y_max))
    .attr("id", "IC_right")
    .style("stroke-dasharray", ("3, 3"));

// plot curves
svg.append("path")
    .datum(Random_normal_Dist(0, std))
    .attr("class", "line")
    .attr("d", line)
    .attr("id", "A_plot")
    .style("stroke-width", 2.5)
    .style("stroke", "rgb(54,163,158)")
    .style("fill", "none");

svg.append("path")
    .datum(Random_normal_Dist(mde_plot / 100, std))
    .attr("class", "line")
    .attr("d", line)
    .attr("id", "B_plot")
    .style("stroke-width", 2.5)
    .style("stroke", "#ff7979")
    .style("fill", "none");


// area under curve
function define_area(mean, z_value, x, y) {
    let std = get_std();
    let distribution = Random_normal_Dist(mean, std);
    let x_max = d3.max(distribution, function (distribution) { return distribution.x_coordinate; });
    let boundary = build_max_bounds(x_max, z_value, mean, std);
    boundary = build_min_bounds(boundary, z_value, mean, std);
    let indexies = d3.range(boundary[0].x_coordinate.length);
    let area = d3.svg.area()
        .interpolate("cardinal")
        .x0(function (d) { return x(boundary[0].x_coordinate[d]) })
        .x1(function (d) { return x(boundary[1].x_coordinate[d]) })
        .y0(function (d) { return y(boundary[0].y_coordinate[d]) })
        .y1(function (d) { return y(boundary[1].y_coordinate[d]) });
    return [area, indexies];
}

function build_max_bounds(x_max, z_value, mean, std) {
    let x_max_bounds = new Array();
    let y_max_bounds = new Array();
    for (var i = x_max; i > z_value; i -= 1 / 300) {
        x_max_bounds.push(i);
        y_max_bounds.push(jStat.normal.pdf(i, mean, std));
    }

    let data = [{
        x_coordinate: x_max_bounds,
        y_coordinate: y_max_bounds
    }];
    return data;
}

function build_min_bounds(data, z_value, mean, std) {
    var len = data[0].x_coordinate.length;
    var x_min_bounds = new Array(len).fill(z_value);
    var y_min_bounds = new Array(len - 1).fill(0);
    y_min_bounds.push(jStat.normal.pdf(z_value, mean, std));
    var arr = {
        x_coordinate: x_min_bounds,
        y_coordinate: y_min_bounds
    };
    data.push(arr);
    return data;
}

function draw_area(area, indexies, color, group) {
    svg.append("path")
        .datum(indexies)
        .attr("d", area)
        .attr("id", "area_" + group)
        .style("fill", color)
        .style("opacity", "0.5");
}


//draw area
let z_value = 0.034;
let area_defined_A = define_area(0, z_value, x, y)
let area_sig_level = area_defined_A[0];
let indexies_A = area_defined_A[1];

let area_defined_B = define_area(0.05, z_value, x, y)
let area_power = area_defined_B[0];
let indexies_B = area_defined_B[1];


draw_area(area_power, indexies_B, "#fdae61", "B");
draw_area(area_sig_level, indexies_A, "#4393c3", "A");

//update distributions and axis
function update_distribution(new_mean, group, x, y) {
    let updated_line = d3.line()
        .x(function (distribution) { return x(distribution.x_coordinate); })
        .y(function (distribution) { return y(distribution.y_coordinate); });

    let std = get_std();
    svg.select("#" + group + "_plot")
        .datum(Random_normal_Dist(new_mean, std))
        .attr("class", "line")
        .attr("d", updated_line)
}

function get_std() {
    let bcr = parseFloat($('#bcr').val()) / 100;
    let svg = d3.select(".plot");
    let new_size_A = parseFloat($("#sample_size_A").html());
    let new_size_B = parseFloat($("#sample_size_B").html());
    let std = Math.sqrt(bcr * (1 - bcr) * (1 / new_size_A + 1 / new_size_B));
    return std;
}

function update_x_axis(width) {
    let std = get_std();
    let mde = parseFloat($('#mde').val()) / 100;
    let new_x_axis = build_x_axis(Random_normal_Dist(0, std), Random_normal_Dist(mde, std), width);
    svg.select("#x_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(new_x_axis));
    return new_x_axis
}

function update_axes(height, width) {
    let std = get_std();
    let mde = parseFloat($('#mde').val()) / 100;
    let distribution_A = Random_normal_Dist(0, std);
    let distribution_B = Random_normal_Dist(mde, std);
    let new_x_axis = build_x_axis(distribution_A, distribution_B, width);
    let new_y_axis = build_y_axis(distribution_A, distribution_B, height);
    svg.select("#x_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(new_x_axis));
    return [new_x_axis, new_y_axis];
}

function update_plots_with_new_sd() {
    let new_axes = update_axes(height, width);
    let new_x = new_axes[0];
    let new_y = new_axes[1];
    update_distribution(0, "A", new_x, new_y);
    let mde_plot = parseFloat($("#mde").val()) / 100;
    update_distribution(mde_plot, "B", new_x, new_y);
    //update IC 
    let std = get_std();
    let y_max = get_ymax(Random_normal_Dist(0, std), Random_normal_Dist(mde, std));
    svg.select('#IC_right')
        .attr('y2', y_max);
}

let bcr = document.getElementById('bcr');
bcr.addEventListener('change', function () {
    update_plots_with_new_sd();
});

let mde = document.getElementById('mde');
mde.addEventListener('change', function () {
    let new_mean_B = parseFloat(this.value) / 100;
    let new_axes = update_axes(height, width);
    let new_x = new_axes[0];
    let new_y = new_axes[1];
    update_distribution(0, "A", new_x, new_y);
    update_distribution(new_mean_B, "B", new_x, new_y);
});



// Rejection zone visualization
function update_z_value(std) {
    let alpha = 1 - parseFloat($("#sig_level").val()) / 100;
    let two_tailed = ($("#tail").val() == "true");
    if (two_tailed) {
        var p = 1 - alpha / 2;
    } else {
        var p = 1 - alpha;
    }
    let z = jStat.normal.inv(p, 0, 1) * std;
    return z;
}


function update_area(group, new_z, new_x, new_y) {
    if (group === "A") {
        var mean = 0;
    } else if (group === "B") {
        var mean = parseFloat($('#mde').val()) / 100;
    }
    let new_area_defined = define_area(mean, new_z, new_x, new_y);
    let new_area = new_area_defined[0];
    let new_indexies = new_area_defined[1];
    svg.select("#area_" + group)
        .datum(new_indexies)
        .attr("d", new_area);
}


function update_IC(z, mde, std, new_x, new_y) {
    let y_max = get_ymax(Random_normal_Dist(0, std), Random_normal_Dist(mde, std));
    svg.select('#IC_right')
        .attr('x1', new_x(z))
        .attr('y1', new_y(0))
        .attr('x2', new_x(z))
        .attr('y2', new_y(y_max));
}

function update_rejection_zone(event) {
    let std = get_std();
    let mde = parseFloat($('#mde').val()) / 100;

    let new_z = update_z_value(std);
    let new_axes = update_axes(height, width);
    let new_x = new_axes[0];
    let new_y = new_axes[1];
    update_IC(new_z, mde, std, new_x, new_y);
    update_area("A", new_z, new_x, new_y);
    update_area("B", new_z, new_x, new_y);

    event.preventDefault();
}

const sig_level = document.getElementById('sig_level');
sig_level.addEventListener('change', function (event) {
    update_legend("Significance level", parseFloat(this.value), "label_sig_level", true);
    update_legend("Power", "compute size", "label_power", false);
    update_rejection_zone(event);
});


bcr.addEventListener('change', function (event) {
    update_rejection_zone(event);
});
mde.addEventListener('change', function (event) { update_rejection_zone(event); });


// Plot's legend
const x_legend = 0
const y_legend = y_max - 25

function plot_legend(x, y, label, color, value, id_text) {
    let text = label + ": " + value + "%";
    svg.append("circle").attr("cx", x)
        .attr("cy", y)
        .attr("r", 6)
        .style("fill", color)
        .style("opacity", "0.5");
    svg.append("text").attr("x", x + 20)
        .attr("y", y)
        .attr("class", "label_legend")
        .text(text)
        .attr("id", id_text)
        .attr("alignment-baseline", "middle");
}

plot_legend(x_legend, y_legend, "Statistical significance", "#4393c3", $("#sig_level").val(), "label_sig_level");
plot_legend(x_legend, y_legend + 20, "Power", "#fdae61", $("#power").val(), "label_power");

// update legend

function update_legend(label, new_value, id, percentage) {
    if (percentage) {
        var new_text = label + ": " + new_value + "%";
    } else {
        var new_text = label + ": " + new_value;
    }
    svg.select("#" + id)
        .text(new_text);
}

const power = document.getElementById('power');
power.addEventListener('change', function (event) {
    update_legend("Power", "compute size", "label_power", false);
});

// update global variables with sample sizes

let hide_attribution = true;
const attribution = document.getElementById('attribution_button');
attribution.addEventListener("click", function (event) {
    store_sizes_in_variables()
        .then(function (response) {
            manage_response(response);
        }).catch(function (error) {
            console.log('There was an issue with the fetch operation ' + error.message);
        });
    display(hide_attribution, "attribution_button", "attribution_alert", false)
    event.preventDefault();
})


function store_sizes_in_variables() {
    let formData = new FormData(document.getElementById('form_data'));
    let n_A = $("#sample_size_A").html();
    let n_B = $("#sample_size_B").html();
    let data = new URLSearchParams(formData);
    data.append("n_A", n_A);
    data.append("n_B", n_B);
    let headers = new Headers();
    let init = {
        method: 'POST',
        headers: headers,
        body: data
    };
    const url = getWebAppBackendUrl('/set_variables');
    let promise = fetch(url, init);
    return promise;
}


// compute duration
function manage_duration(hide_duration) {
    let traffic = $("#traffic").val();
    if (traffic) { 
        if (too_small(traffic, 0)) {
            hide_duration = display(hide_duration, "submit_button", "duration", false);
            $("#" + "alert_traffic").html("Please enter a positive number")
        } else {
            display_experiment_duration(hide_duration);
        }
    } else {
        hide_duration = display(hide_duration, "submit_button", "duration", false);
    }
    return hide_duration;
}


function display_experiment_duration() {
    let duration = compute_duration();
    $("#nb_of_days").html(duration);
    $("#duration").removeClass('d-none');
}


function compute_duration() {
    let daily_traffic = parseFloat($("#traffic").val());
    let n_A = parseFloat($("#sample_size_A").html());
    let n_B = parseFloat($("#sample_size_B").html());
    let sample_size = n_A + n_B;
    return Math.ceil(sample_size / daily_traffic);
}

