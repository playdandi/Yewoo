var SignUp = function() {
    var data = {};

    data['systemId'] = $('#systemId').val().trim();
    data['systemPass1'] = $('#systemPass1').val().trim();
    data['systemPass2'] = $('#systemPass2').val().trim();
    data['systemPassHint'] = $('#systemPassHint').val().trim();

    data['signupName'] = $('#signupName').val().trim();
    var year = $('#signupBirthdayYear').val().trim()
    var month = $('#signupBirthdayMonth').val().trim()
    var day = $('#signupBirthdayDay').val().trim()
    data['signupBirthday'] = year + '-' + month + '-' + day;
    data['signupGender'] = $('#signupGender').val().trim();
    data['signupDepartment'] = $('#signupDepartment').val().trim();
    data['signupPosition'] = $('#signupPosition').val().trim();
    var year = $('#signupJoinYear').val().trim()
    var month = $('#signupJoinMonth').val().trim()
    var day = $('#signupJoinDay').val().trim()
    data['signupJoinDate'] = year + '-' + month + '-' + day;
    
    data['signupContact1'] = $('#signupContact1').val().trim();
    data['signupContact2'] = $('#signupContact2').val().trim();
    data['signupAddress'] = $('#signupAddress').val().trim();

    doSignUp(data);
}

var doSignUp = function(postData) {
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
//	postData['type'] = 'save';

	$.ajax({
		type : 'POST',
		url : '/account/signup/',
		data : postData,
		success : function() {
			alert('성공적으로 가입되었습니다..');
			$(location).attr('href', '/login/');
		},
		error : function(msg) {
			alert('error : ' + msg.responseText);
		},
	});
}

var checkId = function() {
    var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
    postData['systemId'] = $('#systemId').val().trim();

	$.ajax({
		type : 'POST',
		url : '/account/checkid/',
		data : postData,
		success : function() {
			alert('사용 가능한 아이디입니다.');
		},
		error : function(msg) {
			alert('error : ' + msg.responseText);
		},
	});
}
