OneRegExpLexer.insert( function(o){
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
		['EQUAL',/\=/],
		['PLUS',/\+/],
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
		['MLC','S_PHP|E_MLC|L_NEW_LINE|TAB|SPACES|MLC_IN'],
		['SLC','S_PHP|TAB|SPACES|SLC_IN|NOT_WHITE_SPACES']
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
		['PHP_RESERVED',/(?:\@|and|or|xor|exception|as|var|class|const|declare|die|echo|empty|eval|exit|extends|function|global|isset|list|new|print|static|unset|use|__FUNCTION__|__CLASS__|__METHOD__|final|interface|implements|extends|public|private|protected|abstract|clone|\$this)\b/],
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
		'E_PHP|S_PHP',
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
	;(function(){// CSS
	o.addTokens([
		['CSS_ERROR',/[^\r\n\f \t\\\[\,\@\#\.\:\+\>\*\~_a-zA-Z\{]+/],
		['S_ATTRIBUTE_SELECTOR',/\[/],
		['E_ATTRIBUTE_SELECTOR',/\]/],
		['ATTRIBUTE_OPERATOR',/[\^$~|*]?=/],
		['ATTRIBUTE_SELECTOR_ERROR',/[^\]\t\n\r\u000b\f          ]/],
		['S_RULE_SET',/\{/],
		['E_RULE_SET',/\}/],
		['S_PROP_VALUE',/:/],
		['E_PROP_VALUE',/;/],
		['CSS_PHP_BUG',/[\-+]|(?:deg|rad|grad|px|cm|mm|in|pt|pc|em|ex|ms|s|hz|khz|%)/],
		['COMBINATOR',/[+>*~]/],
		['ATKEYWORD',/@-?(?:[_a-zA-Z]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))(?:[_a-zA-Z0-9\-]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))*/],
		['NAME',/(?:[_a-zA-Z0-9\-]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))+/],
		['HASH',/#(?:[_a-zA-Z0-9\-]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))+/],
		['IDENT',/-?(?:[_a-zA-Z]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))(?:[_a-zA-Z0-9\-]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))*/],
		['CLASS',/\.-?(?:[_a-zA-Z]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))(?:[_a-zA-Z0-9\-]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))*/],
		['S_PSEUDO',/::?/],
		['S_IMPORTANT',/!/],
		['E_IMPORTANT',/important/],
		['CSS_NUMBER',/-?(?:[0-9]+|[0-9]*\.[0-9]+)/],
		['DIMENSIONS',/-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:deg|rad|grad|px|cm|mm|in|pt|pc|em|ex|ms|s|hz|khz|%)(?:\/(?:-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:deg|rad|grad|px|cm|mm|in|pt|pc|em|ex|ms|s|hz|khz|%)))*/],
		['PATH',/(?:[!#$%&\*-\~]|é|\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F])*/],
		['S_URL',/url\(/],
		['E_URL',/\)/],
		['S_FUNCTION',/(?:-?(?:[_a-zA-Z]|é|\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F])(?:[_a-zA-Z0-9\-]|é|(?:\\[0-9a-fA-F]{1,6}|\\[^\r\n\f0-9a-fA-F]))*)\(/],
		['E_FUNCTION',/\)/],
		['FUNCTION_ARG',/[^\f\r\n \t,)}{]/]
		])
	o.addRules([
		['CSS','S_PHP|L_NEW_LINE|TAB|SPACES|S_MLC|S_ATTRIBUTE_SELECTOR|ELISION|ATKEYWORD|HASH|CLASS|S_PSEUDO|COMBINATOR|IDENT|S_RULE_SET|CSS_ERROR|NOT_WHITE_SPACES'],
		['ATTRIBUTE_SELECTOR','S_SDQ|S_SSQ|IDENT|ATTRIBUTE_OPERATOR|E_ATTRIBUTE_SELECTOR'],
		['RULE_SET','S_PHP|L_NEW_LINE|TAB|SPACES|S_MLC|IDENT|S_PROP_VALUE|E_RULE_SET'],
		['PROP_VALUE','S_PHP|TAB|SPACES|S_MLC|S_SDQ|S_SSQ|DIMENSIONS|CSS_NUMBER|ELISION|S_URL|IDENT|E_PROP_VALUE|S_FUNCTION|HASH|S_IMPORTANT|CSS_PHP_BUG'],
		['PSEUDO','S_FUNCTION|IDENT'],
		['IMPORTANT','L_NEW_LINE|TAB|SPACES|S_MLC|E_IMPORTANT'],
		['URL','L_NEW_LINE|TAB|SPACES|S_SDQ|S_SSQ|E_URL|S_PHP|PATH|S_PHP'],
		['FUNCTION','L_NEW_LINE|TAB|SPACES|ELISION|S_PHP|IDENT|NAME|FUNCTION_ARG|E_FUNCTION|S_PHP']
		])
	o.addCSSClass("punctuator=ELISION|S_RULE_SET|E_RULE_SET|S_PROP_VALUE|E_PROP_VALUE&undefined=CSS_ERROR|ATTRIBUTE_SELECTOR_ERROR&attribute_selector=ATTRIBUTE_SELECTOR&operator=ATTRIBUTE_OPERATOR&ruleset=RULE_SET&value=PROP_VALUE&combinator=COMBINATOR&id=ATKEYWORD|HASH&name=NAME&selector=IDENT&class=CLASS&pseudo=PSEUDO&important=IMPORTANT&number=CSS_NUMBER&dimension=DIMENSIONS&url=URL&url_delimiter=S_URL|E_URL&function=FUNCTION&argument=FUNCTION_ARG")
	o.setTokensTranslation('S_ATTRIBUTE_SELECTOR=LBRACK&E_ATTRIBUTE_SELECTOR=RBRACK&S_RULE_SET=LBRACE&E_RULE_SET=RBRACE&S_PROP_VALUE=COLON&E_PROP_VALUE=SEMI')
	})()
	;(function(){// HTML
	o.addTokens([
		['S_TAG',/</],
		['E_TAG',/>/],
		['S_DOCTYPE',/<\!DOCTYPE/],
		['E_DOCTYPE',/>/],
		['DOCTYPE_IN',/[^\n\r\f \t"'>]+/],
		['CDATA_IN',/(?:[^\n\r\f \t\]]+|\](?:[^\n\r\f \t\]]+|\][^\n\r\f \t\>]+))+/],
		['S_CDATA',/<\!\[CDATA\[/],
		['E_CDATA',/\]\]>/],
	//	['RBRACK',/\]/],
		['S_HTML_COMMENT',/<\!\-\-/],
		['E_HTML_COMMENT',/\-+\-\>/],
		['HTML_COMMENT_IN',/(?:[^\n\r\f \t\-]+|\-(?:[^\n\r\f\-]+|\-[^\n\r\f\>]+))+/],
		['HTML_TEXT',/[^<\r\n\f \t]+/],
		['S_ELT',/[a-zA-Z0-9]*/],
		['S_END_TAG',/<\//],
		['E_END_TAG',/>/],
		['END_ELT',/[^>\n\r\f \t]+/],
		['TAG_ATTR',/[a-zA-Z0-9\-]+/],
		['S_TAG_ATTR_VALUE',/\=/],
		['S_HTML_SSQ',/'/],
		['E_HTML_SSQ',/'/],
		['HTML_SSQ_IN',/[^'\n\r\f \t]+/],
		['S_HTML_SDQ',/"/],
		['E_HTML_SDQ',/"/],
		['HTML_SDQ_IN',/[^"\n\r\f \t]+/],
		['S_HTML_STYLE',/[Ss][Tt][Yy][Ll][Ee]/],
		['S_HTMLStyle',/>/],
		['E_HTMLStyle',/<\/[Ss][Tt][Yy][Ll][Ee]>/],
		['S_HTML_SCRIPT',/[Ss][Cc][Rr][Ii][Pp][Tt]/],
		['S_HTMLScript',/>/],
		['E_HTMLScript',/<\/[Ss][Cc][Rr][Ii][Pp][Tt]>/]
		])
	o.addRules([
		['HTML','S_PHP|L_NEW_LINE|TAB|SPACES|S_HTML_COMMENT|S_CDATA|S_DOCTYPE|S_END_TAG|S_TAG|HTML_TEXT'],
		['TAG','S_HTML_STYLE|S_HTML_SCRIPT|S_ELT|E_TAG'],
		['DOCTYPE','L_NEW_LINE|TAB|SPACES|S_HTML_SDQ|S_HTML_SSQ|DOCTYPE_IN|E_DOCTYPE'],
		['CDATA','S_PHP|L_NEW_LINE|TAB|SPACES|E_CDATA|CDATA_IN|RBRACK'],
		['HTML_COMMENT','L_NEW_LINE|TAB|SPACES|E_HTML_COMMENT|HTML_COMMENT_IN'],
		['ELT','S_PHP|L_NEW_LINE|TAB|SPACES|TAG_ATTR|S_TAG_ATTR_VALUE'],
		['END_TAG','END_ELT|E_END_TAG'],
		['TAG_ATTR_VALUE','S_PHP|L_NEW_LINE|TAB|SPACES|S_HTML_SDQ|S_HTML_SSQ'],
		['HTML_SSQ','S_PHP|TAB|SPACES|L_NEW_LINE|HTML_SSQ_IN|E_HTML_SSQ'],
		['HTML_SDQ','S_PHP|TAB|SPACES|L_NEW_LINE|HTML_SDQ_IN|E_HTML_SDQ'],
		['HTML_STYLE','S_PHP|L_NEW_LINE|TAB|SPACES|TAG_ATTR|S_TAG_ATTR_VALUE|S_HTMLStyle'],
		['HTML_SCRIPT','S_PHP|L_NEW_LINE|TAB|SPACES|TAG_ATTR|S_TAG_ATTR_VALUE|S_HTMLScript'],
		['HTMLStyle','E_HTMLStyle|CSS'],
		['HTMLScript','E_HTMLScript|JS'] // BIG_JS
		])
	o.addCSSClass("html=HTML&elt=ELT|TAG|END_TAG|S_HTMLStyle|E_HTMLStyle|HTML_SCRIPT|S_HTMLScript|E_HTMLScript&doctype=DOCTYPE&cdata=CDATA&punctuator=RBRACK&comment=HTML_COMMENT&attr=TAG_ATTR&value=TAG_ATTR_VALUE&equal=S_TAG_ATTR_VALUE&string=HTML_SSQ|HTML_SDQ&css=HTMLStyle&js=HTMLScript")
	o.setTokensTranslation('S_TAG_ATTR_VALUE=EQUAL&S_HTML_SSQ=SINGLE_QUOTE&E_HTML_SSQ=SINGLE_QUOTE&S_HTML_SDQ=DOUBLE_QUOTE&E_HTML_SDQ=DOUBLE_QUOTE&E_HTMLStyle=END_HTML_STYLE&E_HTMLScript=END_HTML_SCRIPT')
	})()
	;(function(){// INI
	o.addTokens([
		['INI_KEYWORD',/(?:null|yes|no(?:ne)?|true|false|on|off)\b/],
		['INI_VAR',/[^=!;{}"&|^~[\]()\r\n\f \t]+/],
		['INI_TMP',/[^\r\n\f \t;=]/],
		['S_INI_COMMENT',/;/],
		['INI_COMMENT_IN',/[^\r\n\f]+/],
		['S_INI_SECTION',/\[/],
		['E_INI_SECTION',/\]/],
		['INI_SECTION_IN',/[^\r\n\f \t\]]+/],
		['S_INI_VALUE',/\=/],
		['INI_VALUE_IN',/[^\r\n\f \t;"']+/],
		['S_INI_SDQ',/"/],
		['E_INI_SDQ',/"/],
		['INI_SDQ_IN',/(?:[^"\\\r\n\f \t]|\\[^\r\n\f \t])+/],
		['S_INI_SSQ',/'/],
		['E_INI_SSQ',/'/],
		['INI_SSQ_IN',/[^'\r\n\f \t]+/ ]
		])
	o.addRules([
		['INI', 'S_INI_SECTION|S_INI_COMMENT|INI_KEYWORD|INI_VAR|S_INI_VALUE|SPACES|TAB|L_NEW_LINE|INI_TMP'],
		['INI_COMMENT', 'INI_COMMENT_IN|SPACES|TAB'],
		['INI_SECTION', 'INI_SECTION_IN|E_INI_SECTION|SPACES|TAB'],
		['INI_VALUE', 'S_INI_SDQ|S_INI_SSQ|INI_VALUE_IN|SPACES|TAB'],
		['INI_SDQ', 'INI_SDQ_IN|E_INI_SDQ|SPACES|TAB'],
		['INI_SSQ', 'INI_SSQ_IN|E_INI_SSQ|SPACES|TAB|L_NEW_LINE']
		])
	o.addCSSClass("keyword=INI_KEYWORD&var=INI_VAR&undefined=INI_TMP&comment=INI_COMMENT&section=INI_SECTION_IN&value=INI_VALUE&punctuator=S_INI_VALUE&string=INI_SDQ|INI_SSQ")
	o.setTokensTranslation('INI_COMMENT=COMMENT&INI_SECTION_IN=SECTION_PART&INI_VALUE=VALUES&S_INI_VALUE=OPERATOR&INI_SDQ=STRING&INI_SSQ=STRING')
	})()
	;(function(){// ZenLike
	o.addTokens([
		['ELT',/[$@a-zA-Z\-_0-9]+/],
		['ELTID',/\#[$@a-zA-Z\-_0-9]+/],
		['ELTCLASS',/\.[$@a-zA-Z\-_0-9]+/],
		['MULTIPLICATION',/\*\d+/],
	//	['SPACES',/[ \t]+/],
		['ARGUMENT_PREFIX',/\:/],
		['GTHAN',/\>/],
		['UP',/\^+/],
		['S_SNIPPET_SSQ',/'/],
		['E_SNIPPET_SSQ',/'/],
		['SNIPPET_SSQ_IN',/(?:[^'\\\n\r\f]|\\[^\n\r\f])+/],
		['S_SNIPPET_SDQ',/"/],
		['E_SNIPPET_SDQ',/"/],
		['SNIPPET_SDQ_IN',/(?:[^"\\\n\r\f]|\\[^\n\r\f])+/]
		])
	o.addRules([
		['ZEN','ELT|ELTID|ELTCLASS|LPAREN|RPAREN|LBRACK|RBRACK|EQUAL|MULTIPLICATION|NUMBER|SPACES|ARGUMENT_PREFIX|PLUS|GTHAN|UP|S_SNIPPET_SSQ|S_SNIPPET_SDQ'],
		['SNIPPET_SSQ','SNIPPET_SSQ_IN|E_SNIPPET_SSQ'],
		['SNIPPET_SDQ','SNIPPET_SDQ_IN|E_SNIPPET_SDQ']
		])
	o.addCSSClass("elt=ELT&id=ELTID&className=ELTCLASS&multiplication=MULTIPLICATION&punctuator=ARGUMENT_PREFIX|LPAREN|RPAREN|LBRACK|EQUAL|RBRACK&operator=PLUS|GTHAN|UP&space=SPACES|TAB&string=SNIPPET_SSQ|SNIPPET_SSQ_IN|SNIPPET_SDQ|SNIPPET_SDQ_IN")
	o.setTokensTranslation('SNIPPET_SSQ=STRING&SNIPPET_SSQ_IN=STRING&SNIPPET_SDQ=STRING&SNIPPET_SDQ_IN=STRING')
	})()
	})