from PIL import Image
import os

# --- CONFIGURATION: EDIT THIS SECTION ---

# 1. The specific folder you want to process right now
#    (Relative to where this script is located)
target_folder = 'assets/images/encaustic'

# 2. The new dimensions
target_width = 800
target_height = 600

# 3. Choose your resize mode (True or False)
#    True  = Force exact size (might stretch/squash the image)
#    False = Keep aspect ratio (fits image inside the box, no distortion)
FORCE_EXACT_SIZE = False

# ----------------------------------------

def process_images():
    # Define output path (creates a 'resized' folder inside the target folder)
    output_folder = os.path.join(target_folder, 'resized')

    if not os.path.exists(target_folder):
        print(f"Error: The folder '{target_folder}' does not exist.")
        return

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"Created output folder: {output_folder}")

    count = 0

    print(f"Processing images in: {target_folder}...")

    for filename in os.listdir(target_folder):
        # Skip the 'resized' folder itself and non-image files
        if filename == 'resized':
            continue

        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif')):
            try:
                input_path = os.path.join(target_folder, filename)
                output_path = os.path.join(output_folder, filename)

                with Image.open(input_path) as img:
                    # Handle Convert to RGB if saving as JPG (prevents errors with PNG alphas)
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")

                    if FORCE_EXACT_SIZE:
                        # Forces image to be exactly 800x600 (Stretches)
                        new_img = img.resize((target_width, target_height))
                        new_img.save(output_path)
                    else:
                        # Resizes to fit WITHIN 800x600 (Maintains shapes)
                        img.thumbnail((target_width, target_height))
                        img.save(output_path)

                    print(f"  [OK] {filename}")
                    count += 1

            except Exception as e:
                print(f"  [ERROR] {filename}: {e}")

    print(f"Done! Processed {count} images.")
    print(f"New images are located in: {output_folder}")

if __name__ == "__main__":
    process_images()
