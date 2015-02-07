/* DEPRECATED */
// Lexeme requis

var OneRegExpLexer =(function(){
	var sDefaultSyntax = 'JS'
	var Rules ={
		oList: {},
		get :function( sId ){
			return Rules.oList[sId] || null // (function(){ throw new Error ( 'Lexer: "'+ sId +'" is not a rule.' ) })()
			},
		set :function( sId, o ){
			if( Rules.oList[sId]) throw new Error ( 'Lexer: Rule "'+ sId +'" already exist.' )
			return Rules.oList[sId] = o
			}
		}

	var Lexer =function( sSource, sSyntax ){
		sSyntax = sSyntax || sDefaultSyntax
		Lexer.nLine = 1
		Lexer.nIndex = 0
		return Lexer.parse( Lexeme({
			token: sSyntax,
			value:'',
			css: sSyntax.toLowerCase(),
			index: 0,
			lineStart:1,
			lineEnd:1
			}), Rules.get( sSyntax ), sSource )
		}
	Lexer.union({
		nLine: 1,
		nIndex: 0,
		oCurrent: null,
		bInfo: 1,
		Rules: Rules,
		parse :function( oElt, oRule, s ){
			Lexer.oCurrent = oElt
			s.replace( oRule.re, oRule.replacement )
			if( s && ! oElt.childNodes.length ) throw new Error ( "Parsing error ?\n"+ oRule.re )
			if( oElt.oValue ) oElt.oValue.lineEnd = oElt.lastChild.oValue.lineEnd
			return oElt
			},
		alternative :function( aRules ){
			for( var aRegExp=[], i=0, ni=aRules.length, oRule; i<ni; i++ ){
				oRule = Rules.get( aRules[i])
				if( ! oRule ) throw new Error ( 'Lexer: "'+ aRules[i] +'" is not a rule name.' )
				aRules[i] = oRule
				aRegExp[i] = aRules[i].re.source
				}
			var reResult = new RegExp ( '('+aRegExp.join( ')|(' )+')', 'gm' )
			var fParse =function( sMatched, nIndex ){
				if( ! sMatched ) return;
				var oRule, nIndex, oNode, oLanguageRule
				// Search the alternative matched
				for(var i=1; ! arguments[i]; i++ );
				oRule = aRules[i-1]
				oLanguageRule = Rules.get( oRule.sId +'_CHILD' )
				oNode = Lexeme({
					token: oRule.sId,
					value: oLanguageRule ? '' : sMatched,
					css: oRule.className,
					index: Lexer.nIndex,
					lineStart: Lexer.nLine,
					lineEnd: Lexer.nLine,
					rule: Lexer.oCurrent.oValue.token
					})
				if( oRule.sId=="NEW_LINE" ) Lexer.nLine++
				Lexer.oCurrent.appendChild( oNode )
				if( oLanguageRule ){
					Lexer.parse( oNode, oLanguageRule, sMatched )
					Lexer.oCurrent = oNode.parentNode
				} else Lexer.nIndex += sMatched.length
				return sMatched
				}
			return { type:'alternative', re:reResult, replacement:fParse }
			},
		rule :function( sId, m, sClassName, sAction ){
			switch( arguments.length ){
				case 1:
					for( var i=0, a=sId, ni=a.length; i<ni; i++ )
						Lexer.rule.apply( this, a[i])
					break;
				case 2:
					m = Lexer.alternative( m )
					return Rules.set( sId ,{
						type:'language',
						sId: sId,
						re: m.re,
						replacement: m.replacement
						})
				default:
					return Rules.set( sId ,{
						type:'token',
						sId: sId,
						re: m,
						replacement: sClassName,
						sAction: sAction,
						className: sClassName
						})
				}
			},
		createWordsRegExp :function( sWords, bBoundaries ){
			var aWords = sWords.split(',')  // .sort()
			bBoundaries = bBoundaries==undefined ? true : bBoundaries
			for( var i=0, a=[], ni=aWords.length; i<ni; i++ )
				a.push( RegExp.escape( aWords[i]))
			var reResult = new RegExp(
				bBoundaries
					? "\\b(?:" + a.join('|') + ")\\b"
					: '(?:' + a.join('|') + ')'
				, 'g' )
			return reResult
			}
		})

	// Rules...
	;(function(){
	
	Lexer.rule([
		['CHARSET', /\[\^?|\]|\-/, 'charset' ],
		['PIPE', /\|/, 'punctuator' ],
		['PUNCTUATOR', /\(|\)/, 'punctuator' ],
		['QUANTIFIER1', /\{\d+(?:\,\d*)?\}/, 'repetition' ],
		['QUANTIFIER2', /\*|\+|\?/, 'repetition' ],
		['CHAR_ESCAPED', /\\./, 'character' ],
		['ANY', /\./, 'character' ],
		['CHAR', /[^\(\)\\\|\.\[\]\*\+\?\{\-]/, 'character' ]
		])
	Lexer.rule( 'SimpleRegExp',
		'CHARSET,PIPE,PUNCTUATOR,QUANTIFIER1,QUANTIFIER2,CHAR_ESCAPED,ANY,CHAR'.split(',')
		)
		
	Lexer.rule([
		['SINGLE_QUOTE', /'/, '' ],
		['DOUBLE_QUOTE', /"/, '' ],
		['ELISION', /,/, 'punctuator elision' ],
		['UNARY_OPERATOR', /(?:\+\+|\-\-|\~|\!)/, 'operator' ],
		['LOGICAL_OPERATOR', /&&|\|\|/, 'operator' ],
		['ARITHMETIC_OPERATOR', /(?:\+|\-|\*|\%|\/)/, 'operator' ],
		['RELATIONAL_OPERATOR', /(?:[<>]=?)/, 'operator' ],
		['EQUALITY_OPERATOR', /(?:==|\!=|===|\!==)/, 'operator' ],
		['ASSIGNMENT_OPERATOR', /(?:=|\*=|\/=|\%=|\+=|\-=|<<=|>>=|>>>=|\&=|\^=|\|=)/, 'operator' ],
		['NEW_LINE', /(?:\n|\r)/, 'linefeed' ],
		['NOT_NEW_LINE', /[^\n\r]+/, '' ],
		['NOT_WHITE_SPACES', /[^\s]+?/, 'undefined' ],
		['WHITE_SPACES', /(?: |\t)+/, 'whitespaces' ],
		['TAB', /\t/, 'tab space' ],
		['SPACES', /[ ]/, 'space' ],
	// STRING
		['BACKSLASH', /\\/, 'undefined' ],
		['SSQ', /'(?:[^'\\\n\r]|\\(?:.|\r|\n))*'/g, 'string' ],
		['SSQ_IN', /(?:[^'\\\n\r\f \t]|\\[^\n\r\f \t])+/, '' ],
		['SDQ', /"(?:[^"\\\n\r]|\\(?:.|\r|\n))*"/g, 'string' ],
		['SDQ_IN', /(?:[^"\\\n\r\f \t]|\\[^\n\r\f \t])+/, '' ],
	// COMMENT
		['SLC', /\/\/[^\n\r]*/g, 'comment' ],
		['S_SLC', /^\/\//, '' ],
		['SLC_IN', /[^\n\r\f \t]+/, '' ],
		['MLC', /\/\*[^\*]*\*+(?:[^\/][^\*]*(?:$|\*+))*\//g, 'comment' ],
		['S_MLC', /^\/\*/, '' ],
		['MLC_IN', /(?:[^\*\n\r\f \t]|\*[^\/\n\r\f \t])+/, '' ],
		['E_MLC', /[^\n\r\f \t]*\*\//, '' ],
		
		['REGULAR_EXPRESSION', /\/(?:\\\/|[^\s\*\/])(?:\\\/|[^\s\/])*\/[gim]*/g, 'regexp' ],
		['NUMBER', /\b\d+\b/g, 'number' ],
		['LBRACE', /\{/g, 'punctuator' ], ['RBRACE', /\}/g, 'punctuator' ],
		['LPAREN', /\(/g, 'punctuator' ], ['RPAREN', /\)/g, 'punctuator' ],
		['LBRACK', /\[/g, 'punctuator' ], ['RBRACK', /\]/g, 'punctuator' ],
		['DOT', /\./g, 'punctuator' ],
		['SEMI', /\;/g, 'punctuator' ],
		['QUESTION', /\?/g, 'punctuator' ],
		['COLON', /\:/g, 'punctuator' ],
		/*JS  */
		['JS_IDENTIFIER', /[\$\_\w]+[\$_\w\d]*/, 'identifier' ],
		['JS_KEYWORD', Lexer.createWordsRegExp( 'break,case,catch,continue,default,delete,do,else,finally,for,function,if,in,instanceof,new,return,switch,this,throw,try,typeof,var,void,while,with' ), 'keyword' ],
		['JS_LITERAL', Lexer.createWordsRegExp( 'true,false,null,undefined,Infinity,NaN' ), 'literal' ],
		/* PHP  */
		['PHP', /(?:<\?(?:php\b|=))(?:[^\?]+|\?[^\>]+)*(?:\?\>|$)/gm, 'php', true ],
		['S_PHP', /(?:\<\?(?:php\b|=))/, 'tag' ],
		['E_PHP', /(?:\?\>)/, 'tag' ],
		['PHP_SPECIAL_VARS', /(?:\$(?:GLOBALS|_(?:COOKIE|ENV|FILES|GET|POST|REQUEST|SE(?:RVER|SSION))))\b/g , 'special' ],
		['PHP_IDENTIFIER', /\$[\w_][\w\d_]*\b/, 'identifier' ],
		['PHP_KEYWORD', Lexer.createWordsRegExp( 'break,case,continue,declare,default,do,each,elseif,else,foreach,for,goto,if,include,include_once,require,require_once,return,switch,while' ), 'keyword' ],
		['PHP_LITERAL', Lexer.createWordsRegExp( 'true,TRUE,false,FALSE,null,NULL' ), 'literal' ],
		['PHP_RESERVED', Lexer.createWordsRegExp( '@,and,or,xor,exception,as,var,class,const,declare,die,echo,empty,eval,exit,extends,function,global,isset,list,new,print,static,unset,use,__FUNCTION__,__CLASS__,__METHOD__,final,interface,implements,extends,public,private,protected,abstract,clone,$this' ), 'keyword' ],
		['PHP_FUNCTION', /\b\w[\w\d_]*\b/, 'function' ]
		])
	Lexer.rule( 'MLC_CHILD',[ 'S_MLC','E_MLC','NEW_LINE','TAB','SPACES','MLC_IN' ])
	Lexer.rule( 'SLC_CHILD',[ 'S_SLC','TAB','SPACES','SLC_IN','NOT_WHITE_SPACES' ])
	Lexer.rule( 'SSQ_CHILD',[ 'SINGLE_QUOTE','NEW_LINE','TAB','SPACES','SSQ_IN','BACKSLASH' ])
	Lexer.rule( 'SDQ_CHILD',[ 'DOUBLE_QUOTE','NEW_LINE','TAB','SPACES','SDQ_IN','NOT_WHITE_SPACES' ])
		
	/* JS Language */
	Lexer.rule( 'JS',[
		'PHP',
		'S_PHP','E_PHP',
		'SSQ','SDQ',
		'MLC','SLC',
		'REGULAR_EXPRESSION',
		'NUMBER',
		'ELISION',
		'JS_KEYWORD',
		'JS_LITERAL',
		'JS_IDENTIFIER',
		'LBRACE','RBRACE',
		'LPAREN','RPAREN',
		'LBRACK','RBRACK',
		'DOT','SEMI','COLON','QUESTION',
		'NEW_LINE','SPACES','TAB',
		'EQUALITY_OPERATOR',
		'ASSIGNMENT_OPERATOR',
		'UNARY_OPERATOR',
		'LOGICAL_OPERATOR',
		'ARITHMETIC_OPERATOR',
		'RELATIONAL_OPERATOR',
		'NOT_WHITE_SPACES'
		])

	/* PHP Language */
	Lexer.rule( 'PHP_CHILD',[
		'S_PHP','E_PHP',
		'SSQ','SDQ',
		'MLC','SLC',
		'NUMBER',
		'PHP_KEYWORD',
		'PHP_RESERVED',
		'PHP_LITERAL',
		'PHP_SPECIAL_VARS',
		'PHP_IDENTIFIER',
		'PHP_FUNCTION',
		'LBRACE','RBRACE',
		'LPAREN','RPAREN',
		'LBRACK','RBRACK',
		'ELISION',
		'DOT','SEMI','COLON','QUESTION',
		'NEW_LINE','SPACES','TAB',
		'EQUALITY_OPERATOR',
		'ASSIGNMENT_OPERATOR',
		'UNARY_OPERATOR',
		'LOGICAL_OPERATOR',
		'ARITHMETIC_OPERATOR',
		'RELATIONAL_OPERATOR',
		'NOT_WHITE_SPACES'
		])
	})();
	
	return Lexer
	})()