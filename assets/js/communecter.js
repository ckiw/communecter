var debug = true;
var countPoll = 0;
$(document).ready(function() { 
	initSequence();
	setTimeout( function () { checkPoll() }, 10000);
});

var prevStep = 0;
var steps = ["explain1","live","explain2","event","explain3","orga","explain4","project","explain5","person"];
var slides = {
	explain1 : function() { showDefinition("explainCommunectMe")},
	live : function() { loadByHash("#default.live")},
	explain2 : function() { showDefinition("explainCartographiedeReseau")},
	event : function() { loadByHash("#event.detail.id.57bb4078f6ca47cb6c8b457d")}, 
	explain3 : function() { showDefinition("explainDemoPart")},
	orga : function() { loadByHash("#organization.detail.id.57553776f6ca47b37da93c2d")}, 
	explain4 : function() { showDefinition("explainCommunecter")},
	project : function() { loadByHash("#project.detail.id.56c1a474f6ca47a8378b45ef")},
	explain5 : function() { showDefinition("explainProxicity")},
	person : function() { loadByHash("#person.detail.id.54eda798f6b95cb404000903")} 
};
function runslide(cmd)
{
	if(cmd == 0){
		prevStep = null;
		loadByHash("#default.live");
	}

	if( prevStep != null ){
		slides[ steps[prevStep] ]();
		prevStep = ( prevStep < steps.length - 1 ) ? prevStep+1  : 0;
		setTimeout( function () { 
			runslide();
		 }, 8000);
	}
}

function checkPoll(){
	countPoll++;
	console.log("countPoll",countPoll,"currentUrl",currentUrl);
	//refactor check Log to use only one call with pollParams 
	//returning multple server checks in a unique ajax call
	if(userId){
		_checkLoggued();
		refreshNotifications();
	}
	
	//according to the loaded page 
	//certain checks can be made  
	if(currentUrl.indexOf( "#comment.index.type.actionRooms.id" ) >= 0 )
		checkCommentCount();

	if(countPoll < 100){
		setTimeout( function () { checkPoll() }, 300000); //every5min
		countPoll++;
	}
}
/* *************************** */
/* instance du menu questionnaire*/
/* *************************** */
function DropDown(el) {
	this.dd = el;
	this.placeholder = this.dd.children('span');
	this.opts = this.dd.find('ul.dropdown > li');
	this.val = '';
	this.index = -1;
	this.initEvents();
}
DropDown.prototype = {
	initEvents : function() {
		var obj = this;

		obj.dd.on('click', function(event){
			$(this).toggleClass('active');
			return false;
		});

		obj.opts.on('click',function(){
			var opt = $(this);
			obj.val = opt.text();
			obj.index = opt.index();
			obj.placeholder.text(obj.val);
			window.open($(this).find('a').slice(0,1).attr('href'));
		});
	},
	getValue : function() {
		return this.val;
	},
	getIndex : function() {
		return this.index;
	}
}

function openModal(key,collection,id,tpl,savePath,isSub){
	$.ajax({
	  type: "POST",
	  url: baseUrl+"/common/GetMicroformat/key/"+key,
	  data: { "key" : key, 
	  		  "template" : tpl, 
	  		  "collection" : collection, 
	  		  "id" : id,
	  		  "savePath" : savePath,
	  		  "isSub" : isSub },
	  success: function(data){
			  $("#flashInfoLabel").html(data.title);
			  $("#flashInfoContent").html(data.content);
			  $("#flashInfoSaveBtn").html('<a class="btn btn-warning " href="javascript:;" onclick="$(\'#flashForm\').submit(); return false;"  >Enregistrer</a>');
		
	  },
	  dataType: "json"
	});
}

function updateField(type,id,name,value,reload){ 
    	
	$.ajax({
	  type: "POST",
	  url: baseUrl+"/"+moduleId+"/"+type+"/updatefield", 
	  data: { "pk" : id ,"name" : name, "value" : value },
	  success: function(data){
		if(data.result) {
        	toastr.success(data.msg);
        	if(reload)
        		loadByHash(location.hash);
		}
        else
        	toastr.error(data.msg);  
	  },
	  dataType: "json"
	});
}

/* *************************** */
/* global JS tools */
/* *************************** */
function log(msg,type){
	if(debug){
	   try {
	    if(type){
	      switch(type){
	        case 'info': console.info(msg); break;
	        case 'warn': console.warn(msg); break;
	        case 'debug': console.debug(msg); break;
	        case 'error': console.error(msg); break;
	        case 'dir': console.dir(msg); break;
	        default : console.log(msg);
	      }
	    } else
	          console.log(msg);
	  } catch (e) { 
	     //alert(msg);
	  }
	}
}
/* ------------------------------- */

function initSequence(){
    $.each(initT, function(k,v){
        log(k,'info');
        v();
    });
    initT = null;
}

function showEvent(id){
	$("#"+id).click(function(){
    	if($("#"+id).prop("checked"))
    		$("#"+id+"What").removeClass("hidden");
    	else
    		$("#"+id+"What").addClass("hidden");
    });
}

//In this javascript file you can find a bunk of functional functions
//Calling Actions in ajax. Can be used easily on views
function connectPerson(connectUserId, callback) 
{
	console.log("connect Person");
	$.ajax({
		type: "POST",
		url: baseUrl+"/"+moduleId+'/person/follows',
		dataType : "json",
		data : {
			connectUserId : connectUserId,
		}
	})
	.done(function (data) {
		$.unblockUI();
		if (data &&  data.result) {
			var name = $("#newInvite #ficheName").text();
			toastr.success('You are now following '+name);
			if (typeof callback == "function") callback(data.invitedUser);
		} else {
			$.unblockUI();
			toastr.error('Something Went Wrong !');
		}
		
	});
	
}


/*function disconnectPerson(idToDisconnect, typeToDisconnect, nameToDisconnect, callback) 
{

	bootbox.confirm(trad.areyousure+" <span class='text-red'>"+nameToDisconnect+"</span> "+trad.connection+" ?", 
		function(result) {
			if (!result) {
				return;
			}
			var urlToSend = baseUrl+"/"+moduleId+"/person/disconnect/id/"+idToDisconnect+"/type/"+typeToDisconnect+"/ownerLink/knows";
			$.ajax({
				type: "POST",
				url: urlToSend,
				dataType: "json",
				success: function(data){
					if ( data && data.result ) {               
						toastr.info("You are not following this person anymore.");
						if (typeof callback == "function") callback(idToDisconnect, typeToDisconnect, nameToDisconnect);
					} else {
						toastr.error(data.msg);
					}
				},
				error: function(data) {
					toastr.error("Something went really bad !");
				}
			});
		}
	);
}*/

function disconnectTo(parentType,parentId,childId,childType,connectType, callback) {
	var messageBox = trad["removeconnection"];
	$(".disconnectBtnIcon").removeClass("fa-unlink").addClass("fa-spinner fa-spin");
	var formData = {
		"childId" : childId,
		"childType" : childType, 
		"parentType" : parentType,
		"parentId" : parentId,
		"connectType" : connectType,
	};
	bootbox.dialog({
        onEscape: function() {
            $(".disconnectBtnIcon").removeClass("fa-spinner fa-spin").addClass("fa-unlink");
        },
        message: '<div class="row">  ' +
            '<div class="col-md-12"> ' +
            '<span>'+messageBox+' ?</span> ' +
            '</div></div>',
        buttons: {
            success: {
                label: "Ok",
                className: "btn-primary",
                callback: function () {
                    $.ajax({
						type: "POST",
						url: baseUrl+"/"+moduleId+"/link/disconnect",
						data : formData,
						dataType: "json",
						success: function(data){
							if ( data && data.result ) {
								type=formData.parentType;
								if(formData.parentType==  "citoyens")
									type="people";
								removeFloopEntity(data.parentId, type);
								toastr.success("Le lien a été supprimé avec succès");
								if (typeof callback == "function") 
									callback();
								else
									loadByHash(location.hash);
							} else {
							   toastr.error("You leave succesfully");
							}
						}
					});
                }
            },
            cancel: {
            	label: trad["cancel"],
            	className: "btn-secondary",
            	callback: function() {
            		$(".disconnectBtnIcon").removeClass("fa-spinner fa-spin").addClass("fa-unlink");
            	}
            }
        }
    });      
};

