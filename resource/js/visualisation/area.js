function draw_area(distribution, z_value, mean, std) {
    let x_max = get_x_max(distribution);
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
