$(document).ready(function() {
	$('#get_info').click(requestInfo);
});

function requestInfo () {
	$.ajax({
		url: '/info',
		error: function(error) {
			console.log(error);
		},
		success: function(data) {
			$('#info').html(data);
		}
	});
}

