import TermsButton from "@/components/TermsButton";
import { getTerms } from "@/lib/terms-db";

export default async function Terms({ className }: { className?: string }) {
  return <TermsButton terms={await getTerms()} className={className} />;
}