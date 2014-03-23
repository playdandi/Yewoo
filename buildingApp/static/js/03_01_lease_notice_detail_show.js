function getContents()
{
	// Javascript to enable link to tab
	var url = document.location.toString();
	if (url.match('#')) {
	    $('.nav-tabs a[href=#'+url.split('#')[1]+']').tab('show') ;
	} 
	
	// Change hash for page-reload
	$('.nav-tabs a').on('shown', function (e) {
	    window.location.hash = e.target.hash;
	})
	
	//var year = $('#').val();
	//var month = $('#').val();

	// db에서 정보 뽑고

	var template = new EJS({url : '/static/ejs/03_01_lease_notice_detail_show.ejs'}).render();
	$('#contents').html(template);
	$('#contents_modal').html(template);
}


