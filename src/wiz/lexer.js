AutomatonLexer.insert(function(o,f,g,h){
var x =["\t ","0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"]
o.addTokens([
	["WIZ",(function(a0,a1,a2){return {A:g("["+a0+"]","\n","\f","\r","/","["+a1+"]","["+a2+"]","(","*","=","¤"),M:[,[8,3,3,4,6,9,10,,,11,15],[5,2,2,2],[5,2,2,2],[5,3,2,2],{0:5,7:12},{4:14,8:13},[7],[8],{5:9},{6:10},[7]],F:[,,,1,1,,,5,1,6,7,,2,3,4,8],R:[[0,f(a0,1)],[5,f(a1,1)],[6,f(a2,1)]],TokensTable:',WHITE_SPACES,S_BLOCK,S_MLC,S_SLC,S_RULE,COMPIL,IDENTIFIER,S_WIZ_IMPORT'.split(',')}})(x[0],"!#@",x[1])],
	["WIZ_IMPORT",{A:g("[^\n\f\r,]",","),M:[,[2,3],[2]],F:[,,2,1],R:[[0,f("\n\f\r,")]],TokensTable:[,'ELISION','WIZ_FILE']}],
	["RULE",{A:g("[^\n\f\r]"),M:[,[2],[2]],F:[,,1],R:[[0,f("\n\f\r")]],TokensTable:[,'RULE_IN']}],
	["BLOCK",(function(a0,a1){return {A:g("\n","["+a0+"]","["+a1+"]","\f","\r",")",":"),M:[,[5,3,4,5,2,6,7],[5],[,3],[,,4]],F:[,,1,1,4,1,2,3],R:[[1,f(a0,1)],[2,f(a1,1)]],TokensTable:[,'WHITE_SPACES','E_BLOCK','S_VALUE','ATTRIBUTE']}})(x[0],x[1])],
	["VALUE",{A:g("[^),]",","),M:[,[2,3],[2]],F:[,,2,1],R:[[0,f("),")]],TokensTable:[,'E_VALUE','VALUE_IN']}]
	])
o.addCSSClass("whitespaces=WHITE_SPACES&compil=COMPIL|S_WIZ_IMPORT&identifier=IDENTIFIER|ATTRIBUTE&value=WIZ_FILE|RULE_IN")
o.setPreviousTokenOf("S_RULE","IDENTIFIER")
o.setTokensTranslation('WIZ_IMPORT=REQUIRED')
});