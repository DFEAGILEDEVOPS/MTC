'use strict'

/* global $ describe it expect */

describe('pupil-access-arrangements-selection', function () {
  const $accessArrangementsList = $('<ul class="checkbox-list" id="accessArrangementsList" role="listbox" aria-label="Select access arrangement(s)"></ul>')
  const $accessArrangementsListItems = $(
    '    <li>' +
    '        <div class="font-small">' +
    '            <label for="accessArrangement-0">' +
    '                Audible time alert' +
    '            </label>' +
    '        </div>' +
    '        <div class="multiple-choice-mtc">' +
    '            <input id="accessArrangement-0" name="accessArrangement[0]" type="checkbox" value="ATA"' +
    '                   aria-label="Tick accessArrangement Audible time alert." aria-checked="false" role="checkbox">' +
    '            <div></div>' +
    '        </div>' +
    '    </li>' +
    '    <li>' +
    '        <div class="font-small">' +
    '            <label for="accessArrangement-1">' +
    '                Colour contrast' +
    '            </label>' +
    '        </div>' +
    '        <div class="multiple-choice-mtc">' +
    '            <input id="accessArrangement-1" name="accessArrangement[1]" type="checkbox" value="CCT"' +
    '                   aria-label="Tick accessArrangement Colour contrast." aria-checked="false" role="checkbox">' +
    '            <div></div>' +
    '        </div>' +
    '    </li>' +
    '    <li>' +
    '        <div class="font-small">' +
    '            <label for="accessArrangement-2">' +
    '                Font size' +
    '            </label>' +
    '        </div>' +
    '        <div class="multiple-choice-mtc">' +
    '            <input id="accessArrangement-2" name="accessArrangement[2]" type="checkbox" value="FTS"' +
    '                   aria-label="Tick accessArrangement Font size." aria-checked="false" role="checkbox">' +
    '            <div></div>' +
    '        </div>' +
    '    </li>' +
    '    <li>' +
    '        <div class="font-small">' +
    '            <label for="accessArrangement-3">' +
    '                Input assistance (reason required)' +
    '            </label>' +
    '        </div>' +
    '        <div class="multiple-choice-mtc">' +
    '            <input id="accessArrangement-3" name="accessArrangement[3]" type="checkbox" value="ITA"' +
    '                   aria-label="Tick accessArrangement Input assistance (reason required)." aria-checked="false"' +
    '                   role="checkbox" >' +
    '            <div></div>' +
    '        </div>' +
    '        <div class="hide-checkbox-content">' +
    '            <div class="panel panel-border-wide">' +
    '                <div class="form-group">' +
    '                    <div class="form-label">Please explain why the pupil needs this arrangement</div>' +
    '                    <textarea id="inputAssistanceInformation" name="inputAssistanceInformation"' +
    '                              class="form-control form-control-3-4 restart-reason-info" rows="3"' +
    '                              maxlength="1000"></textarea>' +
    '                </div>' +
    '            </div>' +
    '            <br>' +
    '            <div class="notice">' +
    '                <i class="icon icon-important small">' +
    '                    <span class="visually-hidden">Warning</span>' +
    '                </i>' +
    '                <strong class="bold-xsmall">' +
    '                    Name of input assistant will need to be provided during the pupil\'s check' +
    '                </strong>' +
    '            </div>' +
    '        </div>' +
    '    </li>' +
    '    <li>' +
    '        <div class="font-small">' +
    '            <label for="accessArrangement-4">' +
    '                \'Next\' button between questions' +
    '            </label>' +
    '        </div>' +
    '        <div class="multiple-choice-mtc">' +
    '            <input id="accessArrangement-4" name="accessArrangement[4]" type="checkbox" value="NBQ"' +
    '                   aria-label="Tick accessArrangement \'Next\' button between questions." aria-checked="false"' +
    '                   role="checkbox">' +
    '            <div></div>' +
    '        </div>' +
    '    </li>' +
    '    <li>' +
    '        <div class="font-small">' +
    '            <label for="accessArrangement-5">' +
    '                Question reader (reason required)' +
    '            </label>' +
    '        </div>' +
    '        <div class="multiple-choice-mtc">' +
    '            <input id="accessArrangement-5" name="accessArrangement[5]" type="checkbox" value="QNR"' +
    '                   aria-label="Tick accessArrangement Question reader (reason required)." aria-checked="false"' +
    '                   role="checkbox" >' +
    '            <div></div>' +
    '        </div>' +
    '        <div class="hide-checkbox-content">' +
    '            <div class="form-group">' +
    '' +
    '                <div class="multiple-choice">' +
    '                    <input id="questionReaderReason-0" type="radio" name="questionReaderReason"' +
    '                           class="question-reader-reason" value="EAL">' +
    '                    <label for="questionReaderReason-0">English as an additional language (EAL)</label>' +
    '                </div>' +
    '                <div class="multiple-choice">' +
    '                    <input id="questionReaderReason-1" type="radio" name="questionReaderReason-1"' +
    '                           class="question-reader-reason" value="SLP">' +
    '                    <label for="questionReaderReason-1">Slow processing</label>' +
    '                </div>' +
    '                <div class="multiple-choice">' +
    '                    <input id="questionReaderReason-2" type="radio" name="questionReaderReason-2"' +
    '                           class="question-reader-reason" value="VIM">' +
    '                    <label for="questionReaderReason-2">Visual impairments</label>' +
    '                </div>' +
    '                <div class="multiple-choice">' +
    '                    <input id="questionReaderReason-3" type="radio" name="questionReaderReason-3"' +
    '                           class="question-reader-reason" value="OTH" >' +
    '                    <label for="questionReaderReason-3">Other</label>' +
    '                </div>' +
    '                <div class="panel panel-border-wide js-hidden">' +
    '                    <div class="form-group">' +
    '                        <div class="form-label">Please explain why the pupil needs this arrangement</div>' +
    '                        <textarea id="questionReaderOtherInformation" name="questionReaderOtherInformation"' +
    '                                  class="form-control form-control-3-4 restart-reason-info" rows="3"' +
    '                                  maxlength="1000"></textarea>' +
    '                    </div>' +
    '                </div>' +
    '                <br>' +
    '            </div>' +
    '        </div>' +
    '    </li>' +
    '    <li>' +
    '        <div class="font-small">' +
    '            <label for="accessArrangement-6">' +
    '                Remove on-screen number pad' +
    '            </label>' +
    '        </div>' +
    '        <div class="multiple-choice-mtc">' +
    '            <input id="accessArrangement-6" name="accessArrangement[6]" type="checkbox" value="RON"' +
    '                   aria-label="Tick accessArrangement Remove on-screen number pad." aria-checked="false"' +
    '                   role="checkbox">' +
    '            <div></div>' +
    '        </div>' +
    '    </li>')
  $accessArrangementsList.append($accessArrangementsListItems)
  $(document.body).append($accessArrangementsList)
  it('should find hide-checkbox-content class and change it to show-checkbox-content once the checkbox is checked', function () {
    const el = $accessArrangementsList.find('input:checkbox')[3]
    window.GOVUK.accessArrangements()
    expect($($(el).closest('li').find('.hide-checkbox-content')[0]).length).toBe(1)
    $(el).trigger('click')
    expect(el.checked).toBeTruthy()
    expect(el.value).toBe('ITA')
    expect($($(el).closest('li').find('.show-checkbox-content')[0]).length).toBe(1)
  })
  it('should remove js-hidden class to reveal textarea once the last radio button is checked', function () {
    const el = $accessArrangementsList.find('input:checkbox')[5]
    window.GOVUK.accessArrangements()
    $(el).trigger('click')
    const closestListItem = $(el).closest('li')
    const otherRadioButton = $($(closestListItem).children()[2]).find('input:radio')[3]
    expect($(otherRadioButton).parent().siblings('.panel').hasClass('js-hidden')).toBeTruthy()
    $(otherRadioButton).trigger('click')
    expect(otherRadioButton.value).toBe('OTH')
    expect($(otherRadioButton).parent().siblings('.panel').hasClass('js-hidden')).toBeFalsy()
    $(otherRadioButton).trigger('click')
    $(el).trigger('click')
  })
  it('should clear the text input once the checkbox is unchecked', function () {
    const el = $accessArrangementsList.find('input:checkbox')[3]
    const el2 = $accessArrangementsList.find('input:checkbox')[5]
    window.GOVUK.accessArrangements()
    $(el).trigger('click')
    $(el2).trigger('click')
    const textArea1 = $($(el).closest('li').find('textarea')[0])
    textArea1.val('text1')
    const textArea2 = $($(el2).closest('li').find('textarea')[0])
    textArea2.val('text2')
    $(el).trigger('click')
    $(el2).trigger('click')
    expect(textArea2.val()).toBe('')
    expect(textArea2.val()).toBe('')
  })
})
