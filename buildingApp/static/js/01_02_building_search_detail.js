var fromFloor;
var toFloor;
var isRevising;
var building_id; 

function Revise(done)
{
	if (done) {
		if (!confirm('수정하시겠습니까?'))
			return;
		else
			UpdateBuildingInfo();
	}

	isRevising = !done;
	if (!done) { // 수정 시작
		$('#reviseStart').hide();
		$('#reviseDone').show();
	}
	else { // 완료버튼 클릭
		$('#reviseStart').show();
		$('#reviseDone').hide();
	}

	$('#number').attr('disabled', done);
	$('#type').attr('disabled', done);
	$('#remote').attr('disabled', done);
	$('#name').attr('disabled', done);
	$('#address').attr('disabled', done);
	$('#manager').attr('disabled', done);

	$('#startFloor').attr('disabled', done);
	$('#startFloorNumber').attr('disabled', done);
	$('#endFloor').attr('disabled', done);
	$('#endFloorNumber').attr('disabled', done);
	$('.selOp').attr('disabled', done);
	if ($('#type').val() == '1') {
		$('.storeCheck').attr('disabled', done);
		for (i = fromFloor; i <= toFloor; i++) {
			if (i == 0)
				continue;
			if ($('#store_'+i).is(':checked')) {
				$('#storeNumRoom_'+i).attr('disabled', done);
				$('#storeNames_'+i).attr('disabled', done);
			}
		}
	}
	$('.parkingCheck').attr('disabled', done);
	for (i = fromFloor; i <= toFloor; i++) {
		if (i == 0)
			continue;
		if ($('#parking_'+i).is(':checked'))
			$('#parkingNum_'+i).attr('disabled', done);
	}
}

function ShowFloorInputForm(under, over)
{
	fromFloor = Number(under);
	toFloor = Number(over);

	// 기존에 있는 것 지우고 시작.
	$('.floor_under_over').remove();

	var data = new Array();
	for (i = under; i <= over; i++) {
		if (i == 0)
			continue;

		var param = {};
		param['floor_ko'] = (i < 0) ? '지하 '+(-i) : '지상 '+i;
		param['floor'] = i;
		param['b_d'] = ($('#type').val() == 0) ? 'disabled' : '';
		data.push(param);
	}

	// EJS template을 이용하여 data를 table 형식에 맞추어 보여준다.
	var template = new EJS({url : '/static/ejs/ee.ejs'}).render({'data' : data});
	$('.floor_under_over').remove();
	$('#building_floors > tbody > tr').eq(1).after(template);
	js_functions();
	updateSummary();
}

function js_functions()
{
	// 건물 층수 범위를 클릭해도 보여준다.
	$('.floorChange').change(function() {
		var under = $('#startFloorNumber').val();
		if ($('#startFloor').val() == '지하')
			under *= -1;
		var over = $('#endFloorNumber').val();
		if ($('#endFloor').val() == '지하')
			over *= -1;

		if (under > over) {
			alert('층수의 순서를 정확히 맞춰주세요.');
			$('#floors').hide();
			return;
		}
		ShowFloorInputForm(under, over);
	});
		
	// 원격검침 tooltip 보여주기
	$('#remote').change(function() {
		var id = $('#remote').val();
		var tooltip = '';
		if (id == '0') // 일반
			tooltip = '전기, 가스, 상하수도';
		else if (id == '1') // 원격검침1
			tooltip = '전기, 온수&난방, 상하수도';
		else // 원격검침2
			tooltip = '전기, 가스, 상하수도';
			$('#remote_tooltip').html('<a href="#" title="' + tooltip + '" data-rel="tooltip" class="btn btn-small"><i class="icon-question-sign"></i></a>');
	});

	// 건물 형식 = 임대건물 이면, 상가 부분을 모두 비활성화.
	$('#type').change(function() {
		if ($('#type').val() == 0)
			$('.storeCheck').attr('disabled', true);
		else
			$('.storeCheck').attr('disabled', false);
		updateSummary();
	});

	// 방개수 변경하면 그 옆의 호수가 x01호 ~ xyy호까지 자동으로 보여주도록 하는 것.
	$('.selOp').change(function() {
		var id = $(this).attr('id').replace('numRoom_', '');
		var floor = (id < 0) ? -id : id;
		var numRoom = $(this).val();
		if (numRoom == '0') {
			$('#s_room_'+id).val('없음');
			$('#e_room_'+id).val('없음');
		}
		else {
			var basement = (id < 0) ? 'B ' : '';
			var zero = (Number(numRoom) < 10) ? '0' : '';
			$('#s_room_'+id).val(basement+floor+'01호');
			$('#e_room_'+id).val(basement+floor+zero+numRoom+'호');
		}
		updateSummary();
	});

	// 상가 임대 체크에 따른 활성화
	$('.storeCheck').change(function() {
		var floor = $(this).attr('id').replace('store_', '');
		var chk = $(this).is(':checked');
		$('#storeNumRoom_'+floor).attr('disabled', !chk);
		$('#storeNames_'+floor).attr('disabled', !chk);
		$('#storeNumRoom_'+floor).val('');
		$('#storeNames_'+floor).val('');
		updateSummary();
	});

	// 주차 유무에 따른 활성화
	$('.parkingCheck').change(function() {
		var floor = $(this).attr('id').replace('parking_', '');
		var chk = $(this).is(':checked');
		$('#parkingNum_'+floor).attr('disabled', !chk);
		$('#parkingNum_'+floor).val('');
	});

	$('.selOp_store').change(function() {
		updateSummary();
	});
	$('.selOp_parking').change(function() {
		updateSummary();
	});
}

