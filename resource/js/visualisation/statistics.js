function get_std() {
    let bcr = parseFloat($('#bcr').val()) / 100;
    let new_size_A = parseFloat($("#sample_size_A").html());
    let new_size_B = parseFloat($("#sample_size_B").html());
    let std = Math.sqrt(bcr * (1 - bcr) * (1 / new_size_A + 1 / new_size_B));
    return std;
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

function get_ymax(distribution_A, distribution_B) {
    let y_A = d3.max(distribution_A, function (distribution) { return distribution.y; });
    let y_B = d3.max(distribution_B, function (distribution) { return distribution.y; });
    let y_max = d3.max([y_A, y_B]);
    return y_max;
}
