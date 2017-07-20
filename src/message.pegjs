/////////////
// Message //
/////////////

Messages "messages"
	= messages:(Message __ LineTerminatorSequence*)* { return messages.map(m => m[0]); }

Message "message"
	= author:MessageAuthor __ ":" __ content:MessageContent { return {author, content}; }

MessageAuthor "message author"
	= $Identifier
	/ Expression

MessageContent "message content"
	= $Identifier
	/ Expression