import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnalyticsReportsProvider } from "@/components/analytics/analytics-provider";
import { AnalyticsOverview } from "@/components/analytics/analytics-overview";
import { CampaignsCapReport } from "@/components/analytics/campaigns-cap-report";
import { CreatorEarningsReport } from "@/components/analytics/creator-earnings-report";
import { ViewVelocityReport } from "@/components/analytics/view-velocity-report";

export const metadata = {
  title: "Analytics · Sterz Admin",
};

export default function AdminAnalyticsPage() {
  return (
    <AnalyticsReportsProvider>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.025em]">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aggregate metrics computed in the BigQuery warehouse.
          </p>
        </div>

        <AnalyticsOverview />

        <Tabs defaultValue="campaigns">
          <TabsList variant="line">
            <TabsTrigger value="campaigns">Campaign budget</TabsTrigger>
            <TabsTrigger value="creators">Creator earnings</TabsTrigger>
            <TabsTrigger value="velocity">View velocity</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="pt-4">
            <CampaignsCapReport />
          </TabsContent>
          <TabsContent value="creators" className="pt-4">
            <CreatorEarningsReport />
          </TabsContent>
          <TabsContent value="velocity" className="pt-4">
            <ViewVelocityReport />
          </TabsContent>
        </Tabs>
      </div>
    </AnalyticsReportsProvider>
  );
}
