function setperm(uid) {
    if (!confirm('설정하시겠습니까?'))
        return;
    else {
        var perm = {}
        for(i=0; i<13; i++) {
            perm[i] = $('#check' + i + '_' + uid).parent().hasClass('checked')
        }
        
        var csrftoken = $.cookie('csrftoken');
        var postData = {};
        postData['csrfmiddlewaretoken'] = csrftoken;
        postData['uid'] = uid
        postData['perm'] = perm;
        $.ajax({
            type : 'POST',
            url : '/manage/right/',
            data : postData,
            success : function() {
                alert('변경되었습니다.');
                $(location).attr('href', '/manage/right/');
            },
            error : function(msg) {
                alert('error : ' + msg.responseText);
            },
        });
    }
}
