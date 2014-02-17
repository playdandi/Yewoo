function getContents()
{
	//var year = $('#').val();
	//var month = $('#').val();

	// db에서 정보 뽑고

	var template = new EJS({url : '/static/ejs/03_01_lease_notice_detail_show.ejs'}).render();
	$('#contents').html(template);
	$('#contents_modal').html(template);
}


