/**
 * Global scripts.
 */

$(function() {
  function tickAllCheckboxes(sel, e) {
    $('#tickAllCheckboxes').on("change", function () {
      $(sel + ' > tbody div > input:checkbox').not("[disabled]").prop('checked', ($(this).is(':checked')));
    });
  }

  function disableCheckAll(sel, e) {
    if ($(sel)) {
      const lengthAll = $(sel + ' > tbody div > input:checkbox').length;
      const lengthChecked = $(sel + ' > tbody div > input:checkbox:disabled').length;

      if (lengthAll === lengthChecked) {
        $('#tickAllCheckboxes').prop('disabled', true);
      } else {
        $('#tickAllCheckboxes').prop('disabled', false);
      }
    }
  }

  if ($('#checkFormsList').length > 0 ) tickAllCheckboxes('#checkFormsList');
  if ($('#pupilsList').length > 0 ) tickAllCheckboxes('#pupilsList');
  if ($('#attendanceList').length > 0 )tickAllCheckboxes('#attendanceList');

  if ($('#checkFormsList').length > 0 ) disableCheckAll('#checkFormsList');
  if ($('#pupilsList').length > 0 )  disableCheckAll('#pupilsList');
  if ($('#attendanceList').length > 0 ) disableCheckAll('#attendanceList');

  $('input:file').on("change", function() {
    $('input:submit').prop('disabled', !$(this).val());
  });
});
