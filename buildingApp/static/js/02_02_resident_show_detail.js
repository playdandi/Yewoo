
function moneyToKorean(deposit)
{
	if (!IsNumberRight('leaseDeposit', deposit))
		return '';
	if (deposit.length == 0)
		return '';
	if (deposit.length > 10)
		return $('#leaseDeposit2').val();
	if (deposit.split('')[0] == '0')
		return '';

	var unit = new Array('', '십', '백', '천', '', '십', '백', '천', '', '십');
	deposit = deposit.split('');

	var korean = '';
	var man = false, eok = false;
	for (var i = 0; i < deposit.length; i++) {
		if (deposit[i] != '0') {
			korean += N1To10(deposit[i]) + unit[deposit.length-1-i];
			if (deposit.length-1-i >= 8)
				eok = true;
			if (deposit.length-1-i < 8 && deposit.length-1-i >= 4)
				man = true;
		}
		if (eok && deposit.length-1-i == 8)
			korean += '억 ';
		else if (man && deposit.length-1-i == 4)
			korean += '만 ';
	}

	return korean;
}

function N1To10(number)
{
	var korean = new Array('', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구');
	return korean[number];
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
