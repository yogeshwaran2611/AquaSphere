;(() => {
  angular.module("waterAdminApp").factory("ToastService", ToastService)

  ToastService.$inject = ["$timeout"]

  function ToastService($timeout) {
    let toastTimeout
    let currentToast = null

    const service = {
      show: show,
      success: success,
      error: error,
      hide: hide,
    }

    return service

    function show(title, message, type, duration) {
      if (currentToast && currentToast.show) {
        hide(currentToast)
      }

      if (toastTimeout) {
        $timeout.cancel(toastTimeout)
      }

      const toast = {
        show: true,
        title: title,
        message: message,
        type: type || "info",
      }

      currentToast = toast

      if (duration !== 0) {
        toastTimeout = $timeout(() => {
          toast.show = false
          currentToast = null
        }, duration || 3000)
      }

      return toast
    }

    function success(title, message, duration) {
      return show(title, message, "success", duration)
    }

    function error(title, message, duration) {
      return show(title, message, "error", duration)
    }

    function hide(toast) {
      if (toastTimeout) {
        $timeout.cancel(toastTimeout)
      }

      toast.show = false
      currentToast = null
      return toast
    }
  }
})()

