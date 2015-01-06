AutomatonLexer.insert(function(o,f,g,h){
	o.addTokens([
		["INI",{A:g("[^\t\n\f\r !\"&();=[]^{|}~flnseouatry]","a","e","f","l","n","o","r","s","t","u","y","\n","\t","\f","\r"," ",";","=","[","[!\"&()]^{|}~]"),M:[,[2,2,2,5,2,8,12,2,2,14,2,16,19,20,19,18,21,22,23,24,25],h(12,2),h(12,2),h(12,2,2,3),h(12,2,1,6),h(12,2,4,7),h(12,2,8,4),h(12,2,6,9,10,10),h(12,2,5,4),h(12,2,4,11),h(12,2,4,3),h(12,2,3,13,5,3),h(12,2,3,3),h(12,2,7,15),h(12,2,10,4),h(12,2,2,17),h(12,2,8,3),{12:19}],F:[,,8,9,8,8,8,8,8,9,8,8,8,8,8,8,8,8,2,2,1,3,4,5,6,7],R:[[0,f("\t\n\f\r !\"&();=[]^{|}~flnseouatry")],[20,f("!\"&()]^{|}~",1)]],TokensTable:',TAB,L_NEW_LINE,SPACES,S_INI_COMMENT,S_INI_VALUE,S_INI_SECTION,INI_TMP,INI_VAR,INI_KEYWORD'.split(',')}],
		["INI_COMMENT",{A:g("[\t ]","[^\n\f\r \t]"),M:[,[2,2],[2,2]],F:[,,1],R:[[0,f("\t ",1)],[1,f("\n\f\r \t")]],TokensTable:[,'INI_COMMENT_IN']}],
		["INI_SECTION",{A:g("[^\t\n\f\r ]]","\t"," ","]"),M:[,[2,3,4,5],[2]],F:[,,3,1,2,4],R:[[0,f("\t\n\f\r ]")]],TokensTable:[,'TAB','SPACES','INI_SECTION_IN','E_INI_SECTION']}],
		["INI_VALUE",{A:g("[^\t\n\f\r \"';]","\t"," ","\"","'"),M:[,[2,3,4,5,6],[2]],F:[,,5,1,2,3,4],R:[[0,f("\t\n\f\r \"';")]],TokensTable:[,'TAB','SPACES','S_INI_SDQ','S_INI_SSQ','INI_VALUE_IN']}],
		["INI_SDQ",{A:g("[^\t\n\f\r \"\\]","\\","\"","\t"," "),M:[,[3,2,6,4,5],[3,3,3],[3,2]],F:[,,,4,1,2,3],R:[[0,f("\t\n\f\r \"\\")]],TokensTable:[,'TAB','SPACES','E_INI_SDQ','INI_SDQ_IN']}],
		["INI_SSQ",{A:g("\n","[^\t\n\f\r ']","\t","\f","\r"," ","'"),M:[,[5,3,4,5,2,6,7],[5],[,3]],F:[,,2,5,1,2,3,4],R:[[1,f("\t\n\f\r '")]],TokensTable:[,'TAB','L_NEW_LINE','SPACES','E_INI_SSQ','INI_SSQ_IN']}]
		])
	o.addCSSClass("keyword=INI_KEYWORD&var=INI_VAR&undefined=INI_TMP&comment=INI_COMMENT&section=INI_SECTION_IN&value=INI_VALUE&punctuator=S_INI_VALUE&string=INI_SDQ|INI_SSQ")
	o.setTokensTranslation('INI_COMMENT=COMMENT&INI_SECTION_IN=SECTION&INI_VALUE=VALUES&S_INI_VALUE=OPERATOR&INI_SDQ=STRING&INI_SSQ=STRING')
	});