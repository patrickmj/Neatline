<?php
/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4; */

/**
 * Helper functions.
 *
 * PHP version 5
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by
 * applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * OF ANY KIND, either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 *
 * @package     omeka
 * @subpackage  neatline
 * @author      Scholars' Lab <>
 * @author      Bethany Nowviskie <bethany@virginia.edu>
 * @author      Adam Soroka <ajs6f@virginia.edu>
 * @author      David McClure <david.mcclure@virginia.edu>
 * @copyright   2011 The Board and Visitors of the University of Virginia
 * @license     http://www.apache.org/licenses/LICENSE-2.0.html Apache 2 License
 */
?>

<?php

/**
 * Include the neatline-admin.css stylesheet and the Google Fonts include.
 *
 * @return void.
 */
function neatline_queueAdminCss()
{

    queue_css('neatline-admin');

    ?>
    <link href='http://fonts.googleapis.com/css?family=Crimson+Text:400,400italic,600,600italic,700,700italic' rel='stylesheet' type='text/css'>
    <?php

}

/**
 * Create a form containing a single button.
 *
 * @param string $action Form action URI.
 * @param string $name Name/id attribute for button.
 * @param string $value Button value.
 * @param array $attribs Other HTML attributes for button.
 * @param string $formName Name/id attribute for button.
 * @param array $formAttribs Other HTML attributes for button.
 *
 * @return string HTML form.
 */
function neatline_button_to($action, $name = null, $value = 'Submit', $attribs = array(), $formName = null, $formAttribs = array())
{

    $view = __v();
    if (!array_key_exists('action', $formAttribs)) {
        $formAttribs['action'] = $action;
    }
    if (!array_key_exists('method', $formAttribs)) {
        $formAttribs['method'] = 'post';
    }
    if (!array_key_exists('class', $formAttribs)) {
        $formAttribs['class'] = 'button-form';
    }

    // Fieldset tags fix validation errors.
    return $view->form($formName, $formAttribs,
        '<fieldset>' . $view->formSubmit($name, $value, $attribs) . '</fieldset>');

}
