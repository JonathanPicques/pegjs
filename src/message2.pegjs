/////////////
// Message //
/////////////

Messages "Messages"
	= messages:(Message __ UnicodeLineTerminatorSequence*)* { return messages.map(m => m[0]); }

Message "Message"
	= character:MessageCharacter __ ":" __ content:MessageContent { return {character, content}; }

MessageCharacter "Message character"
    = head:(__ MessageCharacterPart)+ { return head.reduce((a, op) => a + op.join(""), ""); }

MessageContent "Message content"
    = head:(__ MessageContentPart)+ { return head.reduce((a, op) => a + op.join(""), ""); }

MessageCharacterPart
    = MessageExpression
    / !"{{" [^: ] { return text(); }

MessageContentPart
    = MessageExpression
    / !"{{" [^ ] { return text(); }

MessageExpression
    = "{{" __ expression:Expression __ "}}" { return expression; }