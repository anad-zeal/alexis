import os
import sys


def clean_filename(filename):
    """
    Cleans a filename by converting it to lowercase, replacing spaces
    with hyphens, and handling underscores.
    """
    name, extension = os.path.splitext(filename)
    clean_name = name.replace(" ", "-").replace("_", "-").lower()
    clean_extension = extension.lower()
    return f"{clean_name}{clean_extension}"


def bulk_rename(directory_path):
    """
    Performs a safe bulk rename of files in a given directory.
    """
    if not os.path.isdir(directory_path):
        print(f"Error: The path '{directory_path}' is not a valid directory.")
        print("Please check for typos or permissions issues.")
        return

    print(f"Scanning directory: {directory_path}\n")

    planned_renames = []
    for filename in os.listdir(directory_path):
        original_filepath = os.path.join(directory_path, filename)
        if not os.path.isfile(original_filepath):
            continue

        new_filename = clean_filename(filename)
        if filename != new_filename:
            planned_renames.append((filename, new_filename))

    if not planned_renames:
        print("All filenames are already clean. No changes needed.")
        return

    print("--- DRY RUN ---")
    print("The following files will be renamed:")
    for old, new in planned_renames:
        print(f"  '{old}'  ->  '{new}'")
    print("-" * 20)

    try:
        confirm = input("Are you sure you want to proceed? Type 'yes' to continue: ")
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
        return

    if confirm.lower() != "yes":
        print("Operation cancelled. No files were changed.")
        return

    print("\n--- RENAMING FILES ---")
    success_count = 0
    skipped_count = 0

    for old_filename, new_filename in planned_renames:
        original_path = os.path.join(directory_path, old_filename)
        new_path = os.path.join(directory_path, new_filename)

        if os.path.exists(new_path):
            print(
                f"⚠️ SKIPPED: '{new_filename}' already exists. Could not rename '{old_filename}'."
            )
            skipped_count += 1
            continue

        try:
            os.rename(original_path, new_path)
            print(f"✅ Renamed '{old_filename}' to '{new_filename}'")
            success_count += 1
        except OSError as e:
            print(f"❌ ERROR: Could not rename '{old_filename}'. Reason: {e}")
            skipped_count += 1

    print("\n--- SUMMARY ---")
    print(f"Successfully renamed: {success_count} file(s)")
    print(f"Skipped: {skipped_count} file(s)")


# --- Main execution block ---
if __name__ == "__main__":
    print("=" * 60)
    print("      BULK FILE RENAMER for Web-Friendly Filenames")
    print("=" * 60)
    print("This script will rename files in a folder to be web-friendly:")
    print("  - All lowercase")
    print("  - Spaces and underscores replaced with hyphens (-)")
    print("\n" + "!" * 60)
    print("! IMPORTANT: Please BACK UP your folder before proceeding. !")
    print("!" * 60 + "\n")

    try:
        # Get the raw path from the user
        raw_path = input(
            "Enter the full path to the folder you want to process: "
        ).strip()

        # ** NEW, IMPROVED PART **
        # Clean the path to handle escape characters from drag-and-drop
        # This removes the backslash before spaces, tildes, etc.
        cleaned_path = raw_path.replace("\\", "")

        # Run the main function with the cleaned path
        bulk_rename(cleaned_path)

    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user. Exiting.")
        sys.exit(0)
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