// Javascript function used to validate a link between parent and child (ex : member, admin...)
function validateConnection(parentType, parentId, childId, childType, linkOption, callback) {
	var formData = {
		"childId" : childId,
		"childType" : childType, 
		"parentType" : parentType,
		"parentId" : parentId,
		"linkOption" : linkOption,
	};

	$.ajax({
		type: "POST",
		url: baseUrl+"/"+moduleId+"/link/validate",
		data: formData,
		dataType: "json",
		success: function(data) {
			if (data.result) {
				if (typeof callback == "function") callback(parentType, parentId, childId, childType, linkOption);
			} else {
				toastr.error(data.msg);
			}
		},
	});  
}
function follow(parentType, parentId, childId, childType, callback){
	$(".followBtn").removeClass("fa-link").addClass("fa-spinner fa-spin");
	var formData = {
		"childId" : childId,
		"childType" : childType, 
		"parentType" : parentType,
		"parentId" : parentId,
	};
	$.ajax({
		type: "POST",
		url: baseUrl+"/"+moduleId+"/link/follow",
		data: formData,
		dataType: "json",
		success: function(data) {
			if(data.result){
				if (formData.parentType)
					addFloopEntity(formData.parentId, formData.parentType, data.parentEntity);
				toastr.success(data.msg);	
				if (typeof callback == "function") 
					callback();
				else
					loadByHash(location.hash);
			}
			else
				toastr.error(data.msg);
		},
	});
}
function connectTo(parentType, parentId, childId, childType, connectType, parentName, actionAdmin) {
	if(parentType=="events" && connectType=="attendee")
		$(".connectBtn").removeClass("fa-link").addClass("fa-spinner fa-spin");
	else
		$(".becomeAdminBtn").removeClass("fa-user-plus").addClass("fa-spinner fa-spin");
	var formData = {
		"childId" : childId,
		"childType" : childType, 
		"parentType" : parentType,
		"parentId" : parentId,
		"connectType" : connectType,
	};
	console.log(formData);
	
	if(connectType!="admin" && connectType !="attendee"){
		bootbox.dialog({
                title: trad["suretojoin"+parentType]+" "+trad["as"+connectType]+" ?",
                onEscape: function() {
	                $(".becomeAdminBtn").removeClass("fa-spinner fa-spin").addClass("fa-user-plus");
                },
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal"> ' +
                    '<label class="col-md-4 control-label" for="awesomeness">'+trad["areyouadmin"]+'?</label> ' +
                    '<div class="col-md-4"> <div class="radio"> <label for="awesomeness-0"> ' +
                    '<input type="radio" name="awesomeness" id="awesomeness-0" value="admin"> ' +
                    trad["yes"]+' </label> ' +
                    '</div><div class="radio"> <label for="awesomeness-1"> ' +
                    '<input type="radio" name="awesomeness" id="awesomeness-1" value="'+connectType+'" checked="checked"> '+trad["no"]+' </label> ' +
                    '</div> ' +
                    '</div> </div>' +
                    '</form></div></div>',
                buttons: {
                    success: {
                        label: "Ok",
                        className: "btn-primary",
                        callback: function () {
                            var role = $('#role').val();
                            var answer = $("input[name='awesomeness']:checked").val();
                            if(role!=""){
	                            formData.roles=role;
                            }
                            formData.connectType=answer;
                            console.log(formData);
                            $.ajax({
								type: "POST",
								url: baseUrl+"/"+moduleId+"/link/connect",
								data: formData,
								dataType: "json",
								success: function(data) {
									if(data.result){
										addFloopEntity(data.parent["_id"]["$id"], data.parentType, data.parent);
										toastr.success(data.msg);	
										loadByHash(location.hash);
									}
									else{
										if(typeof(data.type)!="undefined" && data.type=="info")
											toastr.info(data.msg);
										else
											toastr.error(data.msg);
									}
								},
							});  
                        }
                    },
                    cancel: {
                    	label: trad["cancel"],
                    	className: "btn-secondary",
                    	callback: function() {
                    		$(".becomeAdminBtn").removeClass("fa-spinner fa-spin").addClass("fa-user-plus");
                    	}
                    }
                }
            }
        );
    }
	else{
		messageBox=trad["suretojoin"+parentType];;
		if (connectType=="admin")
			messageBox += " " + trad["as"+connectType];
		bootbox.dialog({
                onEscape: function() {
	                $(".becomeAdminBtn").removeClass("fa-spinner fa-spin").addClass("fa-user-plus");
                },
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<span>'+messageBox+' ?</span> ' +
                    '</div></div>',
                buttons: {
                    success: {
                        label: "Ok",
                        className: "btn-primary",
                        callback: function () {
                            $.ajax({
								type: "POST",
								url: baseUrl+"/"+moduleId+"/link/connect",
								data: formData,
								dataType: "json",
								success: function(data) {
									if(data.result){
										addFloopEntity(data.parent["_id"]["$id"], data.parentType, data.parent);
										toastr.success(data.msg);	
										loadByHash(location.hash);
									}
									else{
										if(typeof(data.type)!="undefined" && data.type=="info")
											toastr.info(data.msg);
										else
											toastr.error(data.msg);
									}
								},
							});   
                        }
                    },
                    cancel: {
                    	label: trad["cancel"],
                    	className: "btn-secondary",
                    	callback: function() {
                    		$(".becomeAdminBtn").removeClass("fa-spinner fa-spin").addClass("fa-user-plus");
                    	}
                    }
                }
            }
        );      
	}
}		

var loadableUrls = {
	"#organization.addorganizationform" : {title:"ADD AN ORGANIZATION ", icon : "users","login":true},
	"#person.invite": {title:'INVITE SOMEONE', icon : "share-alt","login":true},
	"#event.eventsv": {title:'ADD AN EVENT', icon : "calendar","login":true},
	"#project.projectsv": {title:'ADD A PROJECT', icon : 'lightbulb-o',"login":true},
	"#person.directory" : {title:"PERSON DIRECTORY ", icon : "share-alt"},
	"#organization.directory" : {title:"ORGANIZATION MEMBERS ", icon : "users"},
	"#project.directory" : {title:"PROJECT CONTRIBUTORS ", icon : "users"},
	"#event.directory" : {title:"EVENT VISUALISATION ", icon : "calendar"},
	"#event.calendarview" : {title:"EVENT CALENDAR ", icon : "calendar"},
	//"#city.directory" : {title:"CITY DIRECTORY ", icon : "bookmark fa-rotate-270","urlExtraParam":"tpl=directory2"},
	"#city.opendata" : {title:'STATISTICS ', icon : 'line-chart' },
    "#person.detail" : {title:'PERSON DETAIL ', icon : 'user' },
    "#person.invite" : {title:'PERSON INVITE ', icon : 'user' },
    "#person.changepassword" : {title:'Change your password ', icon : 'fa-lock' },
    "#person.updateprofil" : {title:'Update profil', icon : 'fa-lock' },
    "#person.telegram" : {title:'CONTACT PERSON VIA TELEGRAM ', icon : 'send' },
    "#event.detail" : {title:'EVENT DETAIL ', icon : 'calendar' },
    "#project.detail" : {title:'PROJECT DETAIL ', icon : 'lightbulb-o' },
    "#project.addchartsv" : {title:'EDIT CHART ', icon : 'puzzle-piece' },
    "#gantt.addtimesheetsv" : {title:'EDIT TIMELINE ', icon : 'tasks' },
    "#news.detail" : {title:'NEWS DETAIL ', icon : 'rss' },
    "#news.index.type" : {title:'NEWS INDEX ', icon : 'rss', menuId:"menu-btn-news-network","urlExtraParam":"isFirst=1" },
    "#organization.detail" : {title:'ORGANIZATION DETAIL ', icon : 'users' },
    "#need.detail" : {title:'NEED DETAIL ', icon : 'cubes' },
    "#city.detail" : {title:'CITY ', icon : 'university', menuId:"btn-geoloc-auto-menu" },
    "#city.statisticPopulation" : {title:'CITY ', icon : 'university' },
    "#news" : {title:'NEWS ', icon : 'rss'},
    "#survey" : {title:'VOTE LOCAL ', icon : 'legal'},
    "#rooms.index.type.cities" : {title:'ACTION ROOMS ', icon : 'cubes', menuId:"btn-citizen-council-commun"},
    "#rooms" : {title:'ACTION ROOMS ', icon : 'cubes'},
    "#rooms.editroom" : {title:'ADD A ROOM ', icon : 'plus', action:function(){ editRoomSV ();	}},

    "#comment" : {title:'DISCUSSION ROOMS ', icon : 'comments'},
    "#admin.checkgeocodage" : {title:'CHECKGEOCODAGE ', icon : 'download'},
    "#admin.openagenda" : {title:'OPENAGENDA ', icon : 'download'},
    "#admin.adddata" : {title:'ADDDATA ', icon : 'download'},
    "#admin.importdata" : {title:'IMPORT DATA ', icon : 'download'},
    "#admin.index" : {title:'IMPORT DATA ', icon : 'download'},
    "#admin.sourceadmin" : {title:'SOURCE ADMIN', icon : 'download'},
    "#admin.checkcities" : {title:'SOURCE ADMIN', icon : 'download'},
    "#admin.directory" : {title:'IMPORT DATA ', icon : 'download'},
    "#admin.moderate" : {title:'MODERATE ', icon : 'download'},
	"#log.monitoring" : {title:'LOG MONITORING ', icon : 'plus'},
    "#adminpublic.index" : {title:'SOURCE ADMIN', icon : 'download'},
    "#default.directory" : {title:'COMMUNECTED DIRECTORY', icon : 'connectdevelop', menuId:"menu-btn-directory"},
    "#default.news" : {title:'COMMUNECTED NEWS ', icon : 'rss', menuId:"menu-btn-news" },
    "#default.agenda" : {title:'COMMUNECTED AGENDA ', icon : 'calendar', menuId:"menu-btn-agenda"},
	"#default.home" : {title:'COMMUNECTED HOME ', icon : 'home',"menu":"homeShortcuts"},
	"#default.twostepregister" : {title:'TWO STEP REGISTER', icon : 'home', "menu":"homeShortcuts"},
	"#default.view.page" : {title:'FINANCEMENT PARTICIPATIF ', icon : 'euro'},
	
	//"#home" : {"alias":"#default.home"},
    "#stat.chartglobal" : {title:'STATISTICS ', icon : 'bar-chart'},
    "#stat.chartlogs" : {title:'STATISTICS ', icon : 'bar-chart'},

    "#default.live" : {title:"FLUX'Direct" , icon : 'heartbeat', menuId:"menu-btn-live"},
	"#default.login" : {title:'COMMUNECTED AGENDA ', icon : 'calendar'},
	"#project.addcontributorsv" : {title:'Add contributors', icon : 'plus'},
	"#organization.addmember" : {title:'Add Members ', icon : 'plus'},
	"#event.addattendeesv" : {title:'ADD ATTENDEES ', icon : 'plus'},
	"#project.addcontributorsv" : {title:'COMMUNECTED AGENDA ', icon : 'calendar'},
	"#showTagOnMap.tag" : {title:'TAG MAP ', icon : 'map-marker', action:function( hash ){ showTagOnMap(hash.split('.')[2])	} },
	"#define." : {title:'TAG MAP ', icon : 'map-marker', action:function( hash ){ showDefinition("explain"+hash.split('.')[1])	} },
	"#data.index" : {title:'OPEN DATA FOR ALL', icon : 'fa-folder-open-o'},
	"#opendata" : {"alias":"#data.index"},
	"#search" : { "title":'SEARCH AND FIND', "icon" : 'map-search', "hash" : "#default.directory", "preaction":function( hash ){ return searchByHash(hash);} },
};

