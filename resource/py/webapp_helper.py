import dataiku


api_client = dataiku.api_client()


def do(payload, config, plugin_config, inputs):
    project_key = dataiku.default_project_key()
    project_managed_folders = api_client.get_project(project_key).list_managed_folders()

    choices = [{
        'label': '{} ({})'.format(mf['name'], mf['type']),
        'value': mf['id']
    } for mf in project_managed_folders]
    choices.append({'label': 'Create new Filesystem folder...', 'value': 'create_new_folder'})
    return {"choices": choices}
