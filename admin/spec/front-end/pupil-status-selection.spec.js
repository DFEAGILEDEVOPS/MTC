/* eslint-env jasmine */

describe('A pupil status', function () {
  'use strict'
  let cardElement
  let detailsElement
  const html = `
   <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
            <div id="red-card" class="govuk-panel govuk-panel custom-card red-card">
                <div class="govuk-panel__body custom-card-small-text">
                    Checks that require action
                </div>
                <h1 class="custom-card-large-text">
                    0
                </h1>
                <div class="govuk-panel__body custom-card-small-text">
                    of 75 pupils
                </div>
            </div>
            <details id="red-card-details" class="govuk-details red-card-details" data-module="govuk-details">
                <summary class="govuk-details__summary">
                        <span class="govuk-details__summary-text">
                          Checks that require action
                        </span>
                </summary>
                <div class="govuk-details__text">
                    No pupils found
                </div>
            </details>
        </div>
    </div>
  `

  beforeEach(function () {
    document.body.innerHTML = html
    cardElement = document.getElementById('red-card')
    detailsElement = document.getElementById('red-card-details')
    window.MTCAdmin.pupilStatusSelection()
  })

  afterEach(function () {
    document.innerHTML = ''
  })

  it('expects the details panel to be collapsed by default', function () {
    expect(detailsElement.open).toBeFalsy()
  })

  it('expects the details panel to expand when red card div is clicked', function () {
    cardElement.click()
    expect(detailsElement.open).toBeTruthy()
  })

  it('expects the opened details panel to collapse when red card div is clicked', function () {
    // First click will expand the details panel
    cardElement.click()
    // Second click will collapse the details panel
    cardElement.click()
    expect(detailsElement.open).toBeFalsy()
  })
})
