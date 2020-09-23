import dataiku
from dataiku.customrecipe import get_input_names_for_role, get_output_names_for_role

from constants import SizeDefinition, AttributionMethod, Parameters


def get_design_input_output() -> tuple:
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
    if len(folder_ref) == 0:
        folder_name = None
    else:
        folder_name = folder_ref[0]

    output_name = output_names[0]
    output_dataset = dataiku.Dataset(output_name)

    return input_dataset, folder_name, output_dataset


def get_design_parameters(config: dict, folder_ref: str) -> tuple:
    """Returns recipe parameters after sanity check

    :param dict config: parameters defined in the recipe settings
    :param str folder_ref: reference to the input folder containing the experiment parameters
    :raises: :class:`ValueError`: Missing parameters

    :returns: Parameters
    :rtype: tuple
    """
    reference_column = config.get("user_reference", None)
    size_definition = SizeDefinition(config.get("sample_size_definition", SizeDefinition.WEB_APP))
    leftovers_handling = AttributionMethod(config.get("leftovers_handling", AttributionMethod.LEFTOVER_TO_A))
    if not reference_column:
        raise ValueError("Reference column is missing")
    if not size_definition:
        raise ValueError("Size definition is missing")

    filename = config.get("parameters", None)
    size_A = config.get("size_A", None)
    size_B = config.get("size_B", None)
    if size_definition == SizeDefinition.MANUAL:
        if size_A and size_B:
            if size_A < 0 or size_B < 0:
                raise ValueError("Sample sizes need to be positive")
        else:
            raise ValueError("Sample sizes need to be defined under manual mode.")
    elif size_definition == SizeDefinition.WEB_APP:
        if folder_ref:
            size_A, size_B = get_folder_parameters(folder_ref, filename)
        else:
            raise ValueError(
                "The input folder is missing. It is mandatory under folder mode. From the Wep APP 'AB testing design', you can save sample sizes in a managed folder and reuse them in this recipe. You may also enter sample sizes manually by choosing the manual mode.")
    else:
        raise ValueError("The size definition is invalid.")
    return reference_column, size_definition, leftovers_handling, size_A, size_B


def get_results_input_output() -> tuple:
    """Returns input and output datasets after sanity check

    :raises: :class:`ValueError`: Missing input or output dataset(s)

    :returns: input and output datasets
    :rtype: tuple
    """
    input_names = get_input_names_for_role("results")
    output_names = get_output_names_for_role('statistics')
    if len(input_names) == 0:
        raise ValueError("No input dataset.")
    if len(output_names) == 0:
        raise ValueError("No output dataset.")

    input_dataset = dataiku.Dataset(input_names[0])
    output_dataset = dataiku.Dataset(output_names[0])
    return input_dataset, output_dataset


def get_results_parameters(config: dict) -> tuple:
    """Returns recipe parameters after sanity check

    :param dict config: parameters defined in the recipe settings
    :raises: :class:`ValueError`: Missing parameters

    :returns: Parameters
    :rtype: tuple
    """
    reference_column = config.get("user_reference", None)
    group_column = config.get("group_column", None)
    conversion_column = config.get("conversion_column", None)

    if not reference_column:
        raise ValueError("User reference column is missing")
    if not group_column:
        raise ValueError("Group column is missing")
    if not conversion_column:
        raise ValueError("Conversion column is missing")
    return reference_column, group_column, conversion_column


def get_folder_parameters(folder_ref: str, filename: str):
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
                size_A = int(tracking[Parameters.SIZE_A.value])
                size_B = int(tracking[Parameters.SIZE_B.value])
                return size_A, size_B
            else:
                raise ValueError(
                    "The parameter's file is not in the managed folder. It should be a json file created from the Web App 'AB testing design'. This web app is a component of the same plugin")
        else:
            raise ValueError(
                "The parameters' filename is missing. It should point to a json file created from the Web App 'AB testing design'. This web app is a component of the same plugin")


def get_output_folder(config, client, project_key):
    output_managed_id = config.get('output_managed_folder', None)
    output_new_folder_name = config.get('output_new_folder_name', None)
    project = client.get_project(project_key)

    if output_managed_id == "create_new_folder":
        if output_new_folder_name:
            project_managed_folders = client.get_project(project_key).list_managed_folders()
            managed_folders = [mf["name"] for mf in project_managed_folders]
            if output_new_folder_name in managed_folders:
                raise ValueError("The managed folder '{}' already exists. Please rename it.".format(output_new_folder_name))
            else:
                output_folder_dss = project.create_managed_folder(output_new_folder_name)
        else:
            raise ValueError("The name for the input folder is missing.")
    elif output_managed_id:
        output_folder_dss = project.get_managed_folder(output_managed_id)
    else:
        raise ValueError("The output folder parameter is missing. Create or select one from the setting of the web app")
    output_folder = dataiku.Folder(output_folder_dss.get_definition()['name'], project_key=project_key)
    return output_folder
