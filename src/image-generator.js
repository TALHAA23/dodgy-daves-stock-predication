import { Modality } from "@google/genai";
import { genAI } from "../utils/gemini-api";

export function setupImageGenerator(element) {
  element.innerHTML = `
        <h1>ArtMatch 👩‍🎨</h1>
        <div id="output-img" class="frame">
            <h2>Describe a famous painting without saying its name or the artist!</h2>
        </div>
        <textarea placeholder="A woman with long brown hair..." id="instruction"></textarea>
        <button id="submit-btn">Create</button>
  `;

  const outputImg = document.getElementById("output-img");

  document.getElementById("submit-btn").addEventListener("click", () => {
    const prompt = document.getElementById("instruction").value;
    generateImage(prompt);
  });

  async function generateImage(prompt) {
    // ? We can use Imagen model using generateImages but that is paid
    // ? Imagen will provide more control like:
    /**
     * models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: 'Robot holding a red skateboard',
    config: {
      numberOfImages: 4,
    },
  });
     */
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    let imageSrc = "";
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        // Show the image in the outputImg element
        imageSrc = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    if (imageSrc) {
      outputImg.innerHTML = `<img src="${imageSrc}" alt="Generated Image">`;
    } else {
      outputImg.innerHTML = `<img src="" alt="The Image API Failed">`;
    }
  }
}
