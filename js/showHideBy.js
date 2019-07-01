/* jslint browser: true */
/* global $ */
/* jslint evil: true, sloppy: true */
// ==================================================================
// START: show/hide by form field

/**
 * @var {object} _showHideBy global config stuff used by showHide By
 *               functions
 *
 * @prop {array} autoTriggerList list of form field IDs to run to
 *                        trigger onChange events to show/hide blocks
 * @prop {object} firstTime each property in the object will be keyed
 *                        with a the ID for a form field that
 *                        triggers a focus change and whether or not
 *                        that change has occured.
 * @prop {false|number} setStaticHeight CSS selector for destination. sets
 *               default class and some data for blocks that are to
 *               be shown/hidden
 */
var _showHideBy = {
  autoTriggerList: [],
  firstTime: {
    doSetFocus: false
  },
  setStaticHeight: false,
  showHideBlockHeights: {},
  transitions: ''
}

/**
 * makes all input fields wrapped by the given ID required (used when
 * showing an HTML block)
 * @private
 * @param {string}  id           ID of the select field to use as
 *                               toggle
 * @param {boolean} makeRequired if TRUE, then add a required
 *                               attribute to all fields in the
 *                               toggled HTML block
 */
function _showHideMakeFieldRequired (id, makeRequired) {
  'use strict'

  if (makeRequired === true) {
    $(id + ' input').attr('required', 'required')
    $(id + ' select').attr('required', 'required')
    $(id + ' textarea').attr('required', 'required')
  }
}

/**
 * removes the required attribute from all input fields wrapped by
 * the given ID (used when hiding an HTML block)
 * @private
 * @param {string}  id           ID of the select field to use as
 *                               toggle
 * @param {boolean} makeRequired if TRUE, then remove the required
 *                               attribute from all fields in the
 *                               toggled HTML block
 */
function _showHideMakeFieldOptional (id, makeRequired) {
  'use strict'

  if (makeRequired === true) {
    $(id + ' input').removeAttr('required')
    $(id + ' select').removeAttr('required')
    $(id + ' textarea').removeAttr('required')
  }
}

/**
 * set the focus to the specified (used when showing an HTML block)
 * @private
 * @param {string} focusID the ID of a form field to set the focus on
 */
function _showHideSetFocus (focusID, srcFieldID) {
  'use strict'
  if (_showHideBy.firstTime.doSetFocus) {
    if (!_showHideBy.firstTime[srcFieldID]) {
      if (focusID !== undefined && focusID !== '') {
        $(focusID).focus()
      }
      _showHideBy.firstTime[srcFieldID] = true
    }
  }
}

/**
 * ensures that input is false if it's not TRUE
 * @private
 * @param {mixed} input value to make boolean
 * @return {boolean}
 */
function _showHideMakeBool (input) {
  'use strict'
  var to = typeof input
  var output = false

  if (to !== 'boolean') {
    if (to === 'undefined') {
      output = false
    } else if (to === 'string') {
      output = input.replace(/^\s+|\s+$/g, '')
      if (output === '') {
        console.warn('converting empty string to FALSE')
        output = false
      } else {
        console.warn('converting non-empty string ("' + input + '") to TRUE')
        output = true
      }
    } else if (to === 'number') {
      if (input > 0) {
        console.warn('converting positive number (' + input + ') to TRUE')
        output = true
      } else {
        console.warn('converting zero or negative number (' + input + ') to FALSE')
        output = false
      }
    } else {
      console.error('could not convert ' + to + ' to bloolean assuming FALSE\nFYI input:', input)
      output = false
    }
  } else {
    output = input
  }
  return output
}

/**
 * ensures that input is false if it's not a string or is an empty string
 * @private
 * @param {mixed} input string to be tested for type and content
 * @param {boolean} allowEmpty if TRUE, input can be an empty string.
 * @return {string|false}
 */
function _showHideMakeString (input, allowEmpty) {
  'use strict'

  if ((typeof input !== 'string') || (allowEmpty !== true && input === '')) {
    input = false
  }
  return input
}

/**
 * checks that a given selector matches something in the HTML. If
 * input is not a string or is an empty string or selector doesn't
 * match anything, it writes an error to the console.
 * @private
 * @param {mixed} selector a string to be passed to jQuery
 * @return {boolean}
 */
function _domNodeExists (selector, varName, funcName) {
  'use strict'

  var tmp = _showHideMakeString(selector)
  var tmpType = typeof input
  if (selector !== false) {
    if (tmp === false) {
      if (tmpType !== 'string') {
        console.error(funcName + '() expects ' + varName + ' to be a string and a CSS selector! "' + tmpType + '" given. Please check your Javascript!')
      } else {
        console.error('Cannot find anything with an empty selector. Please check your Javascript!')
      }
      return false
    } else {
      if ($(selector).length > 0) {
        return true
      } else {
        console.error(' Was unable to find HTML block identified by "' + selector + '" (from ' + funcName + '() param ' + varName + '). Please check your Javascript or HTML!')
        return false
      }
    }
  }
  return false
}

