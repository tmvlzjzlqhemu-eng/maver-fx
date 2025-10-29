// server.js
import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 8090;

app.get("/rate", async (req, res) => {
  try {
    console.log("🌐 Puppeteer 실행 중...");

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    await page.goto("https://finance.naver.com/marketindex/exchangeList.naver", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // 테이블 데이터 가져오기
    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table tbody tr"));
      return rows.map((row) => {
        const cols = row.querySelectorAll("td");
        return {
          country: cols[0]?.innerText.trim(),
          basePrice: cols[1]?.innerText.trim(),
          cashBuy: cols[2]?.innerText.trim(),
          cashSell: cols[3]?.innerText.trim(),
          transferSend: cols[4]?.innerText.trim(),
          transferReceive: cols[5]?.innerText.trim(),
          usdPer: cols[6]?.innerText.trim(),
          date: new Date().toISOString(),
        };
      });
    });

    await browser.close();
    res.json({ ok: true, data });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.json({ ok: false, error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Naver FX 서버 실행 중: http://0.0.0.0:${PORT}`);
});
