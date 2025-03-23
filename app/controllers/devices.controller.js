;(() => {
  angular.module("waterAdminApp").controller("DevicesController", DevicesController)

  DevicesController.$inject = ["$scope", "FirebaseService", "ToastService"]

  function DevicesController($scope, FirebaseService, ToastService) {
    const vm = this
    const db = FirebaseService.getFirestore()
    const auth = FirebaseService.getAuth()

    // Properties
    vm.devices = []
    vm.isLoading = true
    vm.isDialogOpen = false
    vm.deviceId = ""
    vm.householdId = ""
    vm.isSubmitting = false

    // Methods
    vm.toggleDeviceStatus = toggleDeviceStatus
    vm.openDialog = openDialog
    vm.closeDialog = closeDialog
    vm.addDevice = addDevice

    // Initialize
    initialize()

    function initialize() {
      fetchDevices()
    }

    function fetchDevices() {
      vm.isLoading = true

      db.collection("devices")
        .get()
        .then((querySnapshot) => {
          const devices = []
          querySnapshot.forEach((doc) => {
            devices.push({
              id: doc.id,
              ...doc.data(),
            })
          })

          $scope.$apply(() => {
            vm.devices = devices
            vm.isLoading = false
          })
        })
        .catch((error) => {
          console.error("Error fetching devices:", error)
          ToastService.error("Error", "Failed to load devices. Please try again.")
          vm.isLoading = false
        })
    }

    function toggleDeviceStatus(device) {
      const newStatus = device.status === "active" ? "deactivated" : "active"

      db.collection("devices")
        .doc(device.id)
        .update({
          status: newStatus,
        })
        .then(() => {
          // Update local state
          const index = vm.devices.findIndex((d) => d.id === device.id)
          if (index !== -1) {
            $scope.$apply(() => {
              vm.devices[index].status = newStatus
            })
          }

          ToastService.success(`Device ${newStatus}`, `Device ${device.id} has been ${newStatus}.`)
        })
        .catch((error) => {
          console.error("Error updating device status:", error)
          ToastService.error("Error", "Failed to update device status. Please try again.")
        })
    }

    function openDialog() {
      vm.isDialogOpen = true
    }

    function closeDialog() {
      vm.isDialogOpen = false
      vm.deviceId = ""
      vm.householdId = ""
    }

    function addDevice() {
      if (!vm.deviceId || !vm.householdId) {
        return
      }

      vm.isSubmitting = true

      // Check if household exists
      db.collection("users")
        .doc(vm.householdId)
        .get()
        .then((doc) => {
          if (!doc.exists) {
            throw new Error(`Household ID ${vm.householdId} does not exist.`)
          }

          // Add device to Firestore
          return db.collection("devices").add({
            deviceId: vm.deviceId,
            householdId: vm.householdId,
            status: "active",
          })
        })
        .then((deviceRef) => {
          // Create Firebase Auth account for the household
          const email = `${vm.householdId}@example.com`
          const password = "DefaultPassword123" // In a real app, generate a secure password

          return auth.createUserWithEmailAndPassword(email, password)
        })
        .then((userCredential) => {
          // Update local state
          $scope.$apply(() => {
            vm.devices.push({
              id: deviceRef.id,
              deviceId: vm.deviceId,
              householdId: vm.householdId,
              status: "active",
            })

            vm.isSubmitting = false
            vm.isDialogOpen = false
            vm.deviceId = ""
            vm.householdId = ""
          })

          ToastService.success("Device added", `Device ${vm.deviceId} has been added and activated.`)
        })
        .catch((error) => {
          console.error("Error adding device:", error)
          ToastService.error("Error", error.message || "Failed to add device. Please try again.")
          vm.isSubmitting = false
        })
    }
  }
})()

