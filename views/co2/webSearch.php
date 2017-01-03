
<button class="btn btn-default menu-btn-back-category btn-second margin-bottom-5" id="btn-new-search">
	<i class="fa fa-undo"></i> Nouvelle recherche
</button>

<?php if(sizeof($siteurls) == 0){ ?>
	<a class="btn btn-default btn-success margin-bottom-5 lbh" href="#co2.referencement">
		<i class="fa fa-plus-circle"></i> Ajouter une URL
	</a><br>

	<span>
		<small><b>
		Le site que vous recherchez n'est pas référencé ?<br> 
		Ajoutez le <span class="letter-green">gratuitement</span> dans la base de données, et faites-en profiter tout le monde !
		</b></small>
	</span>
<?php } ?>

<hr>

<h3 id="titleWebSearch" class="margin-bottom-20">
	<?php echo @$category ? " <small class=''><i class='fa fa-cube'></i> ".@$category."</small><br>" : ""; ?>
	<i class="fa fa-angle-down"></i> 
	<?php echo sizeof($siteurls) > 0 ? sizeof($siteurls) : "aucun"; ?> 
	résultat<?php echo sizeof($siteurls) > 1 ? "s" : ""; ?>
</h3>

	

<style>
	.siteurl_title{
		font-size:17px!important;
	}
	.siteurl_hostname{
		font-size:14px!important;
	}
	.siteurl_desc{
		font-size:13px!important;
		color:#606060;
	}
</style>

<div class="col-md-10 margin-bottom-15" style="">
<?php  foreach ($siteurls as $key => $siteurl) { ?>
	<div class="col-md-12 margin-bottom-15">
		
		<a class="siteurl_title letter-blue" target="_blank" href="<?php echo $siteurl["url"]; ?>">
			<?php echo $siteurl["title"]; ?>
		</a><br>
		<span class="siteurl_hostname letter-green"><?php echo $siteurl["url"]; ?></span><br>

		<?php if(@$siteurl["description"]){ ?>
		<span class="siteurl_desc letter-grey"><?php echo @$siteurl["description"]; ?></span><br>
		<?php } ?>

		<span class="siteurl_desc letter-grey hidden">
			<b><?php //if(!empty($siteurl["categories"])) foreach ($siteurl["categories"] as $key => $category) { ?>
			<?php //echo $category; ?>  
			<?php //} ?>
			</b> 
			<b>
				<?php //if(!empty($siteurl["tags"])) foreach ($siteurl["tags"] as $key2 => $tag) { ?>
					<?php //echo $tag; ?> 
				<?php //} ?>
			</b>
		</span>

		<?php if( Role::isSuperAdmin(Role::getRolesUserId(Yii::app()->session["userId"]) ) ) { ?>
		<button class="btn btn-xs btn-edit-url" data-target="#modalEditUrl" data-toggle="modal" data-idurl="<?php echo $key; ?>">
			<i class="fa fa-cog"></i> Editer
		</button> 
		<?php } ?>
		<br>
	</div>
<?php } ?>
</div>


<?php if(sizeof($siteurls) < 3){ 

	$searchG = str_replace(" ", "+", $search);
?>
<div class="col-md-12" style="">
	<hr>
	<h5>
		<a href="https://www.google.com/search?q=<?php echo $searchG; ?>" target="_blank">
			<i class="fa fa-fw fa-angle-right"></i> continuer la recherche sur 
	    	<img src="<?php echo Yii::app()->theme->baseUrl; ?>/assets/img/google.png" height=50>
    	</a>
	</h5>
</div>
<?php } ?>

<?php if(sizeof($siteurls) >= 1){ ?>
<div class="col-md-12 margin-bottom-15" style="">
	<hr>
	<span>
		<small><b>
		Le site que vous recherchez n'est pas référencé ?<br> 
		Ajoutez le <span class="letter-green">gratuitement</span> dans la base de données, et faites-en profiter tout le monde !
		</b></small>
	</span><br><br>
	<a class="btn btn-default btn-success margin-bottom-5 lbh" href="#co2.referencement">
		<i class="fa fa-plus-circle"></i> Ajouter une URL
	</a>
</div>
<?php } ?>

<script>
  
var siteurls = <?php echo json_encode($siteurls); ?>;

jQuery(document).ready(function() { 
   Sig.showMapElements(Sig.map, siteurls);
   		
   $(".siteurl_title").click(function(){
   		var url = $(this).attr("href");
   		incNbClick(url);
   });

   $(".btn-edit-url").click(function(){ console.log("siteurls", siteurls);
   		var id = $(this).data("idurl");
   		var site = siteurls[id];
   		$("#form-idurl").val(id);
	    $("#form-url").val(site.url);
	    $("#form-title").val(site.title);
	    $("#form-description").val(site.description);

	    if(typeof site.tags != "undefined"){
		    $("#form-keywords1").val(site.tags[0]);
		    $("#form-keywords2").val(site.tags[1]);
		    $("#form-keywords3").val(site.tags[2]);
		    $("#form-keywords4").val(site.tags[3]);
		}

	    $("#form-status").val(site.status);

	    $(".portfolio-item").removeClass("selected");
	    categoriesSelected = new Array();
	    $.each(site.categories, function(key, val){
	    	$(".portfolio-item.cat-"+val).addClass("selected");
	    	console.log("cat", val);
	    	categoriesSelected.push(val);
	    });
	    //categoriesSelected = site.categories;

	    $("#sectionSearchResults").show();
   });

   $(".menu-btn-back-category").off().click(function(){
        $("#mainCategories").show();
        $("#searchResults").html("");
        $("#sectionSearchResults").addClass("hidden");
        KScrollTo("#mainCategories");
        currentCategory = ""
    });

   bindLBHLinks();

   

});

function incNbClick(url){
	console.log("incrémentation nbClick essai");
	$.ajax({ 
        type: "POST",
        url: baseUrl+"/"+moduleId+"/siteurl/incnbclick/",
        data: { url : url },
        dataType: "json",
        success:
            function(data) {
            console.log("incrémentation nbClick ok", data);
                // $("#searchResults").html(html);
                // $("#sectionSearchResults").removeClass("hidden");
                // KScrollTo("#sectionSearchResults");
            },
        error:function(xhr, status, error){
            console.log("erreur lors de l'incrémentation nbClick");
            //$("#searchResults").html("erreur");
        },
        statusCode:{
                404: function(){
                    console.log("404 erreur lors de l'incrémentation nbClick");
            }
        }
    });
}
</script>