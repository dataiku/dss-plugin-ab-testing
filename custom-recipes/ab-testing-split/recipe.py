from dataiku.customrecipe import get_recipe_config

from dku_tools import get_design_input_output, get_design_parameters
from design_experiment.ab_dispatcher import AbDispatcher

# ==============================================================================
# SETUP
# ==============================================================================

input_dataset, folder_ref, output_dataset = get_design_input_output()
input_df = input_dataset.get_dataframe()
config = get_recipe_config()
reference_column, size_definition, leftovers_handling, size_A, size_B = get_design_parameters(config, folder_ref)

# ==============================================================================
# RUN
# ==============================================================================
ab_dispatcher = AbDispatcher(size_A, size_B)
groups_df = ab_dispatcher.dispatch(input_df, reference_column, leftovers_handling)

# ===============================================================================
# WRITE
# ===============================================================================
output_dataset.write_with_schema(groups_df)
