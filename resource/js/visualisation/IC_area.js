function draw_area(x_max, z_value, mean, std) {
    var line = new Array();
    for (var i = x_max; i > z_value; i -= 1 / 300) {
        line.push({
            x: i,
            y: jStat.normal.pdf(i, mean, std)
        });
    };
    line.push({x:z_value, y: jStat.normal.pdf(i, mean, std)})
    return line;
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

function get_x_max(distribution) {
    return d3.max(distribution, function (plot) { return plot.x; });
}