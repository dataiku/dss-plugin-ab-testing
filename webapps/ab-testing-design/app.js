set_form_default_values();
check_form_inputs();

// show / hide optional parameters 
let hide_parameters = true;
const advancedButton = document.getElementById('more');
advancedButton.addEventListener('click', function (event) {
    hide_parameters = display(hide_parameters, "more", "optional_fields", true, "More parameters", "Less parameters");
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
const formButton = document.getElementById("submit_button");
let hide_duration = true;

formButton.addEventListener("click", function (event, hide_duration) {
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

//init axes
let x = build_x_axis(distribution_A, distribution_B, width);
let y_max = get_ymax(distribution_A, distribution_B);
let y = build_y_axis(distribution_A, distribution_B, height);

// init plots
draw_initial_x_axis(svg, x, height);
draw_initial_IC(svg, x, y, y_max);
draw_initial_plots(svg, x, y, std, mde_val);
draw_initial_area(svg, x, y, distribution_A, distribution_B, std);
set_initial_legend(svg, y_max);

//update distributions and axis
let bcr = document.getElementById('bcr');
bcr.addEventListener('change', function () {
    let mde = parseFloat($('#mde').val()) / 100;
    let std = get_std();
    let y_max = get_ymax(Random_normal_Dist(0, std), Random_normal_Dist(mde, std));
    let new_axes = update_axes(svg, height, width, std);

    update_plots_with_new_sd(svg, new_axes, std, y_max);
    update_rejection_zone(svg, std, y_max, height, width);
});

let mde = document.getElementById('mde');
mde.addEventListener('change', function () {
    let mde = parseFloat(this.value) / 100;
    let new_axes = update_axes(svg, height, width, get_std());
    let new_x = new_axes[0];
    let new_y = new_axes[1];
    let std = get_std();
    let y_max = get_ymax(Random_normal_Dist(0, std), Random_normal_Dist(mde, std));

    update_distribution(svg, 0, "A", new_x, new_y, std);
    update_distribution(svg, mde, "B", new_x, new_y, std);
    update_rejection_zone(svg, std, y_max, height, width);
});

const sig_level = document.getElementById('sig_level');
sig_level.addEventListener('change', function (event) {
    let mde = parseFloat($('#mde').val()) / 100;
    let std = get_std();
    let y_max = get_ymax(Random_normal_Dist(0, std), Random_normal_Dist(mde, std));

    update_legend(svg, "Significance level", parseFloat(this.value), "label_sig_level", true);
    update_legend(svg, "Power", "compute size", "label_power", false);
    update_rejection_zone(svg, std, y_max, height, width);
});

// update legend
const power = document.getElementById('power');
power.addEventListener('change', function () {
    update_legend(svg, "Power", "compute size", "label_power", false);
});

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

