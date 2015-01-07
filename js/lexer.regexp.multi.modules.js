;(function(){ // Languages definition
	var o = MultiRegExpLexer.Rules
	// REGEXP LANGUAGE
	o.addTokens({ list:[
		['CHARSET',/\[\^?|\]|\-/],
		['PIPE',/\|/],
		['PUNCTUATOR',/\(|\)/],
		['QUANTIFIER1',/\{\d+(\,\d*)?\}/],
		['QUANTIFIER2',/\*|\+|\?/],
		['CHAR_ESCAPED',/\\./],
		['ANY',/\./],
		['CHAR',/[^\(\)\\\|\.\[\]\*\+\?\{\-]/]
		]})
	o.addGroup({name:'RegExp', list:'CHARSET,PIPE,PUNCTUATOR,QUANTIFIER1,QUANTIFIER2,CHAR_ESCAPED,ANY,CHAR'.split(',')})
	// JS + PHP LANGUAGE
	o.addTokens({ list:[
		['ELISION',/,/],
		['UNARY_OPERATOR',/\+\+|\-\-|\~|\!/],
		['ARITHMETIC_OPERATOR',/[\+\-\*\%\/]/],
		['LOGICAL_OPERATOR',/&&|\|\|/],
		['COMPARISON_OPERATOR',/(?:[<>]|[=!]=)=?/],
		['ASSIGNMENT_OPERATOR',/=|\*=|\/=|\%=|\+=|\-=|<<=|>>=|>>>=|\&=|\^=|\|=/],
		['L_NEW_LINE',/[\n\r]/],
		['WHITE_SPACES',/[ \t]+/],
		['TAB',/\t/],
		['SPACES',/[ ]/],
		['NOT_WHITE_SPACES',/[^\s]+/],
		['BACKSLASH',/\\/],
		['S_SSQ',/'/],
		['SSQ_IN',/([^'\\\n\r\f \t]|\\[^\n\r\f \t])+/],
		['E_SSQ',/'/],
		['S_SDQ',/"/],
		['SDQ_IN',/([^"\\\n\r\f \t]|\\[^\n\r\f \t])+/],
		['E_SDQ',/"/],
		['S_SLC',/\/\//],
		['SLC_IN',/[^\n\r\f \t]+/],
		['S_MLC',/\/\*/],
		['MLC_IN',/[^\n\r\f \t\*]+\**|\*+[^\n\r\f \t\/]*/],
		['E_MLC',/[^\n\r\f \t\*]*\*+\//],
		['R_REGULAR_EXPRESSION',/\/(?:\\\/|[^\s\*\/])(?:\\\/| |	|[^\s\/])*\/[gim]*/],
		['REGULAR_EXPRESSION_IN',/[^\t ]+/],
		['NUMBER',/\d+/],
		['LBRACE',/\{/], ['RBRACE',/\}/],
		['LPAREN',/\(/], ['RPAREN',/\)/],
		['LBRACK',/\[/], ['RBRACK',/\]/],
		['DOT',/\./],
		['SEMI',/\;/],
		['QUESTION',/\?/],
		['COLON',/\:/],
		['JS_KEYWORD',/\b(?:break|c(?:ase|atch|ontinue)|d(?:efault|elete|o)|else|f(?:inally|or|unction)|i(?:f|n|nstanceof)|new|return|switch|t(?:his|hrow|ry|ypeof)|v(?:ar|oid)|w(?:hile|ith))\b/],
		['JS_LITERAL',/\b(?:true|false|null|undefined|Infinity|NaN)\b/],
		['JS_IDENTIFIER',/[\$\_a-zA-Z]([\$\_a-zA-Z]|\d)*/],
		['S_PHP',/\<\?(?:php\b|=)/],
		['E_PHP',/\?\>/],
		['PHP_SPECIAL_VARS',/(?:\$(?:GLOBALS|_(?:COOKIE|ENV|FILES|GET|(?:PO|REQUE)ST|SE(?:RVER|SSION))))\b/g],
		['PHP_KEYWORD',/(?:break|case|continue|declare|default|do|each|elseif|else|foreach|for|goto|if|include|include_once|require|require_once|return|switch|while)\b/],
		['PHP_LITERAL',/(?:true|TRUE|false|FALSE|null|NULL)\b/],
		['PHP_RESERVED',/(?:\@|and|or|xor|exception|as|var|class|const|declare|die|echo|empty|eval|exit|extends|function|global|isset|list|new|print|static|unset|use|__FUNCTION__|__CLASS__|__METHOD__|final|interface|implements|extends|public|private|protected|abstract|clone|\$this)\b/],
		['PHP_IDENTIFIER',/\$[\w_][\w\d_]*\b/],
		['PHP_FUNCTION',/\b\w[\w\d_]*\b/]
		]})
	o.addGroups([
		{name:'JS', list:[
			'L_NEW_LINE','SPACES','TAB',
			'JS_KEYWORD','JS_LITERAL','JS_IDENTIFIER',
			'LBRACE','RBRACE','LPAREN','RPAREN','LBRACK','RBRACK',
			'S_SSQ','S_SDQ',
			'S_MLC','S_SLC',
			'R_REGULAR_EXPRESSION',
			'NUMBER',
			'ELISION',
			'DOT','SEMI','COLON','QUESTION',
			'S_PHP',
			'LOGICAL_OPERATOR','COMPARISON_OPERATOR','ASSIGNMENT_OPERATOR','UNARY_OPERATOR','ARITHMETIC_OPERATOR',
			'NOT_WHITE_SPACES'
			]},
		{name:'REGULAR_EXPRESSION', list:['TAB','SPACES','REGULAR_EXPRESSION_IN']},
		{name:'PHP', list:[
			'L_NEW_LINE','SPACES','TAB',
			'E_PHP',
			'LBRACE','RBRACE','LPAREN','RPAREN','LBRACK','RBRACK',
			'ELISION',
			'S_SSQ','S_SDQ',
			'S_MLC','S_SLC',
			'NUMBER','SEMI',
			'PHP_KEYWORD','PHP_RESERVED','PHP_LITERAL','PHP_SPECIAL_VARS','PHP_IDENTIFIER','PHP_FUNCTION',
			'COMPARISON_OPERATOR','ASSIGNMENT_OPERATOR','ARITHMETIC_OPERATOR','UNARY_OPERATOR',
			'NOT_WHITE_SPACES'
			]},
		{name:'SSQ', list:'L_NEW_LINE,TAB,SPACES,SSQ_IN,E_SSQ,BACKSLASH'.split(',')},
		{name:'SDQ', list:'L_NEW_LINE,TAB,SPACES,SDQ_IN,E_SDQ,BACKSLASH'.split(',')},
		{name:'MLC', list:'L_NEW_LINE,TAB,SPACES,E_MLC,MLC_IN'.split(',')},
		{name:'SLC', list:'TAB,SPACES,SLC_IN'.split(',')}
		])
	})();