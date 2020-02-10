# Show/Hide javascript functions

If you have a complex form that might be intimidating to users you
may want to expose parts of the form only as the user progresses
through the form. Or if you have a form with fields that should only
be completed when a preceding field has a specific value, then
showHideBy.js is for you.

__NOTE:__ The following assumes that blocks you want to hide are
wrapped in an element with an ID.

__Be aware__ `show/hide by` functionality may not behave predictably
if you have multiple fields controlling the visibility of the same
block of HTML.

It may be that with testing, you can be sure it will do what you want
but you _really_ will need to test it.</p>

-----

## Show/Hide by select (or radio button)

Use a select question as the control/toggle to show or hide another
(single) part of the page.

__NOTE:__ If you need to show/hide multiple blocks with multiple values single select field (or group of radio buttons), use [Show/Hide multiple blocks by select (or radio button)](#) instead.

```javascript
showHideBySelect(srcFieldID, destID, showVal, hideVal, makeRequired, focusID);

showHideByRadio(srcParentID, destID, showVal, hideVal, makeRequired, focusID);
```

### Parameters:

* __`srcFieldID` (select only)__<br />
  ID of the select field to use as toggle. Or the `name` attribute of
  a group of radio buttons<br />
  __Note:__ an ID/name attribute must be prefixed with the hash character ("__`#`__")<br />
  e.g. select field with the ID '__`#my-select-field`__'
  ```javascript
  showHideBySelect('#my-select-field', '#my-show-hide-block', '1');
  ```

* __`srcParentID` (radio button only)__<br />
  ID of the wrapper for the radio button fields to use as toggle<br />
  __Note:__ an ID/name attribute must be prefixed with the hash character ("__`#`__")<br />
  e.g. select field with the ID '__`#q461746_q8`__' or a radio field with the name attribute '__`#outer_q461746_q8`__'
  ```javascript
  showHideByRadio('#outer_q461746_q8', '#outer_461746_q30', '1');
  ```

* __`destID`__<br />
  ID of the block of HTML that is to be shown/hidden.<br />
  __Note:__ an ID must be prefixed with the hash character ("__`#`__")<br />
  e.g. the HTML block whose wrapper has the ID: __`#outer_461746_q30`__
  ```javascript
    showHideBySelect('#q461746_q8', '#outer_461746_q30', '1');
    
    showHideByRadio('input[name=q461746_q8]', '#outer_461746_q30', '1');
  ```

* __`showVal`__<br />
  the string value (or array/comma separated list of string values) to be matched to make HTML block _visible_.<br />
  (If `FALSE`, then visibility is toggled _on_ by default)<br />
  __Note:__ each value must exactly match the value of an option in the select box.<br />
  e.g. show the block '#outer_461746_q30' only if the field `#q461746_q8_1` as the option with the value `1` selected
  ```javascript
  // ONLY option values "1" triggers showing '#outer_461746_q30'
  showHideBySelect('#q461746_q8', '#outer_461746_q30', '1');

  // option values "1", "3" & "4" all trigger showing '#outer_461746_q30'  
  showHideBySelect('#q461746_q8', '#outer_461746_q30', ['1', '3', '4']);

  showHideByRadio('input[name=q461746_q8]', '#outer_461746_q30', '1');
  
  // option values "1", "3" & "4" all trigger showing '#outer_461746_q30'
  showHideByRadio('input[name=q461746_q8]', '#outer_461746_q30', ['1', '3', '4']);
  ```

* __`hideVal`__<br />
  the string value (or array/comma separated list of string values) to be matched to make HTML block _hidden_.<br />
  (If `FALSE`, then visibility is toggled _off_ by default)<br />
  __Note:__ each value must exactly match the value of an option in the select box.<br />
  e.g. keep the block `#outer_461746_q30` visible unless `#q461746_q8` field's value is `1`
  ```javascript
  showHideBySelect('#q461746_q8', '#outer_461746_q30', false, '1');
  
  showHideByRadio('input[name=q461746_q8]', '#outer_461746_q30', false, '1');
  ```

* __`makeRequired`__<br />
  If you want the field (or fields) in the show/hide block made required when visible, then make this _true_.<br />
  __Note:__ _true_ and _false_ are not wrapped in quotation marks.<br />
  __Note also:__ you must include _ALL_ the preceding parameters<br />
  e.g. make all fields in block `#outer_461746_q30` required when the `#q461746_q8_1` field's value is '1'
  ```javascript
  showHideBySelect('#q461746_q8', '#outer_461746_q30', '1', false, true);
  
  showHideByRadio('input[name=q461746_q8]', '#outer_461746_q30', '1', false, true);
  ```

* __`focusID`__<br />
  If your toggle field is immediately before the field you are showing, then you can force the cursor to the shown field by making the last parameter _true_.<br />
  __Note:__ _true_ and _false_ are not wrapped in quotation marks.<br />
  __Note also:__ you must include _ALL_ the preceding parameters<br />
  e.g. put the cursor in the field `#q461746_q30` (if it's a texts field) or focus the user on the radio group, checkbox or select field when it is visible
  ```javascript
  showHideBySelect('#q461746_q8', '#outer_461746_q30', '1', false, true, #q461746_q30);
  
  showHideByRadio('input[name=q461746_q8]', '#outer_461746_q30', '1', false, true, #q461746_q30);
  ```

-----

## Show/Hide multiple blocks by select (or radio button)

There are times when you have a select field (or radio fields) and
each option triggers different blocks to be shown/hidden. In this
case we use `showHideByMultiSelect()` or `showHideMulitByRadio()`

__NOTE:__ If you need to show/hide one block with a single select field (or group of radio buttons), it might be easier to use [Show/Hide blocks based on question answers](#) instead.</p>

```javascript
showHideMulitBySelect(srcFieldID, data, hideAllOnEmpty);

showHideMulitByRadio(srcParentID, data, hideAllOnEmpty);
```

### Parameter:

* __`srcFieldID` (select only)<br />
  ID of the select field to use as toggle. Or the `name` attribute of a group of radio buttons<br />
  __Note:__ an ID/name attribute must be prefixed with the hash character ("__`#`__")<br />
  e.g. select field with the ID '__`#q461746_q8`__'
  ```javascript
  showHideBySelect('#q461746_q8', data, true);
  ```

* __`srcParentID` (radio button only)__<br />
  ID of the wrapper for the radio button fields to use as toggle<br />
  __Note:__ an ID/name attribute must be prefixed with the hash character ("__`#`__")<br />
  e.g. select field with the ID '__`#q461746_q8`__' or a radio field with the name attribute '__`#outer_q461746_q8`__'
  ```javascript
  showHideMulitByRadio(`#q461746_q8`, `data`);
  ```

* __`data`__<br />
  A JSON object where each top level key represents an option value from the select field or group of radio buttons<br />
  Each value __must__ have an object with three keys: "__show__", "__hide__" & "__focusID__" (optional)<br />
  By default items listed in the "__show__" array do not have their child fields required. If you want the child fields to be required you put it in an array with the second item in the array being `TRUE` (see `optionValue1.show.["#selectorC", true]`)
  __Requirements:__
    1. You must have an entry for each non-empty value in the select (or radio button group)
    2. Each entry __must__ have a `show` and a `hide` property, each containing an array of selectors
    3. Show items may be a simple string CSS selector or an array with the first item being the string CSS selector and the second item being either `true` or `false` to identify whether block's child fields should be made required.
    4. Each entry may _(or may not)_ have a `focusID` property
    5. __All__ entries __must__ have the same number of show/hide block IDs (or any CSS selector) spread across the `show` and `hide` properties<br />
    Note how all entries list "`#selectorA`", "`#selectorB`", "`#selectorC`", "`#selectorD`", "`.selectorE`" & "`#selectorF`" even though they might be alternately in "__show__" or "__hide__".<br />
    ___Why do I need to specify the same selectors over and over again?___<br />
    I was having issues working out which blocks needed to be shown (or hidden) for each option (or radio button) value. The most reliable way was to explicitly set which blocks should be shown and which should be hidden for each select option (or radio button) value
    6. "__show__", "__hide__" & "__focusID__" selectors can be any valid CSS selector, but IDs work best
    
    __NOTE:__ The console in your browser's web developer tools will show comprehensive error and warning reporting.<br />
    __Make sure you check the console and fix all errors and warnings before you go live.__<br />
    __Sample:__
    ```html
    <label for="showHideToggle">Show Hide toggle</label>
    <select id="showHideToggle">
      <option value=""> -- Please choose -- </option>
      <option value="optionValue1">Option Value 1</option>
      <option value="optionValue2">Option Value 2</option>
      <option value="optionValue3">Option Value 3</option>
    </select>
    ```
    ```javascript
    var data = {
  	  optionValue1: { // The value to trigger is selected/checked
        show: [ // Blocks you wish to show when "optionValue1" is selected/checked
  			  '#selectorA', // selectorA's (css selector) is a block that will be shown when "optionValue1" is selected.
                       // Its child fields are implicitly optional</span>
  			  ['#selectorB', false],  // selectorB's child fields are explicitly not required (optional)
  			  ['#selectorC', true]    // selectorC's child fields are explicitly required
  		  ],
        hide: [
          '#selectorD', // the selectorD block will be hidden when "optionValue1" is selected
          '.selectorE',
          '#selectorF'
        ],
  		  focusID: '#selectorA input[type=text]' // The first time "optionValue1" is selected,
                                               // the cursor will automatically go to the field matching this ID</span>
  	  }
  	  optionValue2: {
        show: [
          ['#selectorA', true],
          '#selectorD',
          '.selectorE']
  		  ],
        hide: [
          '#selectorB',
          '#selectorC',
          '#selectorF'
        ],
        // focusID is optional. If you don't need focus to be set the property can be omitted.
      },
      optionValue3: {
        show: [
          ['.selectorE', true],
          '#selectorF']
  		  ],
        hide: [
          '#selectorA',
          '#selectorB',
          '#selectorC',
          '#selectorD'
        ],
  		  focusID: '.selectorE select'
      }
    }
    
    showHideMulitBySelect(#showHideToggle, data);
    
    showHideMulitByRadio(#showHideToggle, data);
  ```

* __`hideAllOnEmpty`__<br />
  Whether or not to hide all items if the select/radio has no default value set.<br />
  `TRUE`, `FALSE`<br />
  e.g.
  ```javascript
  showHideMulitBySelect('#q461746_q8', data, true);
  
  showHideMulitByRadio('#q461746_q8', data, true);
  ```

-----

## Show/Hide by checkbox

Use a checkbox question as the control/toggle to show or hide another part of the page.</p>

```javascript
showHideByCheckbox(srcFieldID, destID, uncheckedHide, makeRequired, focusID);
```

### Parameter:</h3>

* __`srcFieldID`__<br />
  ID of the checkbox field to use as toggle.<br />
  __Note:__ an ID attribute must be prefixed with the hash character ("__`#`__")<br />
  e.g. checkbox field with the ID '__`#q461746_q8_1`__'
  ```javascript
  showHideByCheckbox('#q461746_q8', '#outer_461746_q30');
  ```

* __`destID`__<br />
  ID of the block of HTML that is to be shown/hidden.<br />
  __Note:__ an ID must be prefixed with the hash character ("__`#`__")<br />
  e.g. the HTML block whose wrapper has the ID: __`#outer_461746_q30`__
  ```javascript
  showHideByCheckbox('#q461746_q8', '#outer_461746_q30');
  ```

* __`uncheckedHide`__<br />
  the string value (or array/comma separated list of string values) to be matched to make HTML block _visible_.<br />
  (If FALSE, then visibility is toggled _on_ by default)<br />
  __Note:__ each value must exactly match the value of an option in the select box.<br />
  e.g. show the block `#outer_461746_q30` only if the field '#q461746_q8' is _NOT_ checked
  ```javascript
  showHideByCheckbox('#q461746_q8', '#outer_461746_q30', false);</pre></span>
  ```

* __`makeRequired`__<br />
  If you want the field (or fields) in the show/hide block made required when visible, then make this _true_.<br />
  __Note:__ _true_ and _false_ are not wrapped in quotation marks.<br />
  __Note also:__ you must include _ALL_ the preceding parameters<br />
  e.g. make all fields in block `#outer_461746_q30` required when the '#q461746_q8' field's value is '1'
  ```javascript
  showHideByCheckbox('#q461746_q8', '#outer_461746_q30', true, true);
  ```

* __`focusID`__<br />
  If your toggle field is immediately before the field you are showing, then you can force the cursor to the shown field by making the last parameter _true_.<br />
  __Note:__ _true_ and _false_ are not wrapped in quotation marks.<br />
  __Note also:__ you must include _ALL_ the preceding parameters<br />
  e.g. put the cursor in the field `#q461746_q30` (if it's a texts field) or focus the user on the radio group, checkbox or select field when it is visible
  ```javascript
  showHideByCheckbox('#q461746_q8', '#outer_461746_q30', true, true, '#q461746_q30');
  ```

-----

## Show/Hide by non-empty text field

Say you have a group of free text fields but you don't want to scare the user by presenting 10 fields at once. `showHideByTextNotempty()` allows you to only show a block based on whether a textbox is empty or not.
  ```javascript
  showHideByTextNotempty(srcFieldID, destID, makeRequired, focusID, usePattern);
  ```

### Parameter:

* __`srcFieldID`__<br />
  ID of the text input field to use as toggle.<br />
  __Note:__ an ID attribute must be prefixed with the hash character ("__`#`__")<br />
  e.g. text input field with the ID '__`#q461746_q8`__'
  ```javascript
  showHideByTextNotempty('#q461746_q8', '#outer_461746_q30');
  ```

* __`destID`__<br />
  ID of the block of HTML that is to be shown/hidden.<br />
  __Note:__ an ID must be prefixed with the hash character ("__`#`__")<br />
  e.g. the HTML block whose wrapper has the ID: __`#outer_461746_q30`__
  ```javascript
  showHideByCheckbox('#q461746_q8', '#outer_461746_q30');
  ```

* __`makeRequired`__<br />
  If you want the field (or fields) in the show/hide block made required when visible, then make this _true_.<br />
  __Note:__ _true_ and _false_ are not wrapped in quotation marks.<br />
  e.g. make all fields in block `#outer_461746_q30` required when the `#q461746_q8_1` field's value is '1'
                    <span class="code"><pre class="hl">
  showHideByTextNotempty('#q461746_q8', '#outer_461746_q30', true);</pre></span>

* __`focusID`__<br />
  If your toggle field is immediately before the field you are showing, then you can force the cursor to the shown field by making the last parameter _true_.<br />
  __Note:__ _true_ and _false_ are not wrapped in quotation marks.<br />
  __Note also:__ you must include _ALL_ the preceding parameters<br />
  e.g. put the cursor in the field `#q461746_q30` (if it's a texts field) or focus the user on the radio group, checkbox or select field when it is visible
  ```javascript
  showHideByTextNotempty('#q461746_q8', '#outer_461746_q30', true, '#q461746_q30');
  ```

* __`usePattern`__<br />
  if TRUE, and the text field has a pattern attribute, then consider the text field empty if the value doesn't match the pattern (regular expression).<br />
  e.g. Only make '#outer_461746_q30' visible if '#q461746_q8' is not empty __<emp>AND</emp>__ and the value matches the pattern of the text field.
  ```javascript
  showHideByTextNotempty('#q461746_q8', '#outer_461746_q30', true, #q461746_q30, true);
  ```

-----

## Automatically hide blocks when the page loads
There is now no need to do anything to make the show/hide block preset to hidden/visible when the page loads. However, if you are doing stuff to the form after the page has already loaded, you may need to call `showHideByDoAutoTrigger()` after you've done what you need. But test first. It shouldn't be necessary.