function jsController(hash){
	console.log("jsController",hash);
	res = false;
	$(".menuShortcuts").addClass("hide");
	$.each( loadableUrls, function(urlIndex,urlObj)
	{
		//console.log("replaceAndShow2",urlIndex);
		if( hash.indexOf(urlIndex) >= 0 )
		{
			checkMenu(urlObj, hash);
		
			endPoint = loadableUrls[urlIndex];
			console.log("jsController 2",endPoint,"login",endPoint.login,endPoint.hash );
			if( typeof endPoint.login == undefined || !endPoint.login || ( endPoint.login && userId ) ){
				//alises are renaming of urls example default.home could be #home
				if( endPoint.alias ){
					endPoint = jsController(endPoint.alias);
					return false;
				} 
				// an action can be connected to a url, and executed
				if( endPoint.action && typeof endPoint.action == "function"){
					endPoint.action(hash);
				} else {
					//classic url management : converts urls by replacing dots to slashes and ajax retreiving and showing the content 
					extraParams = (endPoint.urlExtraParam) ? "?"+endPoint.urlExtraParam : "";
					urlExtra = (endPoint.urlExtra) ? endPoint.urlExtra : "";
					//execute actions before teh ajax request
					res = false;
					if( endPoint.preaction && typeof endPoint.preaction == "function")
						res = endPoint.preaction(hash);
					//hash can be iliased
					if (endPoint.hash) 
						hash = endPoint.hash;
					path = hash.replace( "#","" ).replace( /\./g,"/" );
					showAjaxPanel( '/'+path+urlExtra+extraParams, endPoint.title,endPoint.icon, res );
					
					if(endPoint.menu)
						$("."+endPoint.menu).removeClass("hide");
				}
				res = true;
				return false;
			} else {
				console.warn("PRIVATE SECTION LOGIN FIRST",hash);
				showPanel( "box-login" );
				resetUnlogguedTopBar();
				res = true;
			}
		}
	});
	return res;
}

//back sert juste a differencier un load avec le back btn
//ne sert plus, juste a savoir d'ou vient drait l'appel
function loadByHash( hash , back ) { 
	currentUrl = hash;
	allReadyLoad = true;
	contextData = null;

	$(".my-main-container").off(); 
	console.log("LBH scroll shadows!");
	$(".my-main-container").bind("scroll", function () {shadowOnHeader()});

	$(".searchIcon").removeClass("fa-file-text-o").addClass("fa-search");
	searchPage = false;
	
	//alert("loadByHash");
    console.warn("loadByHash",hash,back);
    if( jsController(hash) ){
    	console.log("loadByHash >>> jsController",hash);
    }
    else if( hash.indexOf("#panel") >= 0 ){
    	panelName = hash.substr(7);
    	if( (panelName == "box-login" || panelName == "box-register") && userId != "" && userId != null ){
    		loadByHash("#default.home");
    		return false;
    	} else if(panelName == "box-add")
            title = 'ADD SOMETHING TO MY NETWORK';
        else
            title = "WELCOM MUNECT HEY !!!";
        showPanel(panelName,null,title);
    }  else if( hash.indexOf("#gallery.index.id") >= 0 ){
        hashT = hash.split(".");
        showAjaxPanel( '/'+hash.replace( "#","" ).replace( /\./g,"/" ), 'ACTIONS in this '+typesLabels[hashT[3]],'rss' );
    }
    /*else if( hash.indexOf("#news.index.type") >= 0 ){
        hashT = hash.split(".");
        showAjaxPanel( '/'+hash.replace( "#","" ).replace( /\./g,"/" )+'?isFirst=1', 'KESS KISS PASS in this '+typesLabels[hashT[3]],'rss' );

    } */
    else if( hash.indexOf("#city.directory") >= 0 ){
        hashT = hash.split(".");
        showAjaxPanel( '/'+hash.replace( "#","" ).replace( /\./g,"/" ), 'KESS KISS PASS in this '+typesLabels[hashT[3]],'rss' );
    } 
	else if( hash.indexOf("#need.addneedsv") >= 0 ){
	        hashT = hash.split(".");
	        showAjaxPanel( '/'+hash.replace( "#","" ).replace( /\./g,"/" ), 'ADD NEED '+typesLabels[hashT[3]],'cubes' );
	} 
    else 
        showAjaxPanel( '/default/home', 'Home Communecter ','home' );

    location.hash = hash;

    /*if(!back){
    	history.replaceState( { "hash" :location.hash} , null, location.hash ); //changes the history.state
	    console.warn("replaceState history.state",history.state);
	}*/
}

function setTitle(str, icon, topTitle,keywords,shortDesc) { 
	if(icon != "")
		icon = ( icon.indexOf("<i") >= 0 ) ? icon : "<i class='fa fa-"+icon+"'></i> ";
	$(".moduleLabel").html( icon +" "+ str);
	if(topTitle)
		str = topTitle;
	$(document).prop('title', ( str != "" ) ? str : "Communecter, se connecter à sa commune" );
	if(notNull(keywords))
		$('meta[name="keywords"]').attr("content",keywords);
	else
		$('meta[name="keywords"]').attr("content","communecter,connecter, commun,commune, réseau, sociétal, citoyen, société, territoire, participatif, social, smarterre");
	
	if(notNull(shortDesc))
		$('meta[name="description"]').attr("content",shortDesc);
	else
		$('meta[name="description"]').attr("content","Communecter : Connecter à sa commune, inter connecter les communs, un réseau sociétal pour un citoyen connecté et acteur au centre de sa société.");
}

//ex : #search:bretagneTelecom:all
//#search:#fablab
//#search:#fablab:all:map
function searchByHash (hash) 
{ 
	var mapEnd = false;
	var searchT = hash.split(':');
	// 1 : is the search term
	var search = searchT[1]; 
	scopeBtn = null;
	// 2 : is the scope
	if( searchT.length > 2 )
	{
		if( searchT[2] == "all" )
			scopeBtn = ".btn-scope-niv-5" ;
		else if( searchT[2] == "region" )
			scopeBtn = ".btn-scope-niv-4" ;
		else if( searchT[2] == "dep" )
			scopeBtn = ".btn-scope-niv-3" ;
		else if( searchT[2] == "quartier" )
			scopeBtn = ".btn-scope-niv-2" ;
	}
	console.log("search : "+search,searchT, scopeBtn);
	$(".input-global-search").val(search);
	//startGlobalSearch();
	if( scopeBtn )
		$(scopeBtn).trigger("click"); 

	if( searchT.length > 3 && searchT[3] == "map" )
		mapEnd = true;
	return mapEnd;
}

function checkMenu(urlObj, hash){
	console.log("checkMenu *******************", hash);
	console.dir(urlObj);
	$(".menu-button-left").removeClass("selected");
	if(typeof urlObj.menuId != "undefined"){ console.log($("#"+urlObj.menuId).data("hash"));
		if($("#"+urlObj.menuId).data("hash") == hash)
			$("#"+urlObj.menuId).addClass("selected");
	}
}

var backUrl = null;
function checkIsLoggued(uId){
	if( uId == "" ||  typeof uId == "undefined" ){
		console.warn("");
		toastr.error("<h1>Section Sécuriser, Merci de vous connecter!</h1>");
		
		setTitle("Section Sécuriser", "user-secret");

		backUrl = location.hash;
		showPanel( "box-login" );
    	
    	resetUnlogguedTopBar();
	}else 
		return true;
}
function resetUnlogguedTopBar() { 
	//put anything that needs to be reset 
	//replace the loggued toolBar nav by log buttons
	$('.topMenuButtons').html('<button class="btn-top btn btn-success  hidden-xs" onclick="showPanel(\'box-register\');"><i class="fa fa-plus-circle"></i> <span class="hidden-sm hidden-md hidden-xs">Sinscrire</span></button>'+
							  ' <button class="btn-top btn bg-red  hidden-xs" style="margin-right:10px;" onclick="showPanel(\'box-login\');"><i class="fa fa-sign-in"></i> <span class="hidden-sm hidden-md hidden-xs">Se connecter</span></button>');
}

function _checkLoggued() { 
	$.ajax({
	  type: "POST",
	  url: baseUrl+"/"+moduleId+"/person/logged",
	  success: function(data){
		if( !data.userId || data.userId == "" ||  typeof data.userId == "undefined" ){
			/*userId = data.userId;
			resetUnlogguedTopBar();*/
			window.location.reload();
		}
	  },
	  dataType: "json"
	});
}

/* ****************
Generic non-ajax panel loading process 
**************/
function showPanel(box,callback){ 
	$(".my-main-container").scrollTop(0);

  	$(".box").hide(200);
  	showNotif(false);
  	
  	if(isMapEnd) showMap(false);
			
	console.log("showPanel");
	//showTopMenu(false);
	$(".main-col-search").animate({ top: -1500, opacity:0 }, 500 );

	$("."+box).show(500);

	if (typeof callback == "function") {
		callback();
	}
}

/* ****************
Generic ajax panel loading process 
loads any REST Url endpoint returning HTML into the content section
also switches the global Title and Icon
**************/
var rand = Math.floor((Math.random() * 7) + 1); 
var urlImgRand = proverbs[rand];
function  processingBlockUi() { 
	$.blockUI({
	 	message : '<h4 style="font-weight:300" class=" text-dark padding-10"><i class="fa fa-spin fa-circle-o-notch"></i><br>Chargement en cours...</h4>' //+
	    //"<img style='max-width:60%; margin-bottom:20px;' src='"+urlImgRand+"'>"
	 });
}
function showAjaxPanel (url,title,icon, mapEnd) { 
	//$(".main-col-search").css("opacity", 0);
	console.log("showAjaxPanel",url,"TITLE",title);
	hideScrollTop = false;

	showNotif(false);
			
	//$(".main-col-search").animate({ top: -1500, opacity:0 }, 800 );

	setTimeout(function(){
		$(".main-col-search").html("");
		$(".hover-info,.hover-info2").hide();
		processingBlockUi();
		setTitle("Chargement en cours ...", "spin fa-circle-o-notch");
		//$(".main-col-search").show();
		showMap(false);
	}, 800);

	$(".box").hide(200);
	//showPanel('box-ajax');
	icon = (icon) ? " <i class='fa fa-"+icon+"'></i> " : "";
	$(".panelTitle").html(icon+title).fadeIn();
	console.log("GETAJAX",icon+title);
	
	showTopMenu(true);
	userIdBefore = userId;
	setTimeout(function(){
		getAjax('.main-col-search', baseUrl+'/'+moduleId+url, function(data){ 
			/*if(!userId && userIdBefore != userId )
				window.location.reload();*/


			//$(".main-col-search").slideDown(); 
			initNotifications(); 
			
			bindExplainLinks();
			bindTags();
			bindLBHLinks();

			$.unblockUI();

			if(mapEnd)
				showMap(true);
			// setTimeout(function(){
			// 	console.log("call timeout MAP MAP");
			// 	getAjax('#mainMap',baseUrl+'/'+moduleId+"/search/mainmap",function(){ 
			// 		toastr.info('<i class="fa fa-check"></i> Cartographie activée');
			// 		showMap(false); 
			// 		$("#btn-toogle-map").show(400);
			// 		//console.log("getAJAX OK timeout MAIN MAP");
					
			// 	},"html");
			// }, 2000);

		},"html");
	}, 800);
}
/* ****************
visualize all tagged elements on a map
**************/
function showTagOnMap (tag) { 

	console.log("showTagOnMap",tag);

	var data = { 	 "name" : tag, 
		 			 "locality" : "",
		 			 "searchType" : [ "persons" ], 
		 			 //"searchBy" : "INSEE",
            		 "indexMin" : 0, 
            		 "indexMax" : 500  
            		};

        //setTitle("", "");$(".moduleLabel").html("<i class='fa fa-spin fa-circle-o-notch'></i> Les acteurs locaux : <span class='text-red'>" + cityNameCommunexion + ", " + cpCommunexion + "</span>");
		
		$.blockUI({
			message : "<h1 class='homestead text-red'><i class='fa fa-spin fa-circle-o-notch'></i> Recherches des collaborateurs ...</h1>"
		});

		showMap(true);
		
		$.ajax({
	      type: "POST",
	          url: baseUrl+"/" + moduleId + "/search/globalautocomplete",
	          data: data,
	          dataType: "json",
	          error: function (data){
	             console.log("error"); console.dir(data);          
	          },
	          success: function(data){
	            if(!data){ toastr.error(data.content); }
	            else{
	            	console.dir(data);
	            	Sig.showMapElements(Sig.map, data);
	            	//setTitle("", "");$(".moduleLabel").html("<i class='fa fa-connect-develop'></i> Les acteurs locaux : <span class='text-red'>" + cityNameCommunexion + ", " + cpCommunexion + "</span>");
					//$(".search-loader").html("<i class='fa fa-check'></i> Vous êtes communecté : " + cityNameCommunexion + ', ' + cpCommunexion);
					//toastr.success('Vous êtes communecté !<br/>' + cityNameCommunexion + ', ' + cpCommunexion);
					$.unblockUI();
	            }
	          }
	 	});

	//loadByHash('#project.detail.id.56c1a474f6ca47a8378b45ef',null,true);
	//Sig.showFilterOnMap(tag);
}

