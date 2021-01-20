from flask import request
import dataiku
from distutils.util import strtobool
import json
import traceback
import numpy as np
import simplejson
from dataiku.customwebapp import get_webapp_config

from results.ab_calculator import compute_Z_score, compute_p_value
from results.statistics_helper import read_statistics
from dku_tools import get_output_folder
from helpers import save_parameters, check_int


def convert_numpy_int64_to_int(o):
    if isinstance(o, np.int64):
        return int(o)
    raise TypeError

@app.route('/ab_calculator', methods=['POST'])
def analyse_results():
    try:
        form_data = json.loads(request.data)
        check_int(form_data.get("size_A"), 'size A')
        check_int(form_data.get("size_B"), 'size B')
        size_A = form_data.get("size_A")
        size_B = form_data.get("size_B")
        CR_A = float(form_data.get("success_rate_A"))/100
        CR_B = float(form_data.get("success_rate_B"))/100
        if (CR_A > 1) or (CR_B > 1):
            raise ValueError('Success rate must be between 0-100%')
        two_tailed = strtobool(form_data.get("tail"))
        Z_score = round(compute_Z_score(size_A, size_B, CR_A, CR_B), 3)
        p_value = round(compute_p_value(Z_score, two_tailed), 3)
        return simplejson.dumps({"Z_score": Z_score, "p_value": p_value}, ignore_nan=True, default=convert_numpy_int64_to_int)
    except:
        return traceback.format_exc(), 500


@app.route("/statistics", methods=["POST"])
def get_statistics():
    try:
        dataset_name = json.loads(request.data).get("dataset_name")
        column_name = json.loads(request.data).get("column_name")
        if dataset_name:
            dataset = dataiku.Dataset(dataset_name)
            df = dataset.get_dataframe()
        else:
            raise ValueError("Statistics dataset is missing, specify it in the settings or edit sizes and success rates manually.")
        if column_name:
            response = read_statistics(df, column_name)
            return response
        else:
            raise ValueError(
                "AB group column name is missing, specify it in the settings or edit sizes and success rates manually.")
    except:
        return traceback.format_exc(), 500


@app.route('/write_parameters', methods=['POST'])
def save():
    try:
        config = get_webapp_config()
        project_key = dataiku.default_project_key()
        client = dataiku.api_client()
        output_folder = get_output_folder(config, client, project_key)
        data = json.loads(request.data)
        fields_to_save = ["size_A", "size_B", "success_rate_A", "success_rate_B", "uplift", "p_value", "z_score"]
        save_parameters(data, output_folder, fields_to_save)
        return json.dumps({"status": "Parameters saved"})
    except:
        return traceback.format_exc(), 500