import { services } from "@/data/services";
import ServiceDetail from "@/pages/ServiceDetail";
import Head from "next/head";
export default function Service({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <Head>
        <title>{title} | Luxury Tech</title>
        <meta name="description" content={description} />
      </Head>
      <ServiceDetail />
    </>
  );
}
export function getStaticPaths() {
  return {
    paths: services.map((s) => ({ params: { slug: s.slug } })),
    fallback: false,
  };
}
export function getStaticProps({ params }) {
  const service = services.find((s) => s.slug === params.slug);
  return {
    props: { title: service.title.he, description: service.tagline.he },
  };
}
