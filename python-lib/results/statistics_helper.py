import dataiku
import json


def read_statistics(dataset_name,  group_column):
    dataset = dataiku.Dataset(dataset_name)
    df = dataset.get_dataframe()
    if invalid_format_df(df, group_column):
        response = {"status": "error", "message": "The format of the statistics dataset is invalid. Make sure it is the output of the AB statistics custom recipe or edit values manually."}
    else:
        groups = df[group_column].values
        A_df = df[df[group_column] == groups[0]]
        B_df = df[df[group_column] == groups[1]]
        size_A, success_rate_A = retrieve_statistics(A_df)
        size_B, success_rate_B = retrieve_statistics(B_df)
        if size_A < 0 or size_B < 0 or success_rate_A < 0 or success_rate_B < 0 or success_rate_A > 100 or success_rate_B > 100:
            response = {"status": "error", "message": "Some values from the statistics dataset are invalid. Make sure it is the output of the AB statistics recipe or edit manually."}
        else:
            response = {"status": "ok", "size_A": str(size_A), "size_B": str(
                size_B), "success_rate_A": str(success_rate_A), "success_rate_B": str(success_rate_B)}
    return json.dumps(response)


def invalid_format_df(df, column_name):
    invalid_format = False
    if df.shape != (2, 3):
        invalid_format = True
    elif not (df.columns == [column_name, u'sample_size', u'success_rate']).all():
        invalid_format = True
    return invalid_format


def retrieve_statistics(group_df):
    size = group_df["sample_size"].values[0]
    success_rate = group_df["success_rate"].values[0]
    return size, success_rate
