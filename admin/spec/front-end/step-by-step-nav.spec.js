/* eslint-env jasmine */

describe('A stepnav module', function () {
  'use strict'

  let element
  let stepnav
  const html = `
    <div id="step-by-step-navigation" data-module="gemstepnav" class="app-step-nav app-step-nav--active govuk-!-margin-top-0" data-id="e01e924b-9c7c-4c71-8241-66a575c2f61f" data-show-text="show" data-hide-text="hide" data-show-all-text="Show all" data-hide-all-text="Hide all">
      <ol class="app-step-nav__steps">
          <li class="app-step-nav__step js-step step-is-shown" id="prepare-for-the-check">
              <div class="app-step-nav__header js-toggle-panel" data-position="1">
                  <h3 class="app-step-nav__title">
                  <span class="app-step-nav__circle app-step-nav__circle--number">
                      <span class="app-step-nav__circle-inner">
                        <span class="app-step-nav__circle-background">
                          <span class="app-step-nav__circle-step-label govuk-visually-hidden">Step</span> 1
                          <span class="app-step-nav__circle-step-colon govuk-visually-hidden" aria-hidden="true">:</span>
                        </span>
                      </span>
                    </span>
                      <span class="js-step-title">
                      <button
                              class="app-step-nav__button app-step-nav__button--title js-step-title-button"
                              aria-expanded="true"
                              aria-controls="step-panel-1">
                          <span class="js-step-title-text">
                              Prepare for the check
                          </span>
                          <span class="app-step-nav__toggle-link js-toggle-link"
                                aria-hidden="true">hide</span></button></span>
                  </h3>
              </div>
              <div class="app-step-nav__panel js-panel" id="step-panel-1">
                  <p class="app-step-nav__paragraph">
                      Prepare for the check by reading guidance documents, ensuring all pupils who will be taking the check are on the pupil register, grouping pupils and applying access arrangements
                  </p>
              </div>
          </li>
          <li class="app-step-nav__step js-step step-is-shown" id="preview-the-check">
              <div class="app-step-nav__header js-toggle-panel" data-position="2">
                  <h3 class="app-step-nav__title">
                    <span class="app-step-nav__circle app-step-nav__circle--number">
                      <span class="app-step-nav__circle-inner">
                        <span class="app-step-nav__circle-background">
                          <span class="app-step-nav__circle-step-label govuk-visually-hidden">Step</span> 2
                          <span class="app-step-nav__circle-step-colon govuk-visually-hidden" aria-hidden="true">:</span>
                        </span>
                      </span>
                    </span>
                      <span class="js-step-title">
                        <button class="app-step-nav__button app-step-nav__button--title js-step-title-button"
                                aria-expanded="true" aria-controls="step-panel-2">
                            <span class="js-step-title-text">
                              Preview the check
                             </span>
                            <span class="app-step-nav__toggle-link js-toggle-link"
                                  aria-hidden="true">hide</span></button></span>
                  </h3>
              </div>
    
              <div class="app-step-nav__panel js-panel" id="step-panel-2">
                  <p class="app-step-nav__paragraph">
                      The MTC can be previewed to see what the pupils will see during the check in the 'try it out' area. This area can also be used to preview access arrangements and check that the browsers and devices in the school are compatible with the MTC
                  </p>
              </div>
          </li>
          <li class="app-step-nav__step js-step step-is-shown" id="start-the-official-check">
              <div class="app-step-nav__header js-toggle-panel" data-position="3">
                  <h3 class="app-step-nav__title">
                    <span class="app-step-nav__circle app-step-nav__circle--number">
                      <span class="app-step-nav__circle-inner">
                        <span class="app-step-nav__circle-background">
                          <span class="app-step-nav__circle-step-label govuk-visually-hidden">Step</span> 3
                          <span class="app-step-nav__circle-step-colon govuk-visually-hidden" aria-hidden="true">:</span>
                        </span>
                      </span>
                    </span>
                      <span class="js-step-title">
                        <button class="app-step-nav__button app-step-nav__button--title js-step-title-button"
                                aria-expanded="true" aria-controls="step-panel-3">
                            <span class="js-step-title-text">
                              Start the official check
                             </span>
                            <span class="app-step-nav__toggle-link js-toggle-link"
                                  aria-hidden="true">hide</span></button></span>
                  </h3>
              </div>
    
              <div class="app-step-nav__panel js-panel" id="step-panel-3">
                  <p class="app-step-nav__paragraph">
                      This is the official Multiplication tables check.
                      Please generate passwords and PINs and hand them to pupils to use for the Official check.
                  </p>
              </div>
          </li>
          <li class="app-step-nav__step js-step step-is-shown" id="review-the-check">
              <div class="app-step-nav__header js-toggle-panel" data-position="4">
                  <h3 class="app-step-nav__title">
                    <span class="app-step-nav__circle app-step-nav__circle--number">
                      <span class="app-step-nav__circle-inner">
                        <span class="app-step-nav__circle-background">
                          <span class="app-step-nav__circle-step-label govuk-visually-hidden">Step</span> 4
                          <span class="app-step-nav__circle-step-colon govuk-visually-hidden" aria-hidden="true">:</span>
                        </span>
                      </span>
                    </span>
                      <span class="js-step-title">
                        <button class="app-step-nav__button app-step-nav__button--title js-step-title-button"
                                aria-expanded="true" aria-controls="step-panel-4">
                            <span class="js-step-title-text">
                              Review the check
                             </span>
                            <span class="app-step-nav__toggle-link js-toggle-link"
                                  aria-hidden="true">hide</span></button></span>
                  </h3>
              </div>
    
              <div class="app-step-nav__panel js-panel" id="step-panel-4">
                  <p class="app-step-nav__paragraph">
                      Go through the pupil status to ensure all pupils have successfully taken the check
                      or have a reason for removing pupil from the MTC register
                  </p>
              </div>
          </li>
          <li class="app-step-nav__step js-step step-is-shown" id="after-the-check">
              <div class="app-step-nav__header js-toggle-panel" data-position="5">
                  <h3 class="app-step-nav__title">
                    <span class="app-step-nav__circle app-step-nav__circle--number">
                      <span class="app-step-nav__circle-inner">
                        <span class="app-step-nav__circle-background">
                          <span class="app-step-nav__circle-step-label govuk-visually-hidden">Step</span> 5
                          <span class="app-step-nav__circle-step-colon govuk-visually-hidden" aria-hidden="true">:</span>
                        </span>
                      </span>
                    </span>
                      <span class="js-step-title">
                        <button class="app-step-nav__button app-step-nav__button--title js-step-title-button"
                                aria-expanded="true" aria-controls="step-panel-5">
                            <span class="js-step-title-text">
                              After the check
                             </span>
                            <span class="app-step-nav__toggle-link js-toggle-link"
                                  aria-hidden="true">hide</span></button></span>
                  </h3>
              </div>
              <div class="app-step-nav__panel js-panel" id="step-panel-5">
                  <p class="app-step-nav__paragraph">
                      Once the pupil status is reviewed and complete.
                      Go into the headteacher's declaration form to check through the pupil outcomes.
                      View the results once they have been released.
                  </p>
              </div>
          </li>
      </ol>
    </div>
  `

  beforeEach(function () {
    stepnav = new window.GOVUK.Modules.StepByStepNavigation()
    document.body.innerHTML = html
    element = document.getElementById('step-by-step-navigation')
    stepnav.start(element)
  })

  afterEach(function () {
    document.innerHTML = ``
    window.sessionStorage.clear()
  })

  it('has a class of app-step-nav--active to indicate the js has loaded', function () {
    expect(element.classList[1]).toEqual('app-step-nav--active')
  })

  it('is not hidden', function () {
    element.classList.forEach(elClass =>
      expect(elClass.indexOf('js-hidden')).toBe(-1)
    )
  })

  it('has a show/hide all button', function () {
    const showHideAllButton = document.body.querySelector('.js-step-controls-button')
    expect(showHideAllButton).toBeDefined()
    expect(showHideAllButton.innerText).toBe('Show all')
    // It has an aria-expanded false attribute as all steps are hidden
    expect(showHideAllButton.getAttribute('aria-expanded')).toBe('false')
    // It has an aria-controls attribute that includes all the step_content IDs
    expect(showHideAllButton.getAttribute('aria-controls')).toBe('step-panel-1')
  })

  it('has no steps which have an shown state', function () {
    const shownSteps = element.querySelectorAll('.step-is-shown').length
    expect(shownSteps).toEqual(0)
  })

  it('inserts a button into each step to show/hide content', function () {
    const titleButtons = element.querySelectorAll('.js-step-title-button')
    titleButtons.forEach(titleButton => {
      expect(titleButton.classList[0].indexOf('app-step-nav__button--title')).toBe(-1)
      expect(titleButton.getAttribute('aria-expanded')).toBe('false')
    })
    expect(titleButtons[0].getAttribute('aria-controls')).toBe('step-panel-1')
    expect(titleButtons[1].getAttribute('aria-controls')).toBe('step-panel-2')
  })

  it('ensures all step content is hidden', function () {
    element.querySelectorAll('.app-step-nav__step').forEach(function (step) {
      step.classList.forEach(function (cl) {
        expect(cl.indexOf('step-is-shown')).toBe(-1)
      })
    })
  })

  it('adds a show/hide element to each step', function () {
    const stepHeaders = element.querySelectorAll('.app-step-nav__header')
    stepHeaders.forEach(function (stepHeader) {
      expect(stepHeader.querySelector('.js-toggle-link')).toBeDefined()
      expect(stepHeader.querySelector('.js-toggle-link').innerText).toEqual('show')
    })
  })

  describe('Clicking the "Show all" button', function () {
    beforeEach(function () {
      clickShowHideAll()
    })

    it('adds a .step-is-shown class to each step to hide the icon', function () {
      const stepCount = element.querySelectorAll('.app-step-nav__step').length
      expect(element.querySelectorAll('.step-is-shown').length).toEqual(stepCount)
    })

    it('adds an aria-expanded attribute to each step link', function () {
      const stepCount = element.querySelectorAll('.app-step-nav__step').length
      expect(element.querySelectorAll('.js-step-title-button[aria-expanded="true"]').length).toEqual(stepCount)
    })

    it('changes the Show/Hide all button text to "Hide all"', function () {
      expect(document.querySelector('.js-step-controls-button').innerText).toEqual('Hide all')
    })

    it('changes all the "show" elements to say "hide"', function () {
      element.querySelectorAll('.js-toggle-link').forEach(function (toggleLink) {
        expect(toggleLink.innerText).toEqual('hide')
      })
    })
  })

  describe('Clicking the "Hide all" button', function () {
    beforeEach(function () {
      clickShowHideAll()
      clickShowHideAll()
    })

    it('changes the Show/Hide all button text to "Show all"', function () {
      expect(document.querySelector('.js-step-controls-button').innerText).toEqual('Show all')
    })

    it('changes all the "hide" elements to say "show"', function () {
      element.querySelectorAll('.js-toggle-link').forEach(function (toggleLink) {
        expect(toggleLink.innerText).toEqual('show')
      })
    })
  })

  describe('Opening a step', function () {
    // When a step is open (testing: toggleStep, openStep)
    it('has a class of step-is-shown', function () {
      const stepLink = element.querySelector('.app-step-nav__button--title')
      const step = element.querySelector('.app-step-nav__step')
      stepLink.click()
      expect(step.classList[2].indexOf('step-is-shown')).toBeGreaterThan(-1)
    })

    // When a step is open (testing: toggleState, setExpandedState)
    it('has a an aria-expanded attribute and the value is true', function () {
      const stepLink = element.querySelector('.app-step-nav__button--title')
      stepLink.click()
      expect(stepLink.getAttribute('aria-expanded')).toBe('true')
    })
  })

  describe('Hiding a step', function () {
    // When a step is hidden (testing: toggleStep, hideStep)
    it('removes the step-is-shown class', function () {
      const stepLink = element.querySelector('.app-step-nav__button--title')
      const step = element.querySelector('.app-step-nav__step')
      stepLink.click()
      expect(step).toHaveClass('step-is-shown')
      stepLink.click()
      expect(step).not.toHaveClass('step-is-shown')
    })

    // When a step is hidden (testing: toggleState, setExpandedState)
    it('has a an aria-expanded attribute and the value is false', function () {
      const stepLink = element.querySelector('.app-step-nav__button--title')
      stepLink.click()
      expect(stepLink.getAttribute('aria-expanded')).toBe('true')
      stepLink.click()
      expect(stepLink.getAttribute('aria-expanded')).toBe('false')
    })
  })

  describe('when a step is supposed to be shown by default', function () {
    beforeEach(function () {
      stepnav = new window.GOVUK.Modules.StepByStepNavigation()
      document.body.innerHTML = html
      element = document.getElementById('step-by-step-navigation')
      element.querySelectorAll('.js-step')[1].setAttribute('data-show', '')
      stepnav.start(element)
    })

    it('shows the step it\'s supposed to', function () {
      const openStep = element.querySelectorAll('.js-step')[1]
      expect(openStep).toHaveClass('step-is-shown')
    })

    it('leaves the other steps closed', function () {
      const closedStep1 = element.querySelectorAll('.js-step')[0]
      const closedStep3 = element.querySelectorAll('.js-step')[2]

      expect(closedStep1).not.toHaveClass('step-is-shown')
      expect(closedStep3).not.toHaveClass('step-is-shown')
    })
  })

  function clickShowHideAll () {
    document.body.querySelector('.js-step-controls-button').click()
  }
})
