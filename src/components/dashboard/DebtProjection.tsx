"use client";

import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { useChartColorScheme } from "@/hooks/useChartOptimization";
import { PayoffStrategy } from "@/lib/dashboardConstants";
import {
  Sparkles,
  TrendingDown,
  Info,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface DebtProjectionProps {
  strategies: PayoffStrategy[];
  onViewDetails: () => void;
  onCreateCustomStrategy: () => void;
}

export const DebtProjection = memo(function DebtProjection({
  strategies = [],
  onViewDetails,
  onCreateCustomStrategy,
}: DebtProjectionProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>("avalanche");
  const colors = useChartColorScheme(3);

  // Find the selected strategy object
  const activeStrategy =
    strategies.find((strategy) => strategy.type === selectedStrategy) ||
    strategies[0];

  // Function to format the X-axis ticks (dates)
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  };

  // Prepare chart data from projection timeline
  const chartData =
    activeStrategy?.projectionTimeline?.map((point) => ({
      date: point.date,
      balance: point.balance,
    })) || [];

  // Guard against missing data
  if (!activeStrategy) {
    return (
      <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-white">
            Debt Payoff Projection
          </h2>
        </div>
        <div className="bg-black/20 rounded-xl p-5 border border-white/5">
          <p className="text-white/70 text-center py-8">
            No debt payoff strategies available.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-white">
          Debt Payoff Projection
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="text-white border-white/20 bg-white/5 hover:bg-white/10"
          onClick={onViewDetails}
        >
          View Details
        </Button>
          </div>

      <div className="bg-black/20 rounded-xl p-5 border border-white/5">
        {/* Strategy selection tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 custom-scrollbar">
          {strategies.map((strategy) => (
            <Button
              key={strategy.type || strategy.id || Math.random().toString()}
              variant="outline"
              size="sm"
              className={`whitespace-nowrap px-4 py-2 ${
                strategy.type === selectedStrategy
                  ? "bg-[#88B04B]/20 text-[#88B04B] border-[#88B04B]/50"
                  : "bg-transparent text-white/70 border-white/10 hover:bg-white/5"
              }`}
              onClick={() => setSelectedStrategy(strategy.type)}
            >
              {strategy.type === "avalanche" && (
                <TrendingDown className="w-4 h-4 mr-2" />
              )}
              {strategy.type === "snowball" && (
                <Calendar className="w-4 h-4 mr-2" />
              )}
              {strategy.type === "ai_optimized" && (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {strategy.name}
            </Button>
          ))}

          <Button
            key="custom-strategy-button"
            variant="outline"
            size="sm"
            className="whitespace-nowrap px-4 py-2 bg-transparent text-white/70 border-white/10 hover:bg-white/5"
            onClick={onCreateCustomStrategy}
          >
            + Custom
          </Button>
        </div>

        {/* Strategy key metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          <div key="debt-free-date" className="bg-black/30 rounded-lg p-4">
            <p className="text-sm text-white/60 mb-1">Debt-Free Date</p>
            <p className="text-lg font-semibold text-white">
              {activeStrategy.projectedPayoffDate
                ? new Date(
                    activeStrategy.projectedPayoffDate
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "N/A"}
            </p>
            <div className="flex items-center mt-1">
              <Badge className="bg-[#88B04B]/20 text-[#88B04B] text-xs font-normal">
                {activeStrategy.projectedPayoffDate
                  ? Math.ceil(
                      (new Date(activeStrategy.projectedPayoffDate).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24 * 30)
                    )
                  : 0}{" "}
                months
              </Badge>
            </div>
          </div>

          <div key="monthly-payment" className="bg-black/30 rounded-lg p-4">
            <p className="text-sm text-white/60 mb-1">Monthly Payment</p>
            <p className="text-lg font-semibold text-white">
              $
              {activeStrategy.monthlyPayment
                ? activeStrategy.monthlyPayment.toLocaleString()
                : "0"}
            </p>
            <div className="flex items-center mt-1">
              <Badge className="bg-white/10 text-white/70 text-xs font-normal">
                +$
                {activeStrategy.extraPaymentAmount
                  ? activeStrategy.extraPaymentAmount.toLocaleString()
                  : "0"}{" "}
                extra
              </Badge>
            </div>
          </div>

          <div key="interest-saved" className="bg-black/30 rounded-lg p-4">
            <p className="text-sm text-white/60 mb-1">Interest Saved</p>
            <p className="text-lg font-semibold text-white">
              $
              {activeStrategy.interestSaved
                ? activeStrategy.interestSaved.toLocaleString()
                : "0"}
            </p>
            <div className="flex items-center mt-1">
              <Badge className="bg-emerald-500/20 text-emerald-300 text-xs font-normal">
                vs. minimum payments
              </Badge>
            </div>
          </div>
      </div>

        {/* Chart */}
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                tickFormatter={formatXAxis}
                axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                tickFormatter={(value) =>
                  `$${value ? value.toLocaleString() : "0"}`
                }
                axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <Tooltip
                formatter={(value) => [
                  `$${Number(value) ? Number(value).toLocaleString() : "0"}`,
                  "Debt Balance",
                ]}
                labelFormatter={(label) =>
                  label
                    ? new Date(label).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "Unknown Date"
                }
                contentStyle={{
                  backgroundColor: "rgba(22,22,22,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              />
              <Bar
                dataKey="balance"
                fill={colors[0]}
                name="Debt Balance"
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Strategy recommendations */}
        <div className="p-4 bg-black/20 rounded-lg border border-white/10">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#88B04B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-medium mb-1">
                Recommendation
              </p>
              <p className="text-sm text-white/70 mb-2">
                {activeStrategy.recommendation || "No recommendation available"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10"
                onClick={onViewDetails}
              >
                See Detailed Plan <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Add default export for lazy loading
// Make sure both names are exported properly
export const DebtProjection2 = DebtProjection;
export const DebtProjection3 = DebtProjection;
export default DebtProjection;
