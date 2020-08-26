function set_initial_legend(svg, y_max, height){
    const x_legend = height;
    const y_legend = y_max - 25
    plot_legend(svg, x_legend, y_legend, "Statistical significance", "#4393c3", $("#sig_level").val(), "label_sig_level");
    plot_legend(svg, x_legend, y_legend + 20, "Power", "#fdae61", $("#power").val(), "label_power");
}

function plot_legend(svg, x, y, label, color, value, id_text) {
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

function update_legend(svg, label, new_value, id, percentage) {
    if (percentage) {
        var new_text = label + ": " + new_value + "%";
    } else {
        var new_text = label + ": " + new_value;
    }
    svg.select("#" + id)
        .text(new_text);
}