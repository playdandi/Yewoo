function getBaseUrl()
{
	return location.host;
}

function getBuildingRooms(b_id, select_id)
{
	doAjax_buildingRoom(b_id.replace('b', ''), select_id);
}

var doAjax_buildingRoom = function(id, select_id) {
	var csrftoken = $.cookie('csrftoken');
	var postData = {};
	postData['csrfmiddlewaretoken'] = csrftoken; 
	postData['id'] = id;

	$.ajax({
		type : 'POST',
		url : 'http://14.49.42.190:8080/building/getrooms/',
		data : postData,
		success : function(rooms) {
			$('#'+select_id).find('option').each(function() {
				$(this).remove();
			});

			$('#'+select_id).append('<option value="">선택</option>');
			for (i = 0; i < rooms.length; i++) {
				roomKor = (rooms[i] < 0) ? 'B '+(-rooms[i]) : rooms[i];
				$('#'+select_id).append('<option value="'+rooms[i]+'">' + roomKor+'호' + '</option>');
			}

			$('#'+select_id).attr('disabled', false);
		},
		error : function(msg) {
			alert('다시 시도해주세요...');	
		},
	});
}
