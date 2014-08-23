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
        $('#revise2Start').attr('disabled',true);
        $('#revise3Start').attr('disabled',true);
        $('#revise4Start').attr('disabled',true);
	}
	else { // 완료버튼 클릭
		$('#revise1Start').show();
		$('#revise1Done').hide();
        $('#revise1Box').css("background-color","#f8f8f8");
        $('#revise2Start').attr('disabled',false);
        $('#revise3Start').attr('disabled',false);
        $('#revise4Start').attr('disabled',false);
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
        url : '/myprofile/',
        data : data,
        success : function() {
            alert('변경되었습니다.');
            $(location).attr('href', '/myprofile/');
        },
        error : function(msg) {
            alert('error : ' + msg.responseText);
        },
    });
}

function Revise2(done, uid) {
	if (done) {
		if (!confirm('수정하시겠습니까?'))
			return;
		else
			UpdateInfo2(uid);
	}

	if (!done) { // 수정 시작
		$('#revise2Start').hide();
		$('#revise2Done').show();
		$('#revise2AddLine').show();
		$('#revise2Cancel').show();
		$('#revise2Done').show();
		$('#acaInit').show();
        $('#revise2Box').css("background-color","#CCFFCC");
        $('#revise1Start').attr('disabled',true);
        $('#revise3Start').attr('disabled',true);
        $('#revise4Start').attr('disabled',true);
	}
	else { // 완료버튼 클릭
		$('#revise2Start').show();
		$('#revise2Done').hide();
		$('#revise2AddLine').hide();
		$('#revise2Cancel').hide();
		$('#revise2Done').hide();
		$('#acaInit').hide();
        $('#revise2Box').css("background-color","#f8f8f8");
        $('#revise1Start').attr('disabled',false);
        $('#revise3Start').attr('disabled',false);
        $('#revise4Start').attr('disabled',false);
	}
    
    var table = document.getElementById('acaTable');
    var acaNum = table.rows.length - 1;

    for(i=0; i<acaNum; i++) {
        var row = table.rows[i+1];
        $(row.children[0].children[0]).attr('disabled', done);
        $(row.children[1].children[0]).attr('disabled', done);
        $(row.children[2].children[0]).attr('disabled', done);
        $(row.children[3].children[0]).attr('disabled', done);
        $(row.children[4].children[0]).attr('disabled', done);
        $(row.children[4].children[1]).attr('disabled', done);
        $(row.children[5].children[0]).attr('disabled', done);
        if(done)
            $(row.children[6].children[0]).css('display', "none");
        else
            $(row.children[6].children[0]).css('display', "");
    }
}

function UpdateInfo2(uid) {
    var table = document.getElementById('acaTable');
    var acaNum = table.rows.length - 1;

    var data = {};
    data['arraynum'] = acaNum;
    for(i=0;i<acaNum;i++) {
        var row = table.rows[i+1];
        data['period' + i] = $(row.children[0].children[0]).val();
        data['name' + i] = $(row.children[1].children[0]).val();
        data['location' + i] = $(row.children[2].children[0]).val();
        data['major' + i] = $(row.children[3].children[0]).val();
        data['gpa' + i] = $(row.children[4].children[0]).val();
        data['maxgpa' + i] = $(row.children[4].children[1]).val();
        data['etc' + i] = $(row.children[5].children[0]).val();
    }

    var csrftoken = $.cookie('csrftoken');
    data['csrfmiddlewaretoken'] = csrftoken;
    data['type'] = 2
    $.ajax({
        type : 'POST',
        url : '/myprofile/',
        data : data,
        success : function() {
            alert('변경되었습니다.');
            $(location).attr('href', '/myprofile/');
        },
        error : function(msg) {
            alert('error : ' + msg.responseText);
        },
    });
}

function Revise2Init() {
    if (!confirm("초기화하시겠습니까?"))
        return;
    else {
        var table = document.getElementById('acaTable');
        var acaNum = table.rows.length - 1;
        for(i=0; i<acaNum; i++) {
            table.deleteRow(1);
        }
    }
}

function Revise2Cancel(uid) {
    if (!confirm('취소하시겠습니까?'))
	    return;
    else
        $(location).attr('href', '/myprofile/');
}

function Revise2DelLine(delbutton) {
    $(delbutton).parent().parent().remove()
}

function Revise2AddLine() {
    var table = document.getElementById('acaTable');
    var acaNum = table.rows.length - 1;
    var newRow = table.insertRow(acaNum + 1);
    for(i=0;i<4;i++) {
        var cell = newRow.insertCell(i);
        var input = document.createElement("input");
        input.className= "margin0";
        input.style.width = "90%";
        input.type = "text";
        cell.appendChild(input);
    }
    var cell = newRow.insertCell(4);
    var input = document.createElement("input");
    input.className= "margin0";
    input.style.width = "30%";
    input.type = "text";
    cell.appendChild(input);
    var text = document.createTextNode('/');
    cell.appendChild(text);
    var input = document.createElement("input");
    input.className= "margin0";
    input.style.width = "30%";
    input.type = "text";
    cell.appendChild(input);

    var cell = newRow.insertCell(5);
    var input = document.createElement("input");
    input.className= "margin0";
    input.style.width = "90%";
    input.type = "text";
    cell.appendChild(input);

    var cell = newRow.insertCell(6);
    var button = document.createElement("button");
    button.className = "btn btn-small";
    button.style.margin = "0px 0px 0px 0px";
    button.setAttribute("onClick", "Revise2DelLine(this);");
    button.innerHTML = "삭제";
    cell.appendChild(button);
}

