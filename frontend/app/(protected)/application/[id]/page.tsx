import { ApplicationWizard } from "@/components/application-wizard";

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  return <ApplicationWizard initialApplicationId={params.id} />;
}
