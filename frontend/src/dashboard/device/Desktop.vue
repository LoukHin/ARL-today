<template>
  <div id="app-container" class="d-flex flex-column justify-content-start">
    <div class="mb-4 align-self-center">
      <span class="font-weight-lighter display-4 text-white">ARL Today</span>
    </div>
    <div class="container row mx-auto justify-content-center">
      <div class="col-md-5 row p-0 m-auto m-md-0 mr-md-2">
        <div
          class="col-12 d-flex flex-column justify-content-center align-self-center text-white"
          v-if="trainTo != null && nextStation != null"
        >
          <div class="display-3 font-weight-lighter align-self-center">{{ schedules[0] }}</div>
          <div
            class="align-self-center"
          >Train to {{ station.options[trainTo - 1].text }}</div>
          <div
            class="align-self-center"
          >Next station : {{ station.options[nextStation - 1].text }}</div>
          <div
            id="text-price"
            class="font-weight-lighter align-self-center mb-2"
          >Price: {{ price }} THB</div>
        </div>
        <div id="app-box" class="col-12 p-3 card shadow d-flex align-self-end">
          <multiselect
            class="my-1"
            placeholder="Current"
            v-model="station.from"
            :options="originData"
            label="text"
            :searchable="false"
            :show-labels="false"
            :allowEmpty="false"
          ></multiselect>
          <multiselect
            class="my-1"
            placeholder="Destination"
            v-model="station.to"
            :options="destinationData"
            label="text"
            :searchable="false"
            :show-labels="false"
            :allowEmpty="false"
          ></multiselect>
          <multiselect
            class="my-1"
            placeholder="Time"
            v-model="time.selected"
            :options="time.options"
            :searchable="false"
            :show-labels="false"
            :allowEmpty="false"
          ></multiselect>
          <div class="form-check mx-auto" v-if="this.time.selected !== 'Current Time'">
            <input
              class="form-check-input"
              type="checkbox"
              id="isHoliday"
              v-model="time.isHoliday"
            />
            <label class="form-check-label" for="isHoliday">Holiday</label>
          </div>
        </div>
      </div>
      <div
        class="col-md-6 card shadow p-0 ml-md-2 mt-3 mt-md-0"
        :class="{ 'align-self-start': trainTo === null && nextStation === null }"
      >
        <div class="my-2 mx-3">
          <div id="dashboard-title" class="text-uppercase font-weight-bold">Incoming Train</div>
        </div>
        <div
          class="container-fluid py-2"
          v-for="(schedule, index) in schedules"
          :key="schedule.index"
          :class="{ 'bg-light': stripeBackground(index) }"
        >
          <div class="container py-1">
            <div class="row">
              <div class="col-4">
                <span class="h2 font-weight-lighter">{{ schedule }}</span>
              </div>
              <div class="col-8 text-right my-auto">
                <span class="font-weight-bold text-middle">{{ timeRemaining(schedule) }}</span>
                <span>{{ (schedule !== "--:--") ? " Remaining" : "No train in 1 hour ahead" }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios"

export default {
  data() {
    return {
      trainTo: null,
      nextStation: null,
      station: {
        from: "",
        to: "",
        options: [
          { value: 1, text: "Suvarnabhumi" },
          { value: 2, text: "Ladkrabang" },
          { value: 3, text: "Ban Thap Chang" },
          { value: 4, text: "Hua Mak" },
          { value: 5, text: "Ramkhamhaeng" },
          { value: 6, text: "Makkasan" },
          { value: 7, text: "Ratchaprarop" },
          { value: 8, text: "Phaya Thai" }
        ]
      },
      time: {
        selected: "Current Time",
        isHoliday: false,
        options: [
          'Current Time', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00',
          '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
          '21:00', '22:00', '23:00', '00:00'
        ],
      },
      schedules: [],
      price: null
    }
  },
  computed: {
    originData() {
      return this.station.options.filter(val => {
        if (val.value !== this.station.to.value) return val
      })
    },
    destinationData() {
      return this.station.options.filter(val => {
        if (val.value !== this.station.from.value) return val
      })
    }
  },
  methods: {
    doEstimate() {
      let fromIndex = this.station.from.value
      let toIndex = this.station.to.value
      if (fromIndex === toIndex) return
      if (toIndex > fromIndex) {
        this.trainTo = 8
        this.nextStation = fromIndex + 1
      } else if (toIndex < fromIndex) {
        this.trainTo = 1
        this.nextStation = fromIndex - 1
      }
      let dayType = (this.time.isHoliday) ? 'holiday' : 'weekday'
      let specificTime = this.time.selected
      let reqAPI
      if (specificTime === "Current Time") {
        reqAPI = `https://app.loukhin.com/arl-today/api/get/${fromIndex}/${toIndex}/now`
      } else {
        reqAPI = `https://app.loukhin.com/arl-today/api/get/${fromIndex}/${toIndex}/${specificTime}/${dayType}`
      }
      axios.get(reqAPI).then(res => {
        this.schedules = res.data.time.length !== 0 ? res.data.time : ["--:--"]
        this.price = res.data.price
      })
    },
    timeRemaining(time) {
      if (time === "--:--") return
      let hours = time.split(":")[0]
      let minutes = time.split(":")[1]
      let remaining = new Date(
        new Date().setHours(hours, minutes, 0) - new Date().setSeconds(0)
      )
      let remainText
      if (remaining.getUTCHours() >= 1) {
        remaining = remaining.getUTCHours()
        remainText = `${remaining} ${remaining > 1 ? "hours" : "hour"}`
      } else {
        remaining = remaining.getMinutes()
        remainText = `${remaining} ${remaining > 1 ? "mins" : "min"}`
      }
      return remainText
    },
    stripeBackground(tableIndex) {
      if (tableIndex % 2 === 0) {
        return true
      } else {
        return false
      }
    }
  },
  watch: {
    station: {
      handler() {
        let fromIndex = this.station.from.value
        let toIndex = this.station.to.value
        if (
          fromIndex !== toIndex &&
          typeof fromIndex !== "undefined" &&
          typeof toIndex !== "undefined"
        )
          this.doEstimate()
      },
      deep: true
    },
    time: {
      handler() {
        let fromIndex = this.station.from.value
        let toIndex = this.station.to.value
        if (
          fromIndex !== toIndex &&
          typeof fromIndex !== "undefined" &&
          typeof toIndex !== "undefined"
        )
          this.doEstimate()
      },
      deep: true
    }
  }
}
</script>
<style scoped>
#app-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(slateblue, cornflowerblue);
  padding-top: 8vw;
  padding-bottom: 50px;
  user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
}
#text-price {
  font-size: 36px;
}
</style>