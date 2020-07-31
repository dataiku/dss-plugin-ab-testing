function draw_initial_plots(svg, x, y, std, mde_val) {
    let line = d3.line()
        .x(function (distribution) { return x(distribution.x_coordinate); })
        .y(function (distribution) { return y(distribution.y_coordinate); });

    svg.append("path")
        .datum(Random_normal_Dist(0, std))
        .attr("class", "line")
        .attr("d", line)
        .attr("id", "A_plot")
        .style("stroke-width", 2.5)
        .style("stroke", "rgb(54,163,158)")
        .style("fill", "none");

    svg.append("path")
        .datum(Random_normal_Dist(mde_val, std))
        .attr("class", "line")
        .attr("d", line)
        .attr("id", "B_plot")
        .style("stroke-width", 2.5)
        .style("stroke", "#ff7979")
        .style("fill", "none");
}

function update_plots_with_new_sd(svg, new_axes, std, y_max) {
    let new_x = new_axes[0];
    let new_y = new_axes[1];
    let mde_plot = parseFloat($("#mde").val()) / 100;

    update_distribution(svg, 0, "A", new_x, new_y, std);
    update_distribution(svg, mde_plot, "B", new_x, new_y, std);
    svg.select('#IC_right')
        .attr('y2', y_max);
}

function update_distribution(svg, new_mean, group, x, y, std) {
    let updated_line = d3.line()
        .x(function (distribution) { return x(distribution.x_coordinate); })
        .y(function (distribution) { return y(distribution.y_coordinate); });
    svg.select("#" + group + "_plot")
        .datum(Random_normal_Dist(new_mean, std))
        .attr("class", "line")
        .attr("d", updated_line);
}