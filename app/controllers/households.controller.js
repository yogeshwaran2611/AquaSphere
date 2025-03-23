;(() => {
  angular.module("waterAdminApp").controller("HouseholdsController", HouseholdsController)

  HouseholdsController.$inject = ["$scope", "FirebaseService", "ToastService"]

  function HouseholdsController($scope, FirebaseService, ToastService) {
    const vm = this
    const db = FirebaseService.getFirestore()

    // Properties
    vm.households = []
    vm.searchQuery = ""
    vm.isLoading = true

    // Methods
    vm.search = search
    vm.toggleHouseholdStatus = toggleHouseholdStatus
    vm.getFilteredHouseholds = getFilteredHouseholds

    // Initialize
    initialize()

    function initialize() {
      fetchHouseholds()
    }

    function fetchHouseholds() {
      vm.isLoading = true

      db.collection("users")
        .get()
        .then((querySnapshot) => {
          const households = []
          querySnapshot.forEach((doc) => {
            households.push({
              id: doc.id,
              ...doc.data(),
            })
          })

          $scope.$apply(() => {
            vm.households = households
            vm.isLoading = false
          })
        })
        .catch((error) => {
          console.error("Error fetching households:", error)
          ToastService.error("Error", "Failed to load households. Please try again.")
          vm.isLoading = false
        })
    }

    function search() {
      // Filtering is handled by getFilteredHouseholds
    }

    function toggleHouseholdStatus(household) {
      const newStatus = household.status === "active" ? "deactivated" : "active"

      db.collection("users")
        .doc(household.id)
        .update({
          status: newStatus,
        })
        .then(() => {
          // Update local state
          const index = vm.households.findIndex((h) => h.id === household.id)
          if (index !== -1) {
            $scope.$apply(() => {
              vm.households[index].status = newStatus
            })
          }

          ToastService.success(`Household ${newStatus}`, `Household ${household.id} has been ${newStatus}.`)
        })
        .catch((error) => {
          console.error("Error updating household status:", error)
          ToastService.error("Error", "Failed to update household status. Please try again.")
        })
    }

    function getFilteredHouseholds() {
      if (!vm.searchQuery) {
        return vm.households
      }

      const query = vm.searchQuery.toLowerCase()
      return vm.households.filter((household) => household.id.toLowerCase().includes(query))
    }
  }
})()

