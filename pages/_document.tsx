import { Html, Head, Main, NextScript } from "next/document";
export default function Document() {
  return (
    <Html lang="he" dir="rtl">
      <Head>
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="manifest" href="/site.webmanifest?v=2" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
