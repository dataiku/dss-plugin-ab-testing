import dataiku
from dataiku.customrecipe import get_input_names_for_role, get_output_names_for_role
from typing import List

from design_experiment.constants import SizeDefinition, AttributionMethod, Parameters


def get_input_output() -> tuple:
    """Returns input and output datasets after sanity check

    :raises: :class:`ValueError`: Missing input or output dataset(s)

    :returns: input and output datasets
    :rtype: tuple
    """
    input_names = get_input_names_for_role("user_list")
    if len(input_names) == 0:
        raise ValueError("No input dataset.")
    output_names = get_output_names_for_role("groups")
    if len(output_names) == 0:
        raise ValueError("No output dataset.")

    input_name = input_names[0]
    input_dataset = dataiku.Dataset(input_name)
    folder_ref = get_input_names_for_role('folder')

    output_name = output_names[0]
    output_dataset = dataiku.Dataset(output_name)

    return input_dataset, folder_ref, output_dataset


def get_parameters(config: dict, folder_ref: str) -> tuple:
    """Returns recipe parameters after sanity check

    :param dict config: parameters defined in the recipe settings
    :param str folder_ref: reference to the input folder containing the experiment parameters
    :raises: :class:`ValueError`: Missing parameters

    :returns: Parameters
    :rtype: tuple
    """
    reference_column = config.get("user_reference", None)
    size_definition = SizeDefinition(config.get("sample_size_definition", SizeDefinition.WEB_APP))
    attribution_method = AttributionMethod(config.get("attribution_method", AttributionMethod.LEFTOVER_TO_A))
    if not reference_column:
        raise ValueError("Reference column is missing")
    if not size_definition:
        raise ValueError("Size definition is missing")

    filename = config.get("parameters", None)
    size_A = config.get("size_A", None)
    size_B = config.get("size_B", None)
    if size_definition == SizeDefinition.MANUAL and size_A and size_B:
        if size_A < 0 or size_B < 0:
            raise ValueError("Sample sizes need to be positive")
    elif folder_ref:
        size_A, size_B = get_folder_parameters(folder_ref, filename)
    elif size_definition == SizeDefinition.WEB_APP:
        raise ValueError("The input folder is missing")
    return reference_column, size_definition, attribution_method, size_A, size_B


def get_folder_parameters(folder_ref: List[str], filename: str):
    """Extracts sample sizes from the managed folder

    :param str filename: name of the json containing the experiment parameters
    :raises: :class:`ValueError`: Missing folder or filename.

    :returns: sample sizes
    :rtype: tuple
    """
    folder = dataiku.Folder(folder_ref)
    paths = folder.list_paths_in_partition()
    if len(paths) == 0:
        raise ValueError("The input folder is empty")
    else:
        if filename:
            if filename in paths:
                tracking = folder.read_json(filename)
                size_A = int(tracking[Parameters.SIZE_A])
                size_B = int(tracking[Parameters.SIZE_B])
                return size_A, size_B
            else:
                raise ValueError(
                    "The parameter's file is not in the managed folder. It should be a json file created from the Web App 'AB testing design'. This web app is a component of the same plugin")
        else:
            raise ValueError(
                "The parameters' filename is missing. It should point to a json file created from the Web App 'AB testing design'. This web app is a component of the same plugin")
