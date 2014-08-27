function searchYear(bid, year, month)
{
	var searchYear = $('#search_year').val().trim();
	$(location).attr('href', '/lease/bill/total/'+bid+'/look/'+year+'/'+month+'/'+searchYear+'/');
}
