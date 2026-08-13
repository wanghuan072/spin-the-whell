import { HomePage } from "@/page/home/HomePage";
import { createMetadata } from "@/seo/metadata";
import { getPageTdk } from "@/seo/tdk";

const tdk = getPageTdk("home");

export const metadata = createMetadata({
  ...tdk,
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
