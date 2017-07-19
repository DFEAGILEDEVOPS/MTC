/* global $ ga */
(function (global) {
  'use strict'
  var GOVUK = global.GOVUK || {}

  GOVUK.speedTest = {
    startTime: null,
    endTime: null,
    downloadSpeedKbps: null,
    sessionStartTime: null,
    minimumTransferTime: 8000,
    downloadIndex: 0,
    timeout: 60000, // 60 seconds in milliseconds
    files: [
      '128kb.text',
      '256kb.text',
      '512kb.text',
      '1mb.text',
      '2mb.text',
      '4mb.text',
      '8mb.text',
      '16mb.text',
      '32mb.text',
      '64mb.text',
      '128mb.text'
    ],
    baseFilePath: '/data/',

    /**
     * Control handler that determines what files to download.
     * @param {number} timeTaken - Milliseconds taken to download the file
     * @param {number} bytes - The size of the download in bytes
     * @returns {boolean}
     */
    control: function (timeTaken, size) {
      var downloadSpeedKbps = 0
      var file = ''

      if (!$.isNumeric(timeTaken)) {
        return false
      }

      if (timeTaken >= GOVUK.speedTest.minimumTransferTime || GOVUK.speedTest.isLastFile()) {
        // we are prepared to accept this
        downloadSpeedKbps = this.calculate(size, timeTaken)
        this.downloadSpeedKbps = downloadSpeedKbps
        // ga('set', 'metric1', downloadSpeedKbps);
        this.ui.showSuccess()
        return true
      }

      this.downloadIndex += 1
      file = this.files[this.downloadIndex]
      this.download(file)
      return true
    },

    isLastFile: function () {
      var i = 1
      // We dont want to give the 128M file to IE8 at it wont work.
      if (GOVUK.speedTest.isIE8() && GOVUK.speedTest.downloadIndex === 9) {
        return true
      }
      return (GOVUK.speedTest.downloadIndex + i) === GOVUK.speedTest.files.length
    },

    isIE8: function () {
      if (document.addEventListener) {
        return false
      }
      return true
    },

    ui: {
      round2: function (num) {
        return Math.round(num * 100) / 100
      },

      showInProgress: function () {
        $('div.section').addClass('hidden')
        $('div.js-in-progress').removeClass('hidden')

        if (global.ga) {
          ga('send', 'event', 'speedTest', 'in-progress', 'Speed Test')
        }
      },

      showSuccess: function () {
        $('div.section').addClass('hidden')
        $('div.js-success').removeClass('hidden')
        // send the data to the back end
        var data = {
          downloadSpeedKbps: GOVUK.speedTest.downloadSpeedKbps,
          resolution: global.screen.width + 'x' + global.screen.height
        }
        $.get('/logger', data)
        if (global.ga) {
          ga('send', 'event', 'speedTest', 'success', 'Speed Test', {
            metric1: GOVUK.speedTest.downloadSpeedKbps
          })
        }
      },

      showError: function () {
        $('div.section').addClass('hidden')
        $('div.js-error').removeClass('hidden')
        if (global.ga) {
          ga('send', 'event', 'speedTest', 'error', 'Speed Test')
        }
      },

      getSpeedTestResult: function (kbps) {
        if (kbps / 1024 >= 1024) {
          return this.round2(kbps / 1024 / 1024).toString() + ' Gbps'
        } else if (kbps >= 1024) {
          return this.round2(kbps / 1024).toString() + ' Mbps'
        } else {
          return this.round2(kbps).toString() + ' Kbps'
        }
      }
    }, // ui

    start: function () {
      var self = GOVUK.speedTest

      self.ui.showInProgress()
      self.downloadIndex = 0
      self.sessionStartTime = new Date().getTime()
      self.startDownload()
    },

    startDownload: function () {
      var file = this.files[this.downloadIndex]
      this.download(file)
    },

    download: function (file) {
      this.startTime = new Date().getTime()
      var url = this.baseFilePath + file
      $.ajax({
        type: 'GET',
        url: url,
        cache: false,
        dataType: 'text',
        processData: false,
        async: true,
        timeout: this.timeout,
        success: function (data, status, xhr) {
          GOVUK.speedTest.endTime = new Date().getTime()
          var timeTaken = GOVUK.speedTest.endTime - GOVUK.speedTest.startTime // ms
          GOVUK.speedTest.control(timeTaken, data.length)
        },
        error: function (xhr, errorType, error) {
          console.log(errorType)
          // show error
          console.log(error)
          if (global.ga) {
            ga('send', 'event', 'speedTest', 'error', 'Speed Test')
          }
          GOVUK.speedTest.ui.showError()
        }
      })
    },

    /**
     *
     * @param size bytes
     * @param time ms
     * @returns {number}
     */
    calculate: function (size, time) {
      var bandwidth = size * (1000 / time) // bytes per second
      var bandwidthKbps = Math.round((bandwidth / 1024) * 8) // Kilobits per second
      return bandwidthKbps
    }

  }  // speedtest

  global.GOVUK = GOVUK
})(window)
