/*
 * Widget instantiations for the Neatline editor.
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

jQuery(document).ready(function($) {

    var neatlineContainer = $('.neatline-container');

    // Positioning manager.
    neatlineContainer.fullscreenpositioner({

        'resize': function() {
            neatlineContainer.neatline('positionDivs');
            neatlineContainer.neatline('positionBlockMarkup');
        }

    });

    // Neatline.
    neatlineContainer.neatline({

        // When the user clicks on an item on the timeline.
        'timelineeventclick': function(event, obj) {

            // Focus the map.
            neatlineContainer.neatline('zoomMapToItemVectors', obj.itemId);

            // Focus the items tray.
            neatlineContainer.neatline('showItemDescription', obj.itemId);

        },

        // When the user clicks on a feature on the map.
        'mapfeatureclick': function(event, obj) {

            // Focus the timeline.
            neatlineContainer.neatline('zoomTimelineToEvent', obj.itemId);

            // Focus the items tray.
            neatlineContainer.neatline('showItemDescription', obj.itemId);

        },

        // When the user clicks on an item in the items tray.
        'undateditemclick': function(event, obj) {

            // Focus the map.
            neatlineContainer.neatline('zoomMapToItemVectors', obj.itemId);

            // Focus the timeline.
            neatlineContainer.neatline('zoomTimelineToEvent', obj.itemId);

            // Focus the items tray.
            neatlineContainer.neatline('showItemDescription', obj.itemId);

        }



    });

});
