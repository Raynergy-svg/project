import React from 'react'
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/logo192.png" />
          <link rel="manifest" href="/manifest.json" />
          
          {/* Inter font from Google Fonts */}
          <link
            rel="preconnect"
            href="https://fonts.googleapis.com"
          />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
          
          {/* Theme color for browser UI */}
          <meta name="theme-color" content="#0f172a" />
        </Head>
        <body>
          {/* Initial loader that will be removed by JavaScript */}
          <div id="initial-loader">
            <style>{`
              #initial-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #0f1729;
                z-index: 9999;
                transition: opacity 0.3s ease-out;
              }
              #initial-loader .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                border-top-color: #ffffff;
                animation: spin 1s ease-in-out infinite;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <div className="spinner"></div>
          </div>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument 