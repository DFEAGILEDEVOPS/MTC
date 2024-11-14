
describe('pupil filter name module', function () {
  'use strict'
  const html = `
    <h3 class="govuk-heading-m govuk-!-margin-top-7">Search pupils by name or UPN</h3>
    <div class="govuk-form-group filter-name">
        <label for="search-name">
        </label>
        <span>
            <input class="govuk-input" id="search-name" type="text" name="search-name">
        </span>
    </div>
    <table id="register-pupils" data-name="filterablePupilsList" class="govuk-table govuk-spacious">
        <caption class="govuk-body govuk-table__caption">List of available pupils (11)</caption>
        <thead class="govuk-table__head">
        <tr class="govuk-table__row">
            <th scope="col" class="govuk-table__header govuk-!-width-one-half">
                <a class="no-underline sortingLink">Pupil<span class="sort-icon asc"><span>Sort by pupil</span></span></a>
            </th>
            <th scope="col" class="govuk-table__header govuk-!-width-one-quarter">
                <a class="no-underline sortingLink">Group<span class="sort-icon"><span>Sort by group</span></span></a>
            </th>
            <th scope="col" class="govuk-table__header govuk-!-width-one-quarter">
                <a class="no-underline sortingLink">Status<span class="sort-icon"><span>Sort by status</span></span></a>
            </th>
        </tr>
        </thead>
        <tbody class="govuk-table__body">
        <tr class="govuk-table__row">
            <td scope="row">
                <div class="govuk-highlight-wrapper">

                    <a id="pupilName" class="govuk-link govuk-!-font-weight-bold name-text-wrap" href="#">Brewer, Juliana</a>


                    <input type="hidden" id="pupilUpn" name="pupilUpn" value="G801200001010">
                </div>
            </td>
            <td class="govuk-table__cell">-</td>
            <td class="govuk-table__cell">Not started</td>
        </tr>
        <tr class="govuk-table__row">
            <td scope="row">
                <div class="govuk-highlight-wrapper">

                    <a id="pupilName" class="govuk-link govuk-!-font-weight-bold name-text-wrap" href="#">Daniels, Ebony</a>


                    <input type="hidden" id="pupilUpn" name="pupilUpn" value="T801200001007">
                </div>
            </td>
            <td class="govuk-table__cell">-</td>
            <td class="govuk-table__cell">Not started</td>
        </tr>
        <tr class="govuk-table__row">
            <td scope="row">
                <div class="govuk-highlight-wrapper">

                    <a id="pupilName" class="govuk-link govuk-!-font-weight-bold name-text-wrap" href="#">Duke, Gregory</a>


                    <input type="hidden" id="pupilUpn" name="pupilUpn" value="N801200001014">
                </div>
            </td>
            <td class="govuk-table__cell">-</td>
            <td class="govuk-table__cell">Not started</td>
        </tr>
        <tr class="govuk-table__row">
            <td scope="row">
                <div class="govuk-highlight-wrapper">

                    <a id="pupilName" class="govuk-link govuk-!-font-weight-bold name-text-wrap" href="#">Dunn, Nieves</a>


                    <input type="hidden" id="pupilUpn" name="pupilUpn" value="W801200001011">
                </div>
            </td>
            <td class="govuk-table__cell">-</td>
            <td class="govuk-table__cell">Not started</td>
        </tr>
        <tr class="govuk-table__row">
            <td scope="row">
                <div class="govuk-highlight-wrapper">

                    <a id="pupilName" class="govuk-link govuk-!-font-weight-bold name-text-wrap" href="#">Flowers, Burns</a>


                    <input type="hidden" id="pupilUpn" name="pupilUpn" value="K801200001012">
                </div>
            </td>
            <td class="govuk-table__cell">-</td>
            <td class="govuk-table__cell">Not started</td>
        </tr>
        <tr class="govuk-table__row">
            <td scope="row">
                <div class="govuk-highlight-wrapper">

                    <a id="pupilName" class="govuk-link govuk-!-font-weight-bold name-text-wrap" href="#">Hobbs, Koch</a>


                    <input type="hidden" id="pupilUpn" name="pupilUpn" value="L801200001003">
                </div>
            </td>
            <td class="govuk-table__cell">-</td>
            <td class="govuk-table__cell">Not started</td>
        </tr>
        <tr class="govuk-table__row">
            <td scope="row">
                <div class="govuk-highlight-wrapper">

                    <a id="pupilName" class="govuk-link govuk-!-font-weight-bold name-text-wrap" href="#">Jimenez, Bessie</a>


                    <input type="hidden" id="pupilUpn-72" name="pupilUpn" value="W801200001009">
                </div>
            </td>
            <td class="govuk-table__cell">-</td>
            <td class="govuk-table__cell">Not started</td>
        </tr>
        <tr class="govuk-table__row">
            <td scope="row">
                <div class="govuk-highlight-wrapper">

                    <a id="pupilName" class="govuk-link govuk-!-font-weight-bold name-text-wrap" href="#">Mcintyre, Kristine</a>


                    <input type="hidden" id="pupilUpn" name="pupilUpn" value="C801200001015">
                </div>
            </td>
            <td class="govuk-table__cell">-</td>
            <td class="govuk-table__cell">Not started</td>
        </tr>
        <tr class="govuk-table__row">
            <td scope="row">
                <div class="govuk-highlight-wrapper">

                    <a id="pupilName" class="govuk-link govuk-!-font-weight-bold name-text-wrap" href="#">Mendoza, Davenport</a>


                    <input type="hidden" id="pupilUpn" name="pupilUpn" value="H801200001001">
                </div>
            </td>
            <td class="govuk-table__cell">-</td>
            <td class="govuk-table__cell">Not started</td>
        </tr>
        <tr class="govuk-table__row">
            <td scope="row">
                <div class="govuk-highlight-wrapper">

                    <a id="pupilName" class="govuk-link govuk-!-font-weight-bold name-text-wrap" href="#">Mosley, Hallie</a>


                    <input type="hidden" id="pupilUpn" name="pupilUpn" value="P801200001005">
                </div>
            </td>
            <td class="govuk-table__cell">-</td>
            <td class="govuk-table__cell">Not started</td>
        </tr>
        <tr class="govuk-table__row">
            <td scope="row">
                <div class="govuk-highlight-wrapper">

                    <a id="pupilName" class="govuk-link govuk-!-font-weight-bold name-text-wrap" href="#">School 2, Pupil 01</a>


                    <input type="hidden" id="pupilUpn" name="pupilUpn" value="A00000000061A">
                </div>
            </td>
            <td class="govuk-table__cell">-</td>
            <td class="govuk-table__cell">Not started</td>
        </tr>
        </tbody>
    </table>
  `

  let unFilteredRows

  beforeEach(function () {
    document.body.innerHTML = html
    window.MTCAdmin.pupilFilter()
    unFilteredRows = document.getElementsByTagName('tbody')[0].querySelectorAll('tr:not(.filter-hidden-name)')
  })

  it('returns same amount of rows if no search term has been specified', function () {
    const searchInput = document.getElementById('search-name')
    const ev = new Event('change')
    searchInput.value = ''
    searchInput.dispatchEvent(ev)
    const filteredRows = document.getElementsByTagName('tbody')[0].querySelectorAll('tr:not(.filter-hidden-name)')
    expect(filteredRows.length).toEqual(unFilteredRows.length)
  })

  it('returns same amount of rows if search term has been specified', function () {
    const searchInput = document.getElementById('search-name')
    const ev = new Event('change')
    searchInput.value = 'B'
    searchInput.dispatchEvent(ev)
    const filteredRows = document.getElementsByTagName('tbody')[0].querySelectorAll('tr:not(.filter-hidden-name)').length
    expect(filteredRows.length).not.toEqual(unFilteredRows.length)
  })

  it('returns single row that matches the pupil upn', function () {
    const searchInput = document.getElementById('search-name')
    const ev = new Event('change')
    searchInput.value = 'G801200001010'
    searchInput.dispatchEvent(ev)
    const result = document.getElementsByTagName('tbody')[0].querySelectorAll('tr:not(.filter-hidden-name)')
    expect(result.length).toEqual(1)
    expect(result[0].querySelector('#pupilName').text).toEqual(unFilteredRows[0].querySelector('#pupilName').text)
  })

  it('returns single row that matches the pupil name', function () {
    const searchInput = document.getElementById('search-name')
    const ev = new Event('change')
    searchInput.value = 'Mosley, Hallie'
    searchInput.dispatchEvent(ev)
    const result = document.getElementsByTagName('tbody')[0].querySelectorAll('tr:not(.filter-hidden-name)')
    expect(result.length).toEqual(1)
    expect(result[0].querySelector('#pupilName').text).toEqual(unFilteredRows[9].querySelector('#pupilName').text)
  })

  it('returns no rows if the search term is not a match both for pupil name or upn', function () {
    const searchInput = document.getElementById('search-name')
    const ev = new Event('change')
    searchInput.value = 'Mosley, Brown'
    searchInput.dispatchEvent(ev)
    const result = document.getElementsByTagName('tbody')[0].querySelectorAll('tr:not(.filter-hidden-name)')
    expect(result.length).toEqual(0)
  })

  it('returns results even if pupil upns are not detected as hidden inputs within rows', function () {
    const searchInput = document.getElementById('search-name')
    document.querySelectorAll('#pupilUpn').forEach(function (a) {
      a.remove()
    })
    const ev = new Event('change')
    searchInput.value = 'Brewer'
    searchInput.dispatchEvent(ev)
    const result = document.getElementsByTagName('tbody')[0].querySelectorAll('tr:not(.filter-hidden-name)')
    expect(result.length).toEqual(1)
  })

  it('returns results even if pupil names are not detected and only upns are available', function () {
    const searchInput = document.getElementById('search-name')
    document.querySelectorAll('#pupilName').forEach(function (a) {
      a.remove()
    })
    const ev = new Event('change')
    searchInput.value = 'G801200001010'
    searchInput.dispatchEvent(ev)
    const result = document.getElementsByTagName('tbody')[0].querySelectorAll('tr:not(.filter-hidden-name)')
    expect(result.length).toEqual(1)
  })
})
