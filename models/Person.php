<?php 
class Person {
	public $jsonLD= array();
	const COLLECTION = "citoyens";

	/**
	 * used to save any user session data 
	 * good practise shouldn't be to heavy
	 * user = array("name"=>$username)
	 */
	public static function saveUserSessionData($id,$email,$user)
    {
      Yii::app()->session["userId"] = $id;
      Yii::app()->session["userEmail"] = $email;
      Yii::app()->session["user"] = $user;
      Yii::app()->session['logguedIntoApp'] = (isset(Yii::app()->controller->module->id)) ? Yii::app()->controller->module->id : "pixelhumain";
    }

    /**
	 * used to clear all user's data from session
	 */
    public static function clearUserSessionData()
    {
      Yii::app()->session["userId"] = null;
      Yii::app()->session["userEmail"] = null; 
      Yii::app()->session["user"] = null; 
      Yii::app()->session['logguedIntoApp'] = null;
    }

	/**
	 * get a Person By Id
	 * @param type $id : is the mongoId of the person
	 * @return type
	 */
	public static function getById($id) {
	  	$person = PHDB::findOne( PHType::TYPE_CITOYEN ,array("_id"=>new MongoId($id)));
	  	
	  	if (empty($person)) {
	  		//TODO Sylvain - Find a way to manage inconsistente data
            //throw new CommunecterException("The person id ".$id." is unkown : contact your admin");
        } else {
			$person["publicURL"] = '/person/public/id/'.$id;
        }

	  	return $person;
	}

	public static function setNameByid($name, $id) {
		PHDB::update(PHType::TYPE_CITOYEN,
			array("_id" => new MongoId($id)),
            array('$set' => array("name"=> $name))
            );
	}

	/**
	 * get all organizations details of a Person By a person Id
	 * @param type $id : is the mongoId (String) of the person
	 * @return person document as in db
	 */
	public static function getOrganizationsById($id){
		$person = self::getById($id);
	    //$person["tags"] = Tags::filterAndSaveNewTags($person["tags"]);
	    $organizations = array();
	    
	    //Load organizations
	    if (isset($person["links"]) && !empty($person["links"]["memberOf"])) 
	    {
	      foreach ($person["links"]["memberOf"] as $id => $e) 
	      {
	        $organization = PHDB::findOne( Organization::COLLECTION, array( "_id" => new MongoId($id)));
	        if (!empty($organization)) {
	          array_push($organizations, $organization);
	        } else {
	         // throw new CommunecterException("Données inconsistentes pour le citoyen : ".Yii::app()->session["userId"]);
	        }
	      }
	    }
	    return $organizations;
	}
	/**
	 * get memberOf a Person By a person Id
	 * @param type $id : is the mongoId (String) of the person
	 * @return person document as in db
	 */
	public static function getPersonMemberOfByPersonId($id) {
	  	$res = array();
	  	$person = self::getById($id);
	  	
	  	if (empty($person)) {
            throw new CommunecterException("The person id is unkown : contact your admin");
        }
	  	if (isset($person) && isset($person["links"]) && isset($person["links"]["memberOf"])) {
	  		$res = $person["links"]["memberOf"];
	  	}

	  	return $res;
	}

	/**
	 * Happens when a Person is invited or linked as a member and doesn't exist in the system
	 * It is created in a temporary state
	 * This creates and invites the email to fill extra information 
	 * into the Person profile 
	 * @param type $param 
	 * @return type
	 */
	public static function createAndInvite($param) {
	  	self::insert($param, true);

        //TODO TIB : mail Notification 
        //for the organisation owner to subscribe to the network 
        //and complete the Organisation Profile
	}

	/**
	 * Apply person checks and business rules before inserting
	 * Throws CommunecterException on error
	 * @param array $person : array with the data of the person to check
	 * @param boolean $minimal : true : a person can be created using only name and email. 
	 * Else : postalCode, city and pwd are also requiered
	 * @return the new person with the business rules applied
	 */
	public static function getAndcheckPersonData($person, $minimal) {
		$dataPersonMinimal = array("name", "email");
		$newPerson = array();
		if (! $minimal) {
			array_push($dataPersonMinimal, "postalCode", "city", "pwd");
		}
		//Check the minimal data
	  	foreach ($dataPersonMinimal as $data) {
	  		if (empty($person["$data"])) 
	  			throw new CommunecterException("Problem inserting the new person : ".$data." is missing");
	  	}
	  	
	  	$newPerson["name"] = $person["name"];

	  	if(! preg_match('#^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,6}$#',$person["email"])) { 
	  		throw new CommunecterException("Problem inserting the new person : email is not well formated");
        } else {
        	$newPerson["email"] = $person["email"];
        }

		//Check if the email of the person is already in the database
	  	$account = PHDB::findOne(PHType::TYPE_CITOYEN,array("email"=>$person["email"]));
	  	if ($account) {
	  		throw new CommunecterException("Problem inserting the new person : a person with this email already exists in the plateform");
	  	}
	  	
	  	if (! $minimal) {
		  	//Encode the password
		  	$newPerson["pwd"] = hash('sha256', $person["email"].$person["pwd"]);
		  	
		  	//Manage the adress : postalCode / adressLocality / codeInsee
		  	//Get Locality label
		  	try {
		  		//Format adress 
		  		$newPerson["address"] = SIG::getAdressSchemaLikeByCodeInsee($person["city"]);
		  	} catch (CTKException $e) {
		  		throw new CommunecterException("Problem inserting the new person : unknown city");
		  	}
		}
	  	return $newPerson;
	}

