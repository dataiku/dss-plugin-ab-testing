from io import StringIO
from dataiku.core.dkujson import dumps
import time
from design_experiment.constants import Parameters


def save_parameters(variables, folder):
    fields = [Parameters.SIZE_A, Parameters.SIZE_B, Parameters.RATIO, Parameters.POWER,
              Parameters.MDE, Parameters.TAIL, Parameters.TRAFFIC, Parameters.SIG_LEVEL, Parameters.BCR]
    tracking = {key: variables[key] for key in variables if key in fields}
    filename = str(time.time())[:5] + ".json"
    parameters = StringIO()
    parameters.write(dumps(tracking))
    parameters.seek(0)
    folder.upload_stream(filename, parameters)
