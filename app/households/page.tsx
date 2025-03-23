"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Search, Eye, Power } from "lucide-react"

interface Household {
  id: string
  address: string
  waterUsage: number
  status: "active" | "deactivated"
}

export default function HouseholdsPage() {
  const [households, setHouseholds] = useState<Household[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchHouseholds = async () => {
      setIsLoading(true)
      try {
        const householdsCollection = collection(db, "users")
        const householdsSnapshot = await getDocs(householdsCollection)
        const householdsList = householdsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Household[]
        setHouseholds(householdsList)
      } catch (error) {
        console.error("Error fetching households:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load households. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchHouseholds()
  }, [toast])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Filter is handled in the filteredHouseholds variable
  }

  const toggleHouseholdStatus = async (household: Household) => {
    try {
      const newStatus = household.status === "active" ? "deactivated" : "active"
      await updateDoc(doc(db, "users", household.id), {
        status: newStatus,
      })

      // Update local state
      setHouseholds((prevHouseholds) =>
        prevHouseholds.map((h) => (h.id === household.id ? { ...h, status: newStatus } : h)),
      )

      toast({
        title: `Household ${newStatus}`,
        description: `Household ${household.id} has been ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating household status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update household status. Please try again.",
      })
    }
  }

  const filteredHouseholds = households.filter((household) =>
    household.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Households</h1>
            <p className="text-muted-foreground">Manage household water distribution and access</p>
          </div>
          <form onSubmit={handleSearch} className="flex w-full md:w-auto items-center space-x-2">
            <Input
              type="search"
              placeholder="Search by Household ID..."
              className="w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Household List</CardTitle>
            <CardDescription>View and manage all registered households</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Household ID</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Water Usage (L)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading households...
                    </TableCell>
                  </TableRow>
                ) : filteredHouseholds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No households found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHouseholds.map((household) => (
                    <TableRow key={household.id}>
                      <TableCell className="font-medium">{household.id}</TableCell>
                      <TableCell>{household.address}</TableCell>
                      <TableCell>{household.waterUsage}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            household.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          }`}
                        >
                          {household.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/households/${household.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button
                          variant={household.status === "active" ? "destructive" : "outline"}
                          size="icon"
                          onClick={() => toggleHouseholdStatus(household)}
                        >
                          <Power className="h-4 w-4" />
                          <span className="sr-only">{household.status === "active" ? "Deactivate" : "Activate"}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

