function searchYear(bid, roomid, year, month)
{
	var searchYear = $('#search_year').val().trim();
	$(location).attr('href', '/lease/bill/each/'+bid+'/'+roomid+'/manage/'+year+'/'+month+'/'+searchYear+'/');
}
