<?php
/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4; */

/**
 * Editor controller integration tests.
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

class Neatline_EditorControllerTest extends Omeka_Test_AppTestCase
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
        $this->_recordsTable = $this->db->getTable('NeatlineDataRecord');

    }

    /**
     * Hitting the /status route with a well-formed POST should result in the
     * correct data commits to the space_active field in the correct record.
     *
     * @return void.
     */
    public function testSpaceStatusSave()
    {

        // Create item, exhibit, and record.
        $item = $this->helper->_createItem();
        $neatline = $this->helper->_createNeatline();
        $record = new NeatlineDataRecord($item, $neatline);

        // Form the POST for a space change.
        $this->request->setMethod('POST')
            ->setPost(array(
                'item_id' => $item->id,
                'neatline_id' => $neatline->id,
                'space_or_time' => 'space',
                'value' => 'true'
            )
        );

        // Hit the route.
        $this->dispatch('neatline-exhibits/editor/status');

        // Re-get the record.
        $record = $this->_recordsTable->getRecordByItemAndExhibit($item, $neatline);

        // Space status should be true, time status unchanged.
        $this->assertEquals($record->space_active, 1);
        $this->assertEquals($record->time_active, 0);

    }

    /**
     * Hitting the /status route with a well-formed POST should result in the
     * correct data commits to the time_active field in the correct record.
     *
     * @return void.
     */
    public function testTimeStatusSave()
    {

        // Create item, exhibit, and record.
        $item = $this->helper->_createItem();
        $neatline = $this->helper->_createNeatline();
        $record = new NeatlineDataRecord($item, $neatline);

        // Form the POST for a space change.
        $this->request->setMethod('POST')
            ->setPost(array(
                'item_id' => $item->id,
                'neatline_id' => $neatline->id,
                'space_or_time' => 'time',
                'value' => 'true'
            )
        );

        // Hit the route.
        $this->dispatch('neatline-exhibits/editor/status');

        // Re-get the record.
        $record = $this->_recordsTable->getRecordByItemAndExhibit($item, $neatline);

        // Time status should be true, space status unchanged.
        $this->assertEquals($record->time_active, 1);
        $this->assertEquals($record->space_active, 0);

    }

}