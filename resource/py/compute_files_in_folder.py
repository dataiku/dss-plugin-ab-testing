from dataiku import Folder


def do(payload, config, plugin_config, inputs):
    for recipe_input in inputs:
        if recipe_input["role"] == "folder":
            folder = Folder(recipe_input["fullName"])
    paths = folder.list_paths_in_partition()
    choices = []
    for file_name in paths:
        if ".json" in file_name:
            choices.append({"value": file_name, "label": file_name})
    return {"choices": choices}
