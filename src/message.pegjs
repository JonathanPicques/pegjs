/////////////
// Message //
/////////////

Messages "Messages"
	= messages:(Message __ UnicodeLineTerminatorSequence*)* { return messages.map(m => m[0]); }

Message "Message"
	= character:MessageCharacter __ ":" __ content:MessageContent { return {character, content}; }

MessageCharacter "Message character"
	= $Identifier
	/ expression:Expression { return "" + expression; }

MessageContent "Message content"
	= $Identifier
	/ expression:Expression { return "" + expression; }