/* ****************
show a definition in the focus menu panel
**************/
function showDefinition( id,copySection ){ 

	setTimeout(function(){
		console.log("showDefinition",id,copySection);
		$(".hover-info,.hover-info2").hide();
		$(".main-col-search").animate({ opacity:0.3 }, 400 );
		
		if(copySection){
			contentHTML = $("."+id).html();
			if(copySection != true)
				contentHTML = copySection;
			$(".hover-info2").css("display" , "inline").html( contentHTML );
			bindExplainLinks()	
		}
		else {
			$(".hover-info").css("display" , "inline");
			toggle( "."+id , ".explain" );
			$("."+id+" .explainDesc").removeClass("hide");
		}
		return false;
	}, 500);
}

var timeoutHover = setTimeout(function(){}, 0);
var hoverPersist = false;
var positionMouseMenu = "out";

function activateHoverMenu () { 
	//console.log("enter all");
	positionMouseMenu = "in";
	$(".main-col-search").animate({ opacity:0.3 }, 400 );
	$(".lbl-btn-menu-name").show(200);
	$(".lbl-btn-menu-name").css("display", "inline");
	$(".menu-button-title").addClass("large");

	showInputCommunexion();

	hoverPersist = false;
	clearTimeout(timeoutHover);
	timeoutHover = setTimeout(function(){
		hoverPersist = true;
	}, 1000);
}

function openMenuSmall () { 
	menuContent = $(".menuSmall").html();
	$.blockUI({ 
		title:    'Welcome to your page', 
		message : menuContent,
		onOverlayClick: $.unblockUI,
        css: { 
         //    border: 'none', 
         //    padding: '15px', 
         //    backgroundColor: 'rgba(0,0,0,0.7)', 
         //    '-webkit-border-radius': '10px', 
         //    '-moz-border-radius': '10px', 
         //    color: '#fff' ,
        	// "cursor": "pointer"
        },
		overlayCSS: { backgroundColor: '#000'}
	});
	$(".blockPage").addClass("menuSmallBlockUI");
	bindLBHLinks();
}

var selection;
function  bindHighlighter() { 
	//console.clear();  
	console.log("bindHighlighter");
  	console.dir(window.getSelection());
	$(".my-main-container").bind('mouseup', function(e){
		if (window.getSelection) {
	      selection = window.getSelection();
	    } else if (document.selection) {
	      selection = document.selection.createRange();
	    }
	    selTxt = selection.toString();
	    if( selTxt){
	    	//alert(selTxt);
	    	/*
	    	if($(".selBtn").length)
	    		$(".selBtn").remove();
	    	links = "<a href='javascript:;' onclick='fastAdd(\"/rooms/fastaddaction\")' class='selBtn text-bold btn btn-purple btn-xs'><i class='fa fa-cogs'></i> créer en action <i class='fa fa-plus'></i></a>"+
	    			" <a href='javascript:;'  onclick='fastAdd(\"/survey/fastaddentry\")' class='selBtn text-bold btn btn-purple btn-xs'><i class='fa fa-archive'></i> créer en proposition <i class='fa fa-plus'></i></a>";

	    	$(this).parent().find("div.bar_tools_post").append(links);
	    	*/
	    }
	});
}

function  bindTags() { 
	console.log("bindTags");
	//var tagClasses = ".tag,.label tag_item_map_list"
	$(".tag,.label tag_item_map_list").off().on('click', function(e){
		//if(userId){
			var tag = ($(this).data("val")) ? $(this).data("val") : $(this).html();
			//alert(tag);
			//showTagInMultitag(tag);
			//$('#btn-modal-multi-tag').trigger("click");
			//$('.tags-count').html( $(".item-tag-name").length );
			if(addTagToMultitag(tag))
				toastr.success("Le tag \""+tag+"\" ajouté à vos favoris");
			else
				toastr.info("Le tag \""+tag+"\" est déjà dans vos tags favoris");
			
		//} else {
		//	toastr.error("must be loggued");
		//}
	});
}

function  bindExplainLinks() { 
	$(".explainLink").click(function() {  
	    showDefinition( $(this).data("id") );
	    return false;
	 });
}

function  bindLBHLinks() { 

	$(".lbh").off().on("click",function(e) {  
		
		e.preventDefault();
		console.warn("***************************************");
		console.warn("bindLBHLinks",$(this).attr("href"));
		console.warn("***************************************");
		var h = ($(this).data("hash")) ? $(this).data("hash") : $(this).attr("href");
	    loadByHash( h );
	});
}

function bindRefreshBtns() { console.log("bindRefreshBtns");
	if( $("#dropdown_search").length || $(".newsTL").length)
	{
		var searchFeed = "#dropdown_search";
		var method = "startSearch(0, indexStepInit);"
		if( $(".newsTL").length){
			searchFeed = ".newsTL";
			method = "reloadNewsSearch();"
		}
	    $('#scopeListContainer .item-scope-checker, #scopeListContainer .item-tag-checker, .btn-filter-type').click(function(e){
	          //console.warn( ">>>>>>>",$(this).data("scope-value"), $(this).data("tag-value"), $(this).attr("type"));
	          str = '<div class="center" id="footerDropdown">';
	          str += "<hr style='float:left; width:100%;'/><label style='margin-bottom:10px; margin-left:15px;' class='text-dark'>Relancer la Recherche, les critères ont changés</label><br/>";
	          str += '<button class="btn btn-default" onclick="'+method+'"><i class="fa fa-refresh"></i> Relancer la Recherche</div></center>';
	          str += "</div>";
	          if(location.hash.indexOf("#news.index")==0 || location.hash.indexOf("#city.detail")==0){  console.log("vide news stream perso");
		          $(".newsFeedNews, #backToTop, #footerDropdown").remove();
		          $(searchFeed).append( str );
		      }else { console.log("vide autre news stream perso", searchFeed);
		          $(searchFeed).html( str );
		      }
		      $(".search-loader").html("<i class='fa fa-ban'></i>");
	    });
	}
}
function hideSearchResults(){
	var searchFeed = "#dropdown_search";
		var method = "startSearch(0, indexStepInit);"
		if( $(".newsTL").length){
			searchFeed = ".newsTL";
			method = "reloadNewsSearch();"
		}
      //console.warn( ">>>>>>>",$(this).data("scope-value"), $(this).data("tag-value"), $(this).attr("type"));
      str = '<div class="center" id="footerDropdown">';
      str += "<hr style='float:left; width:100%;'/><label style='margin-bottom:10px; margin-left:15px;' class='text-dark'>Relancer la Recherche, les critères ont changés</label><br/>";
      str += '<button class="btn btn-default" onclick="'+method+'"><i class="fa fa-refresh"></i> Relancer la Recherche</div></center>';
      str += "</div>";
      if(location.hash.indexOf("#news.index")==0 || location.hash.indexOf("#city.detail")==0){  console.log("vide news stream perso");
          $(".newsFeedNews, #backToTop, #footerDropdown").remove();
          $(searchFeed).append( str );
      }else { console.log("vide autre news stream perso", searchFeed);
          $(searchFeed).html( str );
      }
      $(".search-loader").html("<i class='fa fa-ban'></i>");
	    
}
function reloadNewsSearch(){
	if(location.hash.indexOf("#default.live")==0)
    	startSearch(false);
	else{
		dateLimit = 0;
		loadStream(0, 5);
	}
}
/* **************************************
maybe movebale into Element.js
***************************************** */




function  buildQRCode(type,id) { 
		
	$(".qrCode").qrcode({
	    text: baseUrl+"/"+moduleId+"#"+type+".detail.id"+id,//'{type:"'+type+'",_id:"'+id+'"}',
	    render: 'image',
		minVersion: 8,
	    maxVersion: 40,
	    ecLevel: 'L',
	    size: 150,
	    radius: 0,
	    quiet: 2,
	    /*mode: 2,
	    mSize: 0.1,
	    mPosX: 0.5,
	    mPosY: 0.5,

	    label: name,
	    fontname: 'Ubuntu',
	    fontcolor: '#E33551',*/
	});
}

