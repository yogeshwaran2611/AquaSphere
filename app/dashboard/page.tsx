"use client"

import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WaterUsageChart } from "@/components/water-usage-chart"
import { Droplet, Thermometer, Activity, Gauge } from "lucide-react"

interface WaterQuality {
  ph: number
  turbidity: number
  tds: number
  temperature: number
}

interface WaterUsage {
  daily: number
  weekly: number
  monthly: number
  yearly: number
}

interface TankLevel {
  current: number
  capacity: number
}

export default function Dashboard() {
  const [waterQuality, setWaterQuality] = useState<WaterQuality>({
    ph: 7.0,
    turbidity: 1.2,
    tds: 120,
    temperature: 25,
  })
  const [waterUsage, setWaterUsage] = useState<WaterUsage>({
    daily: 5000,
    weekly: 35000,
    monthly: 140000,
    yearly: 1680000,
  })
  const [tankLevel, setTankLevel] = useState<TankLevel>({
    current: 75,
    capacity: 100,
  })

  useEffect(() => {
    // Subscribe to water quality data
    const qualityUnsubscribe = onSnapshot(doc(db, "analytics", "waterQuality"), (doc) => {
      if (doc.exists()) {
        setWaterQuality(doc.data() as WaterQuality)
      }
    })

    // Subscribe to water usage data
    const usageUnsubscribe = onSnapshot(doc(db, "analytics", "waterUsage"), (doc) => {
      if (doc.exists()) {
        setWaterUsage(doc.data() as WaterUsage)
      }
    })

    // Subscribe to tank level data
    const tankUnsubscribe = onSnapshot(doc(db, "analytics", "tankLevel"), (doc) => {
      if (doc.exists()) {
        setTankLevel(doc.data() as TankLevel)
      }
    })

    return () => {
      qualityUnsubscribe()
      usageUnsubscribe()
      tankUnsubscribe()
    }
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Water Usage</CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{waterUsage.daily.toLocaleString()} L</div>
              <p className="text-xs text-muted-foreground">Total water distributed today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{waterUsage.monthly.toLocaleString()} L</div>
              <p className="text-xs text-muted-foreground">Total water distributed this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tank Level</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tankLevel.current}%</div>
              <Progress value={tankLevel.current} className="h-2 mt-2" aria-label="Tank level" />
              <p className="text-xs text-muted-foreground mt-2">
                {tankLevel.current < 20
                  ? "Low level! Refill needed"
                  : tankLevel.current < 50
                    ? "Moderate level"
                    : "Good level"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Water Quality</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {waterQuality.ph < 6.5 || waterQuality.ph > 8.5 ? "Needs Attention" : "Good"}
              </div>
              <p className="text-xs text-muted-foreground">
                pH: {waterQuality.ph} | TDS: {waterQuality.tds} ppm
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Water Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="daily">
                <TabsList className="mb-4">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
                <TabsContent value="daily">
                  <WaterUsageChart period="daily" />
                </TabsContent>
                <TabsContent value="weekly">
                  <WaterUsageChart period="weekly" />
                </TabsContent>
                <TabsContent value="monthly">
                  <WaterUsageChart period="monthly" />
                </TabsContent>
                <TabsContent value="yearly">
                  <WaterUsageChart period="yearly" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Water Quality Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Droplet className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">pH Level</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        waterQuality.ph < 6.5 || waterQuality.ph > 8.5 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {waterQuality.ph}
                    </span>
                  </div>
                  <Progress value={((waterQuality.ph - 0) / (14 - 0)) * 100} className="h-2" aria-label="pH level" />
                  <p className="text-xs text-muted-foreground">Optimal range: 6.5 - 8.5</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Turbidity</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        waterQuality.turbidity > 5 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {waterQuality.turbidity} NTU
                    </span>
                  </div>
                  <Progress
                    value={Math.min((waterQuality.turbidity / 10) * 100, 100)}
                    className="h-2"
                    aria-label="Turbidity level"
                  />
                  <p className="text-xs text-muted-foreground">Optimal range: &lt; 5 NTU</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Gauge className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">TDS</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${waterQuality.tds > 500 ? "text-red-500" : "text-green-500"}`}
                    >
                      {waterQuality.tds} ppm
                    </span>
                  </div>
                  <Progress
                    value={Math.min((waterQuality.tds / 1000) * 100, 100)}
                    className="h-2"
                    aria-label="TDS level"
                  />
                  <p className="text-xs text-muted-foreground">Optimal range: &lt; 500 ppm</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Temperature</span>
                    </div>
                    <span className="text-sm font-medium">{waterQuality.temperature}°C</span>
                  </div>
                  <Progress
                    value={((waterQuality.temperature - 0) / (50 - 0)) * 100}
                    className="h-2"
                    aria-label="Temperature level"
                  />
                  <p className="text-xs text-muted-foreground">Optimal range: 10°C - 30°C</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

