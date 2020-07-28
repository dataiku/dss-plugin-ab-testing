# Code for custom code recipe compute-results-statistics (imported from a Python recipe)

# To finish creating your custom recipe from your original PySpark recipe, you need to:
#  - Declare the input and output roles in recipe.json
#  - Replace the dataset names by roles access in your code
#  - Declare, if any, the params of your custom recipe in recipe.json
#  - Replace the hardcoded params values by acccess to the configuration map

# See sample code below for how to do that.
# The code of your original recipe is included afterwards for convenience.
# Please also see the "recipe.json" file for more information.

# import the classes for accessing DSS objects from the recipe
import dataiku
# Import the helpers for custom recipes
from dataiku.customrecipe import *

# Inputs and outputs are defined by roles. In the recipe's I/O tab, the user can associate one
# or more dataset to each input and output role.
# Roles need to be defined in recipe.json, in the inputRoles and outputRoles fields.

# To  retrieve the datasets of an input role named 'input_A' as an array of dataset names:
input_A_names = get_input_names_for_role('input_A_role')
# The dataset objects themselves can then be created like this:
input_A_datasets = [dataiku.Dataset(name) for name in input_A_names]

# For outputs, the process is the same:
output_A_names = get_output_names_for_role('main_output')
output_A_datasets = [dataiku.Dataset(name) for name in output_A_names]


# The configuration consists of the parameters set up by the user in the recipe Settings tab.

# Parameters must be added to the recipe.json file so that DSS can prompt the user for values in
# the Settings tab of the recipe. The field "params" holds a list of all the params for wich the
# user will be prompted for values.

# The configuration is simply a map of parameters, and retrieving the value of one of them is simply:
my_variable = get_recipe_config()['parameter_name']

# For optional parameters, you should provide a default value in case the parameter is not present:
my_variable = get_recipe_config().get('parameter_name', None)

# Note about typing:
# The configuration of the recipe is passed through a JSON object
# As such, INT parameters of the recipe are received in the get_recipe_config() dict as a Python float.
# If you absolutely require a Python int, use int(get_recipe_config()["my_int_param"])


#############################
# Your original recipe
#############################

import dataiku
from dataiku import pandasutils as pdu
import pandas as pd

dataset_DKU_TUTORIAL_LAB_experience_joined = dataiku.Dataset("DKU_TUTORIAL_LAB_experience_joined")
df = dataset_DKU_TUTORIAL_LAB_experience_joined.get_dataframe()
column_id = "customer_id"
column_conversion = "conversion"
column_group = "AB_group"

def compute_statistics(df, column_group, column_id,column_conversion ):
    aggregation = df.groupby([column_group]).agg({column_id:"nunique", column_conversion: "sum"})
    groups = ["A","B"]
    rows = []
    for group in groups:
        rows.append(group_statistics(group, aggregation, column_conversion, column_id))
    statistics_df = pd.DataFrame(rows)
    return statistics_df


def group_statistics(group, aggregation, column_conversion, column_id):
    size = aggregation.loc[group][column_id]
    row = {"group":group, "conversion_rate": conversion_rate(group, aggregation, column_conversion, size), "size": size}
    return row


def conversion_rate(group, aggregation, column_conversion, size):
    return float(aggregation.loc[group][column_conversion]) / size*100

statistics_df = compute_statistics(df, column_group, column_id, column_conversion)

statistics_results = dataiku.Dataset("statistics_results")
statistics_results.write_with_schema(statistics_df)