function updateSummary()
{
	// 요약 합계에 보여주는 부분
	var from = (fromFloor < 0) ? '지하 ' : '지상 ';
	from += ((fromFloor < 0) ? -fromFloor : fromFloor) + '층';
	var to = (toFloor < 0) ? '지하 ' : '지상 ';
	to += ((toFloor < 0) ? -toFloor : toFloor) + '층';
	$('.floor').html('<div>'+from+'</div><div>' + to + '</div>');

	var numRoom = 0;
	$('.selOp').each(function() {
		numRoom += Number($(this).val());
	});
	$('.numRoom').html(numRoom+'개');
	$('.numRoom2').html(numRoom+'개');

	if ($('#type').val() == '0') {
		$('.storeFloor').html('-');
		$('.storeNumRoom').html('-');
	}
	else {
		var numStoreFloor = 0;
		$('.storeCheck').each(function() {
			if ($(this).is(':checked'))
				numStoreFloor++;
		});
		$('.storeFloor').html(numStoreFloor+'층');

		var numStore = 0;
		$('.selOp_store').each(function() {
			numStore += Number($(this).val());
		});
		$('.storeNumRoom').html(numStore+'개');

		//$('.storeNames').html();
	}
	
	var numParking = 0;
	$('.selOp_parking').each(function() {
		numParking += Number($(this).val());
	});
	$('.parkingNum').html('총 ' + numParking+'면');

}



function UpdateBuildingInfo()
{	
	var data = {};
	data['number'] = $('#number').val();
	data['type'] = $('#type').val();
	data['remote'] = $('#remote').val();
	data['name'] = $('#name').val();
	data['address'] = $('#address').val();
	data['manager'] = $('#manager').val();

	data['floorFrom'] = fromFloor;
	data['floorTo'] = toFloor;
	data['numRoom'] = Number($('.numRoom').html().replace('개', '').trim());
	data['numStore'] = Number($('.storeNumRoom').html().replace('개', '').trim());
	if ($('.storeNumRoom').html() == '-') { // 상가를 아예 쓰지 않을 때 (임대 건물)
		data['numStore'] = Number(0);
	}
	data['numParking'] = Number($('.parkingNum').html().replace('총', '').replace('면', '').trim());
	
	// 이미 사용중인 번호는 허용 불가능
	if (Number(data['number']) < 0) {
		alert('이미 사용중인 건물 번호입니다...');
		return;
	}
	// 빈 칸이 있으면 알려준다.
	var names = new Array('number', 'type', 'remote', 'name', 'address', 'manager');
	for (i = 0; i < names.length; i++) {
		if (data[names[i]] == '') {
			alert('빈 칸을 입력해 주세요.');
			$('#'+names[i]).focus();
			return;
		}
	}

	var floors = [];
	for (i = fromFloor; i <= toFloor; i++) {
		if (i == 0)
			continue;

		var floor = {};
		floor['floor'] = i;
		floor['roomNum'] = $('#numRoom_'+i).val();
		floor['hasStore'] = $('#store_'+i).is(':checked') ? 'y' : 'n';
		floor['storeNum'] = $('#storeNumRoom_'+i).val();
		floor['storeNames'] = $('#storeNames_'+i).val();
		floor['hasParking'] = $('#parking_'+i).is(':checked') ? 'y' : 'n';
		floor['parkingNum'] = $('#parkingNum_'+i).val();

		floors.push(floor);
	}
	data['floors'] = floors;

	if (confirm('수정하시겠습니까?'))
		doAjax(data);
}

var doAjax = function(postData) {
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 

	$.ajax({
		type : 'POST',
		url : '/building/update/'+building_id+'/',
		data : postData,
		success : function() {
			alert('성공적으로 입력되었습니다.');
		},
		error : function(msg) {
			alert('error : ' + msg);	
		},
	});
	
}

