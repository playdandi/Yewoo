var curPosition = 'resident_file';

var fname, ext;
var files;

$('input[id=residentFileInput]').change(function() {
	// explorer에서는 change가 두번 실행되는 것 같아 예외처리 if문 걸었음...
	fname = $(this).val();
	if (fname == '')
		return;
	
	fname = fname.split('\\')[2].trim();

	// xls copy로 parse하기
	var fileInput = document.getElementsByName('file');
	
	files = fileInput[0].files;
	/*
	for (var i = 0 ; i < files.length ; i++){
		console.log("filename: " + files[i].name);
		console.log('type : ' + files[i].type);
		console.log('size : ' + files[i].size + ' bytes');
	}
	*/
	
	var temp = fname.split('.');
	ext = temp[temp.length-1];
	if (ext != 'xls' && ext != 'xlsx') {
		alert('엑셀 파일만 첨부 가능합니다. (확장자가 xls 또는 xlsx)');
		return;
	}
	
	// input text box에 파일명 입력
	$('#filename').val(fname);
});

// '불러오기' 버튼 클릭
function LoadExcelFile()
{
	if (!(ext == 'xls' || ext == 'xlsx') || fname == '') {
		alert('파일을 선택해 주세요.');
		return;
	}

	var result;
	if (ext == 'xls')
		result = handleXLS(files);
	else if (ext == 'xlsx')
		result = handleXLSX(files);
}


var parsed_result;
var parsed_column;
var parsed_length_each;
function excelParser(result)
{
	// 파일에서 얻은 csv 결과로 적절히 parse.
	// 예기치 못한 공백 라인도 data에 포함될 경우가 있는데, 이는 아래의 for문에서 체크를 통해 배제한다.
	result = result.split('\n');
	var res = [];
	res.push(result[0]);

	for (var i = 1; i < result.length; i++) {
		if (result[i].split(',').join('').trim().length == 0)
			continue;
		pos = result[i].length-1;
		for (var j = pos; j >= 0; j--) {
			if (result[i][j] != ',') {
				pos = j+1;
				break;
			}
		}
		res.push(result[i].slice(0, pos));
	}

	var ptn = /\"[0-9\,]+\"/g;
	for (i = 1; i < res.length; i++) {
		matched = res[i].match(ptn);
		if (matched != null) {
			for (j = 0; j < matched.length; j++)
				res[i] = res[i].replace(matched[j], matched[j].split('"').join('').split(',').join('').trim());
		}

		res[i] = res[i].split(',');
	}

	// data parsing
	res = parseData(res);

	// db 내용 받아와서 비교하기
	doAjaxContents_ResidentInfo(res);
/*	
return;	

	// input text box에 파일명 입력
	$('#filename').val(fname);
	$('#filename_modal').val(fname);
	
	var template = new EJS({url : '/static/ejs/03_02_electricity_excel.ejs'}).render({'result' : res});
	$('#contents_modal').html(template);

	// 실제 서버에 저장할 때의 대기 변수에 넣는다.
	parsed_column = null;
	parsed_column = res[1];


	alert('엑셀 파일 데이터 로드 성공!\n미리보기를 통해 내용을 확인하세요.');
	*/
}

