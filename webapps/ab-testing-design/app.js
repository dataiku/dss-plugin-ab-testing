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
    manage_size_computation(event, svg, height, width, hide_duration);
}
);

// visualization

// set up canvas 
const margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
let svg = set_up_canvas(margin, width, height);

// init distributions
let mde_val = parseFloat($("#mde").val()) / 100;
let std = get_std();
let distribution_A = Random_normal_Dist(0, std);
let distribution_B = Random_normal_Dist(mde_val, std);


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


// Line chart
let z_value = update_z_value(std);
let y_max = get_ymax(distribution_A, distribution_B);
let IC_line = [
    {
        x : z_value,
        y : 0
    },
    {
        x : z_value,
        y : y_max
    }
];

Chart.defaults.scale.gridLines.drawOnChartArea = false;

new Chart(document.getElementById("chart"), {
    type: 'line',
    data: {
        datasets: [{
            data: distribution_A,
            borderColor: "rgb(54,163,158)",
            fill: false
        },
        {
            data: distribution_B,
            borderColor: "#ff7979",
            fill: false
        },
        {
            data:IC_line,
            borderColor: "grey",
            fill:false,
            borderDash: [6],
            borderWidth: 1
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
            display: false
        },
        scales: {
            xAxes: [{
                type: 'linear'
            }]
        }
    }
});
