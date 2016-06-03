<div class="dropdown pull-right hidden-xs">
  <button class="dropdown-toggle menu-name-profil text-dark" data-toggle="dropdown">
    <img class="img-circle" id="menu-thumb-profil" width="34" height="34" src="<?php echo $urlPhotoProfil; ?>" alt="image" >
    <?php //echo $me["name"]; ?>
    <span class="caret"></span>
  </button>
  <ul class="dropdown-menu dropdown-menu-right">
    <li><a href="javascript:;" onclick="loadByHash('#person.detail.id.<?php echo Yii::app()->session['userId']?>');" id="btn-menu-dropdown-my-profil"><i class="fa fa-user text-dark"></i> Mon espace perso  <span class="badge badge-warning"><i class="fa fa-bookmark"></i><?php echo Gamification::badge( Yii::app()->session['userId'] ) ?> <?php echo (isset($me["gamification"]['total'])) ? $me["gamification"]['total'] : 0; ?> pts</span> </a></li>
    <li><a href="javascript:;" onclick="loadByHash('#city.detail.insee.<?php echo $me["address"]["codeInsee"]?>.postalCode.<?php echo $me["address"]["postalCode"]?>');"             id="btn-menu-dropdown-my-city"><i class="fa fa-university text-dark"></i> Ma commune</a></li>
    <li><a href="javascript:;" onclick="loadByHash('#rooms.index.type.citoyens.id.<?php echo Yii::app()->session['userId'] ?>');"><i class="fa fa-thumbs-up text-dark"></i> Mes Votes / Discussions</a></li>

    <li role="separator" class="divider"></li>
    <li><a href="javascript:;" onclick="loadByHash('#person.invite');" id="btn-menu-dropdown-add"><i class="fa fa-plus-circle text-yellow"></i> <i class="fa fa-item-menu fa-user text-yellow"></i> Inviter quelqu'un</a></li>
    <li><a href="javascript:;" onclick="loadByHash('#event.eventsv');" id="btn-menu-dropdown-add"><i class="fa fa-plus-circle text-orange"></i> <i class="fa fa-calendar text-orange"></i> Créer un événement</a></li>
    <li><a href="javascript:;" onclick="loadByHash('#project.projectsv');" id="btn-menu-dropdown-add"><i class="fa fa-plus-circle text-purple"></i> <i class="fa fa-lightbulb-o text-purple"></i> Créer un projet</a></li>
    
    <li role="separator" class="divider"></li>
    <li><a href="javascript:;" onclick="loadByHash('#organization.addorganizationform');" id="btn-menu-dropdown-add"><i class="fa fa-plus-circle text-green"></i> <i class="fa fa-users text-green"></i> Référencer une organisation</a></li>
    <li role="separator" class="divider"></li>
    <?php
      if(Role::isSourceAdmin(Role::getRolesUserId(Yii::app()->session["userId"]))){
        $sourceAdmin = Person::getSourceAdmin(Yii::app()->session['userId']);
        foreach ($sourceAdmin as $key => $value) {
          ?>
            <li><a href="javascript:;" onclick="loadByHash('#adminpublic.index?key=<?php echo $value ;?>');" id="btn-menu-dropdown-add"><i class="fa fa-cog text-blue"></i> <?php echo $value ; ?></a></li>
        <?php } ?>
        <li role="separator" class="divider"></li>
        <?php } ?>
    <li>
      <a href="<?php echo Yii::app()->createUrl('/'.$this->module->id.'/person/logout'); ?>" 
         id="btn-menu-dropdown-logout" class="text-red">
        <i class="fa fa-sign-out"></i> Déconnexion
      </a>
    </li>  
  </ul>
</div>

<button class="menu-button btn-menu btn-menu-notif tooltips text-dark hidden-xs" 
      data-toggle="tooltip" data-placement="left" title="Notifications" alt="Notifications">
  <i class="fa fa-bell"></i>
  <span class="notifications-count topbar-badge badge badge-danger animated bounceIn"><?php count($this->notifications); ?></span>
</button>