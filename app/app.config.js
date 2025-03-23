;(() => {
  angular.module("waterAdminApp").config(config)

  config.$inject = ["$routeProvider", "$locationProvider"]

  function config($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix("!")

    $routeProvider
      .when("/", {
        templateUrl: "app/views/login.html",
        controller: "LoginController",
        controllerAs: "vm",
        resolve: {
          redirectIfAuthenticated: redirectIfAuthenticated,
        },
      })
      .when("/forgot-password", {
        templateUrl: "app/views/forgot-password.html",
        controller: "ForgotPasswordController",
        controllerAs: "vm",
        resolve: {
          redirectIfAuthenticated: redirectIfAuthenticated,
        },
      })
      .when("/dashboard", {
        templateUrl: "app/views/dashboard.html",
        controller: "DashboardController",
        controllerAs: "vm",
        resolve: {
          requireAuth: requireAuth,
        },
      })
      .when("/households", {
        templateUrl: "app/views/households.html",
        controller: "HouseholdsController",
        controllerAs: "vm",
        resolve: {
          requireAuth: requireAuth,
        },
      })
      .when("/households/:id", {
        templateUrl: "app/views/household-details.html",
        controller: "HouseholdDetailsController",
        controllerAs: "vm",
        resolve: {
          requireAuth: requireAuth,
        },
      })
      .when("/devices", {
        templateUrl: "app/views/devices.html",
        controller: "DevicesController",
        controllerAs: "vm",
        resolve: {
          requireAuth: requireAuth,
        },
      })
      .when("/profile", {
        templateUrl: "app/views/profile.html",
        controller: "ProfileController",
        controllerAs: "vm",
        resolve: {
          requireAuth: requireAuth,
        },
      })
      .otherwise({
        redirectTo: "/",
      })
  }

  requireAuth.$inject = ["$location", "AuthService"]

  function requireAuth($location, AuthService) {
    return AuthService.requireAuth().catch(() => {
      $location.path("/")
    })
  }

  redirectIfAuthenticated.$inject = ["$location", "AuthService"]

  function redirectIfAuthenticated($location, AuthService) {
    return AuthService.isAuthenticated().then((authenticated) => {
      if (authenticated) {
        $location.path("/dashboard")
      }
    })
  }
})()

