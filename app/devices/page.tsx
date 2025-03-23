"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, updateDoc, addDoc, getDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Power } from "lucide-react"

interface Device {
  id: string
  householdId: string
  status: "active" | "deactivated"
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deviceId, setDeviceId] = useState("")
  const [householdId, setHouseholdId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDevices = async () => {
      setIsLoading(true)
      try {
        const devicesCollection = collection(db, "devices")
        const devicesSnapshot = await getDocs(devicesCollection)
        const devicesList = devicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Device[]
        setDevices(devicesList)
      } catch (error) {
        console.error("Error fetching devices:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load devices. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDevices()
  }, [toast])

  const addDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Check if household exists
      const householdDoc = await getDoc(doc(db, "users", householdId))
      if (!householdDoc.exists()) {
        toast({
          variant: "destructive",
          title: "Household not found",
          description: `Household ID ${householdId} does not exist.`,
        })
        setIsSubmitting(false)
        return
      }

      // Add device to Firestore
      const deviceRef = await addDoc(collection(db, "devices"), {
        deviceId,
        householdId,
        status: "active",
      })

      // Create Firebase Auth account for the household
      const email = `${householdId}@example.com`
      const password = "DefaultPassword123" // In a real app, generate a secure password

      await createUserWithEmailAndPassword(auth, email, password)

      // Update local state
      setDevices([
        ...devices,
        {
          id: deviceRef.id,
          householdId,
          status: "active",
        },
      ])

      toast({
        title: "Device added",
        description: `Device ${deviceId} has been added and activated.`,
      })

      // Reset form and close dialog
      setDeviceId("")
      setHouseholdId("")
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Error adding device:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add device. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleDeviceStatus = async (device: Device) => {
    try {
      const newStatus = device.status === "active" ? "deactivated" : "active"
      await updateDoc(doc(db, "devices", device.id), {
        status: newStatus,
      })

      // Update local state
      setDevices((prevDevices) => prevDevices.map((d) => (d.id === device.id ? { ...d, status: newStatus } : d)))

      toast({
        title: `Device ${newStatus}`,
        description: `Device ${device.id} has been ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating device status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update device status. Please try again.",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
            <p className="text-muted-foreground">Manage LoRa devices for water distribution</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Device</DialogTitle>
                <DialogDescription>Register a new LoRa device and assign it to a household</DialogDescription>
              </DialogHeader>
              <form onSubmit={addDevice}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="device-id">LoRa Device ID</Label>
                    <Input
                      id="device-id"
                      placeholder="Enter device unique ID"
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="household-id">Household ID</Label>
                    <Input
                      id="household-id"
                      placeholder="Enter household ID"
                      value={householdId}
                      onChange={(e) => setHouseholdId(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This will create login credentials for the household
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Device"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Device List</CardTitle>
            <CardDescription>View and manage all registered LoRa devices</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Assigned Household</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Loading devices...
                    </TableCell>
                  </TableRow>
                ) : devices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No devices found
                    </TableCell>
                  </TableRow>
                ) : (
                  devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.id}</TableCell>
                      <TableCell>{device.householdId}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            device.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          }`}
                        >
                          {device.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={device.status === "active" ? "destructive" : "outline"}
                          size="icon"
                          onClick={() => toggleDeviceStatus(device)}
                        >
                          <Power className="h-4 w-4" />
                          <span className="sr-only">{device.status === "active" ? "Deactivate" : "Activate"}</span>
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

