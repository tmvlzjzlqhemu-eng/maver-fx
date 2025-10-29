import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/rate", async (req, res) => {
  try {
    const response = await fetch("https://finance.naver.com/marketindex/exchangeList.naver", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    let usd = 0;
    let hkd = 0;

    $("table tbody tr").each((_, el) => {
      const currency = $(el).find("td.tit a").text().trim();
      const value = parseFloat($(el).find("td.sale").text().trim().replace(/,/g, ""));
      if (currency.includes("미국")) usd = value;
      if (currency.includes("홍콩")) hkd = value;
    });

    if (!usd || !hkd) throw new Error("환율 데이터를 찾을 수 없습니다.");

    res.json({ ok: true, USD: usd, HKD: hkd });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Naver HTML FX parser on port ${PORT}`));
