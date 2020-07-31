function set_up_canvas(margin, width, height) {
    let svg = d3.select(".plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    return svg;
}

function update_canvas(svg, height, width) {
    let std = get_std();
    let mde = parseFloat($("#mde").val()) / 100;
    let y_max = get_ymax(Random_normal_Dist(0, std), Random_normal_Dist(mde, std));
    let new_axes = update_axes(svg, height, width, std);
    update_plots_with_new_sd(svg, new_axes, std, y_max);
    update_rejection_zone(svg, std, y_max, height, width);
    update_legend(svg, "Power", $("#power").val(), "label_power", true);
}