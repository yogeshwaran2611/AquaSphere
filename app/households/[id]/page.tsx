"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import { WaterUsageChart } from "@/components/water-usage-chart"

interface HouseholdDetails {
  id: string
  name: string
  address: string
  waterUsage: number
  status: "active" | "deactivated"
  people: number
  allocation: number
}

export default function HouseholdDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const [household, setHousehold] = useState<HouseholdDetails | null>(null)
  const [people, setPeople] = useState<number>(0)
  const [allocation, setAllocation] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchHouseholdDetails = async () => {
      setIsLoading(true)
      try {
        const householdDoc = await getDoc(doc(db, "users", params.id))

        if (householdDoc.exists()) {
          const data = householdDoc.data() as Omit<HouseholdDetails, "id">
          const householdData = {
            id: params.id,
            ...data,
          }
          setHousehold(householdData)
          setPeople(householdData.people || 0)
          setAllocation(householdData.allocation || 0)
        } else {
          toast({
            variant: "destructive",
            title: "Household not found",
            description: "The requested household does not exist.",
          })
          router.push("/households")
        }
      } catch (error) {
        console.error("Error fetching household details:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load household details. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchHouseholdDetails()
  }, [params.id, router, toast])

  const handlePeopleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setPeople(value)
    // Calculate water allocation: 55L per person per day
    setAllocation(value * 55)
  }

  const saveAllocation = async () => {
    if (!household) return

    setIsSaving(true)
    try {
      await updateDoc(doc(db, "users", household.id), {
        people,
        allocation,
      })

      setHousehold({
        ...household,
        people,
        allocation,
      })

      toast({
        title: "Allocation updated",
        description: `Water allocation for ${household.id} has been updated.`,
      })
    } catch (error) {
      console.error("Error updating allocation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update allocation. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">Loading household details...</div>
      </DashboardLayout>
    )
  }

  if (!household) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">Household not found</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/households")}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{household.name || household.id}</h1>
            <p className="text-muted-foreground">{household.address}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Household Details</CardTitle>
              <CardDescription>View and update household information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="household-id">Household ID</Label>
                <Input id="household-id" value={household.id} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={household.address} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={household.status}
                  readOnly
                  disabled
                  className={
                    household.status === "active"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="people">Number of People</Label>
                <Input id="people" type="number" min="0" value={people} onChange={handlePeopleChange} />
                <p className="text-xs text-muted-foreground">Used to calculate water allocation</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocation">Daily Water Allocation (L)</Label>
                <Input id="allocation" value={allocation} readOnly disabled />
                <p className="text-xs text-muted-foreground">
                  Calculated as: {people} people × 55L per day = {allocation}L
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveAllocation} disabled={isSaving}>
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Allocation
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Water Usage</CardTitle>
              <CardDescription>Daily water consumption for this household</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <WaterUsageChart period="daily" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Usage</span>
                  <span className="text-sm font-bold">{household.waterUsage}L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Daily Allocation</span>
                  <span className="text-sm font-bold">{allocation}L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Usage Status</span>
                  <span
                    className={`text-sm font-bold ${
                      household.waterUsage > allocation ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {household.waterUsage > allocation ? "Over Allocation" : "Within Allocation"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

