;(() => {
  angular.module("waterAdminApp").factory("AuthService", AuthService)

  AuthService.$inject = ["$q", "FirebaseService"]

  function AuthService($q, FirebaseService) {
    const auth = FirebaseService.getAuth()

    const service = {
      login: login,
      logout: logout,
      resetPassword: resetPassword,
      updatePassword: updatePassword,
      getCurrentUser: getCurrentUser,
      isAuthenticated: isAuthenticated,
      requireAuth: requireAuth,
    }

    return service

    function login(email, password) {
      return $q((resolve, reject) => {
        auth.signInWithEmailAndPassword(email, password).then(resolve).catch(reject)
      })
    }

    function logout() {
      return $q((resolve, reject) => {
        auth.signOut().then(resolve).catch(reject)
      })
    }

    function resetPassword(email) {
      return $q((resolve, reject) => {
        auth.sendPasswordResetEmail(email).then(resolve).catch(reject)
      })
    }

    function updatePassword(newPassword) {
      return $q((resolve, reject) => {
        const user = auth.currentUser
        if (user) {
          user.updatePassword(newPassword).then(resolve).catch(reject)
        } else {
          reject(new Error("No user is signed in."))
        }
      })
    }

    function getCurrentUser() {
      return auth.currentUser
    }

    function isAuthenticated() {
      return $q((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe()
          resolve(!!user)
        })
      })
    }

    function requireAuth() {
      return $q((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe()
          if (user) {
            resolve(user)
          } else {
            reject("Authentication required.")
          }
        })
      })
    }
  }
})()

