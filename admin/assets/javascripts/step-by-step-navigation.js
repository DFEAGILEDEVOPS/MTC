
// based on https://github.com/alphagov/govuk_publishing_components/blob/v9.3.6/app/assets/javascripts/govuk_publishing_components/components/step-by-step-nav.js

window.GOVUK = window.GOVUK || {}
window.GOVUK.Modules = window.GOVUK.Modules || {}
window.GOVUK.support = window.GOVUK.support || {}

window.GOVUK.support.history = function () {
  return window.history && window.history.pushState && window.history.replaceState
}

window.GOVUK.getCurrentLocation = function () {
  return window.location
};

(function (Modules) {
  'use strict'

  Modules.StepByStepNavigation = function () {
    const actions = {} // stores text for JS appended elements 'show' and 'hide' on steps, and 'show/hide all' button
    let rememberShownStep = false
    const sessionStoreLink = 'govuk-step-nav-active-link'
    const activeLinkClass = 'app-step-nav__list-item--active'

    this.start = function (element) {
      window.addEventListener('unload', () => storeScrollPosition)

      // Indicate that js has worked
      element.classList.add('app-step-nav--active')

      // Prevent FOUC, remove class hiding content
      element.classList.remove('js-hidden')

      rememberShownStep = Object.keys(element.attributes).map(e => element.attributes[e]).filter(x => x.name.indexOf('data-remember') >= 0).length
      const steps = document.querySelector(`#${element.id}`).querySelectorAll('.js-step')
      const totalSteps = document.querySelector(`#${element.id}`).querySelectorAll('.js-panel').length

      let showOrHideAllButton

      getTextForInsertedElements()
      addShowHideAllButton()
      addAriaControlsAttrForShowHideAllButton()

      hideAllSteps()
      showLinkedStep()
      ensureOnlyOneActiveLink()

      bindToggleForSteps()
      bindToggleShowHideAllButton()

      function getTextForInsertedElements () {
        actions.showText = document.querySelector(`#${element.id}`).getAttribute('data-show-text')
        actions.hideText = document.querySelector(`#${element.id}`).getAttribute('data-hide-text')
        actions.showAllText = document.querySelector(`#${element.id}`).getAttribute('data-show-all-text')
        actions.hideAllText = document.querySelector(`#${element.id}`).getAttribute('data-hide-all-text')
      }

      // When navigating back in browser history to the step nav, the browser will try to be "clever" and return
      // the user to their previous scroll position. However, since we collapse all but the currently-anchored
      // step, the content length changes and the user is returned to the wrong position (often the footer).
      // In order to correct this behaviour, as the user leaves the page, we anticipate the correct height we wish the
      // user to return to by forcibly scrolling them to that height, which becomes the height the browser will return
      // them to.
      // If we can't find an element to return them to, then reset the scroll to the top of the page. This handles
      // the case where the user has expanded all steps, so they are not returned to a particular step, but
      // still could have scrolled a long way down the page.
      function storeScrollPosition () {
        hideAllSteps()
        const step = getStepForAnchor()
        document.body.scrollTop = step && step.length ? step.offsetTop : 0
      }

      function addShowHideAllButton () {
        const insertEl = document.createElement('div')
        insertEl.classList.add('app-step-nav__controls')
        insertEl.innerHTML = '<button aria-expanded="false" class="app-step-nav__button app-step-nav__button--controls js-step-controls-button">' + actions.showAllText + '</button>'
        element.insertBefore(insertEl, element.childNodes[0])
      }

      function addAriaControlsAttrForShowHideAllButton () {
        const ariaControlsValue = element.querySelector('.js-panel').getAttribute('id')

        showOrHideAllButton = document.querySelector('.js-step-controls-button')
        showOrHideAllButton.setAttribute('aria-controls', ariaControlsValue)
      }

      function hideAllSteps () {
        setAllStepsShownState(false)
      }

      function setAllStepsShownState (isShown) {
        for (let i = 0; i < steps.length; i++) {
          const stepView = new StepView(steps[i])
          stepView.preventHashUpdate()
          stepView.setIsShown(isShown)
        }
      }

      function showLinkedStep () {
        let step
        if (rememberShownStep) {
          step = getStepForAnchor()
        } else {
          step = Array.prototype.slice.call(steps).filter(x => x.matches('[data-show]'))
        }
        if (step && step.length) {
          step.forEach(s => {
            const stepView = new StepView(s)
            stepView.show()
          })
        }
      }

      function getStepForAnchor () {
        const anchor = getActiveAnchor()
        return anchor.length ? element.querySelector('#' + escapeSelector(anchor.substr(1))) : null
      }

      function getActiveAnchor () {
        return GOVUK.getCurrentLocation().hash
      }

      function bindToggleForSteps () {
        const togglePanels = element.querySelectorAll('.js-toggle-panel')
        for (let i = 0; i < togglePanels.length; i++) {
          togglePanels[i].addEventListener('click', function (event) {
            const step = event.target.closest('.js-step')

            const stepView = new StepView(step)
            stepView.toggle()
            setShowHideAllText()
          })
        }
      }

      function loadFromSessionStorage (key) {
        return sessionStorage.getItem(key)
      }

      function removeFromSessionStorage (key) {
        sessionStorage.removeItem(key)
      }

      function ensureOnlyOneActiveLink () {
        const activeLinks = element.querySelectorAll('.js-list-item.' + activeLinkClass)

        if (activeLinks.length <= 1) {
          return
        }

        const lastClicked = loadFromSessionStorage(sessionStoreLink)

        if (lastClicked) {
          removeActiveStateFromAllButCurrent(activeLinks, lastClicked)
          removeFromSessionStorage(sessionStoreLink)
        } else {
          const activeLinkInActiveStep = element.querySelector('.app-step-nav__step--active').querySelector('.' + activeLinkClass)

          if (activeLinkInActiveStep.length) {
            activeLinks.classList.remove(activeLinkClass)
            activeLinkInActiveStep.classList.add(activeLinkClass)
          } else {
            activeLinks.slice(1).classList.remove(activeLinkClass)
          }
        }
      }

      function removeActiveStateFromAllButCurrent (links, current) {
        links.elements.forEach(function (link) {
          if (link.querySelector('.js-link').getAttribute('position').toString() !== current.toString()) {
            link.classList.remove(activeLinkClass)
          }
        })
      }

      function bindToggleShowHideAllButton () {
        showOrHideAllButton = document.querySelector('.js-step-controls-button')
        showOrHideAllButton.addEventListener('click', function () {
          let shouldShowAll
          if (showOrHideAllButton.textContent === actions.showAllText) {
            showOrHideAllButton.textContent = actions.hideAllText
            element.querySelector('.js-toggle-link').textContent = actions.hideText
            shouldShowAll = true
          } else {
            showOrHideAllButton.textContent = actions.showAllText
            element.querySelector('.js-toggle-link').textContent = actions.showText
            shouldShowAll = false
          }

          setAllStepsShownState(shouldShowAll)
          showOrHideAllButton.setAttribute('aria-expanded', shouldShowAll)
          setShowHideAllText()
          setHash(null)

          return false
        })
      }

      function setShowHideAllText () {
        const shownSteps = element.querySelectorAll('.step-is-shown').length
        // Find out if the number of is-opens == total number of steps
        if (shownSteps === totalSteps) {
          showOrHideAllButton.textContent = actions.hideAllText
        } else {
          showOrHideAllButton.textContent = actions.showAllText
        }
      }

      function escapeSelector (s) {
        const cssMatcher = /([\x00-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g // eslint-disable-line no-control-regex
        return s.replace(cssMatcher, '\\$&')
      }
    }

    function StepView (stepElement) {
      const titleLink = stepElement.querySelector('.js-step-title-button')
      const stepContent = stepElement.querySelector('.js-panel')
      let shouldUpdateHash = rememberShownStep
      this.title = stepElement.querySelector('.js-step-title-text').textContent.trim()
      this.element = stepElement

      this.show = show
      this.hide = hide
      this.toggle = toggle
      this.setIsShown = setIsShown
      this.isShown = isShown
      this.isHidden = isHidden
      this.preventHashUpdate = preventHashUpdate

      function show () {
        setIsShown(true)
      }

      function hide () {
        setIsShown(false)
      }

      function toggle () {
        setIsShown(isHidden())
      }

      function setIsShown (isShown) {
        stepElement.classList.toggle('step-is-shown', isShown)
        stepContent.classList.toggle('js-hidden', !isShown)
        titleLink.setAttribute('aria-expanded', isShown)
        stepElement.querySelector('.js-toggle-link').textContent = isShown ? actions.hideText : actions.showText

        if (shouldUpdateHash) {
          updateHash(stepElement)
        }
      }

      function isShown () {
        return stepElement.classList.contains('step-is-shown')
      }

      function isHidden () {
        return !isShown()
      }

      function preventHashUpdate () {
        shouldUpdateHash = false
      }
    }

    function updateHash (stepElement) {
      const stepView = new StepView(stepElement)
      const hash = stepView.isShown() && '#' + stepElement.getAttribute('id')
      setHash(hash)
    }

    // Sets the hash for the page. If a falsy value is provided, the hash is cleared.
    function setHash (hash) {
      if (!GOVUK.support.history()) {
        return
      }

      const newLocation = hash || GOVUK.getCurrentLocation().pathname
      history.replaceState({}, '', newLocation)
    }
  }
})(window.GOVUK.Modules)
