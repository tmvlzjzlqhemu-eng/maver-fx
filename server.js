import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/rate", async (req, res) => {
  try {
    const url =
      "https://ts-proxy.naver.com/content/qapirender.nhn?key=calculator&pkid=141&q=%ED%99%98%EC%9C%A8&where=m";
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36",
        Referer: "https://search.naver.com/",
        "Accept-Language": "ko,en;q=0.9",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // ✅ 환율 input value 추출
    const usd = $('input[data-key="u2"]').attr("value") || null;

    if (!usd) throw new Error("환율 값을 찾을 수 없습니다.");

    res.json({
      ok: true,
      USD: parseFloat(usd.replace(/,/g, "")),
      via: "Naver Search Calculator",
      ts: Date.now(),
    });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`✅ Naver 환율 파서 서버 실행 중 (포트: ${PORT})`)
);
