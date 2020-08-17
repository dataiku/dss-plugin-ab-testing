from dataiku.customrecipe import get_recipe_config

from dku_tools import get_input_output, get_parameters
from design_experiment.ab_dispatcher import AbDispatcher

# ==============================================================================
# SETUP
# ==============================================================================

input_dataset, folder_ref, output_dataset = get_input_output()
input_df = input_dataset.get_dataframe()
config = get_recipe_config()
reference_column, size_definition, attribution_method, size_A, size_B = get_parameters(config, folder_ref)

# ==============================================================================
# RUN
# ==============================================================================
ab_dispatcher = AbDispatcher(size_A, size_B)
groups_df = ab_dispatcher.dispatch(input_df, reference_column, attribution_method)

# ===============================================================================
# WRITE
# ===============================================================================
output_dataset.write_with_schema(groups_df)
