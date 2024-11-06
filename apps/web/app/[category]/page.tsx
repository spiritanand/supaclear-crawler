import { db, parsedProducts, eq } from "@repo/database";
import Link from "next/link";
import SummarySection from "./SummarySection";

export default async function Page({ params }: { params: { category: string } }) {
  const category = params.category;

  const allProducts = await db.query.parsedProducts.findFirst({
    where: eq(parsedProducts.category, category),
    with: {
      product: true,
    },
  });

  return (
    <main className="container mx-auto">
      <Link href="/">
        <h1 className="text-4xl my-5 md:text-6xl  font-black text-center">
          Supa<span className=" text-orange-500">clear</span> Crawler 🕸️
        </h1>
      </Link>

      <p className="text-center text-lg my-5">
        Best catalogue of enterprise AI products on the web
      </p>

      <p className="text-center text-2xl my-5 font-bold text-orange-500 mt-10">{category}</p>

      {allProducts?.parsedData ? (
        <>
          <SummarySection summary={allProducts.parsedData} />
        </>
      ) : (
        <p>No data found</p>
      )}
    </main>
  );
}
