from dataiku import Folder


def do(payload, config, plugin_config, inputs):
    folder = None
    for recipe_input in inputs:
        if recipe_input["role"] == "folder":
            folder = Folder(recipe_input["fullName"])
    if folder:
        paths = folder.list_paths_in_partition()
        choices = []
        for file_name in paths:
            if ".json" in file_name:
                choices.append({"value": file_name, "label": file_name})
        return {"choices": choices}
    else:
        return {"choices": [{"value": None, "label": "Invalid : no input folder"}]}