/**
 * custom classes need to be applied to each show/hide block. Also to
 * make transitions appear smooth, we do some fancy calculations for
 * values that are used later by the onChange function calls.
 *
 * @param {string} destID selector for the show/hide block being
 *                        targeted by the current field
 */
function _showHideSetStyles (destID) {
  'use strict'
  var cubic = ' cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  // var paddingOverride = ''

  $(destID).each(function () {
    var px
    var ms
    var paddingOverride = ''

    if (typeof _showHideBy.setStaticHeight === 'number' && _showHideBy.setStaticHeight > 10) {
      px = _showHideBy.setStaticHeight
    } else {
      px = $(this).outerHeight() * 1
    }

    ms = Math.round((((px - 50) / 950) * (1500)) + 500)
    if (px === 0) {
      paddingOverride = 'padding: 0;'
    }
    $(this).addClass('top-down').attr('style', 'height: ' + px + 'px;' + paddingOverride)

    _showHideBy.showHideBlockHeights[destID] = { 'px': px + 'px;', 'ms': ms }
    _showHideBy.transitions += '\n' + destID + ' { transition: height ' + ms + 'ms' + cubic + ';}'
  })
}

/**
 * apply showHide styles to each show/hide block managed by the
 * current field
 *
 * @param {array} selectors list of all the selectors for blocks that
 *                          need to be shown/hidden
 * @param {boolean} hideAllOnEmpty whether or not to hide show/hide
 *                          blocks if field has no preset option on
 *                          page load
 */
function _showHideMultiSetStyles (selectors, hideAllOnEmpty) {
  for (var a = 0; a < selectors.length; a += 1) {
    _showHideSetStyles(selectors[a])
    if (hideAllOnEmpty) {
      _showHideHide(selectors[a])
    }
  }
}

function _showHideUpdateStyleAttr (dataAttrs, heightOverride, showBlock) {
  'use strict'
  var block = 'block'
  var height = dataAttrs.height
  var output = ''
  var paddingProp = ''

  if (showBlock === false) {
    block = 'none'
  }

  if (heightOverride === 0) {
    height = heightOverride
    paddingProp = 'font-size: 0; margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0'
  } else {
    paddingProp = 'font-size: ' + dataAttrs.fontSize + '; margin-bottom: ' + dataAttrs.margin.bottom + '; margin-top: ' + dataAttrs.margin.top + '; padding-bottom: ' + dataAttrs.padding.bottom + '; padding-top: ' + dataAttrs.padding.top
  }

  output = 'height: ' + height + '; ' + paddingProp + '; display: ' + block + ';'
  return output
}

function UTCdate () {
  var tmp = new Date()
  return tmp.toString()
}

function showHideGetData (id, heightOverride) {
  'use strict'
  var height, obj

  obj = $(id)
  height = $(obj).data('height')

  if (heightOverride === 0 || heightOverride === 'auto') {
    height = heightOverride
  }
  return {
    duration: $(obj).data('duration'),
    fontSize: $(obj).data('fontsize'),
    height: height,
    padding: {
      top: $(obj).data('padding-top'),
      bottom: $(obj).data('padding-bottom')
    },
    margin: {
      top: $(obj).data('margin-top'),
      bottom: $(obj).data('margin-bottom')
    }
  }
}

/**
 * adjust wrapping element's classes and styles when a shown/hide
 * block is to be hidden
 * @private
 * @param {string} destID CSS selector for destination
 */
function _showHideHide (destID) {
  'use strict'

  // var data = showHideGetData(destID)

  if (!$(destID).hasClass('slide-up')) {
    $(destID).addClass('slide-up').removeClass('slide-down').attr('style', 'height: 0px;')
  }
}

/**
 * adjust wrapping element's classes and styles when a shown/hide
 * block is to be shown
 * @private
 * @param {string} destID CSS selector for destination
 * @param {boolean} makeAutoAfter remove height from style attribute
 *                                after the CSS transition period,
 *                                when the HTML block is made visible
 */
function _showHideShow (destID, makeAutoAfter) {
  'use strict'

  // var data = showHideGetData(destID)

  if (!$(destID).hasClass('slide-down')) {
    $(destID).addClass('slide-down').removeClass('slide-up').attr('style', 'height: ' + _showHideBy.showHideBlockHeights[destID].px)
    if (makeAutoAfter === true) {
      window.setInterval(_showHideBy.showHideBlockHeights[destID].ms, $(destID).attr('style', 'height: auto;'))
    }
  }
}

/**
 * to make it easier on editors I want to be a bit flexible about the
 * structure of the "Show" items in the object.
 *
 * @param {string} showHide the selector for the HTML block to
 *                      show/hide
 * @param {string} objName name to be used in error message to
 *                      identify which part of the data object had
 *                      the issue
 * @param {string} funk name of the calling function
 */
