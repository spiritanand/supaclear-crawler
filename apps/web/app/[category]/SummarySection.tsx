import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Building, DollarSign, Trophy } from "lucide-react";

type ParsedData = {
  summary: string;
  bestFor: {
    value: {
      name: string;
      reason: string;
    };
    overall: {
      name: string;
      reason: string;
    };
    enterprise: {
      name: string;
      reason: string;
    };
  };
  productSummaries: {
    summary: string;
    name: string;
  }[];
};

export default function SummarySection({ summary }: { summary: ParsedData }) {
  return (
    <div className="w-full max-w-3xl space-y-6 mx-auto mb-20">
      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{summary.summary}</p>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium">Best Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className=" font-bold">{summary.bestFor.value.name}</div>
                <p className="text-xs text-muted-foreground mt-1">{summary.bestFor.value.reason}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium">Best Overall</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text font-bold">{summary.bestFor.overall.name}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.bestFor.overall.reason}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium">Best for Enterprise</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold">{summary.bestFor.enterprise.name}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.bestFor.enterprise.reason}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Product Summaries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Product Summaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {summary.productSummaries.map((product, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{product.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