function activateSummernote(elem) { 
		
	if( !$('script[src="'+baseUrl+'/themes/ph-dori/assets/plugins/summernote/dist/summernote.min.js"]').length )
	{
		$("<link/>", {
		   rel: "stylesheet",
		   type: "text/css",
		   href: baseUrl+"/themes/ph-dori/assets/plugins/summernote/dist/summernote.css"
		}).appendTo("head");
		$.getScript( baseUrl+"/themes/ph-dori/assets/plugins/summernote/dist/summernote.min.js", function( data, textStatus, jqxhr ) {
		  //console.log( data ); // Data returned
		  //console.log( textStatus ); // Success
		  //console.log( jqxhr.status ); // 200
		  //console.log( "Load was performed." );
		  
		  $(".btnEditAdv").hide();
		  $(elem).summernote({
				toolbar: [
					['style', ['bold', 'italic', 'underline', 'clear']],
					['color', ['color']],
					['para', ['ul', 'ol', 'paragraph']],
				]
			});
		});
	} else {
		$(".btnEditAdv").hide();
		$(elem).summernote({
				toolbar: [
					['style', ['bold', 'italic', 'underline', 'clear']],
					['color', ['color']],
					['para', ['ul', 'ol', 'paragraph']],
				]
		});
	}
}


/* *********************************
			ELEMENTS
********************************** */


function formatData(formData, collection,ctrl) { 
	
	formData.collection = collection;
	formData.key = ctrl;

	if(elementLocation){
		//formData.multiscopes = elementLocation;
		formData.address = centerLocation.address;
		formData.geo = centerLocation.geo;
		if( elementLocations.length ){
			formData.addresses = elementLocations;
			$.each( formData.addresses,function (i,v) { 
				delete v.geoPosition;
			});
		}
	}

	if( typeof formData.tags != "undefined" && formData.tags != "" )
		formData.tags = formData.tags.split(",");
	removeEmptyAttr(formData);

	console.dir(formData);
	return formData;
}

function saveElement ( formId,collection,ctrl,saveUrl ) 
{ 
	console.warn("saveElement",formId,collection);
	formData = $(formId).serializeFormJSON();
	formData = formatData(formData,collection,ctrl);
	$.ajax( {
    	type: "POST",
    	url: (saveUrl) ? saveUrl : baseUrl+"/"+moduleId+"/element/save",
    	data: formData,
    	dataType: "json",
    	success: function(data){
    		console.dir(data);
			if(data.result == false){
                toastr.error(data.msg);
           	}
            else { 
                toastr.success(data.msg);
                $('#ajax-modal').modal("hide");
                if(data.url)
                	loadByHash( data.url );
                else
	        		loadByHash( '#'+ctrl+'.detail.id.'+data.id )
            }
    	}
    });
}

function openForm (type, afterLoad ) { 
    console.warn("---------------"+type+" Form ---------------------");
    elementLocation = null;
    formType = type;
    specs = typeObj[type];
	if( specs.dynForm )
	{
		$("#ajax-modal").removeClass("bgEvent bgOrga bgProject bgPerson").addClass(specs.bgClass);
		$("#ajax-modal-modal-title").html("<i class='fa fa-refresh fa-spin'></i> Chargement en cours. Merci de patienter.");
		$(".modal-header").removeClass("bg-purple bg-green bg-orange bg-yellow").addClass(specs.titleClass);
	  	$("#ajax-modal-modal-body").html("<div class='row bg-white'>"+
	  										"<div class='col-sm-10 col-sm-offset-1'>"+
							              	"<div class='space20'></div>"+
							              	//"<h1 id='proposerloiFormLabel' >Faire une proposition</h1>"+
							              	"<form id='ajaxFormModal' enctype='multipart/form-data'></form>"+
							              	"</div>"+
							              "</div>");
	  	$('.modal-footer').hide();
	  	$('#ajax-modal').modal("show");
	  	afterLoad = ( notNull(afterLoad) ) ? afterLoad : null;
	  	buidDynForm(specs, afterLoad);
	} else if( specs.form.url ) {
		//charge le resultat d'une requete en Ajax
		getModal( { title : specs.form.title , icon : "fa-"+specs.icon } , specs.form.url );
	}else 
		toastr.error("Ce type ou ce formulaire n'est pas déclaré");
}

function buidDynForm(elementObj, afterLoad) { 
	if(userId)
	{
		var form = $.dynForm({
		      formId : "#ajax-modal-modal-body #ajaxFormModal",
		      formObj : elementObj.dynForm,
		      onLoad : function  () {
		        $("#ajax-modal-modal-title").html("<i class='fa fa-"+elementObj.dynForm.jsonSchema.icon+"'></i> "+elementObj.dynForm.jsonSchema.title);
		        $("#ajax-modal-modal-body").append("<div class='space20'></div>");
		        //alert(afterLoad+"|"+typeof elementObj.dynForm.jsonSchema.onLoads[afterLoad]);
		        if( notNull(afterLoad) && elementObj.dynForm.jsonSchema.onLoads 
		        	&& elementObj.dynForm.jsonSchema.onLoads[afterLoad] 
		        	&& typeof elementObj.dynForm.jsonSchema.onLoads[afterLoad] == "function" )
		        	elementObj.dynForm.jsonSchema.onLoads[ afterLoad]();
		        if( notNull(afterLoad) && elementObj.dynForm.jsonSchema.onLoads 
		        	&& elementObj.dynForm.jsonSchema.onLoads[afterLoad] 
		        	&& typeof elementObj.dynForm.jsonSchema.onLoads[afterLoad] == "function" )
		        	elementObj.dynForm.jsonSchema.onLoads.onload();
		        bindLBHLinks();
		      },
		      onSave : function(){

		      	if( elementObj.beforeSave && typeof elementObj.beforeSave == "function")
		        	elementObj.beforeSave();

		        if( elementObj.save )
		        	elementObj.save("#ajaxFormModal");
		        else if(elementObj.saveUrl)
		        	saveElement("#ajaxFormModal",elementObj.col,elementObj.ctrl,elementObj.saveUrl);
		        else
		        	saveElement("#ajaxFormModal",elementObj.col,elementObj.ctrl);

		        return false;
		    }
		});
		console.dir(form);
	} else 
		toastr.error('Vous devez etre loggué');
}

