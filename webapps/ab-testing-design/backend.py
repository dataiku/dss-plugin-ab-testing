from flask import request
from distutils.util import strtobool
import json
import logging
import dataiku
from dataiku.customwebapp import get_webapp_config

from design_experiment.sample_size import min_sample_size, z_value
from design_experiment.helpers import save_parameters
from design_experiment.constants import Parameters

try:
    folder_name = get_webapp_config()["input_folder"]
except KeyError:
    raise SystemError("No folder has been chosen in the settings of the webapp")

folder = dataiku.Folder(folder_name)
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="AB_testing %(levelname)s - %(message)s")


@app.route('/sample_size', methods=['POST'])
def get_sample_size():
    baseline_conversion_rate = float(request.form.get(Parameters.BCR.value))/100
    minimum_detectable_effect = float(request.form.get(Parameters.MDE.value))/100
    alpha = 1-float(request.form.get(Parameters.SIG_LEVEL.value))/100
    power = float(request.form.get(Parameters.POWER.value))/100
    ratio = float(request.form.get(Parameters.RATIO.value))/100
    reach = float(request.form.get(Parameters.REACH.value))/100
    two_tailed = strtobool(request.form.get(Parameters.TAIL.value))
    n_A, n_B = min_sample_size(baseline_conversion_rate, minimum_detectable_effect, alpha, power, ratio, two_tailed)
    n_A = n_A / reach
    n_B = n_B / reach
    return json.dumps({"n_A": n_A, "n_B": n_B})


@app.route('/z_value', methods=['POST'])
def get_z_value():
    alpha = 1-float(request.form.get(Parameters.SIG_LEVEL.value))/100
    two_tailed = strtobool(request.form.get(Parameters.TAIL.value))
    std = float(request.form.get("std"))
    z = std*z_value(alpha, two_tailed)
    return json.dumps({"z": z})


@app.route('/write_parameters', methods=['POST'])
def save():
    data = request.form
    save_parameters(data, folder)
    return json.dumps({"status": "Parameters saved"})
