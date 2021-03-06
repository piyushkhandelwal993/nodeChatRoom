function divEscapedContentElement(message) {
	return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) {
	var message = $('#send-message').val();
	var systemMessage;
	if (message.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(message);
		//console.log("1"+systemMessage);
		if (systemMessage) {
			$('#messages').append(divSystemContentElement(systemMessage));
		}
	} else {
		//console.log(2);
		chatApp.sendMessage($('#room').text(), message);
		$('#messages').append(divEscapedContentElement(message));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}
	$('#send-message').val('');
}

var socket = io.connect();
$(document).ready(function() {
	var chatApp = new Chat(socket);
	socket.on('nameResult', function(result) {
		var message;
		if (result.success) {
			message = 'You are now known as ' + result.name + '.';
		} else {
			message = result.message;
		}
		$('#messages').append(divSystemContentElement(message));
	});
	socket.on('joinResult', function(result) {
		$('#room').text(result.room);
		$('#messages').append(divSystemContentElement('Room changed.'));
	});

	socket.on('message', function (message) {
		var newElement = $('<div></div>').text(message.text);
		$('#messages').append(newElement);
	});

	socket.on('rooms', function(rooms) {
		$('#room-list').empty();
		for(var room in rooms) {
			//console.log(room);
			room = room.substring(0, room.length);
			//console.log(room);
			if (room != '') {
				$('#room-list').append(divEscapedContentElement(room));
			}
		}
		$('#room-list div').click(function() {
			chatApp.processCommand('/join ' + $(this).text());
			$('#send-message').focus();
		});
	});
	setInterval(function() {
		socket.emit('rooms');
	}, 1000);
	$('#send-message').focus();

	$('#send-form').submit(function() {
		processUserInput(chatApp, socket);
		return false;
	});
});