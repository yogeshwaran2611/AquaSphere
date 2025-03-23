import { Chart } from "@/components/ui/chart"
;(() => {
  angular.module("waterAdminApp").directive("waterUsageChart", waterUsageChart)

  waterUsageChart.$inject = []

  function waterUsageChart() {
    return {
      restrict: "E",
      scope: {
        period: "@",
      },
      template: '<canvas id="waterUsageChart"></canvas>',
      link: (scope, element, attrs) => {
        let chart = null

        // Watch for period changes
        scope.$watch("period", (newPeriod) => {
          if (newPeriod) {
            updateChart(newPeriod)
          }
        })

        // Clean up on scope destroy
        scope.$on("$destroy", () => {
          if (chart) {
            chart.destroy()
          }
        })

        function updateChart(period) {
          const ctx = element.find("canvas")[0].getContext("2d")

          // Generate data based on period
          const data = generateChartData(period)

          // Destroy previous chart if it exists
          if (chart) {
            chart.destroy()
          }

          // Create new chart
          chart = new Chart(ctx, {
            type: "line",
            data: {
              labels: data.labels,
              datasets: [
                {
                  label: "Water Usage (L)",
                  data: data.values,
                  fill: true,
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  borderColor: "rgba(59, 130, 246, 1)",
                  borderWidth: 2,
                  tension: 0.4,
                  pointBackgroundColor: "rgba(59, 130, 246, 1)",
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => value + "L",
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => context.parsed.y + "L",
                  },
                },
              },
            },
          })
        }

        function generateChartData(period) {
          let labels = []
          let values = []

          switch (period) {
            case "daily":
              labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
              break
            case "weekly":
              labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
              break
            case "monthly":
              labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
              break
            case "yearly":
              labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
              break
            default:
              labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
          }

          // Generate random data for demonstration
          const baseUsage = period === "daily" ? 200 : period === "weekly" ? 5000 : period === "monthly" ? 4500 : 140000

          values = labels.map(() => Math.round(baseUsage * (0.5 + Math.random())))

          return {
            labels: labels,
            values: values,
          }
        }
      },
    }
  }
})()

