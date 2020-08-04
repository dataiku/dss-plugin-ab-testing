import dataiku

input_A_names = get_input_names_for_role('input_A_role')
input_A_datasets = [dataiku.Dataset(name) for name in input_A_names]

output_A_names = get_output_names_for_role('main_output')
output_A_datasets = [dataiku.Dataset(name) for name in output_A_names]

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