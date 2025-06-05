import { GoogleGenAI } from "@google/genai";

export const genAI = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API,
});
const model = "gemini-2.0-flash";

const config = {
  systemInstruction: [
    {
      text: `Act as a Stock Exchange Expert. You will get some JSON data of stocks you task is to analyize the 
      data and generate a short report summarizing weahter to buy or sell the shares. Your report should not 
      exceed  250 words. Make sure your response do not contain syntax like .md syntax. You have been provided with
      some examples to guide your tone in the content use anything that comes after ### you guide yourself.`,
    },
  ],
};

async function getGeminiResponse(input) {
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `${input}
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

  const response = await genAI.models.generateContent({
    model,
    contents,
    config: {
      ...config,
    },
  });

  console.log(response?.candidates?.[0]?.content?.parts?.[0]?.text || "");

  // Assuming the response structure contains candidates[0].content.parts[0].text
  return response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export default getGeminiResponse;