	/**
	 * Insert a new person from the minimal information inside the parameter
	 * @param array $person Minimal information to create a person.
	 * @param boolean $minimal : true : a person can be created using only "name" and "email". Else : "postalCode" and "pwd" are also requiered
	 * @return array result, msg and id
	 */
	public static function insert($person, $minimal = false) {
	  	//Check Person data + business rules
	  	$person = self::getAndcheckPersonData($person, $minimal);

	  	$person["@context"] = array("@vocab"=>"http://schema.org",
            "ph"=>"http://pixelhumain.com/ph/ontology/");

	  	//Add aditional information
	  	$person["tobeactivated"] = true;
	  	$person["created"] = time();
	  	
	  	PHDB::insert( PHType::TYPE_CITOYEN , $person);
 
        if (isset($person["_id"])) {
	    	$newpersonId = (String) $person["_id"];
	    } else {
	    	throw new CommunecterException("Problem inserting the new person");
	    }

	    //send validation mail
        //TODO : make emails as cron jobs
        /*$app = new Application($_POST["app"]);
        Mail::send(array("tpl"=>'validation',
             "subject" => 'Confirmer votre compte  pour le site '.$app->name,
             "from"=>Yii::app()->params['adminEmail'],
             "to" => (!PH::notlocalServer()) ? Yii::app()->params['adminEmail']: $email,
             "tplParams" => array( "user"=>$newAccount["_id"] ,
                                   "title" => $app->name ,
                                   "logo"  => $app->logoUrl )
        ));*/

	    return array("result"=>true, "msg"=>"You are now communnected", "id"=>$newpersonId); 
	}

	/**
	 * Get a person from an id and return filter data in order to return only public data
	 * @param type $id 
	 * @return person
	 */
	public static function getPublicData($id) {
		//Public datas 
		$publicData = array (
			"imagePath",
			"name",
			"city",
			"socialAccounts",
			"positions",
			"url",
			"coi"
		);
		
		//TODO SBAR = filter data to retrieve only publi data	
		$person = self::getById($id);
		if (empty($person)) {
			throw new CommunecterException("The person id is unknown ! Check your URL");
		}

		return $person;
	}

 	/**
		 * get all events details of a Person By a person Id
		 * @param type $id : is the mongoId (String) of the person
		 * @return person document as in db
	*/
	public static function getEventsByPersonId($id){
		$person = self::getById($id);
	    $events = array();
	    
	    //Load events
	    if (isset($person["links"]) && !empty($person["links"]["events"])) 
	    {
	      foreach ($person["links"]["events"] as $id => $e) 
	      {
	        $event = PHDB::findOne( PHType::TYPE_EVENTS, array( "_id" => new MongoId($id)));
	        if (!empty($event)) {
	          array_push($events, $event);
	        } else {
	         // throw new CommunecterException("Données inconsistentes pour le citoyen : ".Yii::app()->session["userId"]);
	        }
	      }
	    }
	    return $events;
	} 


	/**
		* get person Data => need to update
		* @param type $id : is the mongoId (String) of the person
		* @return a map with : Person's informations, his organizations, events,projects
	*/
	public static function getPersonMap($id){
		$person = self::getById($id);
		$organizations = self::getOrganizationsById($id);
		$events = self::getEventsByPersonId($id);
		$personMap = array(
							"person" => $person,
							"organizations" => $organizations,
							"events" => $events
						);
		return $personMap;
	}

	/**
	 * Update a person field value
	 * @param String $personId The person Id to update
	 * @param String $personFieldName The name of the field to update
	 * @param String $personFieldValue 
	 * @param String $userId 
	 * @return boolean True if the update has been done correctly. Can throw CommunecterException on error.
	 */
	public static function updatePersonField($personId, $personFieldName, $personFieldValue, $userId) {  
		//TODO : Check the field sent
		/*if (! Person::checkFieldBeforeUpdate($personFieldName, $personFieldValue)) {
			throw new CommunecterException("Can not update the person : unknown field ".$personFieldName);
		}*/

		if ($personId != $userId) {
			throw new CommunecterException("Can not update the person : you are not authorized to update that person !");	
		}

		//Specific case : tags
		if ($personFieldName == "tags") {
			$personFieldValue = Tags::filterAndSaveNewTags($personFieldValue);
		}

		$person = array($personFieldName => $personFieldValue);
		
		//update the person
		PHDB::update( self::COLLECTION, array("_id" => new MongoId($personId)), 
		                          array('$set' => $person));
	                  
	    return true;
	}

	//TODO - Cette méthode n'a rien à faire là
	public static function getItemInfoById($id, $context){
		$item = PHDB::findOne( $context ,array("_id"=>new MongoId($id)));
		return $item;
	}
}
?>