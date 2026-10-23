import Head from "next/head";
import Index from "@/pages/Index";
export default function Home() {
  return (
    <>
      <Head>
        <title>Luxury Tech | בונים חוויות דיגיטליות שמייצרות אמון</title>
        <meta
          name="description"
          content="מפתחים אתרי פרימיום ומערכות ניהול לבתי עסק שרוצים לבלוט. חנויות אונליין, מערכות ניהול ואתרי תדמית."
        />
        <meta
          property="og:title"
          content="Luxury Tech | Premium Web Development"
        />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="he_IL" />
        <meta
          property="og:image"
          content="https://www.luxurytech.org/og-image.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.luxurytech.org/" />
      </Head>
      <Index />
    </>
  );
}
