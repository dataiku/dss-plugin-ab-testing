function Random_normal_Dist(mean, sd) {
    let data = [];
    for (var i = mean - 4 * sd; i < mean + 4 * sd; i += 1 / 5000) {
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

function compute_z_value(std, alpha, tail) {
    let two_tailed = (tail == "true");
    if (two_tailed) {
        var p = 1 - alpha / 2;
    } else {
        var p = 1 - alpha;
    }
    let z = jStat.normal.inv(p, 0, 1) * std;
    return z;
}

function get_xmax(distribution) {
    return d3.max(distribution, function (plot) { return plot.x; });
}

function get_ymax($scope) {
    let y_A = d3.max($scope.distribution_A, function (distribution) { return distribution.y; });
    let y_B = d3.max($scope.distribution_B, function (distribution) { return distribution.y; });
    let y_max = d3.max([y_A, y_B]);
    return y_max;
}

