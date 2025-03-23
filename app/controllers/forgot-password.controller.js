;(() => {
  angular.module("waterAdminApp").controller("ForgotPasswordController", ForgotPasswordController)

  ForgotPasswordController.$inject = ["AuthService", "ToastService"]

  function ForgotPasswordController(AuthService, ToastService) {
    const vm = this

    // Properties
    vm.email = ""
    vm.isLoading = false
    vm.isSuccess = false

    // Methods
    vm.resetPassword = resetPassword

    function resetPassword() {
      if (!vm.email) {
        return
      }

      vm.isLoading = true

      AuthService.resetPassword(vm.email)
        .then(() => {
          vm.isSuccess = true
          ToastService.success("Reset email sent", "Check your email for password reset instructions.")
        })
        .catch((error) => {
          ToastService.error("Error", error.message || "Failed to send reset email.")
        })
        .finally(() => {
          vm.isLoading = false
        })
    }
  }
})()

