from io import StringIO
from dataiku.core.dkujson import dumps
import datetime


def save_parameters(variables, folder, fields_to_save):
    tracking = {key: variables[key] for key in variables if key in fields_to_save}
    filename = str(datetime.datetime.now()) + ".json"
    parameters = StringIO()
    parameters.write(dumps(tracking))
    parameters.seek(0)
    folder.upload_stream(filename, parameters)