function _showHideMultiNormaliseData (showHide, objName, funk) {
  'use strict'
  var a = 0
  var isShow = true
  var output = []
  var tmp

  if (Array.isArray(showHide) === false) {
    console.error(funk + 'expects parameter 2 data' + objName + ' to be an array. ' + typeof showHide + ' given.')
    return []
  }

  if (objName.indexOf('hide') > 0) {
    isShow = false
  }

  for (a = 0; a < showHide.length; a += 1) {
    tmp = false
    if (isShow) {
      if (typeof showHide[a] === 'string') {
        output.push([showHide[a], false])
      } else if (Array.isArray(showHide[a])) {
        if (_domNodeExists(showHide[a][0], 'data.' + objName + '[' + a + '][0]', funk)) {
          tmp = showHide[a][0]
        }

        if (tmp !== false) {
          if (typeof showHide[a][1] !== 'boolean') {
            console.warning(funk + 'expects parameter 2 data' + objName + '[' + a + '][1] to be a string. ' + typeof showHide[a][1] + ' given. Defaulting to FALSE')
            showHide[a][1] = false
          }
          output.push([tmp, showHide[a][1]])
        }
      } else {
        console.error(funk + 'expects parameter 2 data' + objName + '[' + a + '] to be a string or array. ' + typeof showHide[a] + ' given.')
      }
    } else {
      if (_domNodeExists(showHide[a], 'data.' + objName + '[' + a + ']', funk)) {
        output.push(showHide[a])
      }
    }
  }

  return output
}

/**
 * Standard way to get all the option values in a select box or radio
 * button group
 *
 * @param {string} selector to find all the options in a select or
 *                 buttons in a radio group
 *
 * @return {array} list of all the possible values for that input.
 */
function _showHideMultiGetOptions (selector) {
  var options = []

  $.each($(selector), function (index, value) {
    var val = $(value).attr('value')
    if (typeof val === 'string' && val !== '') {
      options.push(val)
    }
  })

  return options
}

/**
 * Validates the user supplied data object and reports on errors in
 * that object.
 *
 * @param {object} data object supplied to the showHideByMulti funciton
 * @param {array} options options from the select field (or radio
 *                        buttons) to check against data properties.
 * @param {string} multiType last part of the name of the
 *                        showHideByMulti function name
 */
function _showHideMultiValidateData (data, options, multiType) {
  'use strict'
  var a = 0
  var allSelectors = []
  var func = ''
  var selectorCount = 0
  var tmp

  if (typeof multiType !== 'string' || multiType !== 'radio') {
    func = 'showHideMultiBySelect() '
  } else {
    func = 'showHideMultiByRadio() '
  }
  if (typeof data !== 'object' || data.length === 0) {
    console.error(func + 'parameter 2 (data) to be a non-empty object')
  }

  $.each(data, function (index, value) {
    var tmpSelectorCount = 0

    if (index !== 'hideAllOnEmpty') {
      data[index].show = _showHideMultiNormaliseData(value.show, '["' + index + '"].show', func)
      data[index].hide = _showHideMultiNormaliseData(value.hide, '["' + index + '"].hide', func)

      for (a = 0; a < value.show.length; a += 1) {
        if (allSelectors.indexOf(value.show[a][0]) === -1) {
          allSelectors.push(value.show[a][0])
        }
      }

      for (a = 0; a < value.hide.length; a += 1) {
        if (allSelectors.indexOf(value.hide[a]) === -1) {
          allSelectors.push(value.hide[a])
        }
      }

      tmpSelectorCount = data[index].show.length + data[index].hide.length

      if (tmpSelectorCount > 0) {
        if (tmpSelectorCount > selectorCount) {
          if (selectorCount > 0) {
            console.error(func + 'parameter 2 (data) to have the same total number of show & hide selectors for each option data["' + index + '"] has more selectors than the preceding options.')
          }
          selectorCount = tmpSelectorCount
        }
      } else {
        console.error(func + 'parameter 2 (data) to have at least one show and/or hide selector for each option data["' + index + '"] has no selectors.')
      }

      if (typeof value.focusID !== 'undefined') {
        if (typeof value.focusID !== 'string') {
          console.error(func + 'expects parameter 2 data["' + index + '"].focusID to be a string. ' + typeof value.focusID + ' given.')
          data[index].focusID = ''
          console.error('data.' + index + '.focusID has been converted to an empty string.')
        } else if (value.focusID !== '') {
          if ($(value.focusID).length === 0) {
            console.error('focus field ("' + value.focusID + '") specified in data["' + index + '"].focusID cannot be found in HTML')
          }
        }
      } else {
        data[index].focusID = ''
      }
      if (data[index].focusID === '') {
        data[index].focusID = false
      }
      data[index].makeAutoAfter = _showHideMakeBool(value.makeAutoAfter)
    }
  })

  for (a = 0; a < options.length; a += 1) {
    tmp = options[a]
    if (typeof data[tmp] === 'undefined') {
      console.error(func + 'expects parameter 2 data["' + tmp + '"] to be an object ({"show": [...], "hide": [...], "focusID": ""}). However, it is undefined.')
    }
  }
  tmp = typeof data.hideAllOnEmpty
  if (tmp === 'undefined') {
    data.hideAllOnEmpty = false
  } else if (tmp === 'number') {
    if (data.hideAllOnEmpty < 1) {
      data.hideAllOnEmpty = false
      console.warn(func + 'expects parameter 2 data.hideAllOnEmpty to be TRUE or FALSE. Numeric "' + data.hideAllOnEmpty + '" was given so assuming FALSE')
    } else {
      data.hideAllOnEmpty = true
      console.warn(func + 'expects parameter 2 data.hideAllOnEmpty to be TRUE or FALSE. Numeric "' + data.hideAllOnEmpty + '" was given so assuming TRUE')
    }
  } else if (tmp !== 'boolean') {
    console.error(func + 'expects parameter 2 data.hideAllOnEmpty to be TRUE or FALSE. ' + tmp + '" was given. Cannot reliably infer boolean, so assuming FALSE')
    data.hideAllOnEmpty = false
  }

  data.allSelectors = allSelectors

  return data
}

