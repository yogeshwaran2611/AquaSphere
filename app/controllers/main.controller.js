;(() => {
  angular.module("waterAdminApp").controller("MainController", MainController)

  MainController.$inject = ["$location", "$scope", "AuthService", "ToastService"]

  function MainController($location, $scope, AuthService, ToastService) {
    const vm = this

    // Properties
    vm.isAuthenticated = false
    vm.user = null
    vm.isDarkMode = false
    vm.mobileMenuOpen = false
    vm.userMenuOpen = false
    vm.toast = { show: false }
    vm.navItems = [
      { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
      { name: "Households", href: "/households", icon: "people" },
      { name: "Devices", href: "/devices", icon: "devices" },
      { name: "Profile", href: "/profile", icon: "person" },
    ]

    // Methods
    vm.isActive = isActive
    vm.toggleMobileMenu = toggleMobileMenu
    vm.toggleUserMenu = toggleUserMenu
    vm.toggleDarkMode = toggleDarkMode
    vm.logout = logout
    vm.showToast = showToast
    vm.hideToast = hideToast

    // Initialize
    initialize()

    function initialize() {
      // Check authentication status
      AuthService.isAuthenticated().then((authenticated) => {
        vm.isAuthenticated = authenticated
        if (authenticated) {
          vm.user = AuthService.getCurrentUser()
        }
      })

      // Listen for authentication changes
      firebase.auth().onAuthStateChanged((user) => {
        $scope.$apply(() => {
          vm.isAuthenticated = !!user
          vm.user = user
        })
      })

      // Check for dark mode preference
      const darkMode = localStorage.getItem("darkMode") === "true"
      if (darkMode) {
        vm.isDarkMode = true
        document.documentElement.classList.add("dark")
      }

      // Listen for route changes to close menus
      $scope.$on("$routeChangeSuccess", () => {
        vm.mobileMenuOpen = false
        vm.userMenuOpen = false
      })
    }

    function isActive(path) {
      return $location.path() === path
    }

    function toggleMobileMenu() {
      vm.mobileMenuOpen = !vm.mobileMenuOpen
      if (vm.mobileMenuOpen) {
        vm.userMenuOpen = false
      }
    }

    function toggleUserMenu() {
      vm.userMenuOpen = !vm.userMenuOpen
    }

    function toggleDarkMode() {
      vm.isDarkMode = !vm.isDarkMode
      if (vm.isDarkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      localStorage.setItem("darkMode", vm.isDarkMode)
    }

    function logout() {
      AuthService.logout()
        .then(() => {
          $location.path("/")
          showToast("success", "Logged out", "You have been successfully logged out.")
        })
        .catch((error) => {
          showToast("error", "Error", "Failed to log out. Please try again.")
          console.error("Logout error:", error)
        })
    }

    function showToast(type, title, message) {
      vm.toast = ToastService.show(title, message, type)
    }

    function hideToast() {
      vm.toast = ToastService.hide(vm.toast)
    }
  }
})()

