/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4; */

/*
 * Dynamic layout builder application in the add view.
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

(function($, undefined) {


    $.widget('neatline.layoutbuilder', {

        options: {

            // Ids.
            dragbox_id: 'drag-box',
            options_id: 'options',
            top_element_input_id: 'top_element',
            udi_position_input_id: 'undated_items_position',
            udi_height_input_id: 'undated_items_height',
            timeline_select_id: 'timeline',
            map_select_id: 'map',

            // Css dimension defaults, animation constants.
            top_block_percentage: 60,
            undated_items_width: 150,
            vertical_offset_tier1: 75,
            vertical_offset_tier2: 150,
            gloss_fade_duration: 300,

            // Starting configuration params.
            def_top_element: 'map',
            def_udi_position: 'right',
            def_udi_height: 'partial',

            // Miscellaneous
            no_selection_string: '-',

            // Hex defaults.
            colors: {
                map: {
                    default: '#eef7ff',
                    target: '#dcefff'
                },
                timeline: {
                    default: '#fffded',
                    target: '#fffad2'
                },
                undated_items: {
                    default: '#ffedef',
                    target: '#ffdbdf'
                }
            }

        },

        _create: function() {

            // Get window for mousemove binding.
            this._window = $(window);

            // Getters for options and dragbox divs.
            this.buttons = $('#' + this.options.options_id);
            this.dragbox = $('#' + this.options.dragbox_id);

            // Getters for the hidden form attributes.
            this.top_element_input = $('#' + this.options.top_element_input_id);
            this.udi_position_input = $('#' + this.options.udi_position_input_id);
            this.udi_height_input = $('#' + this.options.udi_height_input_id);

            // Getters for map and timeline select dropdowns.
            this.map_select = $('#' + this.options.map_select_id);
            this.timeline_select = $('#' + this.options.timeline_select_id);

            // Set dropdown select tracker default, wire the
            // layout builder up with the selects.
            this._last_map_dropdown_selection = this.options.no_selection_string;
            this._last_timeline_dropdown_selection = this.options.no_selection_string;
            this._addToggleEvents();

            // Get fixed pixel values for heights.
            this._getPxConstants();

            // Create draggers.
            this._createDraggers();

            // Squash text selection and gloss the buttons.
            this._disableSelect();
            this._createButtons();

            // Set tracker variables for element presence.
            this._is_map = false;
            this._is_timeline = false;
            this._is_undated_items = false;

            // Set tracker variables for element position.
            this._setStartingParameters();

            // Set tracker arrays that record the last parameter
            // loadouts that triggered a div slide.
            this._last_map_slide_params = null;
            this._last_timeline_slide_params = null;

            // Gloss.
            this._addDragEvents();

        },

        _setStartingParameters: function() {

            var top_element_starter = this.top_element_input.attr('value');
            var undated_items_position_starter = this.udi_position_input.attr('value');
            var undated_items_height_starter = this.udi_height_input.attr('value');

            this._top_element = (top_element_starter) ? top_element_starter :
                this.options.def_top_element;

            this._undated_items_position = (undated_items_position_starter) ? undated_items_position_starter :
                this.options.def_udi_position;

            this._undated_items_height = (undated_items_height_starter) ? undated_items_height_starter :
                this.options.def_udi_height;

            this.top_element_input.attr('value', this._top_element);
            this.udi_position_input.attr('value', this._undated_items_position);
            this.udi_height_input.attr('value', this._undated_items_height);

            // If there are dropdown selects (on add page), fire change on them.
            if (this.map_select.length > 0 && this.timeline_select.length > 0) {
                this.map_select.trigger('change');
                this.timeline_select.trigger('change');
            }

            // If not (on edit page), enable the toggle buttons directly.
            else {
                this.map_toggle.togglebutton('enable');
                this.map_toggle.togglebutton('press');
                this.timeline_toggle.togglebutton('enable');
                this.timeline_toggle.togglebutton('press');
                this.undated_items_toggle.togglebutton('enable');
                this.undated_items_toggle.togglebutton('press');
            }

        },

        _getPxConstants: function() {

            this._dragbox_height = this.dragbox.height();
            this._dragbox_width = this.dragbox.width();
            this._dragbox_position = this.dragbox.offset();

            this._top_block_height = this._dragbox_height *
                (this.options.top_block_percentage/100);

            this._bottom_block_height = this._dragbox_height -
                this._top_block_height;

            this._undated_items_left_offset = this._dragbox_width -
                this.options.undated_items_width;

        },

        _disableSelect: function() {

            // Turn off text selection on the whole container div.
            this.element.css('MozUserSelect', 'none');
            this.element.bind('selectstart mousedown', function() {
                return false;
            });

            // Fix the pointer style in the drag box.
            this.dragbox.css('cursor', 'default');

        },

        _createButtons: function() {

            // Instantiate buttons, define callbacks.

            this.map_toggle = $('#toggle-map');
            this.timeline_toggle = $('#toggle-timeline');
            this.undated_items_toggle = $('#toggle-undated-items');

            this.map_toggle.togglebutton({
                pressed_by_default: false,
                enabled_by_default: false,
                press: $.proxy(this._toggleMap, this),
                unpress: $.proxy(this._toggleMap, this)
            });

            this.timeline_toggle.togglebutton({
                pressed_by_default: false,
                enabled_by_default: false,
                press: $.proxy(this._toggleTimeline, this),
                unpress: $.proxy(this._toggleTimeline, this)
            });

            this.undated_items_toggle.togglebutton({
                pressed_by_default: false,
                visible_by_default: false,
                press: $.proxy(this._toggleUndatedItems, this),
                unpress: $.proxy(this._toggleUndatedItems, this)
            });

        },

        _createDraggers: function() {

            // Create the map.
            this.map_drag = this.__createMapDiv();

            // Create the timeline.
            this.timeline_drag = this.__createTimelineDiv();

            // Create the undated items.
            this.undated_items_drag = this.__createUndatedItemsDiv();

            // Inject.
            this.dragbox.append(
                this.map_drag,
                this.timeline_drag,
                this.undated_items_drag);

        },

        _addToggleEvents: function() {

            var self = this;

            // Bind callback on map selection change.
            this.map_select.bind('change', function() {

                var value = self.map_select.find('option:selected').html();

                if (value != self._last_map_dropdown_selection) {

                    if (value == self.options.no_selection_string && self._is_map) {
                        self.map_toggle.togglebutton('press');
                        self.map_toggle.togglebutton('disable');
                    }

                    else if (value == self.options.no_selection_string && !self._is_map) {
                        self.map_toggle.togglebutton('disable');
                    }

                    else if (value != self.options.no_selection_string && !self._is_map) {
                        self.map_toggle.togglebutton('enable');
                        self.map_toggle.togglebutton('press');
                    }

                }

                self._last_map_dropdown_selection = value;

            });

            // Bind callback on map selection change.
            this.timeline_select.bind('change', function() {

                var value = self.timeline_select.find('option:selected').html();

                if (value != self._last_timeline_dropdown_selection) {

                    if (value == self.options.no_selection_string && self._is_timeline) {

                        if (self._is_undated_items) {
                            self.undated_items_toggle.togglebutton('press');
                            self.undated_items_toggle.togglebutton('disable');
                        }

                        self.timeline_toggle.togglebutton('press');
                        self.timeline_toggle.togglebutton('disable');

                    }

                    else if (value == self.options.no_selection_string && !self._is_timeline) {
                        self.timeline_toggle.togglebutton('disable');
                    }

                    else if (value != self.options.no_selection_string && !self._is_timeline) {
                        self.timeline_toggle.togglebutton('enable');
                        self.timeline_toggle.togglebutton('press');
                        self.undated_items_toggle.togglebutton('enable');
                        self.undated_items_toggle.togglebutton('press');
                    }

                }

                self._last_timeline_dropdown_selection = value;

            });

        },

        _addDragEvents: function() {

            var self = this;

            // Gloss map.
            this.map_drag.bind({

                'mouseenter': function() {
                    if (!self._is_dragging) {
                        self.__mapHighlight('enter');
                    }
                },

                'mouseleave': function() {
                    if (!self._is_dragging) {
                        self.__mapHighlight('leave');
                    }
                },

                'mousedown': function(e) {
                    if (!self._is_dragging) {
                        self.__doMapDrag(e);
                    }
                }

            });

            // Gloss timeline.
            this.timeline_drag.bind({

                'mouseenter': function() {
                    if (!self._is_dragging) {
                        self.__timelineHighlight('enter');
                        self.__undatedItemsHighlight('enter');
                    }
                },

                'mouseleave': function() {
                    if (!self._is_dragging) {
                        self.__timelineHighlight('leave');
                        self.__undatedItemsHighlight('leave');
                    }
                },

                'mousedown': function(e) {
                    if (!self._is_dragging) {
                        self.__doTimelineDrag(e);
                    }
                }

            });

            // Gloss undated items.
            this.undated_items_drag.bind({

                'mouseenter': function() {
                    if (!self._is_dragging) {
                        self.__undatedItemsHighlight('enter');
                    }
                },

                'mouseleave': function() {
                    if (!self._is_dragging) {
                        self.__undatedItemsHighlight('leave');
                    }
                },

                'mousedown': function(e) {
                    if (!self._is_dragging) {
                        self.__doUndatedItemsDrag(e);
                    }
                }

            });

        },

        _repositionDraggers: function() {

            // Map.
            this.map_drag.css({
                'height': this.__getMapHeight(),
                'width': this.__getMapWidth(),
                'top': this.__getMapTopOffset(),
                'left': this.__getMapLeftOffset()
            });

            // Timeline.
            this.timeline_drag.css({
                'height': this.__getTimelineHeight(),
                'width': this.__getTimelineWidth(),
                'top': this.__getTimelineTopOffset(),
                'left': this.__getTimelineLeftOffset()
            });

            // Undated items.
            this.undated_items_drag.css({
                'height': this.__getUndatedItemsHeight(),
                'width': this.__getUndatedItemsWidth(),
                'top': this.__getUndatedItemsTopOffset(),
                'left': this.__getUndatedItemsLeftOffset()
            });

            // Center tags.
            this._centerAllTags();

        },

        _centerAllTags: function() {

            this._position_tag(this.map_drag);
            this._position_tag(this.timeline_drag);
            this._position_tag(this.undated_items_drag);

        },

        _toggleMap: function() {

            switch(this._is_map) {

                case true:

                    this._is_map = false;

                    // Display none the map.
                    this.map_drag.css('display', 'none');

                break;

                case false:

                    this._is_map = true;

                    // Show the div.
                    this.map_drag.css('display', 'block');

                break;

            }

            // Recalculate all positions for all divs.
            this._repositionDraggers();

        },

        _toggleTimeline: function() {

            switch(this._is_timeline) {

                case true:

                    this._is_timeline = false;

                    // Display none the timeline.
                    this.timeline_drag.css('display', 'none');

                    this._recuperate_udi_on_timeline_toggle = false;

                    if (this._is_undated_items) {
                        this._toggleUndatedItems();
                        this._recuperate_udi_on_timeline_toggle = true;
                    }

                break;

                case false:

                    this._is_timeline = true;

                    // Show the div.
                    this.timeline_drag.css('display', 'block');

                    if (this._recuperate_udi_on_timeline_toggle) {
                        this._toggleUndatedItems();
                    }

                break;

            }

            // Recalculate all positions for all divs.
            this._repositionDraggers();

            // Toggle the undated items toggle button.
            this.__toggleUndatedItemsButton();

        },

        _toggleUndatedItems: function() {

            switch(this._is_undated_items) {

                case true:

                    this._is_undated_items = false;

                    // Display none the timeline.
                    this.undated_items_drag.css('display', 'none');

                break;

                case false:

                    this._is_undated_items = true;

                    // Show the div.
                    this.undated_items_drag.css('display', 'block');

                break;

            }

            // Recalculate all positions for all divs.
            this._repositionDraggers();

        },

        _position_tag: function(draggable) {

            var tag = draggable.find('.drag-tag');
            var draggable_height = draggable.height();
            var tag_height = tag.height();

            tag.css('top', (draggable_height/2)-(tag_height/2) + 'px');

        },

        _animate_position_tag: function(draggable, height) {

            var tag = draggable.find('.drag-tag');
            var tag_height = tag.height();

            tag.stop().animate({ 'top': (height/2)-(tag_height/2) + 'px' });

        },

        _destroy: function() {

        },

        /*
         * Glossing and dragging methods.
         */

        __mapHighlight: function(enter_or_leave) {

            // Figure out which color to tween to.
            switch (enter_or_leave) {

                case 'enter':
                    var target = this.options.colors.map.target;
                break;

                case 'leave':
                    var target = this.options.colors.map.default;
                break;

            }

            this.map_drag.animate({
                'background-color': target
            }, this.options.gloss_fade_duration);

        },

        __timelineHighlight: function(enter_or_leave) {

            // Figure out which color to tween to.
            switch (enter_or_leave) {

                case 'enter':
                    var target = this.options.colors.timeline.target
                break;

                case 'leave':
                    var target = this.options.colors.timeline.default
                break;

            }

            this.timeline_drag.animate({
                'background-color': target
            }, this.options.gloss_fade_duration);

        },

        __undatedItemsHighlight: function(enter_or_leave) {

            // Figure out which color to tween to.
            switch (enter_or_leave) {

                case 'enter':
                    var target = this.options.colors.undated_items.target
                break;

                case 'leave':
                    var target = this.options.colors.undated_items.default
                break;

            }

            this.undated_items_drag.clearQueue().animate({
                'background-color': target
            }, this.options.gloss_fade_duration);

        },

        __doMapDrag: function(trigger_event_object) {

            this._is_dragging = true;

            // Get starting pointer coordinates.
            var startingX = trigger_event_object.pageX;
            var startingY = trigger_event_object.pageY;

            // Get starting div offsets.
            var startingOffsetX = this.__getMapLeftOffset();
            var startingOffsetY = this.__getMapTopOffset();

            // Bind self.
            var self = this;

            // Make the drag div see-through and always on top.
            this.map_drag.css({
                'opacity': 0.5,
                'z-index': 99
            });

            this._window.bind({

                'mousemove': function(e) {

                    // Calculate new offsets.
                    var offsetX = e.pageX - startingX;
                    var offsetY = e.pageY - startingY;

                    // Apply new position.
                    self.map_drag.css({
                        'left': startingOffsetX + offsetX,
                        'top': startingOffsetY + offsetY
                    });

                    // If there is a timeline.
                    if (self._is_timeline) {

                        // If the timeline is on the bottom.
                        if (self._top_element == 'map') {

                            // If the cursor dips below the top border
                            // of the timeline div, slide the timeline up.
                            if (e.pageY > (self._top_block_height + self._dragbox_position.top)) {
                                self._top_element = 'timeline';
                                self.__slideTimelineAndUndatedItems(false);
                            }

                        }

                        // If the timeline is on the top.
                        else {

                            // If the cursor moves above the bottom border
                            // of the timeline div, slide the timeline down.
                            if (e.pageY < (self._dragbox_position.top + self._top_block_height)) {
                                self._top_element = 'map';
                                self.__slideTimelineAndUndatedItems(false);
                            }

                        }

                    }

                },

                'mouseup': function() {

                    self.__slideMap(true);
                    self._window.unbind('mousemove mouseup');

                }

            });

        },

        __doTimelineDrag: function(trigger_event_object) {

            this._is_dragging = true;

            // Get starting pointer coordinates.
            var startingX = trigger_event_object.pageX;
            var startingY = trigger_event_object.pageY;

            // Get starting div offsets.
            var timelineStartingOffsetX = this.__getTimelineLeftOffset();
            var timelineStartingOffsetY = this.__getTimelineTopOffset();
            var undatedItemsStartingOffsetX = this.__getUndatedItemsLeftOffset();
            var undatedItemsStartingOffsetY = this.__getUndatedItemsTopOffset();

            // Bind self.
            var self = this;

            // Make the drag divs see-through and always on top.
            this.timeline_drag.css({
                'opacity': 0.5,
                'z-index': 99
            });

            this.undated_items_drag.css({
                'opacity': 0.5,
                'z-index': 99
            });

            this._window.bind({

                'mousemove': function(e) {

                    // Calculate new offsets.
                    var offsetX = e.pageX - startingX;
                    var offsetY = e.pageY - startingY;

                    // Apply new position.
                    self.timeline_drag.css({
                        'left': timelineStartingOffsetX + offsetX,
                        'top': timelineStartingOffsetY + offsetY
                    });

                    if (self._undated_items_height == 'partial') {
                        self.undated_items_drag.css({
                            'left': undatedItemsStartingOffsetX + offsetX,
                            'top': undatedItemsStartingOffsetY + offsetY
                        });
                    }

                    // If there is a map.
                    if (self._is_map) {

                        // Get current map top offset.
                        var mapTopOffset = self.__getMapTopOffset();

                        // If the map is on the bottom.
                        if (self._top_element == 'timeline') {

                            // If the cursor dips below the top border
                            // of the timeline div, slide the timeline up.
                            if (e.pageY > (mapTopOffset + self._dragbox_position.top)) {
                                self._top_element = 'map';
                                self.__slideMap(false);
                            }

                        }

                        // If the timeline is on the top.
                        else {

                            // If the cursor moves above the bottom border
                            // of the timeline div, slide the timeline down.
                            if (e.pageY < (self._dragbox_position.top + self._top_block_height)) {
                                self._top_element = 'timeline';
                                self.__slideMap(false);
                            }

                        }

                    }

                },

                'mouseup': function() {

                    self.__slideTimelineAndUndatedItems(true);
                    self._window.unbind('mousemove mouseup');

                }

            });

        },

        __doUndatedItemsDrag: function(trigger_event_object) {

            this._is_dragging = true;

            // Get starting pointer coordinates.
            var startingX = trigger_event_object.pageX;
            var startingY = trigger_event_object.pageY;

            // Get starting div offsets.
            var StartingOffsetX = this.__getUndatedItemsLeftOffset();
            var StartingOffsetY = this.__getUndatedItemsTopOffset();

            // Set starting height and position status.
            this._udi_height_at_start_of_drag = this._undated_items_height;
            this._udi_position_at_start_of_drag = (this._top_element == 'map') ? 'bottom' : 'top';

            // Bind self.
            var self = this;

            // Create typable facades for vertical tier parameters.
            var vt1 = this.options.vertical_offset_tier1;
            var vt2 = this.options.vertical_offset_tier2;

            // Make the drag div see-through and always on top.
            this.undated_items_drag.css({
                'opacity': 0.5,
                'z-index': 99
            });

            this._window.bind({

                'mousemove': function(e) {

                    // Calculate new offsets.
                    var offsetX = e.pageX - startingX;
                    var offsetY = e.pageY - startingY;

                    // Apply new position.
                    self.undated_items_drag.css({
                        'left': StartingOffsetX + offsetX,
                        'top': StartingOffsetY + offsetY
                    });

                    // Control flow to determine where/when the udi
                    // should be animated as the mouse position changes.

                    // If udi was partial-height at drag start.
                    if (self._udi_height_at_start_of_drag == 'partial') {

                        // If udi was on the bottom when the drag started.
                        if (self._udi_position_at_start_of_drag == 'bottom') {

                            // If the mouse has moved upwards but has not crossed
                            // through the first offset tier.
                            if (offsetY < 0 && offsetY > -vt1) {
                                self._undated_items_height = 'partial';
                                self._top_element = 'map';
                                self.__slideTimeline(false);
                                self.__slideMap(false);
                            }

                            // If the mouse has moved upwards and the vertical
                            // offset is between the two vertical offset tiers.
                            else if (offsetY < -vt1 && offsetY > -vt2) {
                                self._undated_items_height = 'full';
                                self.__slideTimeline(false);
                                self.__slideMap(false);
                            }

                            // If the mouse has moved upwards and is over the
                            // second tier threshold.
                            else if (offsetY < -vt2) {
                                self._undated_items_height = 'partial';
                                self._top_element = 'timeline';
                                self.__slideTimeline(false);
                                self.__slideMap(false);
                            }

                        }

                        // If udi was on the top when the drag started.
                        else if (self._udi_position_at_start_of_drag == 'top') {

                            // If the mouse has moved downwards but has not crossed
                            // through the first offset tier.
                            if (offsetY > 0 && offsetY < vt1) {
                                self._undated_items_height = 'partial';
                                self._top_element = 'timeline';
                                self.__slideTimeline(false);
                                self.__slideMap(false);
                            }

                            // If the mouse has moved downwards and the vertical
                            // offset is between the two vertical offset tiers.
                            else if (offsetY > vt1 && offsetY < vt2) {
                                self._undated_items_height = 'full';
                                self.__slideTimeline(false);
                                self.__slideMap(false);
                            }

                            // If the mouse has moved downwards and is over the
                            // second tier threshold.
                            else if (offsetY > vt2) {
                                self._undated_items_height = 'partial';
                                self._top_element = 'map';
                                self.__slideTimeline(false);
                                self.__slideMap(false);
                            }

                        }

                    }

                    // If udi was full-height at the start of the drag.
                    else if (self._udi_height_at_start_of_drag == 'full') {

                        // If the mouse has moved upwards but has not crossed
                        // through the first vertical tier.
                        if (offsetY < 0 && offsetY > -vt1) {
                            self._undated_items_height = 'full';
                            self.__slideTimeline(false);
                            self.__slideMap(false);
                        }

                        // If the mouse has moved upwards and has crossed through
                        // the first vertical tier.
                        else if (offsetY < -vt1) {
                            self._undated_items_height = 'partial';
                            self._top_element = 'timeline';
                            self.__slideTimeline(false);
                            self.__slideMap(false);
                        }

                        // If the mouse has moved downwards but has not crossed
                        // through the first vertical tier.
                        else if (offsetY > 0 && offsetY < vt1) {
                            self._undated_items_height = 'full';
                            self.__slideTimeline(false);
                            self.__slideMap(false);
                        }

                        // If the mouse has moved downwards and has crossed through
                        // the first vertical tier.
                        else if (offsetY > vt1) {
                            self._undated_items_height = 'partial';
                            self._top_element = 'map';
                            self.__slideTimeline(false);
                            self.__slideMap(false);
                        }

                    }

                    // If udi is on the right.
                    if (self._undated_items_position == 'right') {

                        // If the cursor crosses over the centerline going left.
                        if (e.pageX < (self._dragbox_width / 2)) {

                            self._undated_items_position = 'left';
                            self.__slideTimeline(false);

                            if (self._undated_items_height == 'full') {
                                self.__slideMap(false);
                            }

                        }

                    }

                    // If udi is on the left.
                    else {

                        // If the cursor crosses over the centerline going left.
                        if (e.pageX > (self._dragbox_width / 2)) {

                            self._undated_items_position = 'right';
                            self.__slideTimeline(false);

                            if (self._undated_items_height == 'full') {
                                self.__slideMap(false);
                            }

                        }

                    }

                },

                'mouseup': function() {

                    self.__slideUndatedItems(true);
                    self._window.unbind('mousemove mouseup');

                }

            });

        },

        __slideTimeline: function(ending_slide) {

            var self = this;
            var newTimelineHeight = this.__getTimelineHeight();
            var _current_params = [
                this._top_element,
                this._undated_items_position,
                this._undated_items_height
            ];

            if (!jQuery.compare(_current_params, this._last_timeline_slide_params)) {

                if (ending_slide) {

                    // Slide the timeline and undated items.
                    this.timeline_drag.stop().animate({
                        'height': newTimelineHeight,
                        'width': this.__getTimelineWidth(),
                        'top': this.__getTimelineTopOffset(),
                        'left': this.__getTimelineLeftOffset(),
                        'opacity': 1,
                        'z-index': 0
                    }, function() {

                        // On complete, if the slide is an ending
                        // slide, unset the dragging tracker.
                        if (ending_slide) {
                            self._is_dragging = false;
                        }

                    });

                }

                else {

                    // Slide the timeline and undated items.
                    this.timeline_drag.stop().animate({
                        'height': newTimelineHeight,
                        'width': this.__getTimelineWidth(),
                        'top': this.__getTimelineTopOffset(),
                        'left': this.__getTimelineLeftOffset()
                    });

                }

                this._animate_position_tag(this.timeline_drag, newTimelineHeight);

                // Record params loadout for the last slide.
                this._last_timeline_slide_params = [
                    this._top_element,
                    this._undated_items_position,
                    this._undated_items_height
                ];

                this.__updateHiddenInputs();

            }

        },

        __slideTimelineAndUndatedItems: function(ending_slide) {

            var self = this;
            var newTimelineHeight = this.__getTimelineHeight();
            var newUndatedItemsHeight = this.__getUndatedItemsHeight();

            if (ending_slide) {

                // Slide the timeline and undated items.
                this.timeline_drag.stop().animate({
                    'height': newTimelineHeight,
                    'width': this.__getTimelineWidth(),
                    'top': this.__getTimelineTopOffset(),
                    'left': this.__getTimelineLeftOffset(),
                    'opacity': 1,
                    'z-index': 0
                });

                this.undated_items_drag.stop().animate({
                    'height': newUndatedItemsHeight,
                    'width': this.__getUndatedItemsWidth(),
                    'top': this.__getUndatedItemsTopOffset(),
                    'left': this.__getUndatedItemsLeftOffset(),
                    'opacity': 1,
                    'z-index': 0
                }, function() {

                    // On complete, if the slide is an ending
                    // slide, unset the dragging tracker.
                    if (ending_slide) {
                        self._is_dragging = false;
                    }

                });

            }

            else {

                // Slide the timeline and undated items.
                this.timeline_drag.stop().animate({
                    'height': newTimelineHeight,
                    'width': this.__getTimelineWidth(),
                    'top': this.__getTimelineTopOffset(),
                    'left': this.__getTimelineLeftOffset()
                });

                this.undated_items_drag.stop().animate({
                    'height': newUndatedItemsHeight,
                    'width': this.__getUndatedItemsWidth(),
                    'top': this.__getUndatedItemsTopOffset(),
                    'left': this.__getUndatedItemsLeftOffset()
                });

            }

            this._animate_position_tag(this.timeline_drag, newTimelineHeight);
            this._animate_position_tag(this.undated_items_drag, newUndatedItemsHeight);

            this.__updateHiddenInputs();

        },

        __slideMap: function(ending_slide) {

            var self = this;
            var newMapHeight = this.__getMapHeight();
            var _current_params = [
                this._top_element,
                this._undated_items_position,
                this._undated_items_height
            ];

            if (!jQuery.compare(_current_params, this._last_map_slide_params)) {

                if (ending_slide) {

                    // Slide the timeline and undated items.
                    this.map_drag.stop().animate({
                        'height': newMapHeight,
                        'width': this.__getMapWidth(),
                        'top': this.__getMapTopOffset(),
                        'left': this.__getMapLeftOffset(),
                        'opacity': 1,
                        'z-index': 0
                    }, function() {
                        // On complete, if the slide is an ending
                        // slide, unset the dragging tracker.
                            self._is_dragging = false;
                    });

                }

                else {

                    // Slide the timeline and undated items.
                    this.map_drag.stop().animate({
                        'height': newMapHeight,
                        'width': this.__getMapWidth(),
                        'top': this.__getMapTopOffset(),
                        'left': this.__getMapLeftOffset()
                    });

                }

                this._animate_position_tag(this.map_drag, newMapHeight);

                // Record params loadout for the last slide.
                this._last_map_slide_params = [
                    this._top_element,
                    this._undated_items_position,
                    this._undated_items_height
                ];

                this.__updateHiddenInputs();

            }

        },

        __slideUndatedItems: function(ending_slide) {

            var self = this;
            var newUndatedItemsHeight = this.__getUndatedItemsHeight();

            if (ending_slide) {

                // Slide the timeline and undated items.
                this.undated_items_drag.stop().animate({
                    'height': newUndatedItemsHeight,
                    'width': this.__getUndatedItemsWidth(),
                    'top': this.__getUndatedItemsTopOffset(),
                    'left': this.__getUndatedItemsLeftOffset(),
                    'opacity': 1,
                    'z-index': 0
                }, function() {
                    // On complete, if the slide is an ending
                    // slide, unset the dragging tracker.
                        self._is_dragging = false;
                });

            }

            else {

                // Slide the timeline and undated items.
                this.undated_items_drag.stop().animate({
                    'height': newUndatedItemsHeight,
                    'width': this.__getUndatedItemsWidth(),
                    'top': this.__getUndatedItemsTopOffset(),
                    'left': this.__getUndatedItemsLeftOffset()
                });

            }

            this._animate_position_tag(this.undated_items_drag, newUndatedItemsHeight);
            this.__updateHiddenInputs();

        },

        __updateHiddenInputs: function() {

            this.top_element_input.attr('value', this._top_element);
            this.udi_position_input.attr('value', this._undated_items_position);
            this.udi_height_input.attr('value', this._undated_items_height);

        },


        /*
         * Positioning calculators and toggling helpers.
         */

        __toggleUndatedItemsButton: function() {

            if (this._is_timeline) {
                $('#toggle-undated-items').css('display', 'inline');
            }

            else {
                $('#toggle-undated-items').css('display', 'none');
            }

        },

        __createMapDiv: function() {

            return $('<div id="drag-map" class="draggable">\
                        <span class="drag-tag">Map</span>\
                      </div>');

        },

        __createTimelineDiv: function() {

            return $('<div id="drag-timeline" class="draggable">\
                        <span class="drag-tag">Timeline</span>\
                      </div>');

        },

        __createUndatedItemsDiv: function() {

            return $('<div id="drag-undated-items" class="draggable">\
                        <span class="drag-tag">Undated Items</span>\
                      </div>');

        },

        __getUndatedItemsHeight: function() {

            var height = null;

            if (this._undated_items_height == 'full') {
                height = this._dragbox_height;
            }

            else {

                if (this._is_map) {

                    if (this._top_element == 'map') {
                        height = this._bottom_block_height;
                    }

                    else {
                        height = this._top_block_height;
                    }

                }

                else {
                    height = this._dragbox_height;
                }

            }

            return height;

        },

        __getUndatedItemsWidth: function() {

            return this.options.undated_items_width;

        },

        __getUndatedItemsLeftOffset: function() {

            var left_offset = null;

            if (this._undated_items_position == 'left') {
                left_offset = 0;
            }

            else {
                left_offset = this._undated_items_left_offset;
            }

            return left_offset;

        },

        __getUndatedItemsTopOffset: function() {

            var top_offset = null;

            if (this._undated_items_height == 'full') {
                top_offset = 0;
            }

            else {

                if (this._is_map) {

                    if (this._top_element == 'map') {
                        top_offset = this._top_block_height;
                    }

                    else {
                        top_offset = 0;
                    }

                }

                else {
                    top_offset = 0;
                }

            }

            return top_offset;

        },

        __getMapWidth: function() {

            var width = this._dragbox_width;

            if (this._undated_items_height == 'full' && this._is_undated_items) {
                width -= this.options.undated_items_width;
            }

            return width;

        },

        __getMapHeight: function() {

            var height = this._top_block_height;

            if (this._is_timeline) {
                if (this._top_element == 'map') {
                    height = this._top_block_height;
                }
                else {
                    height = this._bottom_block_height;
                }
            }

            else {
                height = this._dragbox_height;
            }

            return height;

        },

        __getMapLeftOffset: function() {

            var offset = 0;

            if (this._undated_items_height == 'full'
                && this._is_undated_items
                && this._undated_items_position == 'left') {

                    offset = this.options.undated_items_width;

            }

            return offset;

        },

        __getMapTopOffset: function() {

            var offset = 0;

            if (this._top_element == 'timeline' && this._is_timeline) {
                offset = this._top_block_height;
            }

            return offset;

        },

        __getTimelineWidth: function() {

            var width = this._dragbox_width;

            if (this._is_undated_items) {
                width -= this.options.undated_items_width;
            }

            return width;

        },

        __getTimelineHeight: function() {

            var height = this._bottom_block_height;

            if (this._is_map) {
                if (this._top_element == 'timeline') {
                    height = this._top_block_height;
                }
            }

            else {
                height = this._dragbox_height;
            }

            return height;

        },

        __getTimelineLeftOffset: function() {

            var offset = 0;

            if (this._is_undated_items && this._undated_items_position == 'left') {
                offset = this.options.undated_items_width;
            }

            return offset;

        },

        __getTimelineTopOffset: function() {

            var offset = 0;

            if (this._top_element == 'map' && this._is_map) {
                offset = this._top_block_height;
            }

            return offset;

        }

    });


    /*
     * Somewhat shockingly, browser implementations of JavaScript do
     * not support array comparison. This function takes two arrays, walks
     * each and compares the elements, and returns true if the arrays
     * contain the same set. This is used in the code that checks to see
     * whether or not a div animation needs to occur, based on the
     * parameter loadout of the last slide.
     */

    jQuery.extend({

        compare: function(array1, array2) {

            if (array1 == null || array2 == null) {
                return false;
            }

            if (array1.length != array2.length) {
                return false;
            }

            var a = jQuery.extend(true, [], array1);
            var b = jQuery.extend(true, [], array2);

            a.sort();
            b.sort();

            for (var i = 0, len = a.length; i < len; i++) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }

            return true

        }

    });


})( jQuery );


// Usage.
jQuery(document).ready(function($) {

    $('#layout-builder').layoutbuilder();

});
