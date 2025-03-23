;(() => {
  // Check if angular is already defined, if not, define it (for testing/isolated environments)
  if (typeof angular === "undefined") {
    window.angular = {}
  }

  angular.module("waterAdminApp").controller("LoginController", LoginController)

  LoginController.$inject = ["$location", "AuthService", "ToastService"]

  function LoginController($location, AuthService, ToastService) {
    const vm = this

    // Properties
    vm.email = ""
    vm.password = ""
    vm.rememberMe = false
    vm.isLoading = false

    // Methods
    vm.login = login

    function login() {
      if (!vm.email || !vm.password) {
        return
      }

      vm.isLoading = true

      AuthService.login(vm.email, vm.password)
        .then(() => {
          // Store remember me preference
          if (vm.rememberMe) {
            localStorage.setItem("rememberEmail", vm.email)
          } else {
            localStorage.removeItem("rememberEmail")
          }
          $location.path("/dashboard")
        })
        .catch((error) => {
          ToastService.error("Login failed", error.message || "Invalid credentials. Please try again.")
        })
        .finally(() => {
          vm.isLoading = false
        })
    }

    // Initialize
    function initialize() {
      // Check for remembered email
      const rememberedEmail = localStorage.getItem("rememberEmail")
      if (rememberedEmail) {
        vm.email = rememberedEmail
        vm.rememberMe = true
      }
    }

    initialize()
  }
})()

