import { dates } from "../utils/dates";
import getGeminiResponse, { genAI } from "../utils/gemini-api";
import safeAi from "../utils/safe-ai";

export default function setupDodgyDave(element) {
  element.innerHTML = `
       <header>
			<img src="/logo-dave-text.png" alt="Dodgy Dave's Stock Predictions">
		</header>
		<main>
			<section class="action-panel">
				<form id="ticker-input-form">
					<label for="ticker-input"> Add up to 3 stock tickers below to get a super accurate stock predictions
						report👇 </label>
					<div class="form-input-control">
						<input type="text" id="ticker-input" placeholder="MSFT">
						<button class="add-ticker-btn">
							<img src="/add.svg" class="add-ticker-svg" alt="add">
						</button>
					</div>
				</form>
				<p class="ticker-choice-display">
					Your tickers will appear here...
				</p>
				<button class="generate-report-btn" type="button" disabled>
					Generate Report
				</button>
				<p class="tag-line">Always correct 15% of the time!</p>
			</section>
			<section class="loading-panel">
				<img src="/loader.svg" alt="loading">
				<div id="api-message">Querying Stocks API...</div>
			</section>
			<section class="output-panel">
				<h2>Your Report 😜</h2>
			</section>
		</main>
		<footer>
			&copy; This is not real financial advice!
		</footer>
    `;

  const tickersArr = [];

  const generateReportBtn = document.querySelector(".generate-report-btn");

  generateReportBtn.addEventListener("click", fetchStockData);

  const testModel = async () => {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: "I fucking hate him" }],
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
    try {
      console.log(response.candidates[0].safetyRatings);
    } catch (err) {
      console.log(err);
    }
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
          const polygonUrl = `https://67955246-ploygon-api-worker.talha23-gemini-api-worker.workers.dev/?ticker=${ticker}&startDate=${dates.startDate}&endDate=${dates.endDate}`;
          const response = await fetch(polygonUrl);
          if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(errMsg);
          }
          apiMessage.innerHTML = "Creating Report...";
          return response.text();
        })
      );
      fetchReport(stockData.join(""));
    } catch (err) {
      loadingArea.innerText = "There was an error fetching stock data.";
    }
  }

  async function fetchReport(data) {
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `${data}
          ###
          OK baby, hold on tight! You are going to haate this! Over the past three days, Tesla (TSLA) shares have 
          plummetted. The stock opened at $223.98 and closed at $202.11 on the third day, with some jumping around 
          in the meantime. This is a great time to buy, baby! But not a great time to sell! But I'm not done! 
          Apple (AAPL) stocks have gone stratospheric! This is a seriously hot stock right now. They opened at 
          $166.38 and closed at $182.89 on day three. So all in all, I would hold on to Tesla shares tight if 
          you already have them - they might bounce right back up and head to the stars! They are volatile stock, 
          so expect the unexpected. For APPL stock, how much do you need the money? Sell now and take the profits 
          or hang on and wait for more! If it were me, I would hang on because this stock is on fire right now!!! 
          Apple are throwing a Wall Street party and y'all invited!
          TL;DR: Believe it ;)
          ###
    
          ###
          Apple (AAPL) is the supernova in the stock sky – it shot up from $150.22 to a jaw-dropping $175.36 by 
          the close of day three. We’re talking about a stock that’s hotter than a pepper sprout in a chilli 
          cook-off, and it’s showing no signs of cooling down! If you’re sitting on AAPL stock, you might as well 
          be sitting on the throne of Midas. Hold on to it, ride that rocket, and watch the fireworks, because 
          this baby is just getting warmed up! Then there’s Meta (META), the heartthrob with a penchant for drama. 
          It winked at us with an opening of $142.50, but by the end of the thrill ride, it was at $135.90, 
          leaving us a little lovesick. It’s the wild horse of the stock corral, bucking and kicking, ready for 
          a comeback. META is not for the weak-kneed So, sugar, what’s it going to be? For AAPL, my advice is to 
          stay on that gravy train. As for META, keep your spurs on and be ready for the rally.
          TL;DR: For Apple Hurrey! For Meta Ammm Might make you Cry!
          ###
          `,
          },
        ],
      },
    ];
    try {
      // const result = await getGeminiResponse(JSON.stringify(data));
      const response = await fetch(
        "https://370e05e0-cloudflare.talha23-gemini-api-worker.workers.dev/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contents),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(await data.error);
      }
      renderReport(data);
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
}
