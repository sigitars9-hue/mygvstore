import Header from "@/components/Header";
import { getHeaderData } from "@/lib/cs";

export default async function SiteHeader() {
  const { games, cs } = await getHeaderData();
  return <Header games={games} cs={cs} />;
}