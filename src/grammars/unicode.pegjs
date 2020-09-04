//////////////////////////////////////////////
// Unicode whitespaces and line terminators //
//////////////////////////////////////////////

_
    = UnicodeWhitespace*
    / UnicodeLineTerminatorSequence*

__
    = UnicodeWhitespace*

UnicodeWhitespace
	= "\t"
	/ "\v"
	/ "\f"
	/ " "
	/ "\u00A0"
	/ "\uFEFF"
	/ [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]

UnicodeLineTerminator
	= [\n\r\u2028\u2029]

UnicodeLineTerminatorSequence
	= "\n"
	/ "\r\n"
	/ "\r"
	/ "\u2028"
	/ "\u2029"

/////////////////////
// Unicode letters //
/////////////////////

UnicodeLatinLetter
	= UnicodeLatinBasicLetter
	/ UnicodeLatinSupplementLetter
	/ UnicodeLatinExtendedALetter
	/ UnicodeLatinExtendedBLetter
	/ UnicodeLatinExtendedAdditionalLetter

UnicodeLatinBasicLetter
	= [\u0041-\u005a\u0061-\u007a]

UnicodeLatinSupplementLetter
	= [\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff]

UnicodeLatinExtendedALetter
	= [\u0100-\u017f]

UnicodeLatinExtendedBLetter
	= [\u0180-\u024f]

UnicodeLatinExtendedAdditionalLetter
	= [\u1e00-\u1eff]
