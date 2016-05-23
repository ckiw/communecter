<?php if($contextType == "actionRooms"){ ?>
<style type="text/css">
.assemblyHeadSection {  
  background-image:url(<?php echo $this->module->assetsUrl; ?>/images/Discussion.jpg); 
  /*background-image: url(/ph/assets/449afa38/images/city/cityDefaultHead_BW.jpg);*/
  background-color: #fff;
  background-repeat: no-repeat;
  background-position: 0px -40px;
  background-size: 100% auto;
}

h1.citizenAssembly-header{
background-color: rgba(255, 255, 255, 0.63);
padding: 30px;
padding-top: 0px;
margin-bottom: -3px;
font-size: 37px;
margin-top:90px;
}

#thumb-profil-parent{
	margin-top:-60px;
	margin-bottom:20px;
	-moz-box-shadow: 0px 3px 10px 1px #656565;
	-webkit-box-shadow: 0px 3px 10px 1px #656565;
	-o-box-shadow: 0px 3px 10px 1px #656565;
	box-shadow: 0px 3px 10px 1px #656565;
}
#commentHistory .panel-heading{
	/*padding:15px !important;*/
}
</style>

<?php 
	Menu::comments( $parentType, $parentId );
	$this->renderPartial('../default/panels/toolbar');

}

?>



<?php if($contextType == "actionRooms"){ ?>

	<!-- start: LOGIN BOX -->
<div class="center">
	
	<br/>
	
<?php 
	//ca sert a quoi ce doublon ?
	$nameParentTitle = "";
	if($parentType == Organization::COLLECTION && isset($parentId)){
		$orga = Organization::getById($parentId);
		$nameParentTitle = $orga["name"];
	}

?>
 	<div>
     
 		<h1 class="homestead text-dark center citizenAssembly-header">

		  
		 <?php $this->renderPartial('../rooms/header',array(    
					                "parent" => $parent, 
					                "parentId" => $parentId, 
					                "parentType" => $parentType, 
					                "fromView" => "comment.index",
					                "faTitle" => "comments",
					                "colorTitle" => "azure",
					                "textTitle" => Yii::t("rooms","Discussions", null, Yii::app()->controller->module->id)
					                )); ?>

		</h1>

    </div>
 </div>

<?php } ?>

<?php
	//$canComment = (isset($parentId) && isset($parentType) && isset(Yii::app()->session["userId"])
	//		&& Authorisation::canParticipate(Yii::app()->session["userId"], $parentType, $parentId));

	$this->renderPartial("../comment/commentPod", array("comments"=>$comments,
											 "communitySelectedComments"=>$communitySelectedComments,
											 "abusedComments"=>$abusedComments,
											 "options"=>$options,
											 "canComment"=>$canComment,
											 "parentType"=>$parentType,
											 "contextType"=>$contextType,
											 "nbComment"=>$nbComment,
											 "canComment" => $canComment,
											 "context"=>$context));
?>

<script type="text/javascript">

var latestComments = <?php echo time(); ?>;
jQuery(document).ready(function() {
	
	<?php if($contextType == "actionRooms"){ ?>
  		$(".moduleLabel").html("<i class='fa fa-comments'></i> <?php echo Yii::t("rooms","Discussion", null, Yii::app()->controller->module->id); ?>");
		$(".main-col-search").addClass("assemblyHeadSection");
  	<?php } ?>

});

function checkCommentCount(){ 
		console.log("check if new comments exist since",latestComments);
		//show refresh button
		$.ajax({
        type: "POST",
        url: baseUrl+'/'+moduleId+"/comment/countcommentsfrom",
        data: {
        	"from" : latestComments,
        	"type" : contextType,
        	"id" : "<?php echo (string)$context["_id"]; ?>"
        },
        dataType: "json",
        success: function(data){
          if(data.count>0){
          	console.log("you have new comments", data.count);
          	
          	$(".refreshComments").removeClass('hide')
          	$(".refreshComments").html("<i class='fa fa-refresh'></i> "+data.count+" <?php echo Yii::t( "comment", 'New Comment(s) Click to Refresh', Yii::app()->controller->module->id)?> ");
          } else {
          	console.log("nothing new");
          }
          if(userId){
	        //checkCommentCount();
	    	}
        }
    });
}
</script>