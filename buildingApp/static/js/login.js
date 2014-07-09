var tryLogin = function() {
    var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
    postData['username'] = $('#username').val().trim();
    postData['password'] = $('#password').val().trim();
	$.ajax({
		type : 'POST',
		url : '/login/',
		data : postData,
		success : function() {
			alert('로그인에 성공하였습니다.');
			$(location).attr('href', '/newmain/');
		},
		error : function(msg) {
			alert('error : ' + msg.responseText);
		},
	});
    return false;
}
