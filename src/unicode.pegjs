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
