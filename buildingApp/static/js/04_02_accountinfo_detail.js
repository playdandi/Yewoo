function Revise1(done, uid)
{
	if (done) {
		if (!confirm('수정하시겠습니까?'))
			return;
		else
			UpdateInfo1(uid);
	}

	if (!done) { // 수정 시작
		$('#revise1Start').hide();
		$('#revise1Done').show();
        $('#revise1Box').css("background-color","#CCFFCC");
	}
	else { // 완료버튼 클릭
		$('#revise1Start').show();
		$('#revise1Done').hide();
        $('#revise1Box').css("background-color","#f8f8f8");
	}

	$('#name').attr('disabled', done);
	$('#birthdayYear').attr('disabled', done);
	$('#birthdayMonth').attr('disabled', done);
	$('#birthdayDay').attr('disabled', done);
	$('#gender').attr('disabled', done);
	$('#status').attr('disabled', done);
	$('#department').attr('disabled', done);
	$('#position').attr('disabled', done);
	$('#joinYear').attr('disabled', done);
	$('#joinMonth').attr('disabled', done);
	$('#joinDay').attr('disabled', done);
	$('#exitYear').attr('disabled', done);
	$('#exitMonth').attr('disabled', done);
	$('#exitDay').attr('disabled', done);
	$('#companyNumber').attr('disabled', done);
	$('#contact1').attr('disabled', done);
	$('#contact2').attr('disabled', done);
	$('#email').attr('disabled', done);
	$('#address').attr('disabled', done);
	$('#address2').attr('disabled', done);
}

function UpdateInfo1(uid) {
    var birthyear = $('#birthdayYear').val().trim()
    var birthmonth = $('#birthdayMonth').val().trim()
    var birthday = $('#birthdayDay').val().trim()
    var joinyear = $('#joinYear').val().trim()
    var joinmonth = $('#joinMonth').val().trim()
    var joinday = $('#joinDay').val().trim()
    var exityear = $('#exitYear').val().trim()
    var exitmonth = $('#exitMonth').val().trim()
    var exitday = $('#exitDay').val().trim()

    var data = {};

    data['name'] = $('#name').val()
    data['birthday'] = birthyear + '-' + birthmonth + '-' + birthday
    data['gender'] = $('#gender').val()
    data['status'] = $('#status').val()
    data['department'] = $('#department').val()
    data['position'] = $('#position').val()
    data['joindate'] = joinyear + '-' + joinmonth + '-' + joinday
    if(exityear!="")
        data['exitdate'] = exityear + '-' + exitmonth + '-' + exitday
    else
        data['exitdate'] = ''
    data['companynumber'] = $('#companyNumber').val()
    data['contact1'] = $('#contact1').val()
    data['contact2'] = $('#contact2').val()
    data['email'] = $('#email').val()
    data['address'] = $('#address').val()
    data['address2'] = $('#address2').val()

    var csrftoken = $.cookie('csrftoken');
    data['csrfmiddlewaretoken'] = csrftoken;
    data['type'] = 1
    $.ajax({
        type : 'POST',
        url : '/manage/accountinfo/detail/' + uid + '/',
        data : data,
        success : function() {
            alert('변경되었습니다.');
            $(location).attr('href', '/manage/accountinfo/detail/' + uid + '/');
        },
        error : function(msg) {
            alert('error : ' + msg.responseText);
        },
    });
}

function Revise2(done, uid) {
}

function Revise2Cancel(uid) {
    if (!confirm('취소하시겠습니까?'))
	    return;
    else
        $(location).attr('href', '/manage/accountinfo/detail/' + uid + '/');
}

function Revise4(done, uid)
{
	if (done) {
		if (!confirm('수정하시겠습니까?'))
			return;
		else
			UpdateInfo4(uid);
	}

	if (!done) { // 수정 시작
		$('#revise4Start').hide();
		$('#revise4Done').show();
        $('#revise4Box').css("background-color","#CCFFCC");
	}
	else { // 완료버튼 클릭
		$('#revise4Start').show();
		$('#revise4Done').hide();
        $('#revise4Box').css("background-color","#f8f8f8");
	}

	$('#introduce').attr('disabled', done);
}

function UpdateInfo4(uid) {
    var data = {};

    data['introduce'] = $('#introduce').val()
    var csrftoken = $.cookie('csrftoken');
    data['csrfmiddlewaretoken'] = csrftoken;
    data['type'] = 4
    $.ajax({
        type : 'POST',
        url : '/manage/accountinfo/detail/' + uid + '/',
        data : data,
        success : function() {
            alert('변경되었습니다.');
            $(location).attr('href', '/manage/accountinfo/detail/' + uid + '/');
        },
        error : function(msg) {
            alert('error : ' + msg.responseText);
        },
    });
}
