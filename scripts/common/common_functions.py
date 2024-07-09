import os

def ensure_directory_exists(directory):
    """
    Checks if the directory at the given destination exists.
    If it does not exist, creates the directory.

    Parameters:
    directory (str): The path to the directory.
    """
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Directory '{directory}' created.")
    else:
        print(f"Directory '{directory}' already exists.")

HTML_DESTINATION_DIR = "data/web"
ensure_directory_exists(HTML_DESTINATION_DIR)