var contextData = null;
var typeObj = {
	"person" : {
		col : "citoyens" , 
		ctrl : "person",
		titleClass : "bg-yellow",
		bgClass : "bgPerson",
		dynForm : {
		    jsonSchema : {
			    title : "Inviter quelqu'un",
			    icon : "user",
			    type : "object",
			    properties : {
			    	info : {
		                "inputType" : "custom",
		                "html":"<p><i class='fa fa-info-circle'></i> Si tu veux créer un nouveau projet de façon à le rendre plus visible : c'est le bon endroit !!<br>Tu peux ainsi organiser l'équipe projet, planifier les tâches, échanger, prendre des décisions ...</p>",
		            },
			        name : {
			        	placeholder : "Nom",
			            "inputType" : "text",
			            "rules" : {
			                "required" : true
			            }
			        },
			        email : {
			        	placeholder : "Email",
			            "inputType" : "text",
			            "rules" : {
			                "required" : true
			            }
			        },
			        "preferences[publicFields]" : {
		                inputType : "hidden",
		                value : []
		            },
		            "preferences[privateFields]" : {
		                inputType : "hidden",
		                value : []
		            },
		            "preferences[isOpenData]" : {
		                inputType : "hidden",
		                value : false
		            },
			    }
			}
		}
	},
	"persons" : {col:"citoyens" , ctrl:"person"},
	"citoyen" : {col:"citoyens" , ctrl:"person"},
	"citoyens" : {col:"citoyens" , ctrl:"person"},
	"poi":{ 
		col:"poi",
		ctrl:"poi",
		dynForm : {
		    jsonSchema : {
			    title : "Point of interest Form",
			    icon : "map-marker",
			    type : "object",
			    onLoads : {
			    	//pour creer un subevnt depuis un event existant
			    	subPoi : function(){
			    		if(contextData.type && contextData.id ){
		    				$('#ajaxFormModal #parentId').val(contextData.id);
			    			$("#ajaxFormModal #parentType").val( contextData.type ); 
			    		}
			    		
			    	}
			    },
			    properties : {
			    	info : {
		                "inputType" : "custom",
		                "html":"<p><i class='fa fa-info-circle'></i> Un Point d'interet et un élément assez libre qui peut etre géolocalisé ou pas, qui peut etre rataché à une organisation, un projet ou un évènement.</p>",
		            },
			        name : {
			        	placeholder : "Nom",
			            "inputType" : "text",
			            "rules" : { "required" : true }
			        },
			        formshowers : {
		                "inputType" : "custom",
		                "html":"<a class='btn btn-xs btn-default' href='javascript:$(\".urlsarray\").slideToggle()'>+urls</a>",
		            },
		            urls : {
			        	placeholder : "url",
			            "inputType" : "array",
			            "value" : [],
			            init:function(){
			            	$(".urlsarray").addClass("hidden");	 
			            }
			        },
		            tags :{
		              "inputType" : "tags",
		              "placeholder" : "Tags ou Types de point d'interet",
		              "values" : tagsList
		            },
		            location : {
		                inputType : "location"
		            },
		            description : {
		                "inputType" : "wysiwyg",
	            		"placeholder" : "Décrire c'est partager"
		            },
		            parentId :{
		            	"inputType" : "hidden"
		            },
		            parentType : {
			            "inputType" : "hidden"
			        },
			    }
			}
		}
	},
	"organization" : { 
		col:"organizations", 
		ctrl:"organization", 
		icon : "group",
		titleClass : "bg-green",
		bgClass : "bgOrga",
		dynForm : {
		    jsonSchema : {
			    title : "Ajouter une Organisation",
			    icon : "group",
			    type : "object",
			    
			    properties : {
			    	info : {
		                "inputType" : "custom",
		                "html":"<p><i class='fa fa-info-circle'></i> Si tu veux créer un nouveau projet de façon à le rendre plus visible : c'est le bon endroit !!<br>Tu peux ainsi organiser l'équipe projet, planifier les tâches, échanger, prendre des décisions ...</p>",
		            },
			        name : {
			        	placeholder : "Nom",
			            "inputType" : "text",
			            "rules" : { "required" : true },
			            init : function(){
			            	$("#ajaxFormModal #name ").off().on("blur",function(){
			            		globalSearch($(this).val(),["organizations"]);
			            	});
			            }
			        },
			        similarLink : {
		                "inputType" : "custom",
		                "html":"<div id='similarLink'><div id='listSameName'></div></div>",
		            },
			        type :{
		            	"inputType" : "select",
		            	"placeholder" : "type select",
		            	"rules" : { "required" : true },
		            	"options" : organizationTypes
		            },
		            typeOrg :{
		            	"inputType" : "select",
		            	"placeholder" : "Quel est votre rôle dans cette organisation ?",
		            	value : "admin",
		            	"options" : {
		            		admin : "Administrateur",
							member : "Member",
							creator : "Just a citizen wanting to give visibility to it :)"
		            	}
		            },
		            location : {
		                inputType : "location"
		            },
		            formshowers : {
		                "inputType" : "custom",
		                "html":
						"<a class='btn btn-xs btn-azure text-dark w100p' href='javascript:$(\".emailtext,.tagstags,.descriptionwysiwyg,.urlsarray\").slideToggle()'>+ options</a>",
		            },
		            email : {
			        	placeholder : "Email du responsable",
			            "inputType" : "text",
			            init : function(){
			            	$(".emailtext").css("display","none");
			            }
			        },
			        tags :{
		              "inputType" : "tags",
		              "placeholder" : "Tags ou Types de l'organisation",
		              "values" : tagsList,
		              init:function(){
			            	$(".tagstags").css("display","none");	 
			            }
		            },
			        description : {
		                "inputType" : "wysiwyg",
	            		"placeholder" : "Décrire c'est partager",
			            init : function(){
			            	$(".descriptionwysiwyg").css("display","none");
			            }
		            },
		            urls : {
			        	placeholder : "url",
			            "inputType" : "array",
			            "value" : [],
			            init:function(){
			            	$(".urlsarray").css("display","none");	 
			            }
			        },
		            "preferences[publicFields]" : {
		                inputType : "hidden",
		                value : []
		            },
		            "preferences[privateFields]" : {
		                inputType : "hidden",
		                value : []
		            },
		            "preferences[isOpenData]" : {
		                inputType : "hidden",
		                value : true
		            },
		            "preferences[isOpenEdition]" : {
		                inputType : "hidden",
		                value : true
		            }
			    }
			}
		}
		/*form : {
			url : "/"+moduleId+"/organization/addorganizationform",
			title : "Ajouter une Organisation"
		}*/
	},

	"organizations" : {col:"organizations",ctrl:"organization"},
	"event" : {
		col:"events",
		ctrl:"event",
		icon : "calendar",
		titleClass : "bg-orange",
		bgClass : "bgEvent",
		dynForm : {
		    jsonSchema : {
			    title : "Ajouter un évènement",
			    icon : "calendar",
			    type : "object",
			    onLoads : {
			    	//pour creer un subevnt depuis un event existant
			    	"subEvent" : function(){
			    			    		
			    		if(contextData.type == "event"){
			    			$("#ajaxFormModal #parentId").removeClass('hidden');
			    		
		    				if( $('#ajaxFormModal #parentId > optgroup > option[value="'+contextData.id+'"]').length == 0 )
			    				$('#ajaxFormModal #parentId > optgroup[label="events"]').prepend('<option value="'+contextData.id+'" selected>Fait parti de : '+contextData.name+'</option>');
			    			else if ( contextData && contextData.id ){
				    			$("#ajaxFormModal #parentId").val( contextData.id );
			    			}
			    			
			    			if( contextData && contextData.type )
			    				$("#ajaxFormModal #parentType").val( contextData.type ); 


			    			//alert($("#ajaxFormModal #parentId").val() +" | "+$("#ajaxFormModal #parentType").val());
			    		}
			    		else {

				    		if( $('#ajaxFormModal #organizerId > optgroup > option[value="'+contextData.id+'"]').length == 0 )
			    				$('#ajaxFormModal #organizerId').prepend('<option data-type="'+contextData.type+'" value="'+contextData.id+'" selected>Organisé par : '+contextData.name+'</option>');
			    			else if( contextData && contextData.id )
				    			$("#ajaxFormModal #organizerId").val( contextData.id );
			    			if( contextData && contextData.type )
			    				$("#ajaxFormModal #organizerType").val( contextData.type );
			    			//alert($("#ajaxFormModal #organizerId").val() +" | "+$("#ajaxFormModal #organizerType").val());
			    		}
			    	}
			    },
			    properties : {
			    	info : {
		                "inputType" : "custom",
		                "html":"<p><i class='fa fa-info-circle'></i> Si tu veux créer une nouvelle organisation de façon à le rendre plus visible : c'est le bon endroit !!<br>Tu peux ainsi organiser l'équipe ou les membres de l'organisation , planifier des évènements, des projets, partager vos actions...</p>",
		            },
		            name : {
			        	placeholder : "Nom",
			            "inputType" : "text",
			            "rules" : {
			                "required" : true
			            },
			            init : function(){
			            	$("#ajaxFormModal #name ").off().on("blur",function(){
			            		globalSearch($(this).val(),["events"]);
			            	});
			            }
			        },
			        similarLink : {
		                "inputType" : "custom",
		                "html":"<div id='similarLink'><div id='listSameName'></div></div>",
		            },
			        organizerId :{
		            	"inputType" : "select",
		            	"placeholder" : "Qui organise ?",
		            	"options" : firstOptions(),
		            	"groupOptions" : myAdminList( ["organizations","projects"] ),
			            init : function(){
			            	$("#ajaxFormModal #organizer ").off().on("change",function(){
			            		
			            		organizerId = $(this).val();
			            		if(organizerId == "dontKnow" )
			            			organizerType = "dontKnow";
			            		else if( $('#organizer').find(':selected').data('type') && typeObj[$('#organizer').find(':selected').data('type')] )
			            			organizerType = typeObj[$('#organizer').find(':selected').data('type')].ctrl;
			            		else
			            			organizerType = "person";

			            		console.warn( organizerId+" | "+organizerType );
			            		$("#ajaxFormModal #organizerType ").val(organizerType);
			            	});
			            }
		            },
			        organizerType : {
			            "inputType" : "hidden"
			        },
			        parentId :{
		            	"inputType" : "select",
		            	"class" : "hidden",
		            	"placeholder" : "Fait parti d'un évènement ?",
		            	"options" : {
		            		"":"Pas de Parent"
		            	},
		            	"groupOptions" : myAdminList( ["events"] )
		            },
		            parentType : {
			            "inputType" : "hidden"
			        },
			        type :{
		            	"inputType" : "select",
		            	"placeholder" : "Type d\'évènnment",
		            	"options" : eventTypes
		            },

		            /*allday : {
		            	"inputType" : "checkbox",
		            	"switch" : {
		            		"onText" : "Oui",
		            		"offText" : "Non",
		            		"labelText":"Journée",
		            		//"onChange" : function(){}
		            	}
		            },*/
		            startDate : {
		                "inputType" : "datetime",
		                "placeholder":"Date de début",
			            "rules" : { "required" : true }
		            },
		            endDate : {
		                "inputType" : "datetime",
		                "placeholder":"Date de fin",
			            "rules" : { "required" : true }
		            },
		            public : {
		            	"inputType" : "checkbox",
		            	"switch" : {
		            		"onText" : "Privé",
		            		"offText" : "Public",
		            		"labelText":"Type"
		            	}
		            },
		            location : {
		                inputType : "location"
		            },
		            formshowers : {
		                "inputType" : "custom",
		                "html":"<a class='btn btn-xs btn-azure  text-dark w100p' href='javascript:$(\".tagstags,.descriptionwysiwyg,.urlsarray\").slideToggle()'>+ options</a>",
		            },
			        tags :{
		              "inputType" : "tags",
		              "placeholder" : "Tags ou Types de l'organisation",
		              "values" : tagsList,
		              init:function(){
			            	$(".tagstags").css("display","none");	 
			            }
		            },
			        description : {
		                "inputType" : "wysiwyg",
	            		"placeholder" : "Décrire c'est partager",
			            init : function(){
			            	$(".descriptionwysiwyg").css("display","none");
			            }
		            },
		            urls : {
			        	placeholder : "url",
			            "inputType" : "array",
			            "value" : [],
			            init:function(){
			            	$(".urlsarray").css("display","none");	 
			            }
			        },
		            "preferences[publicFields]" : {
		                inputType : "hidden",
		                value : []
		            },
		            "preferences[privateFields]" : {
		                inputType : "hidden",
		                value : []
		            },
		            "preferences[isOpenData]" : {
		                inputType : "hidden",
		                value : true
		            },
		            "preferences[isOpenEdition]" : {
		                inputType : "hidden",
		                value : true
		            }
			    }
			}
		}
		/*form : {
			url:"/"+moduleId+"/event/eventsv",
			title : "Ajouter un évènement"
		}*/
	},
	"events" : {col:"events",ctrl:"event"},
	"projects" : {col:"projects",ctrl:"project"},
	"project" : {
		col:"projects",
		ctrl:"project",
		icon : "lightbulb-o",
		titleClass : "bg-purple",
		bgClass : "bgProject",
		dynForm : {
		    jsonSchema : {
			    title : "Ajouter un Projet",
			    icon : "lightbulb-o",
			    type : "object",
			    properties : {
			    	info : {
		                "inputType" : "custom",
		                "html":"<p><i class='fa fa-info-circle'></i> Si tu veux créer un nouveau projet de façon à le rendre plus visible : c'est le bon endroit !!<br>Tu peux ainsi organiser l'équipe projet, planifier les tâches, échanger, prendre des décisions ...</p>",
		            },
			        name : {
			        	placeholder : "Nom",
			            "inputType" : "text",
			            "rules" : {
			                "required" : true
			            },
			            init : function(){
			            	$("#ajaxFormModal #name ").off().on("blur",function(){
			            		globalSearch($(this).val(),["projects"]);
			            	});
			            }
			        },
			        similarLink : {
		                "inputType" : "custom",
		                "html":"<div id='similarLink'><div id='listSameName'></div></div><div id='space20'></div>",
		            },
		            location : {
		                inputType : "location"
		            },
		            formshowers : {
		                "inputType" : "custom",
		                "html":"<a class='btn btn-xs btn-azure  text-dark w100p' href='javascript:$(\".tagstags,.descriptionwysiwyg,.urlsarray\").slideToggle()'>+ options</a>",
		            },
			        tags :{
		              "inputType" : "tags",
		              "placeholder" : "Tags ou Types de l'organisation",
		              "values" : tagsList,
		              init:function(){
			            	$(".tagstags").css("display","none");	 
			            }
		            },
			        description : {
		                "inputType" : "wysiwyg",
	            		"placeholder" : "Décrire c'est partager",
			            init : function(){
			            	$(".descriptionwysiwyg").css("display","none");
			            }
		            },
		            urls : {
			        	placeholder : "url",
			            "inputType" : "array",
			            "value" : [],
			            init:function(){
			            	$(".urlsarray").css("display","none");	 
			            }
			        },
		            "preferences[publicFields]" : {
		                inputType : "hidden",
		                value : []
		            },
		            "preferences[privateFields]" : {
		                inputType : "hidden",
		                value : []
		            },
		            "preferences[isOpenData]" : {
		                inputType : "hidden",
		                value : true
		            },
		            "preferences[isOpenEdition]" : {
		                inputType : "hidden",
		                value : true
		            }
			    }
			}
		}
	},
	"city" : {col:"cities",ctrl:"city"},
	"cities" : {col:"cities",ctrl:"city"},
	"entry" : {
		col:"surveys",
		ctrl:"survey",
		titleClass : "bg-lightblue",
		bgClass : "bgDDA",
		icon : "gavel",
		saveUrl : baseUrl+"/" + moduleId + "/survey/saveSession",
		dynForm : {
		    jsonSchema : {
			    title : "Ajouter un débat",
			    icon : "gavel",
			    type : "object",
			    properties : {
			    	info : {
		                "inputType" : "custom",
		                "html":"<p><i class='fa fa-info-circle'></i> Un débat sert à discuter et demander l'avis d'une communauté sur une idée ou une question donnée</p>",
		            },
			        id :{
		              "inputType" : "hidden",
		              "value" : ""
		            },
		            type :{
		              "inputType" : "hidden",
		              "value" : "<?php echo Survey::TYPE_ENTRY?>"
		            },
		            survey :{
		            	inputType : "select",
		            	placeholder : "Choisir une thématique ?",
		            	init : function(){
		            		if( userId )
		            		{
		            			/*filling the seclect*/
			            		if(notNull(window.myVotesList)){
			            			html = buildSelectGroupOptions( window.myVotesList);
			            			$("#survey").append(html); 
			            		} else {
			            			getAjax( null , baseUrl+"/" + moduleId + "/rooms/index/type/citoyens/id/"+userId+"/view/data/fields/votes" , function(data){
			            			    window.myVotesList = {};
			            			    $.each( data.votes , function( k,v ) 
			            			    { 
				            			    if(!window.myVotesList[ v.parentType]){
				            			    	var label = ( v.parentType == "cities" && cpCommunexion && v.parentId.indexOf(cpCommunexion) ) ? cityNameCommunexion : v.parentType;
				            			    	window.myVotesList[ v.parentType] = {"label":label};
				            			    	window.myVotesList[ v.parentType].options = {}
				            			    }
			            			    	window.myVotesList[ v.parentType].options[v['_id']['$id'] ] = v.name; 
			            			    }); 
			            			    console.dir(window.myVotesList);
			            			    html = buildSelectGroupOptions(window.myVotesList);
										$("#survey").append(html);
								    } );
			            		}
			            		/*$("#survey").change(function() { 
			            			console.dir( $(this).val().split("_"));
			            		});*/

		            		}
		            	},
		            	custom : "<br/><span class='text-small'>Vous pouvez créer des thématiques <a href='javascript:toastr.info(\"todo:open create room form\")' class='lbh btn btn-xs'> ici </a> </span>"
		            },
		            name :{
		              "inputType" : "text",
		              "placeholder" : "Titre de la proposition",
		              "rules" : { "required" : true }
		            },
		            message :{
		              "inputType" : "wysiwyg",
		              "placeholder" : "Texte de la proposition",
		              "rules" : { "required" : true }
		            },
		            dateEnd :{
		              "inputType" : "date",
		              "placeholder" : "Fin de la période de vote",
		              "rules" : { "required" : true }
		            },
		            formshowers : {
		                "inputType" : "custom",
		                "html":"<a class='btn btn-xs btn-azure  text-dark w100p' href='javascript:$(\".tagstags,.urlsarray\").slideToggle()'>+ options</a>",
		            },
		            urls : {
		                "inputType" : "array",
		                "placeholder" : "url, informations supplémentaires, actions à faire, etc",
		                "value" : [],
		                init:function(){
			            	$(".urlsarray").css("display","none");	 
			            }
		            },
		            /*"image" : {
		                  "inputType" : "image",
		                  "contextType": "<?php echo (isset($parentType)) ? $parentType : '' ?>",
		                  "contextId": "<?php echo (isset($parentId)) ? $parentId : '' ?>",
		                  //"placeholder" : "url, informations supplémentaires, actions à faire, etc",
		                  "value" : <?php echo (isset($survey) && isset($survey['pathImage'])) ? json_encode($survey['pathImage']) : '""' ?>
		            },*/
		            tags :{
		                "inputType" : "tags",
		                "placeholder" : "Tags",
		                "values" : tagsList,
		                init:function(){
			            	$(".tagstags").css("display","none");	 
			            }
		            },
		            email:{
		            	inputType : "hidden",
		            	value : (userId) ? userConnected.email : ""
		            },
		            organizer:{
		            	inputType : "hidden",
		            	value : "currentUser"
		            },
		            "type" : {
		            	inputType : "hidden",
		            	value : "entry"
		            },
			    }
			}
		}
	},
	"vote" : {col:"actionRooms",ctrl:"survey"},
	"action" : {
		col:"actions",
		ctrl:"room",
		titleClass : "bg-lightblue2",
		bgClass : "bgDDA",
		icon : "cogs",
		saveUrl : baseUrl+"/" + moduleId + "/rooms/saveaction",
		dynForm : {
		    jsonSchema : {
			    title : "Ajouter une action",
			    icon : "gavel",
			    type : "object",
			    properties : {
			    	info : {
		                "inputType" : "custom",
		                "html":"<p><i class='fa fa-info-circle'></i> Une Action permet de faire avancer votre projet ou le fonctionnement de votre association</p>",
		            },
			        id :{
		              "inputType" : "hidden",
		              "value" : ""
		            },
		            type :{
		              "inputType" : "hidden",
		              "value" : "<?php echo Survey::TYPE_ENTRY?>"
		            },
		            room :{
		            	inputType : "select",
		            	placeholder : "Choisir une thématique ?",
		            	init : function(){
		            		if( userId )
		            		{
		            			/*filling the seclect*/
			            		if(notNull(window.myActionsList)){
			            			html = buildSelectGroupOptions( window.myActionsList);
			            			$("#room").append(html); 
			            		} else {
			            			getAjax( null , baseUrl+"/" + moduleId + "/rooms/index/type/citoyens/id/"+userId+"/view/data/fields/actions" , function(data){
			            			    window.myActionsList = {};
			            			    $.each( data.actions , function( k,v ) 
			            			    { console.log(v.parentType,v.parentId);
			            			    	if(v.parentType){
					            			    if( !window.myActionsList[ v.parentType] ){
					            			    	var label = ( v.parentType == "cities" && cpCommunexion && v.parentId.indexOf(cpCommunexion) ) ? cityNameCommunexion : v.parentType;
					            			    	window.myActionsList[ v.parentType] = {"label":label};
					            			    	window.myActionsList[ v.parentType].options = {};
					            			    }
				            			    	window.myActionsList[ v.parentType].options[v['_id']['$id'] ] = v.name; 
				            			    }
			            			    }); 
			            			    console.dir(window.myActionsList);
			            			    html = buildSelectGroupOptions(window.myActionsList);
										$("#room").append(html);
								    } );
			            		}

		            		}
		            	},

		            	custom : "<br/><span class='text-small'>Vous pouvez créer des thématiques <a href='javascript:toastr.info(\"todo:open create room form\")' class='lbh btn btn-xs'> ici </a> </span>"
		            },
		            name :{
		              "inputType" : "text",
		              "placeholder" : "Titre de la l'action",
		              "rules" : { "required" : true }
		            },
		            message :{
		              "inputType" : "wysiwyg",
		              "placeholder" : "Description de l'action'",
		              "rules" : { "required" : true }
		            },
		            startDate :{
		              "inputType" : "date",
		              "placeholder" : "Date de début"
		            },
		            dateEnd :{
		              "inputType" : "date",
		              "placeholder" : "Date de fin"
		            },
		            formshowers : {
		                "inputType" : "custom",
		                "html":"<a class='btn btn-xs btn-azure  text-dark w100p' href='javascript:$(\".tagstags,.urlsarray\").slideToggle()'>+ options</a>",
		            },
		            urls : {
		                "inputType" : "array",
		                "placeholder" : "url, informations supplémentaires, actions à faire, etc",
		                "value" : [],
		                init:function(){
			            	$(".urlsarray").css("display","none");	 
			            }
		            },
		            /*"image" : {
		                  "inputType" : "image",
		                  "contextType": "<?php echo (isset($parentType)) ? $parentType : '' ?>",
		                  "contextId": "<?php echo (isset($parentId)) ? $parentId : '' ?>",
		                  //"placeholder" : "url, informations supplémentaires, actions à faire, etc",
		                  "value" : <?php echo (isset($survey) && isset($survey['pathImage'])) ? json_encode($survey['pathImage']) : '""' ?>
		            },*/
		            tags :{
		                "inputType" : "tags",
		                "placeholder" : "Tags",
		                "values" : tagsList,
		                init:function(){
			            	$(".tagstags").css("display","none");	 
			            }
		            },
		            email:{
		            	inputType : "hidden",
		            	value : (userId) ? userConnected.email : ""
		            },
		            organizer:{
		            	inputType : "hidden",
		            	value : "currentUser"
		            },
		            "type" : {
		            	inputType : "hidden",
		            	value : "action"
		            },
			    }
			}
		}
	},
	"actions" : {col:"actions",ctrl:"room"},
	"discuss" : {col:"actionRooms",ctrl:"room"},
	"all":{ 
		//col:"poi",
		//ctrl:"poi",
		dynForm : {
		    jsonSchema : {
			    title : "All possible inputs",
			    icon : "map-marker",
			    type : "object",
			    properties : {
			    	info : {
		                "inputType" : "custom",
		                "html":"<p><i class='fa fa-info-circle'></i> Un Point d'interet et un élément assez libre qui peut etre géolocalisé ou pas, qui peut etre rataché à une organisation, un projet ou un évènement.</p>",
		            },
			        name : {
			        	placeholder : "Nom",
			            "inputType" : "text",
			            "rules" : {
			                "required" : true
			            }
			        },
			        description : {
		                "inputType" : "wysiwyg",
	            		"placeholder" : "Décrire c'est partager"
		            },
			        location : {
		                inputType : "location"
		            },
		            tags :{
		              "inputType" : "tags",
		              "placeholder" : "Tags",
		              "values" : tagsList
		            },
		            urls : {
			        	placeholder : "url",
			            "inputType" : "array",
			            "value" : [],
			            init:function(){
			            	$(".urlsarray").addClass("hidden");	 
			            }
			        },
			        select :{
		            	"inputType" : "select",
		            	"placeholder" : "type select",
		            	"options" : {
		            		"person":"Person",
		            		"organization":"Organisation",
	                    	"event":"Event",
	                    	"project":"Project"
		            	}
		            },
		            selectMultiple :{
		            	"inputType" : "selectMultiple",
		            	"placeholder" : "Thematique",
		            	"options" : {
		            		"sport":"Sport",
	                    	"agriculture":"Agricutlture",
	                    	"culture":"Culture",
	                    	"urbanisme":"Urbanisme",
		            	}
		            },

		            date : {
		                "inputType" : "date",
		                "icon" : "fa fa-calendar",
		                "placeholder":"Input Type Date"
		            },

		            daterange : {
		                "inputType" : "daterange",
		                "icon" : "fa fa-clock-o",
		                "placeholder":"Input Type daterange"
		            },
		            properties : {
		                "inputType" : "properties",
		                "placeholder" : "Key",
		                "placeholder2" : "Value",
		                "value":[]
		            },
			    }
			}
		}
	},
};
/*{
"organization" : {
	"label" : "Organisations",
	"options" : {
		xxxxx : "Cococ",
		yyy : "Kiki",
		tttt : "Xxoxoxoxo"
	}
},
"project" : {
	"label" : "Projets",
	"options" : {
		xxxxx : "Cococ",
		yyy : "Kiki",
		tttt : "Xxoxoxoxo"
	}
}, 
"person" : {
	"label" : "Personnes",
	"options" : {
		xxxxx : "Cococ",
		yyy : "Kiki",
		tttt : "Xxoxoxoxo"
	}
}*/
function  firstOptions() { 
	var res = {
		"dontKnow":"Je ne sais pas",
	};
	res[userId] = "Moi";
	return res;
 }

