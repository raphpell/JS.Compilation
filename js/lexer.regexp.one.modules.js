// Rules...
;(function(){
	var o = OneRegExpLexer.Rules
	;(function(){// SimpleRegexp = Sample test
	o.addTokens([
		['CHARSET',/\[\^?|\]|\-/],
		['PIPE',/\|/],
		['PUNCTUATOR',/\(|\)/],
		['QUANTIFIER1',/\{\d+(?:\,\d*)?\}/],
		['QUANTIFIER2',/\*|\+|\?/],
		['CHAR_ESCAPED',/\\./],
		['ANY',/\./],
		['CHAR',/[^\(\)\\\|\.\[\]\*\+\?\{\-]/]
		])
	o.addRule('SimpleRegExp','CHARSET|PIPE|PUNCTUATOR|QUANTIFIER1|QUANTIFIER2|CHAR_ESCAPED|ANY|CHAR')
	})()
	;(function(){// Common
	o.addTokens([
		['BACKSLASH',/\\/],
		['SINGLE_QUOTE',/'/],
		['DOUBLE_QUOTE',/"/],
		['LBRACE',/\{/],['RBRACE',/\}/],
		['LPAREN',/\(/],['RPAREN',/\)/],
		['LBRACK',/\[/],['RBRACK',/\]/],
		['ELISION',/\,/],
		['DOT',/\./],
		['SEMI',/\;/],
		['QUESTION',/\?/],
		['COLON',/\:/]
		])
	})()
	;(function(){// Number
	o.addTokens([
		['NUMBER',/[\+\-]?(?:(?:[1-9]\d*|0)|(?:0[xX](?:[0-9a-fA-F])+)|(?:0[0-7]+)|(?:0b[01]+)|(?:\d+\.\d*(?:[eE][\+\-]?\d+)?|\.?\d+(?:[eE][\+\-]?\d+)?))/]
		])
	})()
	;(function(){// SUPER SCRIPT
	o.addTokens([['S_PHP', /(?:\<\?(?:php\b|=))/]])
	o.addCSSClass("tag=S_PHP")
	})()
	;(function(){// STRINGS & COMMENTS	
	o.addTokens([
	// STRING
		['L_NEW_LINE_IN_STRING',/\r\n?|\n|\f/],
		['S_SSQ',/'/],['E_SSQ',/'/],['SSQ_IN',/(?:[^'\\\n\r\f \t]|\\[^\n\r\f \t])+/],
		['S_SDQ',/"/],['E_SDQ',/"/],['SDQ_IN',/(?:[^"\\\n\r\f \t]|\\[^\n\r\f \t])+/],
	// COMMENT
		['S_MLC',/\/\*/],['E_MLC',/[^\n\r\f \t]*\*\//],['MLC_IN',/(?:[^\*\n\r\f \t]|\*[^\/\n\r\f \t])+/],
		['S_SLC',/\/\//], ['SLC_IN',/[^\n\r\f \t]+/],
		])
	o.addRules([
		['SSQ','S_PHP|TAB|SPACES|L_NEW_LINE_IN_STRING|SSQ_IN|BACKSLASH|E_SSQ'],
		['SDQ','S_PHP|TAB|SPACES|L_NEW_LINE_IN_STRING|SDQ_IN|BACKSLASH|E_SDQ'],
		['MLC','S_MLC|E_MLC|L_NEW_LINE|TAB|SPACES|MLC_IN'],
		['SLC','S_SLC|TAB|SPACES|SLC_IN|NOT_WHITE_SPACES']
		])
	o.setPreviousTokenOf("L_NEW_LINE_IN_STRING","BACKSLASH")
	o.setTokensTranslation('L_NEW_LINE_IN_STRING=NEW_LINE&SSQ=STRING&S_SSQ=SINGLE_QUOTE&E_SSQ=SINGLE_QUOTE&SDQ=STRING&S_SDQ=DOUBLE_QUOTE&E_SDQ=DOUBLE_QUOTE&MLC=COMMENT&SLC=COMMENT')
	o.addCSSClass([
		'string=SSQ|SDQ',
		'comment=SLC|MLC',
		'linefeed=L_NEW_LINE_IN_STRING'
		])
	})()
	;(function(){// PHP
	o.addTokens([
		['E_PHP',/(?:\?\>)/],
		['PHP_SPECIAL_VARS',/(?:\$(?:GLOBALS|_(?:COOKIE|ENV|FILES|GET|POST|REQUEST|SE(?:RVER|SSION))))\b/],
		['PHP_IDENTIFIER',/\$[\w_][\w\d_]*\b/],
		['PHP_KEYWORD',/\b(?:break|case|continue|declare|default|do|each|elseif|else|foreach|for|goto|if|include|include_once|require|require_once|return|switch|while)\b/],
		['PHP_LITERAL',/\b(?:true|TRUE|false|FALSE|null|NULL)\b/],
		['PHP_RESERVED',/\b(?:\@|and|or|xor|exception|as|var|class|const|declare|die|echo|empty|eval|exit|extends|function|global|isset|list|new|print|static|unset|use|__FUNCTION__|__CLASS__|__METHOD__|final|interface|implements|extends|public|private|protected|abstract|clone|\$this)\b/],
		['PHP_FUNCTION',/\b\w[\w\d_]*\b/],
		
		['PHP_ARITHMETIC_OP',/\+\+?|\-\-?|\*|\%|\//],
		['PHP_ASSIGNMENT_OP',/\+=|\-=|\*=|\/=|\.=|\%=|\&=|\|=|\^=|<<=|>>=|=>?/],
		['PHP_BITWISE_OP',/&|\||\^|\~|<<|>>/],
		['PHP_COMPARISON_OP',/===?|!==?|<>|<=?|>=?/],
		['PHP_ERROR_CONTROL_OP',/@/],
		['PHP_LOGICAL_OP',/and|or|xor|!|&&|\|\|/],
		['PHP_STRING_OP',/\./],
		['PHP_TYPE_OP',/\((?:int|float|string|array|object|bool)\)/]
		])
	o.addRule( 'PHP',[
		'E_PHP',
		'NUMBER',
		'L_NEW_LINE|SPACES|TAB',
		'S_SLC|S_MLC',
		'PHP_COMPARISON_OP|PHP_ASSIGNMENT_OP|PHP_ARITHMETIC_OP|PHP_LOGICAL_OP|PHP_BITWISE_OP|PHP_ERROR_CONTROL_OP|PHP_STRING_OP|PHP_TYPE_OP',
		'S_SSQ|S_SDQ',
		'ELISION|LBRACE|RBRACE|LPAREN|RPAREN|LBRACK|RBRACK',
		'DOT|SEMI|COLON|QUESTION',
		'PHP_RESERVED|PHP_LITERAL|PHP_KEYWORD|PHP_SPECIAL_VARS|PHP_FUNCTION|PHP_IDENTIFIER',
		'NOT_WHITE_SPACES'
		].join('|'))
	o.addCSSClass([
		'operator=PHP_UNARY_OP|PHP_LOGICAL_OP|PHP_ARITHMETIC_OP|PHP_ASSIGNMENT_OP|PHP_COMPARISON_OP|PHP_STRING_OP|PHP_ERROR_CONTROL_OP',
		'special=PHP_SPECIAL_VARS',
		'function=PHP_FUNCTION',
		'block=PHP_BRACE',
		'identifier=PHP_IDENTIFIER',
		'keyword=PHP_KEYWORD|PHP_RESERVED',
		'literal=PHP_LITERAL'
		])
	o.setTokensTranslation([
		'PHP_BRACE=BRACE','S_PHP_BRACE=LBRACE','E_PHP_BRACE=RBRACE'
		])
	})()
	;(function(){// JS
	o.addTokens([
		['R_REGULAR_EXPRESSION',/\/(?:(?:[^\n\r\f\*\\\/\[]|(?:\\[^\n\r\f])|(?:\[(?:(?:[^\n\r\f\]\\]|(?:\\[^\n\r\f]))*)\]))(?:(?:[^\n\r\f\\\/\[]|(?:\\[^\n\r\f])|(?:\[(?:(?:[^\n\r\f\]\\]|(?:\\[^\n\r\f]))*)\]))*))\/(?:(?:[a-zA-Z])*)/],
		['REGULAR_EXPRESSION_IN',/[^\t ]+/],
		['JS_IDENTIFIER',/[\$\_a-zA-Z]+[\$_\w\d]*/],
		['JS_KEYWORD',/\b(?:break|case|catch|continue|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with)\b/],
		['JS_LITERAL',/\b(?:true|false|null|undefined|Infinity|NaN)\b/],
		['JS_UNARY_OP',/\+\+|\-\-|\~|\!/],
		['JS_ARITHMETIC_OP',/[\+\-\*\%\/]/],
		['JS_LOGICAL_OP',/&&|\|\|/],
		['JS_COMPARISON_OP',/(?:[<>]|[=!]=)=?/],
		['JS_ASSIGNMENT_OP',/=|\*=|\/=|\%=|\+=|\-=|<<=|>>=|>>>=|\&=|\^=|\|=/]
		])
	o.addRule( 'JS',['L_NEW_LINE|SPACES|TAB',
			'JS_KEYWORD|JS_LITERAL|JS_IDENTIFIER',
			'LBRACE|RBRACE|LPAREN|RPAREN|LBRACK|RBRACK',
			'S_SSQ|S_SDQ|S_MLC|S_SLC',
			'R_REGULAR_EXPRESSION',
			'NUMBER',
			'ELISION|DOT|SEMI|COLON|QUESTION',
			'S_PHP',
			'JS_LOGICAL_OP|JS_COMPARISON_OP|JS_ASSIGNMENT_OP|JS_UNARY_OP|JS_ARITHMETIC_OP',
			'NOT_WHITE_SPACES'
			].join('|'))
	o.addRule( 'REGULAR_EXPRESSION', 'TAB|SPACES|REGULAR_EXPRESSION_IN' )
	o.setPreviousTokenOf("R_REGULAR_EXPRESSION","JS_ARITHMETIC_OP|JS_ASSIGNMENT_OP|JS_COMPARISON_OP|JS_LOGICAL_OP|ELISION|DOT|LPAREN|LBRACE|LBRACK|COLON|SEMI|QUESTION|JS_KEYWORD")
	o.addCSSClass([
		'charset=CHARSET',
		'punctuator=PIPE|PUNCTUATOR',
		'repetition=QUANTIFIER1|QUANTIFIER2',
		'character=CHAR_ESCAPED|ANY|CHAR',
		'operator=JS_UNARY_OP|JS_LOGICAL_OP|JS_ARITHMETIC_OP|JS_ASSIGNMENT_OP|JS_COMPARISON_OP',
		'linefeed=L_NEW_LINE',
		'whitespaces=WHITE_SPACES',
		'tab=TAB',
		'space=SPACES|TAB',
		'undefined=NOT_WHITE_SPACES|BACKSLASH',
		'regexp=R_REGULAR_EXPRESSION',
		'number=NUMBER',
		'block=JS_BRACE',
		'punctuator=ELISION|LBRACE|RBRACE|LPAREN|RPAREN|LBRACK|RBRACK|DOT|SEMI|QUESTION|COLON',
		'elision=ELISION',
		'identifier=JS_IDENTIFIER',
		'keyword=JS_KEYWORD',
		'literal=JS_LITERAL',
		'tag=S_PHP|E_PHP',
		'php=PHP'
		])
	o.setTokensTranslation([
		'R_REGULAR_EXPRESSION=REGULAR_EXPRESSION',
		'JS_BRACE=BRACE','S_JS_BRACE=LBRACE','E_JS_BRACE=RBRACE'
		])
	})()
	})();