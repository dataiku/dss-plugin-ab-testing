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
            "x_coordinate": x_coordinate,
            "y_coordinate": y_coordinate
        }
        data.push(arr);
    };
    return data;
}