/**
 * higher order function to generate jQuery on() callback function
 * with necessary data
 *
 * @param {object} configData user generated (previously validated)
 *                            object containing all necessary info to
 *                            make showHideMulti work
 * @return function to be used as an onChange event handler
 */
function _showHideMultiOnChange (configData) {
  return function (e) {
    var b = 0
    var fieldType = $(this)[0].type
    var val = $(this).val()
    var valData

    valData = configData[val]

    if (fieldType !== 'radio' || $(this).is(':checked')) {
      for (b = 0; b < valData.hide.length; b += 1) {
        _showHideHide(valData.hide[b])
        _showHideMakeFieldOptional(valData.hide[b], true)
      }

      for (b = 0; b < valData.show.length; b += 1) {
        _showHideShow(valData.show[b][0])
        _showHideMakeFieldRequired(valData.show[b][0], valData.show[b][1])
      }
      _showHideSetFocus(valData.focusID, configData.srcFieldID)
    }
  }
}

/**
 * Bundles some repetitive code for reuse
 *
 * @param {string} input          value to be tested
 * @param {string} dest           selector for block to be shown/hidden
 * @param {boolean} makeRequired  whether or not to make children of
 *                                the shown/hidden block required.
 * @param {string} ID             the ID of the fild triggering the event
 * @param {string} focus          The ID of the field to receive
 *                                focus when the field is shown.
 * @param {} show
 * @param {} _show
 * @param {} hide
 * @param {} _hide
 * @param {boolean} _makeAutoAfter remove height from style attribute
 *                                after the CSS transition period,
 *                                when the HTML block is made visible
 * TODO: work out what show, _show, hide & _hide params are for
 */
function _showHideSingleOnChangeSub (input, dest, makeRequired, ID, focus, show, _show, hide, _hide, _makeAutoAfter) {
  if (_hide.indexOf(input) !== -1) {
    _showHideHide(dest)
    _showHideMakeFieldOptional(dest, makeRequired)
  } else if (_show.indexOf(input) !== -1 || show === false) {
    _showHideShow(dest, _makeAutoAfter)
    _showHideMakeFieldRequired(dest, makeRequired)
    _showHideSetFocus(focus, ID)
  } else if (hide === false) {
    _showHideHide(dest)
    _showHideMakeFieldOptional(dest, makeRequired)
  }
}

/**
 * Make sure show/hide test values are in an array
 *
 * @param {string|array} input list of values to test against
 *                             show/hide field value to decide
 *                             whether to show/hide a block.
 * @return {array} first item is an array containing 1 or more string
 *                 values
 */
function _showHideNormaliseShowHide (input) {
  var output = []
  var a = 0

  if (Array.isArray(input) !== false) {
    for (a = 0; a < input.length; a += 1) {
      output.push(_showHideMakeString(input[a], true))
    }
    input = output
  } else {
    input = _showHideMakeString(input, true)
    output.push(input, true)
  }
  return [output, input]
}

/**
 * Create functions to auto trigger change events after the page is
 * loaded. Necessary for when forms get sent to matrix and are
 * returned with errors or when fields are prepopulated from GET
 * variables.
 *
 * @param {string} fieldID
 * @param {string} fieldType
 */
