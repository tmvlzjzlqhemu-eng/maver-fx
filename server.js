import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/rate", async (req, res) => {
  try {
    const url = "https://finance.naver.com/marketindex/exchangeList.naver";

    // 네이버 차단 방지용 헤더
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ko,en;q=0.9",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    let usd = null;
    let hkd = null;

    $("table tbody tr").each((_, el) => {
      const country = $(el).find("td.tit").text().trim();
      const valueText = $(el).find("td.sale").text().trim();
      if (!valueText) return;

      const value = parseFloat(valueText.replace(/,/g, ""));
      if (country.includes("미국")) usd = value;
      if (country.includes("홍콩")) hkd = value;
    });

    if (!usd || !hkd) {
      throw new Error("환율 데이터를 찾지 못했습니다. (HTML 구조 변경 가능)");
    }

    res.json({
      ok: true,
      USD: usd,
      HKD: hkd,
      source: "https://finance.naver.com/marketindex/exchangeList.naver",
    });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Naver FX Parser Server running on port ${PORT}`);
});
