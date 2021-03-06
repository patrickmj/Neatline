<?php
/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4; */

/**
 * Data controller integration tests.
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

class Neatline_DataControllerTest extends Omeka_Test_AppTestCase
{

    // Testing parameters.
    private static $__testParams = array(
        'title' => 'Test Title',
        'description' => 'Test description.',
        'start_date' => 'April 26, 1564',
        'start_time' => '6:00 AM',
        'end_date' => 'April 23, 1616',
        'end_time' => '6:00 AM',
        'vector_color' => '#ffffff',
        'left_percent' => 0,
        'right_percent' => 100,
        'geocoverage' => '[POINT(-1.0, 1.0)]',
        'space_active' => true,
        'time_active' => true
    );

    /**
     * Instantiate the helper class, install the plugins, get the database.
     *
     * @return void.
     */
    public function setUp()
    {

        parent::setUp();
        $this->helper = new Neatline_Test_AppTestCase;
        $this->helper->setUpPlugin();
        $this->db = get_db();

    }

    /**
     * The /openlayers route should return a well-formed JSON string for
     * the map block.
     *
     * @return void.
     */
    public function testOpenlayers()
    {

        // Create an exhibit and items.
        $neatline = $this->helper->_createNeatline();
        $item1 = $this->helper->_createItem();
        $item2 = $this->helper->_createItem();

        // Create two records.
        $record1 = new NeatlineDataRecord($item1, $neatline);
        $record2 = new NeatlineDataRecord($item2, $neatline);

        // Populate map-relevant attributes.
        $record1->title = 'Item 1 Title';
        $record2->title = 'Item 2 Title';
        $record1->vector_color = '#ffffff';
        $record2->vector_color = '#000000';
        $record1->geocoverage = 'POINT(1,0)';
        $record2->geocoverage = 'POINT(0,1)';
        $record1->space_active = 1;
        $record2->space_active = 1;
        $record1->save();
        $record2->save();

        // Hit the route and capture the response.
        $this->dispatch('neatline-exhibits/' . $neatline->id . '/data/openlayers');
        $response = $this->getResponse()->getBody('default');

        // Test the raw construction with no available DC values.
        $this->assertEquals(
            $response,
            '[{"id":' . $record1->item_id . ',' .
            '"title":"Item 1 Title",' .
            '"color":"#ffffff",' .
            '"wkt":"POINT(1,0)"},' .
            '{"id":' . $record2->item_id . ',' .
            '"title":"Item 2 Title",' .
            '"color":"#000000",' .
            '"wkt":"POINT(0,1)"}]'
        );

    }

    /**
     * The /simile route should return a well-formed JSON string for the
     * timeline block.
     *
     * @return void.
     */
    public function testSimile()
    {

        // Create an exhibit and items.
        $neatline = $this->helper->_createNeatline();
        $item1 = $this->helper->_createItem();
        $item2 = $this->helper->_createItem();

        // Create two records.
        $record1 = new NeatlineDataRecord($item1, $neatline);
        $record2 = new NeatlineDataRecord($item2, $neatline);

        // Populate map-relevant attributes.
        $record1->title = 'Item 1 Title';
        $record2->title = 'Item 2 Title';
        $record1->description = 'Item 1 description.';
        $record2->description = 'Item 2 description.';
        $record1->start_date = 'January 2011';
        $record2->start_date = 'January 2011';
        $record1->end_date = 'January 2012';
        $record2->end_date = 'January 2012';
        $record1->vector_color = '#ffffff';
        $record2->vector_color = '#000000';
        $record1->left_ambiguity_percentage = 0;
        $record2->left_ambiguity_percentage = 0;
        $record1->right_ambiguity_percentage = 100;
        $record1->right_ambiguity_percentage = 100;
        $record1->time_active = 1;
        $record2->time_active = 1;
        $record1->save();
        $record2->save();

        // Hit the route and capture the response.
        $this->dispatch('neatline-exhibits/' . $neatline->id . '/data/simile');
        $response = $this->getResponse()->getBody('default');

        // Check format.
        $this->assertEquals(
            $response,
            '{"dateTimeFormat":"Gregorian",' .
            '"events":[{' .
            '"eventID":' . $record1->item_id . ',' .
            '"title":"' . $record1->title . '",' .
            '"description":"' . $record1->description . '",' .
            '"color":"' . $record1->vector_color . '",' .
            '"textColor":"#6b6b6b",' .
            '"left_ambiguity":' . $record1->left_ambiguity_percentage . ',' .
            '"right_ambiguity":' . $record1->right_ambiguity_percentage . ',' .
            '"start":"2011-01-01 00:00:00",' .
            '"end":"2012-01-01 00:00:00"},{' .
            '"eventID":' . $record2->item_id . ',' .
            '"title":"' . $record2->title . '",' .
            '"description":"' . $record2->description . '",' .
            '"color":"' . $record2->vector_color . '",' .
            '"textColor":"#6b6b6b",' .
            '"left_ambiguity":' . $record2->left_ambiguity_percentage . ',' .
            '"right_ambiguity":' . $record2->right_ambiguity_percentage . ',' .
            '"start":"2011-01-01 00:00:00",' .
            '"end":"2012-01-01 00:00:00"}]}'
        );

    }

    /**
     * The /udi route should return well-formed markup for the items pane.
     *
     * @return void.
     */
    public function testUdi()
    {

        // Create an exhibit, item, and record.
        $neatline = $this->helper->_createNeatline();
        $item = $this->helper->_createItem();
        $record = new NeatlineDataRecord($item, $neatline);

        // Populate items-relevant attributes.
        $record->title = 'Item 1 Title';
        $record->description = 'Item 1 description.';
        $record->space_active = 1;
        $record->time_active = 1;
        $record->save();

        // Hit the route.
        $this->dispatch('neatline-exhibits/' . $neatline->id . '/data/udi');

        // Check markup.
        $this->assertQuery('tr.item-row[recordid="' . $item->id . '"]');
        $this->assertQuery('td.space img.active');
        $this->assertQuery('td.time img.active');

        $this->assertQueryContentContains(
            'span.item-title-text',
            'Item 1 Title');

        $this->assertQueryContentContains(
            'div.item-description-content',
            'Item 1 description.');

        // Disable the time status.
        $record->space_active = 0;
        $record->time_active = 1;
        $record->save();

        // Hit the route and check the 'active'/'inactive' classes.
        $this->dispatch('neatline-exhibits/' . $neatline->id . '/data/udi');
        $this->assertQuery('td.space img.inactive');
        $this->assertQuery('td.time img.active');

        // Disable the time status.
        $record->space_active = 1;
        $record->time_active = 0;
        $record->save();

        // Hit the route and check the 'active'/'inactive' classes.
        $this->dispatch('neatline-exhibits/' . $neatline->id . '/data/udi');
        $this->assertQuery('td.space img.active');
        $this->assertQuery('td.time img.inactive');

    }

}
