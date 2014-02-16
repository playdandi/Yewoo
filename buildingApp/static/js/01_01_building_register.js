var fromFloor;
var toFloor;

function InitForm()
{
	if (confirm('초기화하시겠습니까? (페이지를 다시 로드합니다)'))
		window.location.reload();
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
	updateSummary();

	// 건물 형식 = 임대건물 이면, 상가 부분을 모두 비활성화.
	$('#type').change(function() {
		if ($('#type').val() == 0) {
			for (f = under; f <= over; f++) {
				if (f == 0)
					continue;
				$('#store_'+f).attr('disabled', true);
				$('#storeNumRoom_'+f).attr('disabled', true);
				$('#storeNames_'+f).attr('disabled', true);
			}
		}
		else {
			for (f = under; f <= over; f++) {
				if (f == 0)
					continue;
				$('#store_'+f).attr('disabled', false);
				if ($('#store_'+f).is(':checked')) {
					$('#storeNumRoom_'+f).attr('disabled', false);
					$('#storeNames_'+f).attr('disabled', false);
				}
			}
		}
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
		updateSummary();
	});

	// 주차 유무에 따른 활성화
	$('.parkingCheck').change(function() {
		var floor = $(this).attr('id').replace('parking_', '');
		var chk = $(this).is(':checked');
		$('#parkingNum_'+floor).attr('disabled', !chk);
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
	//var fromFloor = $('#startFloor').val() + ' ' + $('#startFloorNumber').val() + '층';
	//var toFloor = $('#endFloor').val() + ' ' + $('#endFloorNumber').val() + '층';
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



function SaveBuildingInfo()
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

	if (confirm('저장하시겠습니까?'))
		doAjax(data);
}
/*
function IsRegNumberRight(name, number)
{
	console.log(name + ' : ' + number);
	// 주민번호는 숫자만 입력되고, 정확히 6자, 7자여야 한다.
	var re = new RegExp('[0-9]+');
	var numbers = number.split('-');
	if (numbers[0].length != 6 || numbers[1].length != 7 || 
		(numbers[0]+numbers[1]).replace(re, '') != '') {
		alert ('주민번호를 잘못 입력하셨습니다.');
		$('#'+name+'_1').focus();
		return false;
	}

	return true;
}

function IsNumberRight(name, number)
{
	var re = new RegExp('[0-9]+');
	if (number.replace(re, '') != '') {
		alert('숫자만 입력하세요.');
		$('#'+name).focus();
		return false;
	}

	return true;
}

function IsContactNumberRight(name, number)
{
	var re = new RegExp('[0-9]*');
	var numbers = number.split('-');

	if (numbers[0].replace(re, '') != '' || numbers[1].replace(re, '') != '' || numbers[2].replace(re, '') != '') {
		alert ('전화번호는 숫자만 입력할 수 있습니다.');
		$('#'+name+'_1').focus();
		return false;
	}

	if (numbers[0] == '' || number[1] == '' || number[2] == '') {
		if (name == 'contractorContactNumber1' || name == 'residentContactNumber1') {
			alert ('빈 칸이 존재합니다.');
			$('#'+name+'_1').focus();
			return false;
		}
	}

	if ((numbers[0] == '' || numbers[1] == '' || numbers[2] == '') &&
		(numbers[0] + numbers[1] + numbers[2] != '')) {
		alert('전화번호는 3개의 칸에 숫자를 모두 쓰셔야 합니다.');
		$('#'+name+'_1').focus();
		return false;
	}

	return true;
}

function IsEmailRight(email)
{
	var form = email.split('@');
	if (form.length < 2 || form[1].split('.').length < 2) {
		alert('이메일 형식이 잘못되었습니다.');
		return false;
	}

	return true;
}
*/

var doAjax = function(postData) {
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 
	$.ajax({
		type : 'POST',
		url : 'http://14.49.42.190:8080/building/save/',
		data : postData,
		success : function() {
			alert('성공적으로 입력되었습니다.');
			$(location).attr('href', 'http://14.49.42.190:8080/building/register/');
		},
		error : function(msg) {
			alert('error : ' + msg);	
		},
	});
	
}