function parseData(res)
{
	parsed = []
	for (i = 1; i < res.length; i++) {
		var p = {};
		p['buildingName'] = res[i][0];
		p['manager'] = res[i][1];
		p['buildingRoomNumber'] = res[i][2];
		p['livingState'] = res[i][3];
		p['residentName'] = res[i][4];
		p['leaseNumber'] = res[i][5];
		p['leaseContractPeriod'] = res[i][6].replace('개월','').trim();
		p['inDate'] = res[i][7];
		p['outDate'] = res[i][8];

		p['realInDate'] = res[i][7];
		p['realOutDate'] = res[i][8];
		if (p['livingState'] == '재실')
			p['realOutDate'] = '';

		p['leaseType'] = res[i][9];
		p['leaseDeposit'] = res[i][10].split(',').join('').trim();
		p['leasePayWay'] = res[i][11];
		p['leasePayDate'] = res[i][12].replace('일','').trim();
		p['leaseMoney'] = res[i][13].split(',').join('').trim();
		p['maintenanceFee'] = res[i][14].split(',').join('').trim();
		p['surtax'] = res[i][15].split(',').join('').trim();

		p['checkType'] = res[i][16];
		var temp = res[i][17].split('/');
		if (p['checkType'] == '일반' || p['checkType'] == '원격검침2') {
			p['checkE'] = temp[0].trim();
			p['checkG'] = temp[1].trim();
			p['checkW'] = temp[2].trim();
		}
		else if (p['checkType'] == '원격검침1') {
			p['checkE'] = temp[0].trim();
			p['checkHWG'] = temp[1].trim();
			p['checkHG'] = temp[2].trim();
			p['checkHWW'] = temp[3].trim();
			p['checkHW'] = temp[4].trim();
		}

		p['readDate'] = res[i][18];
		p['readContent'] = res[i][19];
		p['agency'] = res[i][20];
		p['agencyName'] = res[i][21];
		p['outReason'] = res[i][22];
		p['contractorName'] = res[i][23];
		p['contractorGender'] = res[i][24];
		p['contractorContactNumber1'] = res[i][25];
		p['realResidentName'] = res[i][26];
		p['residentGender'] = res[i][27];
		p['relToContractor'] = res[i][28];
		p['residentContactNumber1'] = res[i][29];
		p['haveCar'] = (res[i][30] == '유') ? 'y' : 'n';
		if (p['haveCar'] == 'y') {
			p['parkingFee'] = res[i][31].split(',').join('').trim();
			p['carNumber'] = res[i][32];
		}
		else {
			p['parkingFee'] = 0;
			p['carNumber'] = '';
		}

		parsed.push(p);
	}

	return parsed;
}

var parsedData; // db내용과 비교한 뒤의 최신 parsed data

var doAjaxContents_ResidentInfo = function(parsed)
{
	var postData = {};
	var csrftoken = $.cookie('csrftoken');
	postData['csrfmiddlewaretoken'] = csrftoken; 

	$.ajax({
		type : 'POST',
		url : '/resident/getAllResidentInfo/',
		data : postData,
		success : function(result) {
			var oldCnt = 0;
			for (i = 0; i < parsed.length; i++) {
				parsed[i]['category'] = '신규';
				flag = false;
				for (j = 0 ; j < result.length; j++) {
					if (parsed[i]['buildingName'] == result[j]['buildingName']) {
						parsed[i]['uid'] = result[j]['rid'];
						parsed[i]['bid'] = result[j]['bid'];
						if (parsed[i]['buildingRoomNumber'] == result[j]['roomNumber']) {
							parsed[i]['category'] = '갱신';
							oldCnt++;
							break;
						}
					}
				}
			}

			parsedData = parsed;
			console.log(parsedData);

			var template = new EJS({url : '/static/ejs/02_03_infoFile.ejs'}).render({'data' : parsed});
			$('#file_content').html(template);

			$('#div_label').show();

			var explain = '불러온 입주자 정보 <font style="color:red">';
			explain += parsedData.length;
			explain += '</font>건 (신규 입주자 정보 <font style="color:red">';
			explain += (Number(parsedData.length) - oldCnt);
			explain += '</font>건 / 중복 정보 <font style="color:red">';
			explain += oldCnt;
			explain += '</font>건) 중 저장 가능한 입주자 정보는 <font style="color:red">';
			explain += parsedData.length;
			explain += '</font>건 입니다. ';
			explain += '<span><button class="btn btn-small btn-inverse" style="margin-left:20px" onclick="saveInfo();">저장하기</button></span>';
			$('.result_sentence').html(explain);
		},
		error : function(msg) {
			alert('오류가 발생했습니다...\n페이지 새로고침을 하거나 다시 시도해 주세요.');
		},
	});
};


