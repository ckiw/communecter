<?php
/**
 * ElementController.php
 *
 * @author: Tibor Katelbach <tibor@pixelhumain.com>
 * Date: 15/08/13
 */
class ElementController extends CommunecterController {
    const moduleTitle = "Element";
    
  protected function beforeAction($action) {
    parent::initPage();
    return parent::beforeAction($action);
  }
  public function actions()
  {
      return array(
          'updatefield' 				  => 'citizenToolKit.controllers.element.UpdateFieldAction',
          'updatefields' 				  => 'citizenToolKit.controllers.element.UpdateFieldsAction',
          'updatesettings'        => 'citizenToolKit.controllers.element.UpdateSettingsAction',
          'detail'                => 'citizenToolKit.controllers.element.DetailAction',
          'getalllinks'           => 'citizenToolKit.controllers.element.GetAllLinksAction',
          'directory'             => 'citizenToolKit.controllers.element.DirectoryAction',
          'addmembers'            => 'citizenToolKit.controllers.element.AddMembersAction',
          'aroundme'              => 'citizenToolKit.controllers.element.AroundMeAction',
          'updatefield'           => 'citizenToolKit.controllers.element.UpdateFieldAction',
          'save'                  => 'citizenToolKit.controllers.element.SaveAction',
          'delete'                => 'citizenToolKit.controllers.element.DeleteAction',
          'stopdelete'            => 'citizenToolKit.controllers.element.StopDeleteAction',
          'updateblock'          => 'citizenToolKit.controllers.element.UpdateBlockAction',
          'get'                   => 'citizenToolKit.controllers.element.GetAction',
          "network"               => 'citizenToolKit.controllers.element.NetworkAction',
      );
  }
}