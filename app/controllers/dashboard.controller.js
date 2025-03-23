;(() => {
  angular.module("waterAdminApp").controller("DashboardController", DashboardController)

  DashboardController.$inject = ["$scope", "FirebaseService", "ToastService"]

  function DashboardController($scope, FirebaseService, ToastService) {
    const vm = this
    const db = FirebaseService.getFirestore()

    // Properties
    vm.waterQuality = {
      ph: 7.0,
      turbidity: 1.2,
      tds: 120,
      temperature: 25,
    }
    vm.waterUsage = {
      daily: 5000,
      weekly: 35000,
      monthly: 140000,
      yearly: 1680000,
    }
    vm.tankLevel = {
      current: 75,
      capacity: 100,
    }
    vm.selectedPeriod = "daily"
    vm.isLoading = true

    // Methods
    vm.setChartPeriod = setChartPeriod
    vm.getPhStatus = getPhStatus
    vm.getTurbidityStatus = getTurbidityStatus
    vm.getTdsStatus = getTdsStatus
    vm.getTemperatureStatus = getTemperatureStatus
    vm.getTankLevelStatus = getTankLevelStatus

    // Initialize
    initialize()

    function initialize() {
      // Subscribe to water quality data
      const qualityUnsubscribe = db
        .collection("analytics")
        .doc("waterQuality")
        .onSnapshot(
          (doc) => {
            if (doc.exists) {
              $scope.$apply(() => {
                vm.waterQuality = doc.data()
              })
            }
          },
          (error) => {
            console.error("Error fetching water quality:", error)
          },
        )

      // Subscribe to water usage data
      const usageUnsubscribe = db
        .collection("analytics")
        .doc("waterUsage")
        .onSnapshot(
          (doc) => {
            if (doc.exists) {
              $scope.$apply(() => {
                vm.waterUsage = doc.data()
              })
            }
          },
          (error) => {
            console.error("Error fetching water usage:", error)
          },
        )

      // Subscribe to tank level data
      const tankUnsubscribe = db
        .collection("analytics")
        .doc("tankLevel")
        .onSnapshot(
          (doc) => {
            if (doc.exists) {
              $scope.$apply(() => {
                vm.tankLevel = doc.data()
              })
            }
          },
          (error) => {
            console.error("Error fetching tank level:", error)
          },
        )

      vm.isLoading = false

      // Clean up on scope destroy
      $scope.$on("$destroy", () => {
        qualityUnsubscribe()
        usageUnsubscribe()
        tankUnsubscribe()
      })
    }

    function setChartPeriod(period) {
      vm.selectedPeriod = period
    }

    function getPhStatus() {
      if (vm.waterQuality.ph < 6.5 || vm.waterQuality.ph > 8.5) {
        return "Needs Attention"
      }
      return "Good"
    }

    function getTurbidityStatus() {
      return vm.waterQuality.turbidity > 5 ? "High" : "Normal"
    }

    function getTdsStatus() {
      return vm.waterQuality.tds > 500 ? "High" : "Normal"
    }

    function getTemperatureStatus() {
      if (vm.waterQuality.temperature < 10) return "Too Cold"
      if (vm.waterQuality.temperature > 30) return "Too Hot"
      return "Normal"
    }

    function getTankLevelStatus() {
      if (vm.tankLevel.current < 20) return "Low level! Refill needed"
      if (vm.tankLevel.current < 50) return "Moderate level"
      return "Good level"
    }
  }
})()

