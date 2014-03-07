function xls_to_json(workbook) {
	var result = {};
	workbook.SheetNames.forEach(function(sheetName) {
		var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
		if (roa.length > 0)
			result[sheetName] = roa;
	});
	return result;
}

function xls_to_csv(workbook) {
	var result = [];
	workbook.SheetNames.forEach(function(sheetName) {
		var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
		if (csv.length > 0) {
			//result.push("SHEET : " + sheetName);
			//result.push("");
			result.push(csv);
		}
	});
	return result.join('\n');
}

function xls_to_formulae(workbook) {
	var result = [];
	workbook.SheetNames.forEach(function(sheetName) {
		var formulae = XLSX.utils.get_formulae(workbook.Sheets[sheetName]);
		if (formulae.length > 0) {
			result.push("SHEET : " + sheetName);
			result.push("");
			result.push(formulae.join('\n'));
		}
	});
	return result.join('\n');
}

var tarea = document.getElementById('b64data');
function b64it() {
	//var wb = XLSX.read(tarea.value, {type : 'base64'});
	var cfb = XLS.CFB.read(tarea.value, {type : 'base64'});
	var wb = XLS.parse_xlscfb(cfb);
	xls_process_wb(wb);
}

function xls_process_wb(wb) {
	var output = "";
	// changeable //
	var type = 'csv';
	///////////////
	switch (type) {
		case "json":
			output = JSON.stringify(xls_to_json(wb), 2, 2);
			break;
		case "form":
			output = xls_to_formulae(wb);
			break;
		default:
			output = xls_to_csv(wb);
	}
}

var xlsxFile = document.getElementById('fileInput');

function handleXLS(files) {
	//e.stopPropagation();
	//e.preventDefault();
	var result;
	var i, f;
	for (i = 0, f = files[i]; i != files.length; ++i) {
		var reader = new FileReader();
		var name = f.name;
		reader.onload = function(e) {
			var data = e.target.result;
			var cfb = XLS.CFB.read(data, {type : 'binary'});
			var wb = XLS.parse_xlscfb(cfb);
			result = xls_process_wb(wb);
			excelParser(result);
		};
		reader.readAsBinaryString(f);
	}
}