function _showHideBySetAutoTrigger (fieldID, fieldType) {
  'use strict'
  var autoTrigger

  if (fieldType === 'select' || fieldType === 'checkbox' || fieldType === 'text' || fieldType === 'file') {
    autoTrigger = function () {
      $(fieldID).trigger('change')
    }
  } else if (fieldType === 'radio') {
    autoTrigger = function () {
      var showHideTriggered = false
      $(fieldID + ' input[type="radio"]:checked').each(function () {
        $(this).trigger('change')
        showHideTriggered = true
        return false
      })
      if (!showHideTriggered) {
        $(fieldID + ' input[type="radio"]').each(function () {
          $(this).trigger('change')
          return false
        })
      }
    }
  }
  if (typeof autoTrigger === 'function') {
    _showHideBy.autoTriggerList.push(autoTrigger)
  }
  _showHideBy.firstTime[fieldID] = false
}

function _showHideGetValidRegExp (input) {
  var regex = [false, false]
  if (typeof input === 'string' && input !== '') {
    try {
      regex = [new RegExp(input), false]
    } catch (e) {
      regex = [false, e]
    }
  }
  return regex
}

/**
 * trigger on change events that cause show/hide events.
 *
 * (called further down this file, when the document is "Ready")
 */
function showHideByDoAutoTrigger () {
  'use strict'
  var a = 0
  var tmp

  $('body').append('<style type="text/css" id="showHideStyles">' + _showHideBy.transitions + '\n\t.form-group--wrap {\n\t\t position: relative;\n\t}</style>')

  for (a = 0; a < _showHideBy.autoTriggerList.length; a += 1) {
    tmp = _showHideBy.autoTriggerList[a]
    tmp()
  }

  _showHideBy.firstTime.doSetFocus = true
  _showHideBy.transitions = ''
}

/**
 * applies an onChange function to a select field that toggles the
 * visibility of an HTML block
 * @param {string} srcFieldID     ID of the select field to use as
 *                                toggle
 * @param {string} destID         ID of the HTML block whose
 *                                visibility is to be toggled
 * @param {string|array|FALSE} showVal  the string value (or array of
 *                                string values) to be matched to make
 *                                HTML block visible (If FALSE, then
 *                                visibility is toggled on by default)
 * @param {string|array|FALSE} hideVal  the string value (or array of
 *                                string values) to be matched to make
 *                                HTML block hidden (If FALSE, then
 *                                visibility is toggled off by default)
 * @param {boolean} makeRequired  if TRUE, then force make all fields
 *                                in the toggled HTML block required
 *                                when the HTML block is visible and
 *                                not required when the HTML block is
 *                                hidden
 * @param {string|FALSE} focusID  set the focus to field specified by
 *                                the ID when the HTML block is made
 *                                visible
 * @param {boolean} makeAutoAfter remove height from style attribute
 *                                after the CSS transition period,
 *                                when the HTML block is made visible
 */
function showHideBySelect (srcFieldID, destID, showVal, hideVal, makeRequired, focusID, makeAutoAfter) {
  'use strict'

  var _hideVals = []
  var _showVals = []
  var tmp

  makeAutoAfter = _showHideMakeBool(makeAutoAfter)

  tmp = _showHideNormaliseShowHide(showVal)
  _showVals = tmp[0]

  tmp = _showHideNormaliseShowHide(hideVal)
  _hideVals = tmp[0]
  hideVal = tmp[1]

  makeRequired = _showHideMakeBool(makeRequired)
  focusID = _showHideMakeString(focusID)

  if (!_domNodeExists(srcFieldID, 'srcFieldID', 'showHideBySelect') || !_domNodeExists(destID, 'destID', 'showHideBySelect')) {
    console.warn('source (' + srcFieldID + ') or destination (' + destID + ') cannot be found in HTML')
    return false
  }

  _showHideSetStyles(destID)

  // Make sure prepopulated fields cause their destination blocks
  // to be shown/hidden
  _showHideBySetAutoTrigger(srcFieldID, 'select')

  $(srcFieldID).on('change', function () {
    var val = $(this).val()

    _showHideSingleOnChangeSub(val, destID, makeRequired, srcFieldID, focusID, showVal, _showVals, hideVal, _hideVals)
  })
}

/**
 * applies an onChange function to a select field that toggles the
 * visibility of an HTML block
 * @param {string} srcFieldID     ID of the select field to use as
 *                                toggle
 * @param {object} data           Object where the first level of keys
 *                                match values for each select
 *                                <OPTION>.
 *                                - All options in the <SELECT> should
 *                                  have a key in the data object.
 *                                - Each option should have the same
 *                                  number of selectors spread across
 *                                  the show & hide keys
 *                                - show selectors whose fields should
 *                                  be made required when visible
 *                                  should be in an array with second
 *                                  value being TRUE
 *   data = {
 *     "option value 1": {
 *       show: [
 *         "selectorA-dontMakeRequired",
 *         ["selectorB-makeRequired", true],
 *         ["selectorC-makeRequired", true]
 *       ],
 *       hide: [ "selectorD", "selectorE", "selectorF", ... ],
 *       focusID: "selectorA input[type=text]"
 *     }
 *     "option value 1": {
 *       show: [
 *         ["selectorA-makeRequired", true],
 *         "selectorD-dontMakeRequired",
 *         "selectorE-dontMakeRequired"
 *       ],
 *       hide: [ "selectorB", "selectorC", "selectorF" ],
 *       focusID: "selectorA input[type=text]"
 *     }
 *     "option value 3": {
 *       show: [
 *         ["selectorE-makeRequired", true],
 *         "selectorF-dontMakeRequired",
 *       ],
 *       hide: ["selectorA", "selectorB", "selectorC", "selectorD"],
 *       focusID: "selectorE select"
 *     }
 *   }
 * @param {boolean} hideAllOnEmpty Whether or not to hide all show/hide
 *                                blocks if nothing is selected/checked
 */
