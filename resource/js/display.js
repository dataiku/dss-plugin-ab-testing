// Display or hide elements (fields, explanations...)

function explain_form_fields(){
    explain("bcr");
    explain("mde");
    explain("sig_level");
    explain("power");
    explain("ratio");
    explain("tail");
}


//show descriptions of the input fields
function explain(parameter) {
    const info_button = document.getElementById('info_' + parameter);
    let hide = true;
    info_button.addEventListener('click', function (event) {
        hide = display(hide, "info_" + parameter, "explanation_" + parameter, true, "[Info]", "[Hide]");
        event.preventDefault();
    });
}


/**
 * Display or hide a given text when you click on a button.
 * Eventually, the text displayed on the button may change.
 * @param {boolean} hide - True if the text is hidden, false otherwise
 * @param {string} button_id - Id of the button that controls the display of the text
 * @param {string} text_id - Id of the text that you want to display or hide
 * @param {boolean} change_button - True if the text displayed on the button should change. For ex- switch from "Show" to "Hide"
 * @param {string} default_text - Text displayed when the text is hidden. For ex - "Show"
 * @param {boolean} default_text - Text displayed on the button when the field is displayed. For ex - "Hide"
 * @return {boolean} - Is the text now displayed or hidden? 
 */
function display(hide, button_id, text_id, change_button, default_text, replacement_text) {
    const button = $("#" + button_id);
    let optional_text = $("#" + text_id);
    if (hide) {
        if (change_button) {
            button.html(replacement_text);
        }
        optional_text.removeClass('d-none');
        hide = false;
    } else {
        if (change_button) {
            button.html(default_text);
        }
        optional_text.addClass('d-none');
        hide = true
    };
    return hide;
}
