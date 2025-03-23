;(() => {
  // Declare angular before using it
  var angular = window.angular

  angular.module("waterAdminApp").factory("FirebaseService", FirebaseService)

  FirebaseService.$inject = ["$window"]

  function FirebaseService($window) {
    // Declare firebase before using it
    var firebase = $window.firebase

    // Firebase configuration
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
    }

    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig)
    const auth = firebase.auth()
    const db = firebase.firestore()

    const service = {
      app: app,
      auth: auth,
      db: db,
      getAuth: getAuth,
      getFirestore: getFirestore,
    }

    return service

    function getAuth() {
      return auth
    }

    function getFirestore() {
      return db
    }
  }
})()

