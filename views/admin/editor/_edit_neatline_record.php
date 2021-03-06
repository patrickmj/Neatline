<?php
/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4; */

/**
 * Partial template for the Nealtine record edit form.
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

<div class="neatline-record-edit-form">

    <div class="small-scroll-content">

    <form class="form-stacked">

        <fieldset>

            <div class="clearfix">
                <label for="title">Title</label>
                <div class="input">
                    <input class="xlarge" name="title" size="30" placeholder="Title" type="text" value="<?php echo $neatline->getTextByItemAndField($item, 'Title'); ?>" />
                    <span class="help-block">The text displayed as the item's icon on the timeline.</span>
                </div>
            </div>

            <div class="clearfix">
                <label for="map-description">Description</label>
                <div class="input">
                    <textarea class="xlarge" name="description" placeholder="Description" rows="4"><?php echo $neatline->getTextByItemAndField($item, 'Description'); ?></textarea>
                    <span class="help-block">Descriptive text associated with the item's timeline entry.</span>
                </div>
            </div>

            <div class="clearfix">
                <label>Start Date</label>
                <div class="input">
                    <div class="inline-inputs">
                        <input class="medium" name="start-date-date" type="text" placeholder="Date" value="<?php echo $neatline->getTimeTextByItemAndField($item, 'start_date'); ?>">
                        <input class="mini" name="start-date-time" type="text" placeholder="Time" value="<?php echo $neatline->getTimeTextByItemAndField($item, 'start_time'); ?>">
                        <span class="help-inline">Enter the date (or start date) of the item.</span>
                    </div>
                </div>
            </div>

            <div class="clearfix">
                <label>End Date</label>
                <div class="input">
                    <div class="inline-inputs">
                        <input class="medium" name="end-date-date" type="text" placeholder="Date" value="<?php echo $neatline->getTimeTextByItemAndField($item, 'end_date'); ?>">
                        <input class="mini" name="end-date-time" type="text" placeholder="Time" value="<?php echo $neatline->getTimeTextByItemAndField($item, 'end_time'); ?>">
                        <span class="help-inline">Enter an ending date, if applicable.</span>
                    </div>
                </div>
            </div>

            <div class="clearfix">
                <label>Date Ambiguity</label>
                <div class="input">
                    <div class="inline-inputs">
                        <div class="date-ambiguity-container">
                            <div class="date-ambiguity-editor">
                                <div class="stop-marker left"><div class="color-swatch"></div></div>
                                <div class="stop-marker right"><div class="color-swatch"></div></div>
                            </div>
                            <input name="left-ambiguity-percentage" type="hidden" value="<?php echo $neatline->getAmbiguityPercentage($item, 'left'); ?>">
                            <input name="right-ambiguity-percentage" type="hidden" value="<?php echo $neatline->getAmbiguityPercentage($item, 'right'); ?>">
                        </div>
                        <span class="help-inline">Drag the beginning and ending sliders inward to capture uncertainty over the date interval.</span>
                    </div>
                </div>
            </div>

            <div class="clearfix">
                <label>Vector Color</label>
                <input type="text" id="color-<?php echo $item->id; ?>" class="color-picker" name="color" value="<?php echo $neatline->getTextByItemAndField($item, 'Identifier'); ?>" />
                <span class="help-inline">Select a color for the item's spatial vectors.</span>
            </div>

            <div class="actions">
                <input type="submit" class="btn primary" value="Save">&nbsp;<button type="reset" class="btn">Close</button>
            </div>

        </fieldset>

        <recordid><?php echo $item->id; ?></recordid>

    </form>

    </div>

</div>
