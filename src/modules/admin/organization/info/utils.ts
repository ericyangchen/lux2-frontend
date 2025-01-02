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
            }
            h1 {
              margin-bottom: 20px;
              color: #333;
            }
            img {
              max-width: 100%;
              height: auto;
              border: 1px solid #ddd;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
          </style>
        </head>
        <body>
          <h1>${name}</h1>
          <img src="${qrCode}" alt="驗證碼: ${name}">
        </body>
      </html>
    `);

    newWindow.document.close();

    return true;
  } else {
    return false;
  }
};
