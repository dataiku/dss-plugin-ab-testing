import dataiku
from results.dku_tools import get_input_output


results, statistics = get_input_output()

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