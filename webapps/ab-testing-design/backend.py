from flask import request
from distutils.util import strtobool
import json

from design.sample_size import min_sample_size, z_value
from design.ab_split import set_size_variables


@app.route('/sample_size', methods=['POST'])
def get_sample_size():
    bcr = float(request.form.get("bcr"))/100
    mde = float(request.form.get("mde"))/100
    alpha = 1-float(request.form.get("sig_level"))/100
    power = float(request.form.get("power"))/100
    ratio = float(request.form.get("ratio"))/100
    two_tailed = strtobool(request.form.get("tail"))
    n_A, n_B = min_sample_size(bcr=bcr, mde=mde, sig_level=alpha,
                               min_power=power, size_ratio=ratio, two_tailed=two_tailed)
    return json.dumps({"n_A": n_A, "n_B": n_B})


@app.route('/z_value', methods=['POST'])
def get_z_value():
    alpha = 1-float(request.form.get("sig_level"))/100
    two_tailed = strtobool(request.form.get("tail"))
    std = float(request.form.get("std"))
    z = std*z_value(alpha, two_tailed)
    return json.dumps({"z": z})


@app.route('/set_variables', methods=['POST'])
def set_variables():
    form = request.form
    set_size_variables(form)
    return json.dumps({"status": "ok"})