function showHideMultiBySelect (srcFieldID, data, hideAllOnEmpty) {
  'use strict'
  var options = []
  // var optionsRaw

  if (!_domNodeExists(srcFieldID, 'srcFieldID', 'showHideMultiBySelect')) {
    console.error('source (' + srcFieldID + ') cannot be found in HTML')
    return false
  }

  options = _showHideMultiGetOptions(srcFieldID + ' option')

  data = _showHideMultiValidateData(data, options)
  data.srcFieldID = srcFieldID
  data.hideAllOnEmpty = _showHideMakeBool(hideAllOnEmpty)

  _showHideMultiSetStyles(data.allSelectors, data.hideAllOnEmpty)

  _showHideBySetAutoTrigger(srcFieldID, 'select')
  $(srcFieldID).on('change', _showHideMultiOnChange(data))
}

/**
 * applies an onChange function to a group of radio button fields
 * that toggles the visibility of an HTML block
 * @param {string} srcFieldID     ID of the wrapper for the group of
 *                                radio button fields to use as toggle
 * @param {string} destID         ID of the HTML block whose
 *                                visibility is to be toggled
 * @param {string|FALSE} showVal  the value to be matched to make HTML
 *                                block visible (If FALSE, then
 *                                visibility is toggled on by default)
 * @param {string|FALSE} hideVal  the value to be matched to make
 *                                HTML block hidden (If FALSE, then
 *                                visibility is toggled off by default)
 * @param {boolean} makeRequired  if TRUE, then force make all fields
 *                                in the toggled HTML block required
 *                                when the HTML block is visible and
 *                                not required when the HTML block is
 *                                hidden
 * @param {string|FALSE} focusID  set the focus to field specified by
 *                                the ID when the HTML block is made
 *                                visible
 * @param {boolean} makeAutoAfter remove height from style attribute
 *                                after the CSS transition period,
 *                                when the HTML block is made visible
 */
function showHideByRadio (srcParentID, destID, showVal, hideVal, makeRequired, focusID, makeAutoAfter) {
  'use strict'

  var _hideVals = []
  var _showVals = []
  var tmp

  makeAutoAfter = _showHideMakeBool(makeAutoAfter)

  tmp = _showHideNormaliseShowHide(showVal)
  _showVals = tmp[0]
  showVal = tmp[1]

  tmp = _showHideNormaliseShowHide(hideVal)
  _hideVals = tmp[0]
  hideVal = tmp[1]

  makeRequired = _showHideMakeBool(makeRequired)
  focusID = _showHideMakeString(focusID)

  if (!_domNodeExists(srcParentID, 'srcParentID', 'showHideByRadio') || !_domNodeExists(destID, 'srcParentID', 'showHideByRadio')) {
    console.warn('source (' + srcParentID + ') or destination (' + destID + ') cannot be found in HTML')
    return false
  }

  _showHideSetStyles(destID)

  // Make sure prepopulated fields cause their destination blocks
  // to be shown/hidden
  _showHideBySetAutoTrigger(srcParentID, 'radio')

  $(srcParentID + ' input[type="radio"]').on('change', function () {
    var val = $(this).val()

    if ($(this).is(':checked')) {
      _showHideSingleOnChangeSub(val, destID, makeRequired, srcParentID, focusID, showVal, _showVals, hideVal, _hideVals, makeAutoAfter)
    } else {
      _showHideHide(destID)
      _showHideMakeFieldOptional(destID, makeRequired)
    }
  })
}

