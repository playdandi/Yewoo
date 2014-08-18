function Input(type, id)
{
	if (type == 'total')
		$(location).attr('href', '/lease/bill/total/input');
	else if (type == 'each')
		$(location).attr('href', '/lease/bill/each/input');
}
