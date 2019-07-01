/* jslint browser: true */
/* global $ alert */

/**
 * textareaSafe() makes strings that are to be put into a textarea safe
 * @param string input
 */
function textareaSafe (input) {
  'use strict'

  input = input.replace(/</g, '&lt;')
  input = input.replace(/>/g, '&gt;')
  return input
}

function simpleWrap (input) {
  return '\n\t\t\t\t<table>' +
    '\n\t\t\t\t\t<thead>' +
    '\n\t\t\t\t\t\t<tr>' +
    '\n\t\t\t\t\t\t\t<!-- <td rowspan="2">&nbsp;</td> -->' +
    '\n\t\t\t\t\t\t\t<th id="section" rowspan="2">' +
    '\n\t\t\t\t\t\t\t\tSection ID' +
    '\n\t\t\t\t\t\t\t\t<span class="extra">or form ID if no sections</span></th>' +
    '\n\t\t\t\t\t\t\t<th id="bootstrap" colspan="3">Bootstrap grid columns for question text</th>' +
    '\n\t\t\t\t\t\t\t<th id="q-IDs" rowspan="2">' +
    '\n\t\t\t\t\t\t\t\tQuestion IDs for section' +
    '\n\t\t\t\t\t\t\t\t<span class="extra">' +
    '\n\t\t\t\t\t\t\t\t\tcomma separate list of question IDs or range of question IDs' +
    '\n\t\t\t\t\t\t\t\t</span>' +
    '\n\t\t\t\t\t\t\t</th>' +
    '\n\t\t\t\t\t\t\t<td rowspan="2">&nbsp;</td>' +
    '\n\t\t\t\t\t\t</tr>' +
    '\n\t\t\t\t\t\t<tr>' +
    '\n\t\t\t\t\t\t\t<th id="screen-cols-sm">Small screen <span class="extra">tablets</span></th>' +
    '\n\t\t\t\t\t\t\t<th id="screen-cols-md">Medium screen <span class="extra">small desktop</span></th>' +
    '\n\t\t\t\t\t\t\t<th id="screen-cols-lg">Large screen <span class="extra">large desktop</span></th>' +
    '\n\t\t\t\t\t\t</tr>' +
    '\n\t\t\t\t\t</thead>' +
    '\n\t\t\t\t\t<tbody>' +
    '\n\t\t\t\t\t\t' + input +
    '\n\t\t\t\t\t</tbody>' +
    '\n\t\t\t\t</table>'
}

function _qIDsRaw2All (matches) {
  var a = 0
  var all = matches[0].replace(/\s+/, '')
  var output = []
  var b = 0
  var c = 0

  all = all.split(',')

  for (a = 0; a < all.length; a += 1) {
    all[a] = all[a].split('-')

    if (all[a].length === 1) {
      output.push(all[a][0] * 1)
    } else {
      b = all[a][0] * 1
      c = all[a][1] * 1
      if (all[a][0] > c) {
        for (b; b >= c; b -= 1) {
          output.push(b)
        }
      } else if (all[a][0] < c) {
        for (b; b <= c; b += 1) {
          output.push(b)
        }
      } else {
        alert(all[a][0] + ' - ' + all[a][1] + ' is not valid')
        return false
      }
    }
  }
  return output
}

function removeEventHandlers (a) {
  $('#fieldset_' + a + '_id').off('change', '**')
  $('#fieldset_' + a + '_bs-cols_sm').off('change', '**')
  $('#fieldset_' + a + '_bs-cols_md').off('change', '**')
  $('#fieldset_' + a + '_bs-cols_lg').off('change', '**')
  $('#fieldset_' + a + '_q-IDs').off('change', '**')
  // console.log('removing onClick event handler for #remove-' + a)
  $('#remove-' + a).off('click', '**')
  $('#add-' + a).off('click', '**')
}

function getPreviusJson () {
  var vars = { 'json': false }
  var parts = window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = decodeURI(value)
  })
  return vars.json
}

