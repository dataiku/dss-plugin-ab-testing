import dataiku
from dataiku.customrecipe import get_input_names_for_role, get_output_names_for_role


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
