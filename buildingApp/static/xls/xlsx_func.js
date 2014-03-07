function xlsx_to_json(workbook) {
	var result = {};
	workbook.SheetNames.forEach(function(sheetName) {
		var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
		if (roa.length > 0)
			result[sheetName] = roa;
	});
	return result;
}

function xlsx_to_csv(workbook) {
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

function xlsx_to_formulae(workbook) {
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
	var wb = XLSX.read(tarea.value, {type : 'base64'});
	xlsx_process_wb(wb);
}

function xlsx_process_wb(wb) {
	var output = "";
	// changeable //
	var type = 'csv';
	///////////////
	switch (type) {
		case "json":
			output = JSON.stringify(xlsx_to_json(wb), 2, 2);
			break;
		case "form":
			output = xlsx_to_formulae(wb);
			break;
		default:
			output = xlsx_to_csv(wb);
	}

	return output;
}

//var drop = document.getElementById('drop');
var xlsxFile = document.getElementById('fileInput');

function handleXLSX(files) {
	//e.stopPropagation();
	//e.preventDefault();
	var result;
	var i, f;
	for (i = 0, f = files[i]; i != files.length; ++i) {
		var reader = new FileReader();
		var name = f.name;
		reader.onload = function(e) {
			var data = e.target.result;
			var arr = String.fromCharCode.apply(null, new Uint8Array(data));
			var wb = XLSX.read(btoa(arr), {type: 'base64'});
			result = xlsx_process_wb(wb);
			excelParser(result);
		};
		reader.readAsArrayBuffer(f);
	}
}

function handleDragover(e) {
	e.stopPropagation();
	e.preventDefault();
	console.log(e);
	e.dataTransfer.dropEffect = 'copy';
}
