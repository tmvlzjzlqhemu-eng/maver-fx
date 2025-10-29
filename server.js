import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/rate", async (req, res) => {
  try {
    const url = "https://finance.naver.com/marketindex/exchangeList.naver";
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    let usd = null;
    let hkd = null;

    $("tr").each((_, el) => {
      const country = $(el).find("td.tit").text().trim();
      const value = parseFloat(
        $(el).find("td.sale").text().trim().replace(/,/g, "")
      );
      if (country.includes("미국")) usd = value;
      if (country.includes("홍콩")) hkd = value;
    });

    if (!usd || !hkd) throw new Error("Parsing failed");

    res.json({ ok: true, USD: usd, HKD: hkd });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Naver FX (lite) server running on port ${PORT}`);
});
