/* global jQuery */
/* global io */
var socket = io();
var $button = jQuery('#onoff');
var $users = jQuery('#users');

socket.on('users', function (count) {
	console.info('users: %s', count);
	$users.text(count);
});

$button.on('click', function (e) {
	var state = $button.data('led');
	if (state === 'on') {
		socket.emit('led', { led: 0 });
		$button.data('led', 'off');
		$button.text('On');
	} else {
		socket.emit('led', { led: 1 });
		$button.data('led', 'on');
		$button.text('Off');
	}
});

socket.on('led', function (data) {
	if (data.led === 1) {
		$button.data('led', 'on');
		$button.text("Off");
	} else {
		$button.data('led', 'off');
		$button.text("On");
	}
});
