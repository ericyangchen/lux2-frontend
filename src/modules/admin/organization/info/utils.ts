export const showTotpQrCodeInNewWindow = async ({
  name,
  qrCode,
}: {
  name?: string;
  qrCode?: string;
}) => {
  const newWindow = window.open("", "_blank");

  if (newWindow) {
    newWindow.document.write(`
      <html>
        <head>
          <title>驗證碼: ${name}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
              background-color: #f9fafb;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 32px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 400px;
            }
            h1 {
              margin-bottom: 16px;
              color: #333;
              font-size: 24px;
            }
            .warning {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 24px;
              color: #92400e;
            }
            .warning-title {
              font-weight: bold;
              margin-bottom: 8px;
            }
            img {
              max-width: 100%;
              height: auto;
              border: 1px solid #ddd;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
            }
            .instructions {
              margin-top: 20px;
              font-size: 14px;
              color: #666;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${name}</h1>
            <div class="warning">
              <div class="warning-title">⚠️ 重要提醒</div>
              <div>請立即設定此QR碼到您的驗證器應用程式中，因為此QR碼無法重新產生。請確保您已成功添加到驗證器應用程式後再關閉此視窗。</div>
            </div>
            <img src="${qrCode}" alt="驗證碼: ${name}">
            <div class="instructions">
              1. 開啟您的驗證器應用程式 (如 Google Authenticator)<br/>
              2. 掃描上方的QR碼<br/>
              3. 確認驗證器中顯示6位數驗證碼<br/>
              4. 保存此設定，因為QR碼無法重新產生
            </div>
          </div>
        </body>
      </html>
    `);

    newWindow.document.close();

    return true;
  } else {
    return false;
  }
};
