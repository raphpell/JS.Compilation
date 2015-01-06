AutomatonLexer.insert(function(o,f,g,h){
	var x ={ a:"ABCDEFabdef", b:"0123456789", c:"GHIJKLMNOPQRSTUVWXYZghijklmnopqrstvwyz" }
	o.addTokens([
		["E_CHARSET",{A:g("]"),M:[,[2]],F:[,,1]}],
		["E_NEGATED_CHARSET",{A:g("]"),M:[,[2]],F:[,,1]}],
		["REGEXP",(function(a0,a1,a2){return {A:g("["+a0+"]","c","["+a1+"]","^","["+a2+"]","u","x","(",")","*","+","-",".","?","[","[^c^ux()*+-.?[\\{|]"+a0+a1+a2+"]","\\","{","|","]"),M:[,[11,11,11,11,11,11,11,12,13,14,15,16,17,18,9,11,2,20,21],h(20,10,1,3,5,7,6,8),h(7,10,2,0,3,0),[10,10,10],[6,6,6],[4,4,4],[5,5,5],[4,4,4],{3:19}],F:[,,10,11,,,,11,11,8,11,10,1,2,3,4,5,6,7,9,12,13],R:[[0,f(a0,1)],[2,f(a1,1)],[4,f(a2,1)],[15,f("c^ux()*+-.?[\\{|]"+a0+a1+a2+"")]],TokensTable:',S_SUB_REGEXP,E_SUB_REGEXP,STAR,PLUS,MINUS,DOT,QUESTION,S_CHARSET,S_NEGATED_CHARSET,CHAR,CHAR_ESCAPED,S_QUANTIFIER,PIPE'.split(',')}})( x.a, x.b, x.c )],
		["CHARSET_IN",(function(a0,a1,a2){return {A:g("["+a0+"]","c","["+a1+"]","["+a2+"]","u","x","(",")","*","+","-",".","?","[","[^cux()*+-.?[\\{|}]"+a0+a1+a2+"]","\\","{","|","}","]"),M:[,[10,10,10,10,10,10,11,12,13,14,15,16,17,18,10,2,19,20,21],h(20,9,1,3,4,7,5,8),h(6,9,2,0),[9,9,9],[6,6,6],[4,4,4],[5,5,5],[4,4,4]],F:[,,9,10,,,,10,10,10,9,1,2,3,4,5,6,7,8,11,12,13],R:[[0,f(a0,1)],[2,f(a1,1)],[3,f(a2,1)],[14,f("cux()*+-.?[\\{|}]"+a0+a1+a2+"")]],TokensTable:',LPAREN,RPAREN,STAR,PLUS,MINUS,DOT,QUESTION,LBRACK,CHAR,CHAR_ESCAPED,LBRACE,PIPE,RBRACE'.split(',')}})( x.a, x.b, x.c )],
		["QUANTIFIER",{A:g("[0123456789]",",","}"),M:[,[2,3,4],[2]],F:[,,2,1,3],R:[[0,f("0123456789",1)]],TokensTable:[,'ELISION','INTEGER','E_QUANTIFIER']}]
		])
	o.addRules([
		["RegExp","REGEXP"],
		["CHARSET","CHARSET_IN|E_CHARSET"],
		["NEGATED_CHARSET","CHARSET_IN|E_NEGATED_CHARSET"],
		["SUB_REGEXP","REGEXP"]
		])
	o.addCSSClass("regexp=REGEXP|SUB_REGEXP&reserved=DOT|PIPE|MINUS|LBRACK|LPAREN|RPAREN|STAR|PLUS|QUESTION|LBRACE|RBRACE&any=DOT&alternation=PIPE&character=LBRACK|LPAREN|RPAREN|CHAR_ESCAPED|CHAR&charclass=CHARSET|NEGATED_CHARSET&block=S_CHARSET|E_CHARSET|S_NEGATED_CHARSET|E_NEGATED_CHARSET|S_SUB_REGEXP|E_SUB_REGEXP|S_QUANTIFIER|E_QUANTIFIER&negated=NEGATED_CHARSET&quantifier=QUANTIFIER|STAR|PLUS|QUESTION&integer=INTEGER&elision=ELISION")
	o.setTokensTranslation('S_CHARSET=LBRACK&E_CHARSET=RBRACK&S_NEGATED_CHARSET=NLBRACK&E_NEGATED_CHARSET=NRBRACK&S_SUB_REGEXP=LPAREN&E_SUB_REGEXP=RPAREN&S_QUANTIFIER=LBRACE&E_QUANTIFIER=RBRACE')
	});