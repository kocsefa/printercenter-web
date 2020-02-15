// <device></device>
Vue.component('device', {
  props: ['ipaddress', 'date', 'infolist', 'deviceinfo', 'device', 'highlightlist'],
  methods: {
    selectlabel(label) {
      this.$emit('selectlabel', label)
    }
  },
  computed: {
    isOnline() {
      return this.device && this.device.status === 'online'
    }
  },
  template: `
    <div class="device" :class="{offline: !isOnline}">
      <div class="device-header">
        <div class="ip-address">
          <a :href="'http://' + ipaddress" target="_blank">{{ ipaddress }}</a>
        </div>
        <div>
          {{ date }}
        </div>
      </div>
      <div class="img">
        <img :src="'/images/' + this.device.manufacturer.toUpperCase() + '.jpg'" />
      </div>
      <div class="device-info">
        {{ deviceinfo }}
      </div>

      <div class="info">
        <div class="info-item"
             :class="{ highlight: highlightlist.indexOf(info.label) !== -1, top: highlightlist.indexOf(info.label) !== -1}"
             v-for="info in infolist">
          <span class="info-label"
                @click="selectlabel(info.label)">
                {{ info.label }}
          </span>
          <span class="gap"></span>
          <span :title="info.value" class="info-value">{{ info.value }}</span>
        </div>
      </div>
    </div>
  `
})

const printerListApp = new Vue({
  el: '#printer-list-app',
  data: {
    infoList: [],
    highlightList: [],
    search: '',
    scanList: [],
    selectedTimestamp: null
  },
  computed: {
    filteredDevices() {
      let regex = new RegExp('.?' + this.search, 'gmi')
      return this._infoList.filter(({ info }) =>
        info.filter(item => item.value.match(regex)).length > 0)
    },
    _infoList() {
      return this.infoList.map(info => {
        info.deviceinfo = info.info.find(i => i.label === 'Info')
        if (info.deviceinfo !== undefined) {
          info.deviceinfo = ((info.deviceinfo.value).split(';')[0]).split('/')[0]
        }
        info.info.splice(info.info.findIndex(i => i.label === 'Info'), 1)
        var d = new Date(info.date)
        info.date = `${d.getFullYear()}.${('0' + (d.getMonth() + 1)).slice(-2)}.${('0' + d.getDate()).slice(-2)} - ${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}`
        info.info.map(i => {
          if (i.label === 'Uptime') {
            let worktime = Math.floor(i.value / 8640000) + ' Days '
            i.value = i.value % 8640000
            worktime += Math.floor(i.value / 360000) + ' Hours '
            i.value = i.value % 360000
            worktime += Math.floor(i.value / 6000) + ' Minutes '
            i.value = worktime
          }
        })
        return info
      })
    }
  },
  methods: {
    applylabel(label) {
      var exists = this.highlightList.filter(hl => hl === label).length > 0
      if (exists) {
        this.highlightList = this.highlightList.filter(hl => hl !== label)
      } else {
        this.highlightList.push(label)
      }
    },
    defaulthighlight() {
      this.highlightList = [
        'Serial Number',
        'Total Print Count',
        'Color Impressions',
        'Black Impressions',
        'Color Large Impressions',
        'Black Large Impressions',
        'Device Name'
      ]
    },
    filterDeviceInfo() {
      axios
        .get(`/info-list?dateFilter=${this.selectedTimestamp}`)
        .then(res => {
          this.infoList = res.data
        })
    }
  },
  mounted() {
    flatpickr('#datepicker', {
      defaultDate: new Date(),
      // locale: 'tr',
      altInput: true,
      altFormat: 'F j, Y',
      dateFormat: 'Y-m-d',
      onChange: (_date, _dateString)  => {
        this.selectedTimestamp = null
        axios
          .get(`/scan-list?day=${_dateString}`)
          .then(res => {
            this.scanList = _.orderBy(res.data, ['label'])
          })
      }
    })

    axios
      .get('/info-list')
      .then(res => {
        // console.log(res)
        this.infoList = res.data
      })
  }
})
