function plot_chart($scope) {
    Chart.defaults.scale.gridLines.drawOnChartArea = false;
    chart = new Chart(document.getElementById("chart"), {
        type: 'line',
        data: {
            datasets: get_datasets($scope)
        },
        "options": {
            elements: {
                point: {
                    radius: 0
                }
            },
            legend: {
                display: true
            },
            scales: {
                xAxes: [{
                    type: 'linear'
                }]
            }
        }
    });
    return chart;
}

function update_chart($scope) {
    $scope.chart.config.data.datasets = get_datasets($scope);
    $scope.chart.update(0);
}

function erase_chart($scope){
    $scope.chart.config.data.datasets =[];
    $scope.chart.update(0);
}

function get_datasets($scope) {
    let mde = $scope.mde / 100;
    let sig_level = $scope.sig_level / 100;
    let bcr = $scope.bcr / 100;
    let std = Math.sqrt(bcr * (1 - bcr) * (1 / $scope.sample_size_A + 1 / $scope.sample_size_B) * 100 / $scope.reach);
    let distribution_A = Random_normal_Dist(0, std);
    let distribution_B = Random_normal_Dist(mde, std);
    let z_value = compute_z_value(std, 1 - sig_level, $scope.tail);

    let CI_line = get_CI(distribution_A, distribution_B, z_value)
    let area_boundary_A = draw_area(distribution_A, z_value, 0, std);
    let area_boundary_B = draw_area(distribution_B, z_value, mde, std);

    chart_datasets = [{
        data: distribution_A,
        borderColor: "rgba(47, 53, 66,1.0)",
        fill: false,
        label: "H0"
    },
    {
        data: distribution_B,
        borderColor: "#ffc845",
        fill: false,
        label: "H1"
    },
    {
        data: CI_line,
        borderColor: "grey",
        fill: false,
        borderDash: [6],
        borderWidth: 1,
        label: "Confidence interval"
    },
    {
        data: area_boundary_A,
        fill: true,
        borderWidth: 0,
        backgroundColor: "rgba(6, 82, 221,0.2)",
        label: "Significance level"
    },
    {
        data: area_boundary_B,
        fill: true,
        borderWidth: 0,
        backgroundColor: "rgba(236, 204, 104,0.2)",
        label: "Power"
    }]
    return chart_datasets
}

function get_CI(distribution_A, distribution_B, z_value) {
    let y_max = get_ymax(distribution_A, distribution_B);
    let CI_line = [
        {
            x: z_value,
            y: 0
        },
        {
            x: z_value,
            y: y_max
        }
    ];
    return CI_line;
}

function draw_area(distribution, z_value, mean, std) {
    let x_max = get_x_max(distribution);
    var line = new Array();
    for (var i = x_max; i > z_value; i -= 1 / 5000) {
        line.push({
            x: i,
            y: jStat.normal.pdf(i, mean, std)
        });
    };
    line.push({ x: z_value, y: jStat.normal.pdf(i, mean, std) })
    return line;
}
