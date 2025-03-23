;(() => {
  angular.module("waterAdminApp").controller("ProfileController", ProfileController)

  ProfileController.$inject = ["$scope", "AuthService", "ToastService"]

  function ProfileController($scope, AuthService, ToastService) {
    const vm = this

    // Properties
    vm.user = AuthService.getCurrentUser()
    vm.newPassword = ""
    vm.confirmPassword = ""
    vm.isLoading = false

    // Methods
    vm.updatePassword = updatePassword

    function updatePassword() {
      if (vm.newPassword !== vm.confirmPassword) {
        ToastService.error("Passwords do not match", "Please make sure your passwords match.")
        return
      }

      if (vm.newPassword.length < 6) {
        ToastService.error("Password too short", "Password must be at least 6 characters long.")
        return
      }

      vm.isLoading = true

      AuthService.updatePassword(vm.newPassword)
        .then(() => {
          $scope.$apply(() => {
            vm.newPassword = ""
            vm.confirmPassword = ""
            vm.isLoading = false
          })

          ToastService.success("Password updated", "Your password has been successfully updated.")
        })
        .catch((error) => {
          console.error("Error updating password:", error)
          ToastService.error("Error", error.message || "Failed to update password. Please try again.")
          vm.isLoading = false
        })
    }
  }
})()

