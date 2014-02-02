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


var sidebar_flipped = false;
function show_sidebar()
{
	if (!sidebar_flipped) { // 펼쳐져있는 모습
		var template = new EJS({url : '/static/ejs/sidebar.ejs'}).render();
		$('#sidebar').html(template);

		// content 부분의 가로 크기 변경
		$('#content').removeClass('span11');
		$('#content').addClass('span10');
	}

	else { // 접혀진 모습
		var template = new EJS({url : '/static/ejs/sidebar_min.ejs'}).render();
		$('#sidebar').html(template);

		// content 부분의 가로 크기 변경
		$('#content').removeClass('span10');
		$('#content').addClass('span11');
	
		// sidebar popover for detail
		$('#building').popover({
			html : 'true',
			placement : 'right',
			title : '[건물 관리]',
			content : '<ul class="nav nav-tab main-menu" style="margin-bottom:-1px"><li><a href="/building/register/"><i class="icon-hand-right" style="margin-right:5px"></i>건물 정보 등록</a></li><li><a href="/building/search/building/"><i class="icon-hand-right" style="margin-right:5px"></i>등록 건물 정보 확인</a></li><li><a href="/building/search/rooms/"><i class="icon-hand-right" style="margin-right:5px"></i>등록 호수 정보 확인</a></li></ul>'
		});

		$('#resident').popover({
			html : 'true',
			placement : 'right',
			title : '[입주자 관리]',
			content : '<ul class="nav nav-tab main-menu" style="margin-bottom:-1px"><li><a href="/resident/info/"><i class="icon-hand-right" style="margin-right:5px"></i>입주자 정보 입력</a></li><li><a href="/resident/show/"><i class="icon-hand-right" style="margin-right:5px"></i>입주자 정보 확인</a></li></ul>'
		});

		// popover를 열 때, 다른 모든 popover를 끈다. (중복되지 않기 위하여)
		$('#building').on('click', function() {
			$('#resident').popover('hide');
		});
		$('#resident').on('click', function() {
			$('#building').popover('hide');
		});
	}

	sidebar_flipped = !sidebar_flipped;

	$('#sidebar-collapse').on('click', function() {
		show_sidebar();
	});
}

/*


function changeSidebar()
{
	if (!flipped) { // F->T (접는다)
		var html = '';
		html += '<div class="main-menu-span" style="width:45px">';
		html += '<div class="nav-collapse sidebar-nav">';

		html += '<ul class="nav nav-tabs nav-stacked main-menu" style="margin-bottom:0px">';
		html += '<li class="nav-header hidden-tablet" style="padding:3px 10px">메뉴</li>';
		html += '<li><a href="/main/"><i class="icon-align-justify"></i></a></li>';
		html += '<li><a href="#" id="building" rel="popover"><i class="icon-home"></i></a></li>';
		html += '<li><a href="#" id="resident" rel="popover"><i class="icon-user"></i></a></li>';

		html += '</ul>';
		html += '</div>';
		html += '<div id="sidebar-collapse">';
		html += '<i class="icon-forward"></i>';
		html += '</div>';
		html += '</div>';

		$('#qweqwe').html(html);

		$('#content').removeClass('span10');
		$('#content').addClass('span11');
	}

	else { // 펼친다
		var html = '';
		html += '<div class="span2 main-menu-span">';
		html += '<div class="nav-collapse sidebar-nav">';
		html += '<ul class="nav nav-tabs nav-stacked main-menu" style="margin-bottom:0px">';
		html += '<li class="nav-header hidden-tablet">주요 메뉴</li>';
		html += '<li><a href="/main/"><i class="icon-align-justify"></i><span class="hidden-tablet"> 홈으로</span></a></li>';
		html += '<li><a href="#building" data-toggle="collapse"><i class="icon-home"></i><span class="hidden-tablet"> [건물 관리]</span></a></li>';
		html += '<ul id="building" class="nav nav-tab nav-stacked main-menu collapse" style="margin-bottom:-1px">';
	    html += '<li><a href="/building/register/"><i class="icon-hand-right"></i><span class="hidden-tablet"> 건물 정보 등록</span></a></li>';
		html += '<li><a href="/building/search/building/"><i class="icon-hand-right"></i><span class="hidden-tablet"> 등록 건물 정보 확인</span></a></li>';
		html += '<li><a href="/building/search/rooms/"><i class="icon-hand-right"></i><span class="hidden-tablet"> 등록 호수 정보 확인</span></a></li>';
	    html += '</ul>';
		html += '<li><a href="#resident" data-toggle="collapse"><i class="icon-user"></i><span class="hidden-tablet"> [입주자 관리]</span></a></li>';
		html += '<ul id="resident" class="nav nav-tab nav-stacked main-menu collapse" style="margin-bottom:-1px">';
		html += '<li><a href="/resident/info/"><i class="icon-hand-right"></i><span class="hidden-tablet"> 입주자 정보 입력</span></a></li>';
		html += '<li><a href="/resident/show/"><i class="icon-hand-right"></i><span class="hidden-tablet"> 입주자 정보 확인</span></a></li>';
		html += '</ul>';
		html += '</ul>';
		html += '</div>';

		html += '<div id="sidebar-collapse">';
		html += '<i class="icon-backward"></i>';
		html += '</div>';
		html += '</div>';

		$('#qweqwe').html(html);
		$('#content').removeClass('span11');
		$('#content').addClass('span10');
	}

	flipped = !flipped;
	
	$('#sidebar-collapse').on('click', function() {
		changeSidebar();
	});

	// sidebar popover for detail
	$('#building').popover({
		html : 'true',
		placement : 'right',
		title : '[건물 관리]',
		content : '<ul class="nav nav-tab main-menu" style="margin-bottom:-1px"><li><a href="/building/register/"><i class="icon-hand-right" style="margin-right:5px"></i>건물 정보 등록</a></li><li><a href="/building/search/building/"><i class="icon-hand-right" style="margin-right:5px"></i>등록 건물 정보 확인</a></li><li><a href="/building/search/rooms/"><i class="icon-hand-right" style="margin-right:5px"></i>등록 호수 정보 확인</a></li></ul>'
	});

	$('#resident').popover({
		html : 'true',
		placement : 'right',
		title : '[입주자 관리]',
		content : '<ul class="nav nav-tab main-menu" style="margin-bottom:-1px"><li><a href="/resident/info/"><i class="icon-hand-right" style="margin-right:5px"></i>입주자 정보 입력</a></li><li><a href="/resident/show/"><i class="icon-hand-right" style="margin-right:5px"></i>입주자 정보 확인</a></li></ul>'
	});

	// popover를 열 때, 다른 모든 popover를 끈다. (중복되지 않기 위하여)
	$('#building').on('click', function() {
		$('#resident').popover('hide');
	});
	$('#resident').on('click', function() {
		$('#building').popover('hide');
	});
}
*/
