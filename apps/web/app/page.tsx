import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto">
      <h1 className="text-4xl my-5 md:text-6xl  font-black text-center">
        Supa<span className=" text-orange-500">clear</span> Crawler 🕸️
      </h1>

      <p className="text-center text-lg my-5">
        Best catalogue of enterprise AI products on the web
      </p>

      <div className="flex justify-center">
        <Link
          href="/data-science-and-machine-learning-platforms"
          className="bg-gray-100 p-2 rounded-md text-black flex items-center gap-2 hover:bg-gray-200 hover:text-blue-700 cursor-pointer"
        >
          Data science and machine learning platforms <SquareArrowOutUpRight />
        </Link>
      </div>
    </main>
  );
}
