function add() {
    var addtext = $('#addtext')
    if (addtext.val() == "")
        alert("부서 이름을 입력하세요.");
    else {
        var csrftoken = $.cookie('csrftoken');
        var postData = {};
        postData['csrfmiddlewaretoken'] = csrftoken;
        postData['type'] = 'add';
        postData['data'] = addtext.val();
        $.ajax({
            type : 'POST',
            url : '/manage/setting/department/',
            data : postData,
            success : function() {
                alert('추가되었습니다.');
                $(location).attr('href', '/manage/setting/department/');
            },
            error : function(msg) {
                alert('error : ' + msg);
            },
        });
    }
}
function del() {
    var radios = $('input[name=depselect]');
    var value = "ND";
    for (var i = 0; i < radios.length; i++) {
        if ($(radios[i]).parent().hasClass('checked')) {
            value = radios[i].value;       
        }
    }
    if (value == "ND")
            alert("부서를 선택하세요.");
    else {
        var csrftoken = $.cookie('csrftoken');
        var postData = {};
        postData['csrfmiddlewaretoken'] = csrftoken;
        postData['type'] = 'del';
        postData['data'] = value;
        $.ajax({
            type : 'POST',
            url : '/manage/setting/department/',
            data : postData,
            success : function() {
                alert('삭제되었습니다.');
                $(location).attr('href', '/manage/setting/department/');
            },
            error : function(msg) {
                alert('error : ' + msg);
            },
        });
    }
}
function modify() {
    var radios = $('input[name=depselect]');
    var value = "ND";
    for (var i = 0; i < radios.length; i++) {
        if ($(radios[i]).parent().hasClass('checked')) {
            value = radios[i].value;       
        }
    }
    var modtext = $('#modifytext')
    if (value == "ND")
        alert("부서를 선택하세요.");
    else if(modtext.val() == "")
        alert("부서 이름을 입력하세요.");
    else {
        var csrftoken = $.cookie('csrftoken');
        var postData = {};
        postData['csrfmiddlewaretoken'] = csrftoken;
        postData['type'] = 'mod';
        postData['data'] = value;
        postData['data2'] = modtext.val()
        $.ajax({
            type : 'POST',
            url : '/manage/setting/department/',
            data : postData,
            success : function() {
                alert('변경되었습니다.');
                $(location).attr('href', '/manage/setting/department/');
            },
            error : function(msg) {
                alert('error : ' + msg);
            },
        });
    }
}
function changeRadio(name) {
    var modtext = $('#modifytext')
    modtext.val(name)
}
