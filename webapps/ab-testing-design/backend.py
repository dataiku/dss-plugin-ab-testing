from flask import request
from distutils.util import strtobool
import json
import traceback
import dataiku
from dataiku.customwebapp import get_webapp_config

from design_experiment.sample_size import min_sample_size, z_value
from helpers import save_parameters
from constants import Parameters
from dku_tools import get_output_folder

config_settings = get_webapp_config()
project_key = dataiku.default_project_key()
client = dataiku.api_client()


@app.route('/sample_size', methods=['POST'])
def get_sample_size():
    try:
        config = json.loads(request.data)
        baseline_conversion_rate = float(config.get(Parameters.BCR.value))/100
        minimum_detectable_effect = float(config.get(Parameters.MDE.value))/100
        alpha = 1-float(config.get(Parameters.SIG_LEVEL.value))/100
        power = float(config.get(Parameters.POWER.value))/100
        ratio = float(config.get(Parameters.RATIO.value))/100
        reach = float(config.get(Parameters.REACH.value))/100
        two_tailed = strtobool(config.get(Parameters.TAIL.value))
        sample_size_A, sample_size_B = min_sample_size(baseline_conversion_rate, minimum_detectable_effect, alpha, power, ratio, two_tailed)
        sample_size_A = round(sample_size_A / reach)
        sample_size_B = round(sample_size_B / reach)
        return json.dumps({"sample_size_A": sample_size_A, "sample_size_B": sample_size_B})
    except:
        return traceback.format_exc(), 500

@app.route('/z_value', methods=['POST'])
def get_z_value():
    try:
        config = json.loads(request.data)
        alpha = 1-float(config.get(Parameters.SIG_LEVEL.value))/100
        two_tailed = strtobool(config.get(Parameters.TAIL.value))
        std = float(config.get("std"))
        z = std*z_value(alpha, two_tailed)
        return json.dumps({"z": z})
    except:
        return traceback.format_exc(), 500


@app.route('/write_parameters', methods=['POST'])
def save():
    try:
        output_folder = get_output_folder(config_settings, client, project_key)
        data = json.loads(request.data)
        fields_to_save = [Parameters.SIZE_A.value, Parameters.SIZE_B.value, Parameters.RATIO.value, Parameters.POWER.value,
                          Parameters.MDE.value, Parameters.TAIL.value, Parameters.TRAFFIC.value, Parameters.SIG_LEVEL.value, Parameters.BCR.value]
        save_parameters(data, output_folder, fields_to_save)
        return json.dumps({"status": "Parameters saved"})
    except:
        return traceback.format_exc(), 500