function myAdminList (ctypes) { 
	var myList = {};
	if(userId){
		//types in MyContacts
		var connectionTypes = {
			organizations : "members",
			projects : "contributors",
			events : "attendees"
		};
		$.each( ctypes, function(i,ctype) {
			var connectionType = connectionTypes[ctype];
			myList[ ctype ] = { label: ctype, options:{} };
			$.each( myContacts[ ctype ],function(id,elemObj){
				//console.log(ctype+"-"+id+"-"+elemObj.name);
				if( notNull(elemObj.links) && notNull(elemObj.links[connectionType]) && notNull(elemObj.links[connectionType][userId]) && notNull(elemObj.links[connectionType][userId].isAdmin) ){
					//console.warn(ctype+"-"+id+"-"+elemObj.name);
					myList[ ctype ]["options"][ elemObj["_id"]["$id"] ] = elemObj.name;
				}
			});
		});
		console.dir(myList);
	}
	return myList;
}

function globalSearch(searchValue,types){
	
	searchType = (types) ? types : ["organizations", "projects", "events", "needs"];

	var data = { 	 
		"name" : searchValue,
		// "locality" : "", a otpimiser en utilisant la localité 
		"searchType" : searchType,
		"indexMin" : 0,
		"indexMax" : 50
	};
	$("#listSameName").html("<i class='fa fa-spin fa-circle-o-notch'></i> Vérification d'existence");
	$("#similarLink").show();
	$.ajax({
      type: "POST",
          url: baseUrl+"/" + moduleId + "/search/globalautocomplete",
          data: data,
          dataType: "json",
          error: function (data){
             console.log("error"); console.dir(data);
          },
          success: function(data){
            var str = "";
 			var compt = 0;

 			$.each(data, function(id, elem) {
  				console.log(elem);
  				city = "";
				postalCode = "";
				var htmlIco ="<i class='fa fa-users fa-2x'></i>";
				if(elem.type){
					typeIco = elem.type;
					htmlIco ="<i class='fa "+mapIconTop[elem.type] +" fa-2x'></i>";
					}
					if (elem.address != null) {
						city = (elem.address.addressLocality) ? elem.address.addressLocality : "";
						postalCode = (elem.address.postalCode) ? elem.address.postalCode : "";
					}
					if("undefined" != typeof elem.profilImageUrl && elem.profilImageUrl != ""){
						var htmlIco= "<img width='30' height='30' alt='image' class='img-circle' src='"+baseUrl+elem.profilThumbImageUrl+"'/>";
					}
					str += 	"<div class='padding-5 col-sm-6 col-xs-12 light-border'>"+
								"<a href='#' data-id='"+ elem.id +"' data-type='"+ typeIco +"'>"+
								"<span>"+ htmlIco +"</span>  " + elem.name+' ('+postalCode+" "+city+")"+
								"</a></div>";
					compt++;
  				//str += "<li class='li-dropdown-scope'><a href='javascript:initAddMeAsMemberOrganizationForm(\""+key+"\")'><i class='fa "+mapIconTop[value.type]+"'></i> " + value.name + "</a></li>";
  			});
			
			if (compt > 0) {
				$("#listSameName").html("<div class='col-sm-12 light-border text-red'> <i class='fa fa-eye'></i> Verifiez si cette organisation n'existe pas deja : </div>"+str);
			} else {
				$("#listSameName").html("<span class='txt-green'><i class='fa fa-thumbs-up text-green'></i> Aucun élément avec ce nom.</span>");
			}

			
          }
 	});

	
}
var elementLocation = null;
var centerLocation = null;
var elementLocations = [];
var countLocation = 0;
function copyMapForm2Dynform() { 
	//if(!elementLocation)
	//	elementLocation = [];
	elementLocation = {
		address : {
			"@type" : "PostalAddress",
			addressCountry : $("[name='newElement_country']").val(),
			streetAddress : $("[name='newElement_streetAddress']").val(),
			addressLocality : $("[name='newElement_city']").val(),
			postalCode : $("[name='newElement_cp']").val(),
			codeInsee : $("[name='newElement_insee']").val()
		},
		geo : {
			"@type" : "GeoCoordinates",
			latitude : $("[name='newElement_lat']").val(),
			longitude : $("[name='newElement_lng']").val()
		},
		geoPosition : {
			"@type" : "Point",
			"coordinates" : [ $("[name='newElement_lng']").val(), $("[name='newElement_lat']").val() ]
		}
	};
	elementLocations.push(elementLocation);
	if(!centerLocation){
		centerLocation = elementLocation;
		elementLocation.center = true;
	}
	console.dir(elementLocations);
	//elementLocation.push(positionObj);
}

