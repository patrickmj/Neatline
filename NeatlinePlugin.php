<?php
/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4; */

/**
 * Plugin manager class.
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

class NeatlinePlugin
{

    private static $_hooks = array(
        'install',
        'uninstall',
        'define_routes',
        'define_acl',
        'admin_theme_header',
        'public_theme_header',
        'admin_append_to_plugin_uninstall_message'
    );

    private static $_filters = array(
        'admin_navigation_main'
    );

    /**
     * Get database, call addHooksAndFilters().
     *
     * @return void
     */
    public function __construct()
    {

        $this->_db = get_db();
        self::addHooksAndFilters();

    }

    /**
     * Iterate over hooks and filters, define callbacks.
     *
     * @return void
     */
    public function addHooksAndFilters()
    {

        foreach (self::$_hooks as $hookName) {
            $functionName = Inflector::variablize($hookName);
            add_plugin_hook($hookName, array($this, $functionName));
        }

        foreach (self::$_filters as $filterName) {
            $functionName = Inflector::variablize($filterName);
            add_filter($filterName, array($this, $functionName));
        }

    }

    /**
     * Hook callbacks:
     */

    /**
     * Install. Create _neatlines table.
     *
     * @return void.
     */
    public function install()
    {

        $sql = "CREATE TABLE IF NOT EXISTS `{$this->_db->prefix}neatline_exhibits` (
                `id` int(10) unsigned not null auto_increment,
                `added` timestamp NOT NULL default NOW(),
                `name` tinytext collate utf8_unicode_ci,
                `map_id` int(10) unsigned NULL,
                `top_element` ENUM('map', 'timeline') DEFAULT 'map',
                `undated_items_position` ENUM('right', 'left') DEFAULT 'right',
                `undated_items_height` ENUM('partial', 'full') DEFAULT 'partial',
                `is_map` tinyint(1) NOT NULL,
                `is_timeline` tinyint(1) NOT NULL,
                `is_undated_items` tinyint(1) NOT NULL,
                `default_map_bounds` varchar(100) NULL,
                `default_map_zoom` int(10) unsigned NULL,
                `default_timeline_focus_date` varchar(100) NULL,
                 PRIMARY KEY (`id`)
               ) ENGINE=innodb DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci";

        $this->_db->query($sql);

        $sql = "CREATE TABLE IF NOT EXISTS `{$this->_db->prefix}neatline_data_records` (
                `id` int(10) unsigned not null auto_increment,
                `item_id` int(10) unsigned NULL,
                `exhibit_id` int(10) unsigned NULL,
                `title` tinytext COLLATE utf8_unicode_ci NULL,
                `description` mediumtext COLLATE utf8_unicode_ci NULL,
                `start_date` tinytext COLLATE utf8_unicode_ci NULL,
                `start_time` tinytext COLLATE utf8_unicode_ci NULL,
                `end_date` tinytext COLLATE utf8_unicode_ci NULL,
                `end_time` tinytext COLLATE utf8_unicode_ci NULL,
                `geocoverage` mediumtext COLLATE utf8_unicode_ci NULL,
                `left_ambiguity_percentage` int(10) unsigned NULL,
                `right_ambiguity_percentage` int(10) unsigned NULL,
                `vector_color` tinytext COLLATE utf8_unicode_ci NULL,
                `space_active` tinyint(1) NULL,
                `time_active` tinyint(1) NULL,
                `display_order` int(10) unsigned NULL,
                 PRIMARY KEY (`id`)
               ) ENGINE=innodb DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci";

        $this->_db->query($sql);

    }

    /**
     * Uninstall.
     *
     * @return void.
     */
    public function uninstall()
    {

        // Drop the exhibits table.
        $sql = "DROP TABLE IF EXISTS `{$this->_db->prefix}neatline_exhibits`";
        $this->_db->query($sql);

        // Drop the data table.
        $sql = "DROP TABLE IF EXISTS `{$this->_db->prefix}neatline_data_records`";
        $this->_db->query($sql);

    }

    /**
     * Establish access privileges.
     *
     * @return void.
     */
    public function defineAcl($acl)
    {

         // Omeka_Acl_Resource is deprecated in 2.0.
         if (version_compare(OMEKA_VERSION, '2.0-dev', '<')) {
             $editorResource = new Omeka_Acl_Resource('Neatline_Editor');
             $editorResource->add(array('index', 'items', 'save', 'status', 'positions', 'arrangement'));
         } else {
             $editorResource = new Zend_Acl_Resource('Neatline_Editor');
         }

         $acl->add($editorResource);
         $acl->allow('super', 'Neatline_Editor');
         $acl->allow('admin', 'Neatline_Editor');

    }

    /**
     * Push administrative Neatline assets.
     *
     * @return void
     */
    public function adminThemeHeader($request)
    {

        // Queue CSS.
        if ($request->getModuleName() == 'neatline' &&
            $request->getControllerName() == 'index' &&
            $request->getActionName() != 'edit') {

              neatline_queueAdminCss();

        }

        // Queue layout builder JavaScript.
        if ($request->getModuleName() == 'neatline' &&
            $request->getControllerName() == 'index' &&
            in_array($request->getActionName(), array('add'))) {

              neatline_queueLayoutBuilderCssAndJs();

        }

        // Queue row glosser for browse actions.
        if ($request->getModuleName() == 'neatline' &&
            $request->getControllerName() == 'index' &&
            $request->getActionName() == 'browse') {

              neatline_queueBrowseJs();

        }

        // Queue static assets for the Neatline editor.
        if ($request->getModuleName() == 'neatline' &&
            $request->getControllerName() == 'editor' &&
            $request->getActionName() == 'index') {

              neatline_queueNeatlineAssets();
              neatline_queueEditorAssets();

        }

    }

    /**
     * Push public-facing Neatline assets.
     *
     * @return void
     */
    public function publicThemeHeader($request)
    {

        // Queue static assets for public-facing Neatline exhibits.
        if ($request->getModuleName() == 'neatline' &&
            $request->getControllerName() == 'public' &&
            $request->getActionName() == 'show') {

              neatline_queueNeatlineAssets();
              neatline_queuePublicAssets();

        }

    }

    /**
     * Register routes.
     *
     * @param object $router Router passed in by the front controller.
     *
     * @return void
     */
    public function defineRoutes($router)
    {

        $router->addConfig(new Zend_Config_Ini(NEATLINE_PLUGIN_DIR
            .'/routes.ini', 'routes'));

    }

    /**
     * Flash warning about table drops before uninstall.
     *
     * @return void
     */
    public function adminAppendToPluginUninstallMessage()
    {

        echo neatline_uninstallWarningMessage();

    }

    /**
     * Filter callbacks:
     *

    /**
     * Add link to main admin menu bar.
     *
     * @param array $tabs This is an array of label => URI pairs.
     *
     * @return array The tabs array with the Neatline Maps tab.
     */
    public function adminNavigationMain($tabs)
    {

        $tabs['Neatline'] = uri('neatline-exhibits');
        return $tabs;

    }

}
