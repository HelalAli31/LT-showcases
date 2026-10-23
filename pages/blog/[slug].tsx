import { articles } from "@/data/articles";
import BlogPost from "@/pages/BlogPost";
import Head from "next/head";
export default function Article({
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
      <BlogPost />
    </>
  );
}
export function getStaticPaths() {
  return {
    paths: articles.map((a) => ({ params: { slug: a.slug } })),
    fallback: false,
  };
}
export function getStaticProps({ params }) {
  const article = articles.find((a) => a.slug === params.slug);
  return {
    props: { title: article.title.he, description: article.excerpt.he },
  };
}
