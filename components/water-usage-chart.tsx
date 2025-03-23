"use client"

import { useEffect, useState } from "react"
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface WaterUsageData {
  date: string
  usage: number
}

interface WaterUsageChartProps {
  period: "daily" | "weekly" | "monthly" | "yearly"
}

export function WaterUsageChart({ period }: WaterUsageChartProps) {
  const [data, setData] = useState<WaterUsageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // In a real app, you would fetch data based on the period
        // Here we're simulating data for demonstration
        const dataPoints = period === "daily" ? 24 : period === "weekly" ? 7 : period === "monthly" ? 30 : 12

        const labels =
          period === "daily"
            ? Array.from({ length: 24 }, (_, i) => `${i}:00`)
            : period === "weekly"
              ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
              : period === "monthly"
                ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
                : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        // Generate random data for demonstration
        const mockData = labels.map((label, index) => {
          const baseUsage = period === "daily" ? 200 : period === "weekly" ? 5000 : period === "monthly" ? 4500 : 140000
          const randomFactor = 0.5 + Math.random()
          return {
            date: label,
            usage: Math.round(baseUsage * randomFactor),
          }
        })

        setData(mockData)
      } catch (error) {
        console.error("Error fetching water usage data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="h-[300px] w-full">
      <Chart>
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}L`}
              />
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <ChartTooltipContent>
                        <div className="font-bold">{payload[0].payload.date}</div>
                        <div className="text-xs text-muted-foreground">Usage: {payload[0].value} L</div>
                      </ChartTooltipContent>
                    )
                  }
                  return null
                }}
              />
              <Area type="monotone" dataKey="usage" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorUsage)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Chart>
    </div>
  )
}