/**
 * applies an onChange function to a select field that toggles the
 * visibility of an HTML block
 * @param {string} srcFieldID     ID of the select field to use as
 *                                toggle
 * @param {object} data           Object where the first level of keys
 *                                match values for each select
 *                                <OPTION>.
 *                                - All options in the <SELECT> should
 *                                  have a key in the data object.
 *                                - Each option should have the same
 *                                  number of selectors spread across
 *                                  the show & hide keys
 *                                - show selectors whose fields should
 *                                  be made required when visible
 *                                  should be in an array with second
 *                                  value being TRUE
 *   data = {
 *     'option value 1': {
 *       show: [
 *         'selectorA-dontMakeRequired',
 *         ['selectorB-makeRequired', true],
 *         ['selectorC-makeRequired', true]
 *       ],
 *       hide: [ 'selectorD', 'selectorE', 'selectorF', ... ],
 *       focusID: 'selectorA input[type=text]',
 *       makeAutoAfter: false
 *     }
 *     'option value 1': {
 *       show: [
 *         ['selectorA-makeRequired', true],
 *         'selectorD-dontMakeRequired',
 *         'selectorE-dontMakeRequired'
 *       ],
 *       hide: [ 'selectorB', 'selectorC', 'selectorF' ],
 *       focusID: 'selectorA input[type=text]',
 *       makeAutoAfter: false
 *     }
 *     'option value 3': {
 *       show: [
 *         ['selectorE-makeRequired', true],
 *         'selectorF-dontMakeRequired',
 *       ],
 *       hide: ['selectorA', 'selectorB', 'selectorC', 'selectorD'],
 *       focusID: 'selectorE select',
 *       makeAutoAfter: true
 *     }
 *   }
 * @param {boolean} hideAllOnEmpty Whether or not to hide all show/hide
 *                                blocks if nothing is selected/checked
 */
function showHideMultiByRadio (srcParentID, data, hideAllOnEmpty) {
  'use strict'
  var options = []

  if (!_domNodeExists(srcParentID, 'srcParentID', 'showHideMultiByRadio')) {
    console.error('source (' + srcParentID + ') cannot be found in HTML')
    return false
  } else if (!_domNodeExists(srcParentID + ' input[type="radio"]', 'srcParentID', 'showHideMultiByRadio')) {
    console.error('source (' + srcParentID + ' input[type="radio"]) cannot be found in HTML')
    return false
  }

  options = _showHideMultiGetOptions(srcParentID + ' input[type="radio"]')

  data = _showHideMultiValidateData(data, options)
  data.srcFieldID = srcParentID
  data.hideAllOnEmpty = _showHideMakeBool(hideAllOnEmpty)

  _showHideMultiSetStyles(data.allSelectors, data.hideAllOnEmpty)

  _showHideBySetAutoTrigger(srcParentID, 'radio')

  $(srcParentID + ' input[type="radio"]').on('change', _showHideMultiOnChange(data))
}

/**
 * applies an onChange function to a checkbox field that toggles the
 * visibility of an HTML block
 * @param {string} srcFieldID      ID of the checkbox field to use
 *                                 as toggle
 * @param {string} destID          ID of the HTML block whose
 *                                 visibility is to be toggled
 * @param {boolean} uncheckedHide  if TRUE, the toggled HTML is
 *                                 hidden when the checkbox is
 *                                 unchecked,
 *                                 if FALSE, toggled HTML block is
 *                                 shown until the checkbox is
 *                                 checked
 *                                 (checked = show, unchecked = hide)
 * @param {boolean} makeRequired   if TRUE, make all fields in the
 *                                 toggled HTML block required when
 *                                 the HTML block is visible and not
 *                                 required when the HTML block is
 *                                 hidden
 * @param {string|FALSE} focusID   set the focus to field specified
 *                                 by the ID when the HTML block is
 *                                 made visible
 * @param {boolean} makeAutoAfter remove height from style attribute
 *                                after the CSS transition period,
 *                                when the HTML block is made visible
 */
function showHideByCheckbox (srcFieldID, destID, uncheckedHide, makeRequired, focusID, makeAutoAfter) {
  'use strict'

  makeAutoAfter = _showHideMakeBool(makeAutoAfter)
  makeRequired = _showHideMakeBool(makeRequired)
  focusID = _showHideMakeString(focusID)

  if (!_domNodeExists(srcFieldID, 'srcFieldID', 'showHideByCheckbox') || !_domNodeExists(destID, 'destID', 'showHideByCheckbox')) {
    console.warn('source (' + srcFieldID + ') or destination (' + destID + ') cannot be found in HTML')
    return false
  }

  if (uncheckedHide !== false) {
    uncheckedHide = true
  }

  _showHideSetStyles(destID)

  // Make sure prepopulated fields cause their destination blocks
  // to be shown/hidden
  _showHideBySetAutoTrigger(srcFieldID, 'checkbox')

  $(srcFieldID).on('change', function () {
    var hide = true

    if ($(this).is(':checked')) {
      if (uncheckedHide === true) {
        hide = false
      }
    } else {
      if (uncheckedHide === false) {
        hide = false
      }
    }

    if (hide === true) {
      _showHideHide(destID)
      _showHideMakeFieldOptional(destID, makeRequired)
    } else {
      _showHideShow(destID, makeAutoAfter)
      _showHideMakeFieldRequired(destID, makeRequired)
      _showHideSetFocus(focusID, srcFieldID)
    }
  })
}

