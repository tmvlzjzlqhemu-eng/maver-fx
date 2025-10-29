import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// 🇺🇸 USD / 🇭🇰 HKD 각각 호출하는 네이버 내부 API URL
const makeUrl = (from, to) =>
  `https://ts-proxy.naver.com/content/qapirender.nhn?key=calculator&pkid=141&q=환율&where=m&u1=keb&u6=standardUnit&u7=0&u3=${from}&u4=${to}&u8=down&u2=2200`;

app.get("/rate", async (req, res) => {
  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json, text/javascript, */*; q=0.01",
      Referer: "https://search.naver.com/",
      Origin: "https://search.naver.com",
    };

    // USD 요청
    const usdRes = await fetch(makeUrl("USD", "KRW"), { headers });
    const usdText = await usdRes.text();

    // HKD 요청
    const hkdRes = await fetch(makeUrl("HKD", "KRW"), { headers });
    const hkdText = await hkdRes.text();

    // 응답이 JSON 문자열이 아니라 HTML/JS일 수도 있으므로 안전하게 파싱
    const usdMatch = usdText.match(/([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?)/);
    const hkdMatch = hkdText.match(/([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?)/);

    const usd = usdMatch ? parseFloat(usdMatch[1].replace(/,/g, "")) : null;
    const hkd = hkdMatch ? parseFloat(hkdMatch[1].replace(/,/g, "")) : null;

    if (!usd || !hkd) throw new Error("Parsing failed");

    res.json({ ok: true, USD: usd, HKD: hkd });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Naver FX API server running on port ${PORT}`);
});
