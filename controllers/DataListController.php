<?php

class DataListController extends CommunecterController {

	protected function beforeAction($action) {
		parent::initPage();
		return parent::beforeAction($action);
	}

	public function actionGetListByName($name) {
		if ($name) {
			$list = Lists::getListByName($name);
		}
		Rest::json(array("result"=>true, "list"=>$list));
	}


}