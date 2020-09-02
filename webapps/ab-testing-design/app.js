set_form_default_values();
check_form_inputs();

// show / hide optional parameters 
let hide_parameters = true;
const advancedButton = document.getElementById('more');
advancedButton.addEventListener('click', function (event) {
    hide_parameters = display(hide_parameters, "more", "optional_fields", true, "Advanced parameters", "Less parameters");
    event.preventDefault();
});

// show / hide explanations of the different fields
explain_form_fields();

// show/ hide maths derivations
let hide_derivation = true;
const computation = document.getElementById('size_derivation');
computation.addEventListener('click', function (event) {
    hide_derivation = display(hide_derivation, "size_derivation", "derivation_text", true, "<div class='extra'> How is the sample size computed? </div>", "<div class='extra'> Hide </div>");
    event.preventDefault();
});


//Submit form 
const formButton = document.getElementById('submit_button');
let hide_duration = true;

formButton.addEventListener('click', function (event, hide_duration) {
    manage_size_computation(event, hide_duration);
}
);

// save parameters in the managed folder
let hide_attribution = true;
const attribution = document.getElementById('attribution_button');
attribution.addEventListener("click", function (event) {
    store_parameters()
        .then(function (response) {
            manage_response(response);
        }).catch(function (error) {
            console.log('There was an issue with the fetch operation ' + error.message);
        });
    display(hide_attribution, "attribution_button", "attribution_alert", false)
    event.preventDefault();
})

// visualization

// init distributions
let mde_val = parseFloat($("#mde").val()) / 100;
let std = get_std();
let distribution_A = Random_normal_Dist(0, std);
let distribution_B = Random_normal_Dist(mde_val, std);


// Line chart
let z_value = update_z_value(std);
let y_max = get_ymax(distribution_A, distribution_B);
let IC_line = [
    {
        x: z_value,
        y: 0
    },
    {
        x: z_value,
        y: y_max
    }
];

// area
let x_max_A = get_x_max(distribution_A);
let x_max_B = get_x_max(distribution_B);
let area_boundary_A = draw_area(x_max_A, z_value, 0, std);
let area_boundary_B = draw_area(x_max_B, z_value, mde_val, std);

Chart.defaults.scale.gridLines.drawOnChartArea = false;
new Chart(document.getElementById("chart"), {
    type: 'line',
    data: {
        datasets: [
        {
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
            data: IC_line,
            borderColor: "grey",
            fill: false,
            borderDash: [6],
            borderWidth: 1,
            label:"Confidence interval"
        },
        {
            data: area_boundary_A, 
            fill:true,
            borderWidth: 0,
            backgroundColor: "rgba(6, 82, 221,0.2)",
            label: "Significance level",

        },
        {
            data: area_boundary_B, 
            fill:true,
            borderWidth: 0,
            backgroundColor: "rgba(236, 204, 104,0.2)",
            label:"Power"
        }
        ]
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
