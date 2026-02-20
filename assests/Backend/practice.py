import replicate
import requests
from dotenv import load_dotenv
import os

# 1️⃣ Load environment variables from .env
load_dotenv()  # This will read variables from .env in the same folder
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")

if not REPLICATE_API_TOKEN:
    raise ValueError("Please set REPLICATE_API_TOKEN in your .env file!")

os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN

# 2️⃣ Model details
model_name = "prunaai/flux.1-dev"
version_id = "b0306d92aa025bb747dc74162f3c27d6ed83798e08e5f8977adf3d859d0536a3"

# 3️⃣ Input prompt
inputs = {
    "prompt": "A beautiful landscape, sunrise over mountains, highly detailed"
}

# 4️⃣ Run the model using replicate.run()
print("Generating image, please wait...")
output = replicate.run(
    f"{model_name}:{version_id}",
    input=inputs
)

# 5️⃣ Handle output
if isinstance(output, list) and len(output) > 0:
    image_url = output[0]
    print("Image generated successfully!")
    print("Image URL:", image_url)

    # Download and save locally
    img_data = requests.get(image_url).content
    with open("generated_image.png", "wb") as f:
        f.write(img_data)
    print("Image saved as 'generated_image.png' in the current folder.")
else:
    print("Unexpected output format:", output)
