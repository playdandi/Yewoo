function modify() {
    var min_number = $('#min_number').val()
    var max_number = $('#max_number').val()
    var modtext = $('#modifytext')
    if (false)
        alert("에러");
    else {
        var csrftoken = $.cookie('csrftoken');
        var postData = {};
        postData['csrfmiddlewaretoken'] = csrftoken;
        postData['min_number'] = min_number;
        postData['max_number'] = max_number;
        $.ajax({
            type : 'POST',
            url : '/manage/setting/companynum/',
            data : postData,
            success : function() {
                alert('변경되었습니다.');
                $(location).attr('href', '/manage/setting/companynum/');
            },
            error : function(msg) {
                alert('error : ' + msg.responseText);
            },
        });
    }
}
