function test_outcome($scope) {
    let sig_level = $scope.sig_level / 100;
    let confidence_level = 1 - $scope.p_value;
    let displayed_confidence = (confidence_level * 100).toFixed(2);
    let difference = $scope.success_rate_A / 100 - $scope.success_rate_B / 100;
    let displayed_difference = Math.round(difference * 100);
    let conclusion = $("#result_caption");
    if (difference > 0) {
        var message = "<div class='dku-box p-3 text-r'> <div>Variant A is " + displayed_difference + "% better than variant B with a <b>" + displayed_confidence + "% confidence level.</b></div> ";
    } else {
        displayed_difference = - displayed_difference
        var message = "<div class='dku-box p-3 text-r'> <div>Variant B is " + displayed_difference + "% better than variant A with a <b>" + displayed_confidence + "% confidence level. </b> </div>";
    };
    if (confidence_level >= sig_level) {
        message += "<div id = 'significance' >These results are statistically significant within <b>" + $scope.sig_level + "% significance level</b>.</div></div>";
        conclusion.html(message);
        $("#significance").addClass("green");
        $("#confidence").addClass("green");
        $("#p_value").addClass("green");
        var is_significant = true;
    } else {
        message += "<div id = 'significance' >These results are not statistically significant within <b>" + $scope.sig_level + "% significance level </b></div></div>";
        conclusion.html(message);
        $("#significance").addClass("red");
        $("#p_value").removeClass("green");
        $("#p_value").addClass("red");
        $("#confidence").addClass("red");
        var is_significant = false;
    };
    $("#save-section").removeClass("d-none");
    $("#save-caption").addClass("d-none");
    return is_significant;
}

function plot_results_chart($scope) {
    Chart.defaults.scale.gridLines.drawOnChartArea = false;
    $scope.chart = new Chart(document.getElementById("chart"), {
        type: 'line',
        data: {
            datasets: [{
                data: Random_normal_Dist(0, 1),
                borderColor: "rgba(47, 53, 66,1.0)",
                fill: false,
                label: "H0",
                pointStyle: 'line'
            }]
        },
        "options": {
            elements: {
                point: {
                    radius: 0
                }
            },
            legend: {
                display: true,
                labels:{
                    usePointStyle: true,
                    fontSize: 11,
                    fontColor: "#222222",
                    fontFamily: "'Source Sans Pro', sans-serif"
                }
            },
            scales: {
                xAxes: [{
                    type: 'linear'
                }]
            }
        }
    });
}


function get_results_datasets($scope) {
    let y_max = d3.max($scope.distribution, function (distribution) { return distribution.y; });
    let z_value = compute_z_value(1, 1 - $scope.sig_level / 100, $scope.tail);
    let CI_line = get_CI(y_max, z_value);
    let area_boundary = draw_area($scope.distribution, z_value, 0, 1);

    if ($scope.test_is_significant) {
        var area_color = "rgb(0, 148, 50,0.3)"
    }
    else {
        var area_color = "rgb(234, 32, 39,0.3)"
    }

    let Z_score_point = [{
        x: $scope.z_score,
        y: 0
    },
    {
        x: $scope.z_score,
        y: 0.03
    }];

    let updated_datasets = [{
        data: $scope.distribution,
        borderColor: "rgba(47, 53, 66,1.0)",
        fill: false,
        label: "H0",
        pointStyle: 'line',
    }, {
        data: CI_line,
        borderColor: "grey",
        fill: false,
        borderDash: [6],
        borderWidth: 1,
        label: "Confidence interval",
        pointStyle: 'line'
    },
    {
        data: area_boundary,
        fill: true,
        borderWidth: 4,
        backgroundColor: area_color,
        borderColor: area_color,
        label: "Significance level",
        pointStyle: 'line'
    },
    {
        data: Z_score_point,
        borderColor: "#3B99FC",
        fill: false,
        borderWidth: 4,
        label: "Your AB score",
        pointStyle: 'line'
    },
    ];
    return updated_datasets;
}