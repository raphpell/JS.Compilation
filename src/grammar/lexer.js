// Attention: Fichier UTF-8
//		le symbole → se perd parfois au copié/collé
AutomatonLexer.insert(function(o,f,g,h){
	o.addTokens([
		["GRAMMAR",(function(a0){return {A:g("*","/","["+a0+"]","[^*/\n\t\f\r "+a0+"]","\n","\t","\f","\r"," "),M:[,[3,4,2,3,9,8,9,7,10],[3,3,2,3],h(4,3),[5,6,3,3],h(4,3),h(4,3),{4:9}],F:[,,7,4,4,5,6,2,1,2,3],R:[[2,f(a0,1)],[3,f("*/\n\t\f\r "+a0+"")]],TokensTable:',TAB,NEW_LINE,SPACES,SYMBOL,S_MLC,S_SLC,S_PRODUCTION'.split(',')}})("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_")],
		["PRODUCTION",{A:g("\t"," ","-",">","→"),M:[,[3,4,2,,5],{3:5}],F:[,,,1,2,3],TokensTable:[,'TAB','SPACES','S_RHS']}],
		["RHS",{A:g("[^\t\n\f\r epsilon|e]","e","i","l","n","o","p","s","|","e","\n","\t","\f","\r"," "),M:[,[2,4,2,2,2,2,2,2,10,3,12,13,12,11,14],h(10,2),h(10,2),h(10,2,6,5),h(10,2,7,6),h(10,2,2,7),h(10,2,3,8),h(10,2,5,9),h(10,2,4,3),h(10,2),{10:12}],F:[,,4,5,4,4,4,4,4,4,6,2,2,1,3],R:[[0,f("\t\n\f\r epsilon|e")]],TokensTable:',TAB,E_RHS,SPACES,SYMBOL,EPSILON,PIPE'.split(',')}]
		])
	o.addCSSClass("symbol=SYMBOL&alternation=PIPE&production=PRODUCTION&lhs=S_PRODUCTION&linefeed=E_PRODUCTION|E_RHS&rhs=RHS&rarrow=S_RHS&epsilon=EPSILON")
	o.setTokensTranslation('S_PRODUCTION=LHS&E_PRODUCTION=NEW_LINE&S_RHS=RARROW&E_RHS=NEW_LINE&EPSILON=SYMBOL_EPSILON')
	});
	