/**
 * applies an onChange function to a text (or text style) field that
 * toggles the visibility of an HTML block
 * @param {string} srcFieldID     ID of the text input field to use
 *                                as toggle
 * @param {string} destID         ID of the HTML block whose
 *                                visibility is to be toggled
 * @param {boolean} makeRequired  if TRUE, then force make all fields
 *                                in the toggled HTML block required
 *                                when the HTML block is visible and
 *                                not required when the HTML block is
 *                                hidden
 * @param {string|FALSE} focusID  set the focus to field specified by
 *                                the ID when the HTML block is made
 *                                visible
 * @param {boolean} usePattern    if TRUE, and the text field has a
 *                                pattern attribute, then consider
 *                                the text field empty if the value
 *                                doesn't match the pattern.
 * @param {boolean} makeAutoAfter remove height from style attribute
 *                                after the CSS transition period,
 *                                when the HTML block is made visible
 */
function showHideByTextNotempty (srcFieldID, destID, makeRequired, focusID, usePattern, makeAutoAfter) {
  'use strict'

  var patternMatch = function (input) { return true }
  var patternStr = ''
  var regex

  makeAutoAfter = _showHideMakeBool(makeAutoAfter)
  makeRequired = _showHideMakeBool(makeRequired)
  focusID = _showHideMakeString(focusID)
  usePattern = _showHideMakeBool(usePattern)

  if (!_domNodeExists(srcFieldID, 'srcFieldID', 'showHideByTextNotempty') || !_domNodeExists(destID, 'destID', 'showHideByTextNotempty')) {
    console.warn('source (' + srcFieldID + ') or destination (' + destID + ') cannot be found in HTML')
    return false
  }

  if (usePattern === true && typeof $(srcFieldID).attr('pattern') !== 'undefined') {
    patternStr = $(srcFieldID).attr('pattern')
    regex = _showHideGetValidRegExp(patternStr)
    if (regex[0] !== false) {
      regex = regex[0]
      patternMatch = function (input) {
        return regex.test(input)
      }
    } else {
      if (regex[1] !== false) {
        console.error('The pattern attribute "/' + patternStr + '/"of ' + srcFieldID + ' contains an invalid RegExp', regex[1])
      }
    }
  }

  _showHideSetStyles(destID)
  _showHideBySetAutoTrigger(srcFieldID, 'checkbox')

  $(srcFieldID).on('change', function () {
    var val

    val = $(this).val()

    if (val !== '' && patternMatch(val)) {
      _showHideShow(destID, makeAutoAfter)
      _showHideMakeFieldRequired(destID, makeRequired)
      _showHideSetFocus(focusID, srcFieldID)
    } else {
      _showHideHide(destID)
      _showHideMakeFieldOptional(destID, makeRequired)
    }
  })
}

/**
 * applies an onChange function to a "file" (upload) input field that
 * toggles the visibility of an HTML block
 * @param {string} srcFieldID     ID of the text input field to use
 *                                as toggle
 * @param {string} destID         ID of the HTML block whose
 *                                visibility is to be toggled
 * @param {boolean} makeRequired  if TRUE, then force make all fields
 *                                in the toggled HTML block required
 *                                when the HTML block is visible and
 *                                not required when the HTML block is
 *                                hidden
 * @param {string|FALSE} focusID  set the focus to field specified by
 *                                the ID when the HTML block is made
 *                                visible
 *                                visible
 * @param {boolean} makeAutoAfter remove height from style attribute
 *                                after the CSS transition period,
 *                                when the HTML block is made visible
 */
function showHideByFileNotempty (srcFieldID, destID, makeRequired, focusID, makeAutoAfter) {
  'use strict'

  // var patternMatch
  // var patternStr = ''
  // var regex

  makeRequired = _showHideMakeBool(makeRequired)
  focusID = _showHideMakeString(focusID)
  makeAutoAfter = _showHideMakeBool(makeAutoAfter)

  if (!_domNodeExists(srcFieldID, 'srcFieldID', 'showHideByFileNotempty') || !_domNodeExists(destID, 'destID', 'showHideByFileNotempty')) {
    console.warn('source (' + srcFieldID + ') or destination (' + destID + ') cannot be found in HTML')
    return false
  }

  _showHideSetStyles(destID)
  _showHideBySetAutoTrigger(srcFieldID, 'file')

  $(srcFieldID).on('change', function () {
    var val

    val = $(this).val()

    if (val !== '') {
      _showHideShow(destID, makeAutoAfter)
      _showHideMakeFieldRequired(destID, makeRequired)
      _showHideSetFocus(focusID, srcFieldID)
    } else {
      _showHideHide(destID)
      _showHideMakeFieldOptional(destID, makeRequired)
    }
  })
}

//  END:  show/hide by form field
// ==================================================================

$(document).on('ready', function () {
  showHideByDoAutoTrigger()
})