function openAnchor () {
  var anchor = window.location.hash
  var field

  if (typeof anchor === 'string' && anchor !== '') {
    field = $('.modal-content ' + anchor)
    if ($(field).length > 0 && $(field)[0].tagName === 'INPUT') {
      $('#modal').attr('checked', true)
      field = $(field)[0]
      if ($(field).attr('name') === 'accordion') {
        $(field).attr('checked', true)
      } else if ($(field).attr('name') === 'accordionShowHide') {
        $('#showHide').attr('checked', true)
        $(field).attr('checked', true)
        console.log(anchor + '--head')
        console.log('#showHideByText--head')
        $(anchor + '--head').focus()
      }
    }
  }
}

$(document).ready(function () {
  'use strict'

  // var mode = 'simple'
  var fieldsets = []
  var newFeilds = []
  // var rowFunc = null
  // var wrapFunc = null
  // var setEventHandlerFunc = null
  // var generateFunc = null
  var pattern = '^\\s*[1-9][0-9]*(?:\\s*-\\s*[1-9][0-9]*)?(?:\\s*,\\s*[1-9][0-9]*(?:\\s*-\\s*[1-9][0-9]*)?)*\\s*$'
  var qMatch = new RegExp(pattern)

  function getNewRow (a) {
    var fieldset = {
      'id': a,
      'section': '',
      'bootstrap': {
        'sm': 6,
        'md': 5,
        'lg': 4
      },
      'qIDs': {
        'raw': '',
        'all': []
      }
    }

    if (typeof fieldsets[a] !== 'undefined') {
      fieldset = fieldsets[a]
    } else {
      fieldsets.push(fieldset)
    }
    newFeilds.push(a)
    return '\n\t\t\t\t\t\t<tr id="wrapRow' + a + '">' +
      '\n\t\t\t\t\t\t\t<!-- <th id="row' + a + '">' + a + '</th> -->' +
      '\n\t\t\t\t\t\t\t<td headers="row' + a + ' section">' +
      '\n\t\t\t\t\t\t\t\t<input type="number" name="fieldset[' + a + '][id]" id="fieldset_' + a + '_id" value="' + fieldset.section + '" min="1000" max="10000000" placeholder="e.g. 123456" class="section" width="7" required="required" data-id="' + a + '" />' +
      '\n\t\t\t\t\t\t\t</td>' +
      '\n\t\t\t\t\t\t\t<td headers="row' + a + ' bootstrap screen-cols-sm" id="row' + a + '_bs-sm">' +
      '\n\t\t\t\t\t\t\t\t<input type="number" name="fieldset[' + a + '][bs-cols][sm]" id="fieldset_' + a + '_bs-cols_sm" value="' + fieldset.bootstrap.sm + '" min="1" max="12" step="1" class="bs-cols" width="2" data-id="' + a + '" data-bs="sm" />' +
      '\n\t\t\t\t\t\t\t</td>' +
      '\n\t\t\t\t\t\t\t<td headers="row' + a + ' bootstrap screen-cols-md" id="row' + a + '_bs-md">' +
      '\n\t\t\t\t\t\t\t\t<input type="number" name="fieldset[' + a + '][bs-cols][md]" id="fieldset_' + a + '_bs-cols_md" value="' + fieldset.bootstrap.md + '" min="1" max="12" step="1" class="bs-cols" width="2" data-id="' + a + '" data-bs="md" />' +
      '\n\t\t\t\t\t\t\t</td>' +
      '\n\t\t\t\t\t\t\t<td headers="row' + a + ' bootstrap screen-cols-lg" id="row' + a + '_bs-md">' +
      '\n\t\t\t\t\t\t\t\t<input type="number" name="fieldset[' + a + '][bs-cols][lg]" id="fieldset_' + a + '_bs-cols_lg" value="' + fieldset.bootstrap.lg + '" min="1" max="12" step="1" class="bs-cols" width="2" data-id="' + a + '" data-bs="lg" />' +
      '\n\t\t\t\t\t\t\t</td>' +
      '\n\t\t\t\t\t\t\t<td headers="row' + a + ' q-IDs" id="row' + a + '_q-IDs">' +
      '\n\t\t\t\t\t\t\t\t<input type="text" name="fieldset[' + a + '][q-IDs]" id="fieldset_' + a + '_q-IDs" value="' + fieldset.qIDs.raw + '" pattern="' + pattern + '" placeholder="e.g. 1,4,6-9,3,5" class="q-IDs" width="3" data-id="' + a + '" />' +
      '\n\t\t\t\t\t\t\t</td>' +
      '\n\t\t\t\t\t\t\t<td>' +
      '\n\t\t\t\t\t\t\t\t<button id="remove-' + a + '" class="btn btn-row btn-remove" title="Remove this set" data-id="' + a + '">&ndash;</button>' +
      '\n\t\t\t\t\t\t\t\t<button id="add-' + a + '" class="btn btn-row btn-add" title="Add another set after this" data-id="' + a + '">+</button>' +
      '\n\t\t\t\t\t\t\t</td>' +
      '\n\t\t\t\t\t\t</tr>'
  }

  // function getKwd (id, num) {
  //   return id + '_q' + num
  // }

  /**
   * getCols() return bootstrap grid column class names
   *
   * @param {number} sm small screen columns
   * @param {number} md medium screen columns
   * @param {number} lg large screen columns
   * @param {boolean} rev subtract columns from 12 to get the reverse column count
   */
  function getCols (sm, md, lg, rev) {
    if (typeof rev === 'boolean' && rev === true) {
      return 'col-sm-' + (12 - sm) + ' col-md-' + (12 - md) + ' col-lg-' + (12 - lg)
    } else {
      return 'col-sm-' + sm + ' col-md-' + md + ' col-lg-' + lg
    }
  }

  function simpleGenerate (e) {
    var a = 0
    var b = 0
    // var c = 0
    var formHTML = ''
    var thanksHTML = ''
    var emailHTML = ''
    var tmpSect
    var tmpSm
    var tmpMd
    var tmpLg
    var tmp = JSON.stringify(fieldsets)
    var kwd = ''

    e.preventDefault()

    if (fieldsets.length > 0 && fieldsets[0].section !== '' && fieldsets[0].qIDs.raw !== '') {
      formHTML = '<!-- https://test-webapps.acu.edu.au/mini-apps/matrix_form_HTML_generator/?json=' + tmp + ' -->\n\n%form_errors_message^notempty:<div class="alert alert-danger">%%form_errors_message%%form_errors_message^notempty:</div>%\n%form_errors^notempty:<div class="alert alert-danger">%%form_errors%%form_errors^notempty:</div>% '

      thanksHTML = '<p>Dear %response_[[firstname question ID]]_[[question number]]%</p>\n\n'

      emailHTML = '<p>Dear %response_[[firstname question ID]]_[[question number]]%</p>\n\n'

      for (a = 0; a < fieldsets.length; a += 1) {
        tmpSm = fieldsets[a].bootstrap.sm
        tmpMd = fieldsets[a].bootstrap.md
        tmpLg = fieldsets[a].bootstrap.lg
        tmpSect = fieldsets[a].section

        formHTML += '\n\n<div id="fieldset-' + tmpSect + '--wrap" class="fieldset--wrap">'
        formHTML += '\n\t<fieldset id="fieldset-' + tmpSect + '" class="form-horizontal">\n\t\t<legend>%section_title_' + tmpSect + '%</legend>\n'
        thanksHTML += '\n\n<h2>%section_title_' + tmpSect + '%</h2>\n\n<dl class="dl-horizontal">'
        emailHTML += '\n\n<h2>%section_title_' + tmpSect + '%</h2>\n\n<table cellspacing="0" cellpadding="5" border="0">\n\t<tbody>'

        for (b = 0; b < fieldsets[a].qIDs.all.length; b += 1) {
          kwd = tmpSect + '_q' + fieldsets[a].qIDs.all[b]

          formHTML += '\n\t\t<div class="form-group--wrap" id="outer_' + kwd + '">'
          formHTML += '\n\t\t\t<div class="form-group%question_error_' + kwd + '^notempty: has-error%">'
          formHTML += '%question_error_' + kwd + '^notempty:'
          formHTML += '\n\t\t\t\t<div class="alert alert-danger" role="alert">'
          formHTML += '\n\t\t\t\t\t%%question_error_' + kwd + '%%question_error_' + kwd + '^notempty:'
          formHTML += '\n\t\t\t\t</div>%'
          formHTML += '\n\t\t\t\t<label for="%question_id_' + kwd + '%" class="' + getCols(tmpSm, tmpMd, tmpLg) + ' control-label">'
          formHTML += '\n\t\t\t\t\t%question_name_' + kwd + '%'
          formHTML += '\n\t\t\t\t</label>'
          formHTML += '\n\t\t\t\t<div class="' + getCols(tmpSm, tmpMd, tmpLg, true) + '">'
          formHTML += '\n\t\t\t\t\t<!-- aria-describeby="describedBy_' + kwd + '" -->'
          formHTML += '\n\t\t\t\t\t%question_field_' + kwd + '%'
          formHTML += '\n\t\t\t\t</div>'
          formHTML += '\n\t\t\t\t<div class="pull-right ' + getCols(tmpSm, tmpMd, tmpLg, true) + '" id="describedBy_' + kwd + '">'
          formHTML += '\n\t\t\t\t\t%question_note_' + kwd + '%'
          formHTML += '\n\t\t\t\t</div>'
          formHTML += '\n\t\t\t</div>'
          formHTML += '\n\t\t</div>\n'

          thanksHTML += '\n\t<dt>%question_name_' + kwd + '%</dt>'
          thanksHTML += '\n\t\t<dd>\n\t\t\t%response_' + kwd + '%'
          thanksHTML += '\n\t\t\t<!-- %question_note_' + kwd + '% -->'
          thanksHTML += '\n\t\t</dd>\n'

          emailHTML += '\n\t\t<tr valign="top">'
          emailHTML += '\n\t\t\t<th align="right">'
          emailHTML += '\n\t\t\t\t<strong>%question_name_' + kwd + '%</strong>'
          emailHTML += '\n\t\t\t</th>'
          emailHTML += '\n\t\t\t<td>'
          emailHTML += '\n\t\t\t\t%response_' + kwd + '%'
          emailHTML += '\n\t\t\t\t<!-- %question_note_' + kwd + '% -->'
          emailHTML += '\n\t\t\t</td>'
          emailHTML += '\n\t\t</tr>\n'
        }

        formHTML += '\t</fieldset>'
        formHTML += '\n</div>\n\n'
        thanksHTML += '</dl>\n\n'
        emailHTML += '\t</tbody>\n</table>\n\n'
      }

      formHTML += '\n\n\n<p>%submit_button% %reset_button%</p>'

      // console.log($('#form-output'))
      if ($('#form-output').length === 0) {
        $('#fieldsWrap').after('\n\t\t\t<fieldset id="form-output">\n\t\t\t\t<legend>Output</legend>\n\n\t\t\t\t<ul>\n\t\t\t\t\t<li>\n\t\t\t\t\t\t<label for="formHTML">Form HTML</label>\n\t\t\t\t\t\t<textarea id="formHTML" name="formHTML" readonly="readonly">' + textareaSafe(formHTML) + '</textarea>\n\t\t\t\t\t</li>\n\n\t\t\t\t\t<li>\n\t\t\t\t\t\t<label for="thanksHTML">Thank you HTML</label>\n\t\t\t\t\t\t<textarea id="thanksHTML" name="thanksHTML" readonly="readonly">' + textareaSafe(thanksHTML) + '</textarea>\n\t\t\t\t\t</li>\n\n\t\t\t\t\t<li>\n\t\t\t\t\t\t<label for="emailHTML">Email HTML</label>\n\t\t\t\t\t\t<textarea id="emailHTML" name="emailHTML" readonly="readonly">' + textareaSafe(emailHTML) + '</textarea>\n\t\t\t\t\t</li>\n\t\t\t\t</ul>\n\t\t\t</fieldset>\n')
      } else {
        $('#formHTML').html(textareaSafe(formHTML))
        $('#thanksHTML').html(textareaSafe(thanksHTML))
        $('#emailHTML').html(textareaSafe(emailHTML))
      }
    }
  }

  function getCurrentFieldsetIndex (id) {
    var a = 0
    for (a = 0; fieldsets.length; a += 1) {
      if (fieldsets[a].id === id) {
        return a
      }
    }
    return false
  }

  function validateID (e) {
    var a = 0
    var id = $(this).data('id') * 1
    var ok = true
    var val = $(this).val()

    e.preventDefault()
    // console.log('validating section ID')

    a = getCurrentFieldsetIndex(id)
    if (a === false) {
      console.error('could not find a section identified by ' + id)
    }

    if (val < 100 || val >= 10000000) {
      ok = false
    }

    if (ok === true) {
      fieldsets[a].section = val
    } else {
      alert('Impossilbe Section/form ID')
      $('#fieldset_' + id + '_id').focus()
    }
  }

  function validateQuestionID (e) {
    var a = 0
    var id = $(this).data('id') * 1
    var val = $(this).val()
    var matches = []
    // var tmp

    e.preventDefault()
    a = getCurrentFieldsetIndex(id)
    if (a === false) {
      console.error('could not find a section identified by ' + id)
    }

    // tmp = val.match(qMatch)

    matches = _qIDsRaw2All(val.match(qMatch))
    if (matches !== false) {
      fieldsets[a].qIDs.raw = val
      fieldsets[a].qIDs.all = matches
    } else {
      $('#fieldset_' + id + '_id').focus()
    }
  }
  function updateBootstrapCols (e) {
    var a = 0
    var id = $(this).data('id')
    var cols = $(this).data('bs')
    var val = $(this).val() * 1

    e.preventDefault()
    a = getCurrentFieldsetIndex(id)
    if (a === false) {
      console.error('could not find a section identified by ' + id)
    }
    fieldsets[a].bootstrap[cols] = val
  }

  function setEventHandlers () {
    var a = null

    a = newFeilds.pop()

    while (a !== undefined) {
      $('#fieldset_' + a + '_id').on('change', validateID)
      $('#fieldset_' + a + '_bs-cols_sm').on('change', updateBootstrapCols)
      $('#fieldset_' + a + '_bs-cols_md').on('change', updateBootstrapCols)
      $('#fieldset_' + a + '_bs-cols_lg').on('change', updateBootstrapCols)
      $('#fieldset_' + a + '_q-IDs').on('change', validateQuestionID)
      // console.log('adding onClick event handler for #remove-' + a)
      $('#remove-' + a).on('click', deleteCurrentSection)
      $('#add-' + a).on('click', addNewSection)
      a = newFeilds.pop()
    }
  }

  function addNewSection (e) {
    e.preventDefault()

    var a = 0
    var id = $(this).data('id') * 1
    var newID = 0
    var output = []
    var tmpFieldsets = fieldsets

    // console.log('adding new section')
    // console.log('a: ', a)
    // console.log('newID: ', newID)

    for (a = 0; a < fieldsets.length; a += 1) {
      if (fieldsets[a].id > newID) {
        newID = fieldsets[a].id
      }
    }
    newID += 1
    a = tmpFieldsets.shift()
    while (a !== undefined) {
      output.push(a)
      if (a.id === id) {
        fieldsets = output
        $('#wrapRow' + id).after(getNewRow(newID))
        output.push(fieldsets.pop())
      }
      a = tmpFieldsets.shift()
    }
    fieldsets = output
    setEventHandlers()
    // console.log('fieldsets: ', fieldsets)
  }

  function deleteCurrentSection (e) {
    var a = null
    var id = $(this).data('id')
    var output = []

    e.preventDefault()

    // console.log('removing this section')
    if (fieldsets.length > 1) {
      a = fieldsets.shift()
      while (a !== undefined) {
        if (a.id !== id) {
          output.push(a)
        }
        a = fieldsets.shift()
        // console.log('a: ', a)
      }
      $('#wrapRow' + id).remove()
      fieldsets = output
    }
    removeEventHandlers(id)
    // console.log('fieldsets: ', fieldsets)
  }

  function updateInterface () {
    var a = 0
    var output = ''
    var previous = JSON.parse(getPreviusJson())

    if (previous !== false) {
      fieldsets = previous
      for (a = 0; a < fieldsets.length; a += 1) {
        output += getNewRow(a)
      }
    } else {
      output += getNewRow(0)
    }

    // console.log('newFeilds: ', newFeilds)
    $('#fields').html(simpleWrap(output))
    setEventHandlers()
  }

  openAnchor()
  updateInterface(this)
  $('#submit').on('click', simpleGenerate)
})
