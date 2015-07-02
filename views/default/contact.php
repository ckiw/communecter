<div class="space20"></div>
<div class="keywordList"></div>

<script type="text/javascript">

var keywords = [
	
	{
		"icon" : "fa-envelope-o",
		"title":"BY MAIL : contact @ pixelhumain.com"
	},
	{
		"icon" : "fa-envelope-o",
		"title":"BY PHONE : 00262-262343686"
	},
	{
		"icon" : "fa-paper-plane-o",
		"title":"BY PAPER AIRPLANE : good luck !!"
	},
	{
		"icon" : "fa-skype",
		"title":"BY SKYPE : user oceatoon"
	},
	{
		"icon" : "fa-paw",
		"title":"BY FOOT",
		"body" : "<br/> La Riviere ou Trois Bassins, Reunion Island, @PixelHumain"+
				"<br/> Bastille , Paris, @Assemblée Virtuelle"+
				"<br/> Auvergne, @ Chez Nous .coop"+
				"<br/> Lilles, @Livin.coop or @Unissons"+
				"<br/> in Noumea, New Caledonia, @PixelHumain"+
				"<br/> in Berlin, Germany @PLP Elf Pavlic or Alex Corbi"
	},
	{
		"icon" : "fa-github",
		"title":" <a href='https://github.com/pixelhumain' target='_blank'>ON GITHUB</a>"
	},
	{
		"icon" : "fa-bookmark-o",
		"title":" <a href='https://groups.diigo.com/group/pixelhumain' target='_blank'>BY DIIGO</a> "
	},
	{
		"icon" : "fa-google-plus",
		"title":" <a href='https://plus.google.com/u/0/communities/111483652487023091469' target='_blank'>BY GOOGLE+ </a> "
	},
	{
		"icon" : "fa-facebook-square",
		"title":"<a href='https://www.facebook.com/groups/pixelhumain/' target='_blank'>BY FACEBOOK </a> "
	},
	{
		"icon" : "fa-twitter",
		"title":"<a href='https://www.twitter.com/pixelhumain/' target='_blank'>BY TWITTER</a> "
	},
	{
		"icon" : "fa-bookmark-o",
		"title":"<a href='https://groups.diigo.com/group/pixelhumain' target='_blank'>BY DIIGO</a> "
	},
	{
		"icon" : "fa-smile-o",
		"title":"<a href='https://ello.co/pixelhumain' target='_blank'>BY ELLO</a> "
	},
];
	
jQuery(document).ready(function() 
{
	$(".keywordList").html('');
	$.each(keywords,function(i,obj) { 
		var icon = (obj.icon) ? obj.icon : "fa-tag" ;
		var color = (obj.color) ? obj.color : "#E33551" ;
		var body = (obj.body) ? obj.body : null ;
		var str = '<div class="panel panel-white">'+
			'<div class="panel-heading border-light ">'+
				'<span class="panel-title homestead"> <i class="fa '+icon+'  fa-2x"></i> <span style="font-size: 35px; color:'+color+';"> '+obj.title+'</span></span>'+
			'</div>';
		if(body)
			str += '<div class="panel-body">'+
				'<blockquote class="space20">'+
					body+
				 "</blockquote>"+
			"</div>"+
		"</div>";
		$(".keywordList").append(str);
	 });
});

</script>