// parsing된 데이터에서 '미리보기' 버튼 눌렀을 경우
function setPreviewInfo(idx)
{
	idx = Number(idx);
	var data = {};

	$('#buildingName_modal').html( parsedData[idx]['buildingName'] );
	$('#manager_modal').html( parsedData[idx]['manager'] );

	var roomNumber = Number( parsedData[idx]['buildingRoomNumber'] );
	if (roomNumber < 0)
		roomNumber = String(roomNumber).replace('-', 'B ');
	$('#buildingRoomNumber_modal').html(roomNumber);

	$('#maintenanceFee_modal').html( Number(parsedData[idx]['maintenanceFee']).toLocaleString().replace('.00','') );
	$('#surtax_modal').html( Number(parsedData[idx]['surtax']).toLocaleString().replace('.00','') );
	$('#residentName_modal').html( parsedData[idx]['residentName'] );
	$('#leaseNumber_modal').html( parsedData[idx]['leaseNumber'] + '회' );
	$('#leaseContractPeriod_modal').html( parsedData[idx]['leaseContractPeriod'] + '개월' );
	$('#inOutDate_modal').html( parsedData[idx]['inDate'] + ' ~ ' + parsedData[idx]['outDate'] );

	$('#leaseType_modal').html( parsedData[idx]['leaseType'] );
	$('#leaseDeposit_modal').html( Number(parsedData[idx]['leaseDeposit']).toLocaleString().replace('.00','') );
	$('#leasePay_modal').html( parsedData[idx]['leasePayWay'] + ', ' + parsedData[idx]['leasePayDate'] + '일, ' + Number(parsedData[idx]['leaseMoney']).toLocaleString().replace('.00','') + '원' );

	$('#checkType_modal').html( ' [' + parsedData[idx]['checkType'] + ']  ' );
	if (parsedData[idx]['checkType'] == '원격검침1') { // 원격검침1
		$('#checkEHWHW_modal').html( '전기(' + parsedData[idx]['checkE'] + '), 온수가스(' + parsedData[idx]['checkHWG'] + '), 난방가스(' + parsedData[idx]['checkHG'] + '), 온수수도(' + parsedData[idx]['checkHWW'] + '), 난방수도(' + parsedData[idx]['checkHW'] + ')' );
		$('#checkEGW_modal').html('');
	}
	else { // 일반 or 원격검침2
		$('#checkEHWHW_modal').html('');
		$('#checkEGW_modal').html( '전기(' + parsedData[idx]['checkE'] + '), 가스(' + parsedData[idx]['checkG'] + '), 상하수도(' + parsedData[idx]['checkW'] + ')' );
	}

	$('#readDate_modal').html( parsedData[idx]['readDate'] );
	$('#readContent_modal').html( parsedData[idx]['readContent'] );

	$('#agency_modal').html( parsedData[idx]['agency'] + ' (' + parsedData[idx]['agencyName'] + ')' );
	
	var checkOut = (parsedData[idx]['livingState'] == '퇴실') ? '확인' : '미확인';
	$('#checkIn_modal').html( '확인' );
	$('#checkOut_modal').html( checkOut );
	$('#realInDate_modal').html( parsedData[idx]['realInDate'] );
	if (checkOut == '확인') {
		$('#realOutDate_modal').html( parsedData[idx]['realOutDate'] );
		$('#outReason_modal').html( parsedData[idx]['outReason'] );
	}
	else {
		$('#realOutDate_modal').html('');
		$('#outReason_modal').html('');
	}
	
	$('#contractorNameGender_modal').html( parsedData[idx]['contractorName'] + ' (' + parsedData[idx]['contractorGender'] + ')');
	$('#contractorContactNumber1_modal').html( parsedData[idx]['contractorContactNumber1'] );


	$('#residentNameGender_modal').html( parsedData[idx]['realResidentName'] + ' (' + parsedData[idx]['residentGender'] + ')');
	$('#relToContractor_modal').html( parsedData[idx]['relToContractor'] );
	$('#residentContactNumber1_modal').html( parsedData[idx]['residentContactNumber1'] );
	
	if (parsedData[idx]['haveCar'] == 'y') {
		$('#haveCar_modal').html('있음 : 번호(' + parsedData[idx]['carNumber'] + '), 주차비용(' + Number(parsedData[idx]['parkingFee']).toLocaleString().replace('.00','') + '원)');
	}
	else {
		$('#haveCar_modal').html('없음');
	}

	$('#myModal').modal();
}



