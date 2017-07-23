/////////////
// Message //
/////////////

Messages "messages"
	= messages:(Message __ LineTerminatorSequence*)* { return messages.map(m => m[0]); }

Message "message"
	= author:MessageAuthor __ ":" __ content:MessageContent { return {author, content}; }

MessageAuthor "message author"
	= $Identifier
	/ expression:Expression { return "" + expression; }

MessageContent "message content"
	= $Identifier
	/ expression:Expression { return "" + expression; }
