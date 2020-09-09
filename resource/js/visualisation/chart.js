function plot_chart($scope) {
    let y_max = get_ymax($scope);
    let x_max = get_xmax($scope.distribution_B);
    let suggested_x_max = Math.ceil(x_max / 0.05) * 0.05
    suggested_x_max = suggested_x_max.toFixed(2);

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
                    type: 'linear',
                    ticks: {
                        suggestedMin: -suggested_x_max + $scope.bcr / 100,
                        suggestedMax: suggested_x_max
                    }
                }],
                yAxes: [{
                    ticks: {
                        suggestedMax: Math.ceil(y_max / 10) * 10
                    }
                }]
            }
        }
    });
    return chart;
}

function update_chart($scope) {
    let mde = $scope.mde / 100;
    let bcr = $scope.bcr / 100;
    $scope.std = Math.sqrt(bcr * (1 - bcr) * (1 / $scope.sample_size_A + 1 / $scope.sample_size_B) * 100 / $scope.reach);
    $scope.distribution_A = Random_normal_Dist(0, $scope.std);
    $scope.distribution_B = Random_normal_Dist(mde, $scope.std);

    $scope.chart.config.data.datasets = get_datasets($scope);
    update_axes_bound($scope);
    $scope.chart.update(0);
}

function erase_chart($scope) {
    $scope.chart.config.data.datasets = [];
    $scope.chart.update(0);
}

function get_datasets($scope) {
    let sig_level = $scope.sig_level / 100;
    let z_value = compute_z_value($scope.std, 1 - sig_level, $scope.tail);

    let CI_line = get_CI($scope, z_value);
    let area_boundary_A = draw_area($scope.distribution_A, z_value, 0, $scope.std);
    let area_boundary_B = draw_area($scope.distribution_B, z_value, $scope.mde / 100, $scope.std);

    chart_datasets = [{
        data: $scope.distribution_A,
        borderColor: "rgba(47, 53, 66,1.0)",
        fill: false,
        label: "H0"
    },
    {
        data: $scope.distribution_B,
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

function update_axes_bound($scope) {
    let y_max = get_ymax($scope);
    $scope.chart.options.scales.yAxes[0].ticks = { suggestedMax: Math.ceil(y_max / 10) * 10 };
    let x_max = get_xmax($scope.distribution_B);
    let suggested_max = Math.ceil(x_max / 0.05) * 0.05;
    suggested_max = suggested_max.toFixed(2);
    $scope.chart.options.scales.xAxes[0].ticks = { suggestedMax: suggested_max, suggestedMin: -suggested_max + $scope.mde / 100 };
}

function get_CI($scope, z_value) {
    let y_max = get_ymax($scope);
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
    let x_max = get_xmax(distribution);
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