var L0 = false, L1 = false, L2 = false;

function filter(f)
{
	if ((L1 && f == '1') || (L2 && f == '2'))
		return;

	for (i = 0; i < 3; i++)
		$('#label'+i).removeClass('label-inverse');
	$('#label'+f).addClass('label-inverse');

	if (f == '0') { // 전체선택
		L0 = !L0;
		L1 = L2 = false;
		if (!L0)
			$('#label0').removeClass('label-inverse');

		for (var i = 0; i < parsedData.length; i++)
			$('#selCheck'+i).attr('checked', L0);
		$('#selCheck_all').attr('checked', L0);
	}
	else if (f == '1') { // 중복정보제거
		L1 = true;
		L0 = L2 = false;

		for (var i = 0; i < parsedData.length; i++) {
			if (parsedData[i]['category'] == '갱신')
				$('#selCheck'+i).attr('checked', false);
		}
	}
	else { // 중복정보포함
		L2 = true;
		L0 = L1 = false;

		for (var i = 0; i < parsedData.length; i++) {
			if (parsedData[i]['category'] == '갱신')
				$('#selCheck'+i).attr('checked', true);
		}
	}
}


// 저장하기 버튼 누른 경우
var saveInfo = function() {
	var postData = {};
	postData['csrfmiddlewaretoken'] = $.cookie('csrftoken');

	data = [];
	for (var i = 0; i < parsedData.length; i++) {
		if ($('#selCheck'+i).is(':checked')) {
			if (parsedData[i]['category'] == '신규')
				parsedData[i]['type'] = 'save';
			else
				parsedData[i]['type'] = 'update';
			data.push(parsedData[i]);
		}
	}

	// 하나도 체크되지 않은 경우 (저장할 필요가 없으므로 메시지 띄우자)
	if (data.length == 0) {
		alert('적어도 한 개 이상 항목을 체크해 주세요.');
		return;
	}

	for (var i = 0; i < data.length; i++) {
		for (var key in data[i]) {
			postData[i+'_'+key] = data[i][key];
			if (key == 'buildingName')
				postData[i+'_'+key] = data[i]['bid'];
		}
		postData[i+'_'+'checkIn'] = 'y';
		postData[i+'_'+'checkOut'] = (data[i]['livingState'] == '재실') ? 'n' : 'y';
		postData[i+'_'+'contractorRegNumber'] = '000000-0000000';
		postData[i+'_'+'contractorContactNumber2'] = '';
		postData[i+'_'+'contractorAddress'] = '';
		postData[i+'_'+'residentRegNumber'] = '000000-0000000';
		postData[i+'_'+'residentPeopleNumber'] = Number(1);
		postData[i+'_'+'residentOfficeName'] = '';
		postData[i+'_'+'residentAddress'] = '';
		postData[i+'_'+'residentContactNumber2'] = '';
		postData[i+'_'+'residentOfficeName'] = '';
		postData[i+'_'+'residentOfficeLevel'] = '';
		postData[i+'_'+'residentOfficeAddress'] = '';
		postData[i+'_'+'residentOfficeContactNumber'] = '';
		postData[i+'_'+'residentEmail'] = '';
		postData[i+'_'+'itemCheckIn'] = 'n';
		postData[i+'_'+'itemCheckOut'] = 'n';
		postData[i+'_'+'sendMsg'] = 'n';
		postData[i+'_'+'memo'] = '';

		if (postData[i+'_'+'checkType'] == '일반')
			postData[i+'_'+'checkType'] = '0';
		else if (postData[i+'_'+'checkType'] == '원격검침1')
			postData[i+'_'+'checkType'] = '1';
		else
			postData[i+'_'+'checkType'] = '2';
	}

	postData['length'] = Number(data.length);

	$.ajax({
		type : 'POST',
		url : '/resident/saveByFile/',
		data : postData,
		success : function(result) {
			alert('성공적으로 저장되었습니다.');
			window.location.reload();
		},
		error : function(msg) {
			alert('오류가 발생했습니다...\n다음 중 하나가 해당하면 오류가 발생할 수 있습니다.\n원인 1) 존재하지 않는 건물명\n원인 2) 건물 안에 존재하지 않는 호실 번호\n원인 3) 기타 주의사항에 반하는 데이터 형태\n\n확인하고 다시 시도해 주세요.');
		},
	});

};

