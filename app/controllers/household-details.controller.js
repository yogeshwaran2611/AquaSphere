;(() => {
  angular.module("waterAdminApp").controller("HouseholdDetailsController", HouseholdDetailsController)

  HouseholdDetailsController.$inject = ["$scope", "$routeParams", "$location", "FirebaseService", "ToastService"]

  function HouseholdDetailsController($scope, $routeParams, $location, FirebaseService, ToastService) {
    const vm = this
    const db = FirebaseService.getFirestore()
    const householdId = $routeParams.id

    // Properties
    vm.household = null
    vm.people = 0
    vm.allocation = 0
    vm.isLoading = true
    vm.isSaving = false

    // Methods
    vm.handlePeopleChange = handlePeopleChange
    vm.saveAllocation = saveAllocation
    vm.goBack = goBack

    // Initialize
    initialize()

    function initialize() {
      fetchHouseholdDetails()
    }

    function fetchHouseholdDetails() {
      vm.isLoading = true

      db.collection("users")
        .doc(householdId)
        .get()
        .then((doc) => {
          if (doc.exists) {
            $scope.$apply(() => {
              vm.household = {
                id: doc.id,
                ...doc.data(),
              }
              vm.people = vm.household.people || 0
              vm.allocation = vm.household.allocation || 0
              vm.isLoading = false
            })
          } else {
            ToastService.error("Household not found", "The requested household does not exist.")
            $location.path("/households")
          }
        })
        .catch((error) => {
          console.error("Error fetching household details:", error)
          ToastService.error("Error", "Failed to load household details. Please try again.")
          vm.isLoading = false
        })
    }

    function handlePeopleChange() {
      // Calculate water allocation: 55L per person per day
      vm.allocation = vm.people * 55
    }

    function saveAllocation() {
      if (!vm.household) return

      vm.isSaving = true

      db.collection("users")
        .doc(vm.household.id)
        .update({
          people: vm.people,
          allocation: vm.allocation,
        })
        .then(() => {
          $scope.$apply(() => {
            vm.household.people = vm.people
            vm.household.allocation = vm.allocation
            vm.isSaving = false
          })

          ToastService.success("Allocation updated", `Water allocation for ${vm.household.id} has been updated.`)
        })
        .catch((error) => {
          console.error("Error updating allocation:", error)
          ToastService.error("Error", "Failed to update allocation. Please try again.")
          vm.isSaving = false
        })
    }

    function goBack() {
      $location.path("/households")
    }
  }
})()

