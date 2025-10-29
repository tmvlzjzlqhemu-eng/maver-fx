import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

async function getRate(from, to) {
  const url = `https://ts-proxy.naver.com/content/qapirender.nhn?key=calculator&pkid=141&q=환율&where=m&u3=${from}&u4=${to}`;
  const res = await fetch(url, {
    headers: {
      "Referer": "https://search.naver.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Accept": "application/json, text/javascript, */*; q=0.01"
    }
  });
  const text = await res.text();
  const json = JSON.parse(text);
  const val = json?.country?.[0]?.value || "0";
  return parseFloat(val.replace(/,/g, ""));
}

app.get("/rate", async (req, res) => {
  try {
    const usd = await getRate("USD", "KRW");
    const hkd = await getRate("HKD", "KRW");

    res.json({
      ok: true,
      USD: usd,
      HKD: hkd
    });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`✅ Naver Real FX proxy running on ${PORT}`)
);
