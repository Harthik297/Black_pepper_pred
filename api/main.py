from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
MODEL = tf.keras.models.load_model("C:/Users/Harthik/Documents/Jupyter Notebook Files/models/Black_pepper2.keras")
CLASS_NAMES = ["Healthy", "Quick_wilt", "Slow_wilt"]

@app.get("/ping")
async def ping():
    return "Hello, I am alive"

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

def generate_solution(predicted_class: str, confidence: float) -> list:
    """Generates a list of solutions (points) based on the predicted class and confidence."""
    if confidence > 0.70:
        if predicted_class == "Slow_wilt":
            return [
                "Ensure proper watering, keeping the soil moist but not waterlogged.",
                "Avoid over-fertilization as it can lead to stress on the plant.",
                "Improve soil aeration by regularly tilling around the plant.",
                "Use organic mulches to help retain soil moisture.",
                "Regularly monitor the plant's root health."
            ]
        elif predicted_class == "Quick_wilt":
            return [
                "Improve drainage in the soil to prevent waterlogging.",
                "Avoid excess watering, especially during the rainy season.",
                "Apply fungicides that target root rot if applicable.",
                "Remove any affected plants to prevent the spread of the disease.",
                "Ensure that the soil has a balanced pH level."
            ]
        elif predicted_class == "Healthy":
            return [
                "The plant is in perfect condition. Keep up regular care."
            ]
    else:
        return [
            "I am not sure about the diagnosis."
        ]


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)

    # Make predictions
    predictions = MODEL.predict(img_batch)
    
    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])
    
    # Generate the solution based on the prediction
    solution = generate_solution(predicted_class, confidence)

    return {
        'class': predicted_class,
        'confidence': float(confidence),
        'solution': solution
    }

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)
