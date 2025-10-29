import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/rate", async (req, res) => {
  try {
    const url = "https://finance.naver.com/marketindex/exchangeList.naver";
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    let usd = null;
    let hkd = null;

    $("table tbody tr").each((_, el) => {
      const currency = $(el).find("td.tit a").text().trim();
      const value = parseFloat($(el).find("td.sale").text().trim().replace(/,/g, ""));
      if (currency.includes("미국")) usd = value;
      if (currency.includes("홍콩")) hkd = value;
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
