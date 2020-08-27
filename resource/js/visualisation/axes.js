function draw_initial_x_axis(svg, x, height) {
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .attr("id", "x_axis")
        .call(d3.axisBottom(x));
}


function update_axes(svg, height, width) {
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


function build_y_axis(distribution_A, distribution_B, height) {
    let y_max = get_ymax(distribution_A, distribution_B);
    let y = d3.scaleLinear().domain([0, y_max])
        .range([height, 0]);
    return y;
}


function get_ymax(distribution_A, distribution_B) {
    let y_A = d3.max(distribution_A, function (distribution) { return distribution.y_coordinate; });
    let y_B = d3.max(distribution_B, function (distribution) { return distribution.y_coordinate; });
    let y_max = d3.max([y_A, y_B]);
    return y_max;
}


function Random_normal_Dist(mean, sd) {
    let data = [];
    for (var i = mean - 4 * sd; i < mean + 4 * sd; i += 1 / 1000) {
        let x_coordinate = i
        let y_coordinate = jStat.normal.pdf(i, mean, sd);
        let arr = {
            x: x_coordinate,
            y: y_coordinate
        }
        data.push(arr);
    };
    return data;
}