function addLocationToForm()
{
	console.dir(elementLocation);
	var strHTML = "";
	if( elementLocation.address.addressCountry)
		strHTML += elementLocation.address.addressCountry;
	if( elementLocation.address.postalCode)
		strHTML += " ,"+elementLocation.address.postalCode;
	if( elementLocation.address.addressLocality)
		strHTML += " ,"+elementLocation.address.addressLocality;
	if( elementLocation.streetAddress)
		strHTML += " ,"+elementLocation.address.streetAddress;
	var btnSuccess = "";
	var locCenter = "";
	if( countLocation == 0){
		btnSuccess = "btn-success";
		locCenter = "<span class='lblcentre'>(localité centrale)</span>";
	}
	
	strHTML = "<a href='javascript:removeLocation("+countLocation+")' class=' locationEl"+countLocation+" btn'> <i class='text-red fa fa-times'></i></a>"+
			  " <a class='locationEl"+countLocation+" locel' href=''>"+strHTML+"</a> "+
			  "<a href='javascript:setAsCenter("+countLocation+")' class='centers center"+countLocation+" locationEl"+countLocation+" btn btn-xs "+btnSuccess+"'> <i class='fa fa-map-marker'></i>"+locCenter+"</a> <br/>";
	$(".locationlocation").prepend(strHTML);
	countLocation++;
}

function removeLocation(ix){
	elementLocation = null;
	elementLocations.splice(ix,1);
	//TODO check if this center then apply on first
	$(".locationEl"+countLocation).remove();
}

function setAsCenter(ix){

	$(".centers").removeClass('btn-success');
	$(".lblcentre").remove();
	$.each(elementLocations,function(i, v) { 
		if( v.center)
			delete v.center;
	})
	$(".centers").removeClass('btn-success');
	$(".center"+ix).addClass('btn-success').append(" <span class='lblcentre'>(localité centrale)</span>");
	centerLocation = elementLocations[ix];
	elementLocations[ix].center = true;
}
function myContactLabel (type,id) { 
	if(myContacts && myContacts[type]){
		$.each( myContacts[type], function( key,val ){
			if( id == val["_id"]["$id"] ){
				return val;
			}
		});
	}
	return null;
}
/*
elementJson = {
    //reuired
    "name" : "",
    "email" : "",
    "creator" :"" ,

    "url":"",
    "shortDescription" : "",	
	"description" : "",

	"address" : {
        "@type" : "PostalAddress",
        "codeInsee" : "",
        "addressCountry" : "",
        "postalCode" : "",
        "addressLocality" : "",
        "streetAddress" : ""
    },
    "geo" : {
        "@type" : "GeoCoordinates",
        "latitude" : "-21",
        "longitude" : "55"
    },
    "geoPosition" : {
        "type" : "Point",
        "coordinates" : [ 55,  -21]
    },

    "tags" : [],
    "scopes" : [],

    "profilImageUrl" : "",
    "profilThumbImageUrl" : "",
    "profilMarkerImageUrl" : "",
    "profilMediumImageUrl" : "",

    "isOpenData":"",

    //generated
    "updated" :"" ,
    "modified" :"" ,
    "created" :"",
    
}

organizationJson = {
	"telephone":"",
    "mobile":"",
    "fixe":"",
    "fax":"",
    "type":"",
}

eventJson = {
    "type" : "",
    "allDay" : true,
    "public" : true,
    "startDate" : "",
    "endDate" : "",
}

var projectJson = {
    "startDate" : "",
    "endDate" :"" 
}

*/

function shadowOnHeader() {
	var y = $(".my-main-container").scrollTop(); 
    if (y > 0) {  $('.main-top-menu').addClass('shadow'); }
    else { $('.main-top-menu').removeClass('shadow'); }
}
