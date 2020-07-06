import pandas as pd


def add_group_column(input_df, A_list, B_list, column_name, attribution_method):
    input_df["AB_group"] = input_df[column_name].apply(lambda x: retrieve_group(x, A_list, B_list))
    return input_df


def retrieve_group(reference, A_group, B_group):
    if reference in A_group:
        return "A"
    elif reference in B_group:
        return "B"


def group_to_df(group, column_name):
    columns = [column_name]
    df = pd.DataFrame(data=group, index=range(group.shape[0]), columns=columns)
    return df


def format_tracking(tracking):
    tracking_df = pd.DataFrame(tracking, index=range(1))
    return tracking_df
