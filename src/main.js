import { dates } from "../utils/dates";
import getGeminiResponse, { genAI } from "../utils/gemini-api";
import { GoogleGenAI } from "@google/genai";
const tickersArr = [];

const generateReportBtn = document.querySelector(".generate-report-btn");

generateReportBtn.addEventListener("click", fetchStockData);

const testModel = async () => {
  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: "Create a number list of Fruits" }],
      },
    ],
    config: {
      stopSequences: ["3.", "\n"],
      //? Lower: Model repeats topics more, Higher: Model explores new topics more
      presencePenalty: 0,
      //? Lower: Model repeats words/phrases more, Higher: Model avoids repetition
      frequencyPenalty: 0,
    },
  });
  console.log(response);
};

document
  .getElementById("ticker-input-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const tickerInput = document.getElementById("ticker-input");
    if (tickerInput.value.length > 2) {
      generateReportBtn.disabled = false;
      const newTickerStr = tickerInput.value;
      tickersArr.push(newTickerStr.toUpperCase());
      tickerInput.value = "";
      renderTickers();
    } else {
      const label = document.getElementsByTagName("label")[0];
      label.style.color = "red";
      label.textContent =
        "You must add at least one ticker. A ticker is a 3 letter or more code for a stock. E.g TSLA for Tesla.";
    }
  });

function renderTickers() {
  const tickersDiv = document.querySelector(".ticker-choice-display");
  tickersDiv.innerHTML = "";
  tickersArr.forEach((ticker) => {
    const newTickerSpan = document.createElement("span");
    newTickerSpan.textContent = ticker;
    newTickerSpan.classList.add("ticker");
    tickersDiv.appendChild(newTickerSpan);
  });
}

const loadingArea = document.querySelector(".loading-panel");
const apiMessage = document.getElementById("api-message");

async function fetchStockData() {
  document.querySelector(".action-panel").style.display = "none";
  loadingArea.style.display = "flex";
  try {
    const stockData = await Promise.all(
      tickersArr.map(async (ticker) => {
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${
          dates.startDate
        }/${dates.endDate}?apiKey=${import.meta.env.VITE_PLOYGON_API_KEY}`;
        const response = await fetch(url);
        const data = await response.text();
        const status = await response.status;
        if (status === 200) {
          apiMessage.innerText = "Creating report...";
          console.log(data);
          return data;
        } else {
          loadingArea.innerText = "There was an error fetching stock data.";
        }
      })
    );
    fetchReport(stockData.join(""));
  } catch (err) {
    loadingArea.innerText = "There was an error fetching stock data.";
    console.error("error: ", err);
  }
}

async function fetchReport(data) {
  /** AI goes here **/
  try {
    const result = await getGeminiResponse(JSON.stringify(data));
    renderReport(result);
  } catch (err) {
    renderReport(err.message);
  }
}

function renderReport(output) {
  loadingArea.style.display = "none";
  const outputArea = document.querySelector(".output-panel");
  const report = document.createElement("p");
  outputArea.appendChild(report);
  report.textContent = output;
  outputArea.style.display = "flex";
}
