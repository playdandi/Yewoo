function setperm(uid) {
    if (!confirm('설정하시겠습니까?'))
        return;
    else {
        var perm = {}
        for(i = 0; i <= 14; i++) {
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
				alert('실패하였습니다. 다시 시도해 주세요...');
                //alert('error : ' + msg.responseText);
            },
        });
    }
}

function filter(f) // label (ㄱ,ㄴ,ㄷ,...) 클릭했을 때 검사하는 함수
{
    var trs = $('tr[class=datas]');
    var trs_sub = $('tr[class=datas_sub]');
	// label 색 선택
	for (i = 0; i <= 14; i++)
		$('#label'+i).removeClass('label-inverse');
	$('#labelall').removeClass('label-inverse');
	$('#labeletc').removeClass('label-inverse');
	$('#labelwork').removeClass('label-inverse');
	$('#labelexit').removeClass('label-inverse');
    $('#label'+f).addClass('label-inverse');
	
	if (f == 'all') {
		for (i = 0; i < trs.length; i++)
			trs[i].style.display="";
	} else if(f == 'etc') {
		for (var i = 0; i < trs.length; i++) {
			if (iSound($($(trs[i]).children()[1]).text()[0]) == -1)
				trs[i].style.display="";
			else {
				trs[i].style.display="none";
                trs_sub[i].style.display="none";
            }
		}
    } else if(f == 'work') {
		for (var i = 0; i < trs.length; i++) {
			if ($($(trs[i]).children()[5]).text() == "재직")
				trs[i].style.display="";
			else {
				trs[i].style.display="none";
                trs_sub[i].style.display="none";
            }
		}
    } else if(f == 'exit') {
		for (var i = 0; i < trs.length; i++) {
			if ($($(trs[i]).children()[5]).text() == "퇴사")
				trs[i].style.display="";
			else {
				trs[i].style.display="none";
                trs_sub[i].style.display="none";
            }
		}
    }
	else {
		for (var i = 0; i < trs.length; i++) {
			if (iSound($($(trs[i]).children()[1]).text()[0]) == Number(f))
				trs[i].style.display="";
			else {
				trs[i].style.display="none";
                trs_sub[i].style.display="none";
            }
		}
	}
}

function iSound(a) // 한 글자의 '초성'으로 idx 구하기
{
	var res = new Array(0,2,3,5,6,7,9,11,12,14,15,16,17,18);
	var r = parseInt( (a.charCodeAt(0) - parseInt('0xAC00',16)) / 588 );
//	var t = String.fromCharCode(r + parseInt('0x1100',16));

	for (var i = 0; i < res.length; i++)
		if (res[i] == r)
			return i;
	return -1;
}
