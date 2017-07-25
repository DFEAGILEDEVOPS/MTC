(function (global) {
  'use strict'

  var GOVUK = global.GOVUK || {}
  var defaultQuestionTimeLimit = 5  // seconds allowed per page
  var defaultPreloadInterval = 2 // seconds for student preparation
  var isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints || navigator.maxTouchPoints ||
    (window.Touch && document instanceof Touch) || (window.DocumentTouch && document instanceof DocumentTouch)

  var deadline
  var startTime
  var registerInputs = []

  // Needed for IE8
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt) {
      var len = this.length >>> 0
      var from = Number(arguments[1]) || 0

      from = (from < 0) ? Math.ceil(from) : Math.floor(from)

      if (from < 0) {
        from += len
      }

      for (; from < len; from++) {
        if (from in this && this[from] === elt) {
          return from
        }
      }
      return -1
    }
  }

  // Taken from jquery 1.12
  // https://github.com/jquery/jquery/blob/2d4f53416e5f74fa98e0c1d66b6f3c285a12f0ce/src/css/hiddenVisibleSelectors.js
  // Find out if an element is visible
  GOVUK.isVisible = function (elem) {
    return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)
  }

  // For IE8
  Date.now = Date.now || function () { return +new Date() }

  // Needed for IE8
  GOVUK.preventDefault = function (event) {
    event.preventDefault ? event.preventDefault() : (event.returnValue = false)
  }

  // Needed for IE
  GOVUK.createEvent = function (eventName) {
    var event = null
    try {
      event = new Event(eventName)
    } catch (error) {
      event = document.createEvent('Event')
      var bubble = false
      var cancelable = false
      event.initEvent(eventName, bubble, cancelable)
    }
    return event
  }

  // Needed for IE8
  GOVUK.addEvent = function addEvent ( obj, type, fn) {
    if (obj.attachEvent) {
      obj['e' + type + fn] = fn
      obj[type + fn] = function (){
        obj['e' + type + fn](window.event)
      }
      obj.attachEvent('on' + type, obj[type + fn])
    } else {
      obj.addEventListener(type, fn, false)
    }
  }

  // Needed for IE8
  GOVUK.removeEvent = function removeEvent (obj, type, fn) {
    if (obj.detachEvent) {
      obj.detachEvent('on' + type, obj[type + fn])
      obj[type + fn] = null
    } else {
      obj.removeEventListener(type, fn, false)
    }
  }

  GOVUK.getTextContent = function (element) {
    var text = ''
    if ('innerText' in element) {
      // IE8
      text = element.innerText
    } else {
      text = element.textContent
    }
    return text
  }

  // cross-browser version of .textContent
  GOVUK.setTextContent = function (element, text) {
    if ('innerText' in element) {
      // IE8
      element.innerText = text
    } else {
      element.textContent = text
    }
  }

  // Add a single character to the input from the user
  // up to 5 characters allowed then we stop adding.
  GOVUK.addInput = function (element, char) {
    var currentAnswer = GOVUK.getTextContent(element)
    var currentLength = currentAnswer.length

    if (currentLength === 5) {
      // 5 is the maxlength - we drop the input.
      return
    }
    if (char.length !== 1) {
      return
    }
    GOVUK.setTextContent(element, '' + currentAnswer + char)
  }

  // This is key, the user only has a few seconds to submit an answer or
  // the page will auto-submit (even if there is no input from the user)
  GOVUK.submitPageOnTimeout = function () {
    var form = document.getElementById('js-question-form')
    var questionTimeLimit = GOVUK.getQuestionTimeLimit()

    // Prefix setTimeout with `global` scope for IE8
    global.setTimeout(function () {
      // Copy the user input from the <span> into the <form>
      GOVUK.addInputToForm()
      form.submit()
    }, (questionTimeLimit * 1000))
  }

  GOVUK.getQuestionTimeLimit = function () {
    var questionTimeLimit = defaultQuestionTimeLimit
    var pageSettings = document.getElementById('js-page-time-settings')
    if (pageSettings.dataset.value) {
      questionTimeLimit = pageSettings.dataset.value
    }
    return questionTimeLimit
  }

  GOVUK.getLoadingTime = function () {
    var loadingTime = defaultPreloadInterval
    var loadingTimeContainer = document.getElementById('js-preload-div')
    if (loadingTimeContainer.dataset.value) {
      loadingTime = loadingTimeContainer.dataset.value
    }
    return loadingTime
  }

  // Show the 'Loading' screen for a short time before we ask a question
  GOVUK.preloadTimer = function () {
    var loadingTime = GOVUK.getLoadingTime()

    setTimeout(function () {
      var preloadDiv = document.getElementById('js-preload-div')
      var contentDiv = document.getElementById('js-content-div')
      preloadDiv.style.display = 'none'
      contentDiv.className = ''
      // This was originally emitted a custom event to decouple the dependencies.
      // However, you can't do that in IE8, so we now call this wrapper function.
      GOVUK.onContentShown()
    }, loadingTime * 1000)
  }

  GOVUK.keyPressListener = function () {
    var answer = document.getElementById('js-answer')
    var form = document.getElementById('js-question-form') // Never used?

    GOVUK.addEvent(document, 'keypress', function (e) {
      // keyCodes
      // 47-57 = 0-9
      // 96-105 = numpad 0-9
      var event = e || global.event
      var allowedChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

      if (!GOVUK.isVisible(answer)) {
        // keypress made when the form is hidden; ignore
        return false
      }

      // All other codes accumulate chars in the answer
      var code = event.which || event.keyCode // event.keyCode required for IE8
      var char = String.fromCharCode(code)
      if (allowedChars.indexOf(parseInt(char), 0) !== -1) {
        GOVUK.addInput(answer, char)
        GOVUK.preventDefault(event) // consume the event with IE8 support
      }
    })
  }

  GOVUK.clickListener = function () {
    GOVUK.addEvent(document, 'mousedown', function (e) {
      var event = e || global.event
      var eventType = isTouch ? 'touch ' + event.type : event.type
      var clickButton

      if (!event.which) {
        /* IE case */
        clickButton = (event.button < 2) ? 'left click' : ((event.button === 4) ? 'middle click' : 'right click')
      } else {
        /* All others */
        clickButton = (event.which < 2) ? 'left click' : ((event.which === 2) ? 'middle click' : 'right click')
      }
      GOVUK.registerInput(clickButton, eventType)
    })
  }

  GOVUK.keyDownListener = function () {
    var answer = document.getElementById('js-answer')
    var form = document.getElementById('js-question-form')
    var isSubmitted = false

    GOVUK.addEvent(document, 'keydown', function (e) {
      var event = e || global.event
      // Safari+macOS does not implement event.code
      // keyCode is deprecated.
      var keyCode = event.keyCode
      var eventKey = event.key

      // IE 9 cases
      if (!eventKey) {
        eventKey = keyCode
        if (eventKey === 8) eventKey = 'backspace'
        if (eventKey === 9) eventKey = 'tab'
        if (eventKey === 13) eventKey = 'enter'
        if (eventKey === 17) eventKey = 'control'
        if (eventKey === 18) eventKey = 'alt'
        if (eventKey === 32) eventKey = 'space'
        if (eventKey === 46) eventKey = 'delete'
        if (eventKey === 91) eventKey = 'meta'
        if (typeof eventKey === 'number') eventKey = String.fromCharCode(eventKey)
      } else {
        // Other browsers
        if (eventKey === ' ') eventKey = 'space'
        if (eventKey.length > 1) eventKey = eventKey.toLowerCase()
      }

      // Handle backspace before the question has finished loading
      if (keyCode === 8) {
        GOVUK.preventDefault(event)
      }

      var eventType = isTouch ? 'touch ' + event.type : event.type
      GOVUK.registerInput(eventKey, eventType)
      var currentAnswer = GOVUK.getTextContent(answer) // answer.textContent;

      if (!GOVUK.isVisible(answer)) {
        // keypress made when the form is hidden; ignore
        return false
      }

      // Handle backspace
      if (keyCode === 8) {
        GOVUK.setTextContent(answer, '' + currentAnswer.slice(0, currentAnswer.length - 1))
        GOVUK.preventDefault(event)
      }

      // Handle enter
      if (!isSubmitted && keyCode === 13) {
        // user pressed enter, consume the event
        GOVUK.preventDefault(event)
        if (!isSubmitted && currentAnswer.length > 0) {
          // Copy the user input from the <span> into the <form>
          GOVUK.addInputToForm()
          form.submit()
          isSubmitted = true
        }
      }
    })
  }

  // Prevent the form being submitted by the user without
  // any input.
  GOVUK.preventEmptyFormSubmit = function () {
    var form = document.getElementById('js-question-form') // Never used?
    var answer = document.getElementById('js-answer')
    GOVUK.addEvent(form, 'submit', function (e) {
      var event = e || global.event
      var currentAnswer = GOVUK.getTextContent(answer)
      if (currentAnswer.length === 0) {
        GOVUK.preventDefault(event)
      }
    })
  }

  // Hook up the numpad
  GOVUK.virtualNumpad = function () {
    var numpadId = 'js-numpad'
    var writeElementId = 'js-answer'
    var formId = 'js-question-form'

    var numpad = document.getElementById(numpadId)
    var answer = document.getElementById(writeElementId)
    var form = document.getElementById(formId)

    var isSubmitted = false

    GOVUK.addEvent(numpad, 'click', function (e) {
      // What was clicked?  Looks at the 'data-value' attribute to get string to be written
      var event = e || global.event

      if (!GOVUK.isVisible(answer)) {
        // Keypress made when the form is hidden; ignore
        return false
      }

      var target = null
      if (typeof event.target !== 'undefined') {
        target = event.target // Standard
      } else {
        target = event.srcElement // Hello, IE8
      }

      var attr = target.attributes.getNamedItem('data-value')
      if (!attr) {
        return
      }
      var char = attr.value
      var eventType = isTouch ? 'touch ' + event.type : event.type
      GOVUK.registerInput(char, eventType)

      // Write it in the input box
      var currentAnswer = GOVUK.getTextContent(answer)
      if (char === 'backspace') {
        GOVUK.setTextContent(answer, currentAnswer.slice(0, currentAnswer.length - 1))
      } else if (char === 'enter') {
        // Enter should submit the form if it is not empty
        if (!isSubmitted && currentAnswer.length > 0) {
          // Copy the user input from the <span> into the <form>
          GOVUK.addInputToForm()
          form.submit()
          isSubmitted = true
        }
      } else {
        GOVUK.addInput(answer, char)
      }
    })
  }

  GOVUK.preventRightClick = function () {
    GOVUK.addEvent(document, 'contextmenu', function (e) {
      var event = e || global.event
      GOVUK.preventDefault(event)
      return false
    })
  }

  /**
   * Push the keystroke, virtual key or click button in an array to be sent on form.submit()
   */
  GOVUK.registerInput = function (input, eventType) {
    registerInputs.push(JSON.stringify({input: input, eventType: eventType, clientInputDate: Date.now()}))
  }

  /**
   * Copy the written answer to a hidden <input> so that it is sent on form.submit()
   */
  GOVUK.addInputToForm = function() {
    var answer = document.getElementById('js-answer')
    var form = document.getElementById('js-question-form') // Never used?
    var formAnswer = document.getElementById('js-form-answer')
    var formRegisteredInputs = document.getElementById('js-form-registered-inputs')

    formAnswer.value = GOVUK.getTextContent(answer)
    if (formRegisteredInputs) {
      formRegisteredInputs.value = JSON.stringify(registerInputs)
    }
  }

  GOVUK.onDOMContentReady = function () {
    GOVUK.preloadTimer()
    GOVUK.preventEmptyFormSubmit()
    GOVUK.keyPressListener()
    GOVUK.clickListener()
    GOVUK.keyDownListener()
    GOVUK.virtualNumpad()
    GOVUK.preventRightClick()
  }

  GOVUK.onContentShown = function () {
    // Start the timers as the question is now visible
    var questionTimeLimit = GOVUK.getQuestionTimeLimit()
    startTime = Date.now()
    deadline = startTime + (questionTimeLimit * 1000)
    GOVUK.submitPageOnTimeout()
  }

  // IE8 does not trigger the DOMContentLoaded event, so use onload instead
  GOVUK.addEvent(global, 'load', GOVUK.onDOMContentReady)

  global.GOVUK = GOVUK
})(window)