function Revise3(done, uid) {
	if (done) {
		if (!confirm('수정하시겠습니까?'))
			return;
		else
			UpdateInfo3(uid);
	}

	if (!done) { // 수정 시작
		$('#revise3Start').hide();
		$('#revise3Done').show();
		$('#revise3AddLine').show();
		$('#revise3Cancel').show();
		$('#revise3Done').show();
		$('#workInit').show();
        $('#revise3Box').css("background-color","#CCFFCC");
        $('#revise1Start').attr('disabled',true);
        $('#revise2Start').attr('disabled',true);
        $('#revise4Start').attr('disabled',true);
	}
	else { // 완료버튼 클릭
		$('#revise3Start').show();
		$('#revise3Done').hide();
		$('#revise3AddLine').hide();
		$('#revise3Cancel').hide();
		$('#revise3Done').hide();
		$('#workInit').hide();
        $('#revise3Box').css("background-color","#f8f8f8");
        $('#revise1Start').attr('disabled',false);
        $('#revise2Start').attr('disabled',false);
        $('#revise4Start').attr('disabled',false);
	}
    
    var table = document.getElementById('workTable');
    var workNum = table.rows.length - 1;

    for(i=0; i<workNum; i++) {
        var row = table.rows[i+1];
        $(row.children[0].children[0]).attr('disabled', done);
        $(row.children[1].children[0]).attr('disabled', done);
        $(row.children[2].children[0]).attr('disabled', done);
        $(row.children[3].children[0]).attr('disabled', done);
        if(done)
            $(row.children[4].children[0]).css('display', "none");
        else
            $(row.children[4].children[0]).css('display', "");
    }
}

function UpdateInfo3(uid) {
    var table = document.getElementById('workTable');
    var workNum = table.rows.length - 1;

    var data = {};
    data['arraynum'] = workNum;
    for(i=0;i<workNum;i++) {
        var row = table.rows[i+1];
        data['period' + i] = $(row.children[0].children[0]).val();
        data['name' + i] = $(row.children[1].children[0]).val();
        data['position' + i] = $(row.children[2].children[0]).val();
        data['mission' + i] = $(row.children[3].children[0]).val();
    }

    var csrftoken = $.cookie('csrftoken');
    data['csrfmiddlewaretoken'] = csrftoken;
    data['type'] = 3
    $.ajax({
        type : 'POST',
        url : '/myprofile/',
        data : data,
        success : function() {
            alert('변경되었습니다.');
            $(location).attr('href', '/myprofile/');
        },
        error : function(msg) {
            alert('error : ' + msg.responseText);
        },
    });
}

function Revise3Init() {
    if (!confirm("초기화하시겠습니까?"))
        return;
    else {
        var table = document.getElementById('workTable');
        var workNum = table.rows.length - 1;
        for(i=0; i<workNum; i++) {
            table.deleteRow(1);
        }
    }
}

function Revise3Cancel(uid) {
    if (!confirm('취소하시겠습니까?'))
	    return;
    else
        $(location).attr('href', '/myprofile/');
}

function Revise3DelLine(delbutton) {
    $(delbutton).parent().parent().remove()
}

function Revise3AddLine() {
    var table = document.getElementById('workTable');
    var workNum = table.rows.length - 1;
    var newRow = table.insertRow(workNum + 1);
    for(i=0;i<4;i++) {
        var cell = newRow.insertCell(i);
        var input = document.createElement("input");
        input.className= "margin0";
        input.style.width = "90%";
        input.type = "text";
        cell.appendChild(input);
    }

    var cell = newRow.insertCell(4);
    var button = document.createElement("button");
    button.className = "btn btn-small";
    button.style.margin = "0px 0px 0px 0px";
    button.setAttribute("onClick", "Revise3DelLine(this);");
    button.innerHTML = "삭제";
    cell.appendChild(button);
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
        $('#revise1Start').attr('disabled',true);
        $('#revise2Start').attr('disabled',true);
        $('#revise3Start').attr('disabled',true);
	}
	else { // 완료버튼 클릭
		$('#revise4Start').show();
		$('#revise4Done').hide();
        $('#revise4Box').css("background-color","#f8f8f8");
        $('#revise1Start').attr('disabled',false);
        $('#revise2Start').attr('disabled',false);
        $('#revise3Start').attr('disabled',false);
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
        url : '/myprofile/',
        data : data,
        success : function() {
            alert('변경되었습니다.');
            $(location).attr('href', '/myprofile/');
        },
        error : function(msg) {
            alert('error : ' + msg.responseText);
        },
    });
}
