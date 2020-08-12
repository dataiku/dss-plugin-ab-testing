// area under curve
function draw_initial_area(svg, z_value, x, y, distribution_A, distribution_B, std) {
    let x_max_A = get_x_max(distribution_A);
    let area_defined_A = define_area(x_max_A, 0, z_value, x, y, std)
    let area_sig_level = area_defined_A[0];
    let indexies_A = area_defined_A[1];

    let x_max_B = get_x_max(distribution_B);
    let area_defined_B = define_area(x_max_B, 0.05, z_value, x, y, std)
    let area_power = area_defined_B[0];
    let indexies_B = area_defined_B[1];

    draw_area(svg, area_power, indexies_B, "#fdae61", "B");
    draw_area(svg, area_sig_level, indexies_A, "#4393c3", "A");
}

function update_area(svg, x_max, group, new_z, new_x, new_y, std) {
    if (group === "A") {
        var mean = 0;
    } else if (group === "B") {
        var mean = parseFloat($('#mde').val()) / 100;
    }
    let new_area_defined = define_area(x_max, mean, new_z, new_x, new_y, std);
    let new_area = new_area_defined[0];
    let new_indexies = new_area_defined[1];
    svg.select("#area_" + group)
        .datum(new_indexies)
        .attr("d", new_area);
}


function define_area(x_max, mean, z_value, x, y, std) {
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


function draw_area(svg, area, indexies, color, group) {
    svg.append("path")
        .datum(indexies)
        .attr("d", area)
        .attr("id", "area_" + group)
        .style("fill", color)
        .style("opacity", "0.5");
}


// Rejection zone visualization
function draw_initial_IC(svg, x, y, y_max) {
    svg.append('line')
        .style('stroke', '#7f8fa6')
        .attr('x1', x(0.034))
        .attr('y1', y(0))
        .attr('x2', x(0.034))
        .attr('y2', y(y_max))
        .attr("id", "IC_right")
        .style("stroke-dasharray", ("3, 3"));
}

function update_rejection_zone(svg, std, y_max, height, width) {
    let new_z = update_z_value(std);
    let new_axes = update_axes(svg, height, width, std);
    let new_x = new_axes[0];
    let new_y = new_axes[1];
    update_IC(svg, new_z, new_x, new_y, y_max);
    let mde = parseFloat($("#mde").val()) / 100;
    let x_max_A = get_x_max(Random_normal_Dist(0, std));
    let x_max_B = get_x_max(Random_normal_Dist(mde, std));
    update_area(svg, x_max_A, "A", new_z, new_x, new_y, std);
    update_area(svg, x_max_B, "B", new_z, new_x, new_y, std);
}

function get_x_max(distribution) {
    return d3.max(distribution, function (plot) { return plot.x_coordinate; });
}

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


function update_IC(svg, z, new_x, new_y, y_max) {
    svg.select('#IC_right')
        .attr('x1', new_x(z))
        .attr('y1', new_y(0))
        .attr('x2', new_x(z))
        .attr('y2', new_y(y_max));
}