// 주의사항 클릭한 경우
function Alert()
{
	var content = '<주의사항><br><br>';
	content += '기본사항 : 1행에 컬럼 이름, 2행부터 한 사람에 대한 데이터 넣으면 됩니다.<br>';
	content += '(컬럼 순서를 바꾸면 안 됩니다!)<br>';
	content += '건물명 : <b>등록되어 있는</b> 건물의 정확한 이름을 쓰세요.<br>';
	content += '호실 : <b>등록되어 있는</b> 건물의 <b>등록된</b>호실만 숫자로 적어야 합니다.<br>';
	content += '재실정보 : 재실/퇴실 둘 중 하나로 작성하세요.<br>';
	content += '입주회차 : 숫자만 적어야 합니다.<br>';
	content += '입주기간 : "숫자+개월" 형태로 기입하세요. (예: 15개월)<br>';
	content += '입주일, 만료일, 검침날짜 : "년.월.일" 형태로 기입하세요. (반드시 점(.)으로 구분!)<br>';
	content += '보증금, 임대료3, 관리비, 부가세, 주차비용 : 숫자만 적어야 합니다. (컴마(,)는 허용)<br>';
	content += '주차비용 : 30000, 20000, 10000 의 3가지 중 하나로 기입하세요.<br>';
	content += '임대료1 : 선불/후불 둘 중 하나로 기입하세요.<br>';
	content += '임대료2 : "숫자+일" 형태로 기입하세요. (예: 28일)<br>';
	content += '입주검침1 : 일반, 원격검침1, 원격검침2 의 3가지 중 하나로 기입하세요.<br>';
	content += '입주검침2 :<br>';
    content += '"전기/가스/수도" 순서대로 기입하세요. (반드시 슬래시(/)로 구분!)<br>';
	content += '(단, 원격검침1의 경우, "전기/온수(가스)/난방(가스)/온수(수도)/난방(수도)" 순서대로 기입하세요)<br>';
	content += '중개정보1 : 공인중개/직거래 둘 중 하나로 작성하세요.<br>';
	content += '연락처 2가지 : 반드시 하이픈(-)으로 구분하세요. (예: 010-1234-5678)<br>';
	content += '주차유무 : 유/무 둘 중 하나로 기입하세요.';
	
	$('#alertT').tooltip({
		html : true,
		//title : "<연체 내역><br>연체 내역을 확인하는 정보입니다.<br><br>미납이나 연체 내역이 있는 경우 [미납회차] 항목에 '미납' 과 '미납회차' 가 표시됩니다.<br>[누적] 항목에 누적된 회수가 표시됩니다.<br><br>미납이나 연체 내역이 없는 경우, [미납회차] 항목에 '고지'와 '고지회차' 가 표시됩니다."
		title : content,
		placement : 'left', 
	});
										//	<a href="#" title="<최근 미납 내역><br>1) 총 연체 기간 (연체 기간에 대한 정보)<br>2) 총 미납 회수 (총 미납된 회수 정보)<br>3) 총 미납 금액 (이번달 납부 금액을 제외한 최근까지 총 미납 금액)<br>으로 표시됩니다." data-rel="tooltip" data-html="true" data-placement="auto left" class="margin0"><button class="btn btn-small btn-danger" style="">주의사항</button><!--<i class="icon-question-sign"></i>--></a>
}

function ShowTooltip()
{
	$('#alertT').tooltip('show');
}










