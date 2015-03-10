/* DEPRECATED */
// Lexeme requis

var OneRegExpLexer =(function(){
	var SINGLETON
	, LexerRules =(function(){
		var Dictionary =function( sId ){
			var sGetError = '"$1" is not a lexer '+ sId
			var sAddError = 'Lexer '+ sId +' "$1" already exist.'
			return {
				list: {},
				add :function( ID, m ){
					if( this.list[ID]) throw new Error ( sAddError.replace( '$1', ID ))
					return this.list[ID] = m
					},
				get :function( ID ){
					if( this.list[ID]) return this.list[ID]
					throw new Error ( sGetError.replace( '$1', ID ))
					},
				have :function( ID ){
					return this.list[ID]
					}
				}
			}
		, Rules=Dictionary('rule')
		, Tokens=Dictionary('token')
		return{
			setPreviousTokenOf :function( sToken, sPreviousTokens ){
				if( Previous.ofToken[sToken]) throw new Error ( 'Previous token of '+ sToken +' already defined !' )
				Previous.ofToken[sToken] = sPreviousTokens
				},
			CSS: {},
			addCSSClass :function( m ){ // m = 'class1=TOKEN1|TOKEN2&class2=TOKEN3'
				var o = this.CSS
				var aCouples = m.constructor==Array ? m : m.split('&')
				for(var i=0, s ; s=aCouples[i]; i++){
					var aCouple = s.split('=')
					var sClassName = aCouple[0]
					var aTokens=aCouple[1].split('|')
					for(var j=0, sToken; sToken=aTokens[j]; j++){
						o[sToken] = o[sToken] ? o[sToken].split(' ') : []
						o[sToken].push( sClassName )
						o[sToken].sort()
						o[sToken] = Array.unique( o[sToken]).join(' ')
						}
					}
				},
			Translation: {},
			setTokensTranslation :function( m ){ // m = 'TOKEN1=NEWNAME1&TOKEN2=NEWNAME2'
				var o = this.Translation
				var aCouples = m.constructor==Array ? m : m.split('&')
				for(var aCouple, sToken, i=0, ni=aCouples.length; i<ni ; i++ ){
					aCouple = aCouples[i].split('=')
					sToken = aCouple[0]
					if( o[sToken]) throw Error ( 'Token Translation of '+ sToken +' already defined with '+ o[sToken] +' !' )
					o[sToken] = aCouple[1]
					}
				},
			Rules: Rules,
			addRule :function( sName, sTokens ){
				var aList = sTokens.split('|')
				var a = []
				for(var i=0; aList[i]; i++){
					var ID = aList[i]
					var oToken = Tokens.list[ID]
					if( oToken ) a.push( oToken )
					else {
						var aRule = Rules.list[ID]
						if( ! aRule ) throw Error ('Rule "'+ ID +'" Not Found !' )
						a = a.concat( aRule )
						}
					}
				return Rules.add( sName, a )
				},
			addRules :function( aRules ){
				for(var i=0; aRules[i]; i++ )
					this.addRule( aRules[i][0], aRules[i][1])
				},
			Tokens: Tokens,
			addTokens :function( aTokens ){
				if( aTokens.length )
					for(var i=0; aTokens[i]; i++){
						var sName=aTokens[i][0]
						Tokens.add( sName, this.makeTokenFrom( sName, aTokens[i][1] ))
						}
				},
			makeTokenFrom :function( sName, o ){
				o = new RegExp ( '^(?:'+ o.source +')' )
				o.name = sName
				return o
				}
			}
		})()

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
	var oLexeme, sToken, sValue, bNoSkip
	, Actions =(function(){
		var Actions={
			add :function(){
				this.previous.set( oLexeme.token )
				return this.appendNode( Lexeme( oLexeme ))
				},
			endParent :function(){
				oLexeme.bParentLimit = true
				this.previous.set( this.eParent.oValue.token )
				var eNode = this.appendNode( Lexeme( oLexeme ))
				this.stack.pop()
				return eNode
				},
			newLine :function(){
				this.previous.set( oLexeme.token )
				this.nLine++
				return this.appendNode( Lexeme( oLexeme ))
				},
			rescanToken :function(){
				this.nPos = oLexeme.index
				this.nLine = oLexeme.lineStart
				var sRule = sToken.slice(2)
				, sTextRescan = oLexeme.value
				, nEnd = this.nPos + sTextRescan.length
				, sTMP = this.sText
				oLexeme.value = ''
				oLexeme.rule = sRule
				oLexeme.bParent = oLexeme.bRescan = true
				var eParent = this.appendNode( Lexeme( oLexeme ))
				this.stack.push( eParent )
				this.previous.set( oLexeme.token )
				this.sText = this.sText.slice( 0, nEnd )
				do{ this.readToken()}while( this.nPos<nEnd )
				this.sText = sTMP
				this.stack.pop()
				return eParent
				},
			startParent :function(){
				sToken = sToken.slice(2)
				var eNewParent = Lexeme({
					token: LexerRules.Translation[sToken]||sToken,
					css: LexerRules.CSS[sToken]||'',
					rule:sToken,
					value:'',
					index:oLexeme.index,
					lineStart:this.nLine,
					bParent:true
					})
				oLexeme.bParentLimit = true
				this.previous.set( oLexeme.token )
				var bSkip = this.skip( oLexeme.token )
				if( ! bSkip ) this.appendNode( eNewParent )
				this.stack.push( eNewParent )
				this.appendNode( Lexeme( oLexeme ))
				if( Skip.notFor[ this.sSyntax ])
					do{ this.readToken()}while( this.eParent==eNewParent )
				return bSkip ? true : eNewParent
				}
			}
		var Char={E:'endParent',L:'newLine',R:'rescanToken',S:'startParent'}
		return function( oInstance ){
			return Actions[ sToken.charAt(1)=='_'
					? Char[ sToken.charAt(0)] || 'add'
					: 'add' ].call( oInstance )
			}
		})()
	, Previous =(function(){
		var o =function(){
			var s = ''
			return {
				invalidFor :function( sToken ){
					return o.ofToken[sToken] && o.ofToken[sToken].indexOf(s)<0
					},
				set :function( sToken ){
					return o.excluded[sToken]
						? false // doit impérativement retourner cette valeur
						: s = /* LexerRules.Translation[sToken]|| */sToken
					},
				get :function(){ return s }
				}
			}
		o.union({
			excluded :{
				WHITE_SPACES:1,SPACES:1,SPACE:1,TAB:1,// L_NEW_LINE:1,L_NEW_LINE:1,
				S_SLC:1,SLC:1,SLC_IN:1,
				S_MLC:1,MLC:1,MLC_IN:1,E_MLC:1,
				COMMENT:1,
				REGULAR_EXPRESSION_IN:1
				},
			ofToken :{}
			})
		return o
		})()
	, Stack =function( that ){
		var a =[0,0,0,0,0]
		var n = 0 // StackLength
		return {
			pop :function(){
				if( n ){
					var e = a[--n]
					e.oValue.lineEnd = e.lastChild && e.lastChild.oValue.lineEnd || 1
					if( e.setTitle ) e.setTitle()
					}
				if( n ){
					that.eParent = a[n-1]
					that.setSyntax( that.eParent.oValue.rule )
					}
				return n
				},
			push :function( e ){
				a[n++] = that.eParent = e
				that.setSyntax( e.oValue.rule )
				return e
				},
			top :function(){ return a[n-1]},
			unshift :function( e ){
				a.unshift(e)
				n++
				}
			}
		}
	, Skip =(function(){
		var o = function( that ){
			var f = that.bSkip
				? function( sToken ){
					return bNoSkip ? false : Previous.excluded[sToken]
					}
				: function(){ return false }
			f.set =function( bSkip ){
				that.bSkip = bSkip
				that.skip = Skip(that)
				}
			return f
			}
		o.notFor={SSQ:1,SDQ:1,MLC:1,SLC:1,REGULAR_EXPRESSION:1}
		return o
		})()
	, Lexer =function( sText, sSyntax ){
		if( sText!=undefined ) return SINGLETON.scan( sText, sSyntax )
		}
	Lexer.union({
		Previous: Previous,
		Rules: LexerRules,
		Skip: Skip,
		Stack: Stack
		})
	Lexer.rule =function( sId, m, sCSS ){
		switch( arguments.length ){
			case 1:
				for( var i=0, a=sId, ni=a.length; i<ni; i++ ) Lexer.rule.apply( this, a[i])
				break;
			case 2:
				if( m.constructor==String ){
					var aRules = m.split('|')
					for( var aRegExp=[], i=0, ni=aRules.length, oRule; i<ni; i++ ){
						oRule = Rules.get( aRules[i])
						if( ! oRule ) throw new Error ( 'Lexer: "'+ aRules[i] +'" is not a rule name.' )
						aRules[i] = oRule
						aRegExp[i] = '('+ aRules[i].re.source +')'
						}
					return Rules.set( sId ,{
						sId: sId,
						re: new RegExp ( aRegExp.join('|'), 'gm' ),
						tokens: aRules
						})
					}
			default:
				return Rules.set( sId ,{ sId:sId, re:m, css:sCSS })
			}
		}

	Lexer.prototype ={
		bSkip: 0,
		appendNode: appendNode =function( eNode ){
			return this.skip( eNode.oValue.token )
				? true
				: this.eParent.appendChild( eNode )
			},
		end :function(){
			return this.eRoot
			},
		init :function( sText, sSyntax ){
			sSyntax = sSyntax || 'TXT'
			this.rule = Rules.get( sSyntax )
			this.union({
				nLine:1,
				nPos:0,
				sText:sText,
				skip:Skip(this),
				stack:Stack(this),
				previous:Previous()
				})
			this.eRoot = this.stack.push( Lexeme({
				value:'',
				token:sSyntax,
				rule:sSyntax,
				css:sSyntax.toLowerCase(),
				index:0,
				lineStart:1
				}))
			},
		readToken :function(){
			// End of input?
			if( this.rule.re.lastIndex >= this.sText.length ) return null

		//	console.info( this.sSyntax, this.rule.re )
		//	console.info( this.rule.re.lastIndex, this.nPos, JSON.stringify( this.sText.substr( this.nPos )))

			var result = this.rule.re.exec( this.sText )
		//	console.warn( result )
			if( result === null || result.index > this.nPos || ! result[0].length )
				return this.stack.pop() ? true : null
			//	throw Error( 'Cannot match a token at position ' + this.rule.re.lastIndex )

			for(var i=1; result[i]===undefined; i++ );
			if( ! result[i] ) throw Error( 'Internal error' )
			var oToken =this.rule.tokens[i-1]
			
			
		/* 	DEBUG ONLY
			if( result.length-1 != this.rule.tokens.length ){
				console.warn( result.length , this.rule.tokens.length )
				throw Error ( "WARN: no matching parenthesis is allowed in token regexp. Required (?:regexp)" )
				}
		*/
		 
			sToken = oToken.sId
			
		//	if( this.previous.invalidFor( sToken )) return false;
			
			oLexeme ={
				token: LexerRules.Translation[sToken]||sToken,
				value: result[0],
				css: LexerRules.CSS[sToken],
				index: result.index,
				lineStart: this.nLine,
				lineEnd: this.nLine,
				rule: this.sSyntax
				}
			this.nPos += result[0].length
			return Actions(this)
			},
		scan :function( sText, sSyntax ){
			this.init( sText, sSyntax )
			while( this.readToken());
			return this.end()
			},
		setSyntax :function( sSyntax ){
			this.rule = Rules.get( this.sSyntax = sSyntax )
			this.rule.re.lastIndex = this.nPos
			bNoSkip = Skip.notFor[ sSyntax ]
			}
		}

	// Analyse par défaut
	;(function(){
		var o = LexerRules
/* 		o.addTokens([
			// Espaces blancs
			['SPACES',{A:g(" "),M:[,[2]],F:[,,1]}],
			['TAB',{A:g("\t"),M:[,[2]],F:[,,1]}],
			['L_NEW_LINE',{A:g("\n","\f","\r"),M:[,[3,3,2],[3]],F:[,,1,1]}],
			['WHITE_SPACES',{A:g("[\t \n\r\f]"),R:[[0,f("\t \n\r\f",1)]],M:[[],[2],[2]],F:[,,1]}],
			// Tout sauf un espaces blancs
			['NOT_WHITE_SPACES',{A:{"[^\t \n\r\f]":0},R:[[0,f("\t \n\r\f")]],M:[[1],[1]],F:{1:1}}],
			// Syntaxe par défaut
			['TXT',{A:g("\n","[^\t\n\f\r ]","\t","\f","\r"," "),R:[[1,f("\t\n\f\r ")]],M:[[],[5,3,4,5,2,6],[5],[,3]],F:[,,3,5,2,3,4],TokensTable:',,TAB,L_NEW_LINE,SPACES,TEXT'.split(',')}]
			]) */
		o.addCSSClass( 'space=SPACES&tab=TAB&linefeed=L_NEW_LINE&whitespaces=WHITE_SPACES&undefined=NOT_WHITE_SPACES' )
		o.setTokensTranslation('L_NEW_LINE=NEW_LINE')
		})();
	SINGLETON = new Lexer
	return Lexer
	})()

// Rules...
;(function(){
	var Lexer = OneRegExpLexer
	var o = OneRegExpLexer.Rules
	var add = Lexer.rule
	;(function(){// SimpleRegexp = Sample test
	add([
		['CHARSET', /\[\^?|\]|\-/ ],
		['PIPE', /\|/ ],
		['PUNCTUATOR', /\(|\)/ ],
		['QUANTIFIER1', /\{\d+(?:\,\d*)?\}/ ],
		['QUANTIFIER2', /\*|\+|\?/ ],
		['CHAR_ESCAPED', /\\./ ],
		['ANY', /\./ ],
		['CHAR', /[^\(\)\\\|\.\[\]\*\+\?\{\-]/ ]
		])
	add( 'SimpleRegExp',
		'CHARSET|PIPE|PUNCTUATOR|QUANTIFIER1|QUANTIFIER2|CHAR_ESCAPED|ANY|CHAR'
		)
	})()
	;(function(){// Common
	add([
		['BACKSLASH', /\\/, 'undefined' ],
		['L_NEW_LINE', /(?:\n|\r\n?|\f)/, 'linefeed' ],
		['NOT_NEW_LINE', /[^\n\r]+/, '' ],
		['NOT_WHITE_SPACES', /[^\s]+?/, 'undefined' ],
		['WHITE_SPACES', /(?: |\t)+/, 'whitespaces' ],
		['TAB', /\t/, 'tab space' ],
		['SPACES', /[ ]/, 'space' ],
		['SINGLE_QUOTE', /'/, '' ],
		['DOUBLE_QUOTE', /"/, '' ],
		['LBRACE',/\{/, 'punctuator'],['RBRACE',/\}/, 'punctuator'],
		['LPAREN',/\(/, 'punctuator'],['RPAREN',/\)/, 'punctuator'],
		['LBRACK',/\[/, 'punctuator'],['RBRACK',/\]/, 'punctuator'],
		['ELISION',/\,/, 'punctuator elision'],
		['DOT',/\./, 'punctuator'],
		['SEMI',/\;/, 'punctuator'],
		['QUESTION',/\?/, 'punctuator'],
		['COLON',/\:/, 'punctuator']
		])
	})()
	;(function(){// Number
	add([
		['NUMBER',/[\+\-]?(?:(?:[1-9]\d*|0)|(?:0[xX](?:[0-9a-fA-F])+)|(?:0[0-7]+)|(?:0b[01]+)|(?:\d+\.\d*(?:[eE][\+\-]?\d+)?|\.?\d+(?:[eE][\+\-]?\d+)?))/, 'number' ]
		])
	})()
	;(function(){// SUPER SCRIPT
	add( 'S_PHP', /(?:\<\?(?:php\b|=))/ )
	o.addCSSClass("tag=S_PHP")
	})()
	;(function(){// STRINGS & COMMENTS	
	add([
	// STRING
		['S_SSQ', /'/ ],['E_SSQ', /'/ ],['SSQ_IN', /(?:[^'\\\n\r\f \t]|\\[^\n\r\f \t])+/ ],
		['S_SDQ', /"/ ],['E_SDQ', /"/ ],['SDQ_IN', /(?:[^"\\\n\r\f \t]|\\[^\n\r\f \t])+/ ],
	// COMMENT
		['S_MLC', /\/\*/ ],['E_MLC', /[^\n\r\f \t]*\*\// ],['MLC_IN', /(?:[^\*\n\r\f \t]|\*[^\/\n\r\f \t])+/ ],
		['S_SLC', /\/\// ], ['SLC_IN', /[^\n\r\f \t]+/ ],
		])
	add( 'SSQ', 'S_PHP|TAB|SPACES|L_NEW_LINE|SSQ_IN|BACKSLASH|E_SSQ' )
	add( 'SDQ', 'S_PHP|TAB|SPACES|L_NEW_LINE|SDQ_IN|BACKSLASH|E_SDQ' )
	add( 'MLC', 'S_MLC|E_MLC|L_NEW_LINE|TAB|SPACES|MLC_IN' )
	add( 'SLC', 'S_SLC|TAB|SPACES|SLC_IN|NOT_WHITE_SPACES' )
	
	o.setPreviousTokenOf("L_NEW_LINE_IN_STRING","BACKSLASH")
	o.setTokensTranslation('L_NEW_LINE_IN_STRING=NEW_LINE&SSQ=STRING&S_SSQ=SINGLE_QUOTE&E_SSQ=SINGLE_QUOTE&SDQ=STRING&S_SDQ=DOUBLE_QUOTE&E_SDQ=DOUBLE_QUOTE&MLC=COMMENT&SLC=COMMENT')
	o.addCSSClass([
		'string=SSQ|SDQ',
		'comment=SLC|MLC',
		'linefeed=L_NEW_LINE_IN_STRING'
		])
	})()
	;(function(){// PHP
	add([
		['E_PHP', /(?:\?\>)/ ],
		['PHP_SPECIAL_VARS', /(?:\$(?:GLOBALS|_(?:COOKIE|ENV|FILES|GET|POST|REQUEST|SE(?:RVER|SSION))))\b/ ],
		['PHP_IDENTIFIER', /\$[\w_][\w\d_]*\b/ ],
		['PHP_KEYWORD', /\b(?:break|case|continue|declare|default|do|each|elseif|else|foreach|for|goto|if|include|include_once|require|require_once|return|switch|while)\b/ ],
		['PHP_LITERAL', /\b(?:true|TRUE|false|FALSE|null|NULL)\b/ ],
		['PHP_RESERVED', /\b(?:\@|and|or|xor|exception|as|var|class|const|declare|die|echo|empty|eval|exit|extends|function|global|isset|list|new|print|static|unset|use|__FUNCTION__|__CLASS__|__METHOD__|final|interface|implements|extends|public|private|protected|abstract|clone|\$this)\b/ ],
		['PHP_FUNCTION', /\b\w[\w\d_]*\b/ ],
		
		['PHP_ARITHMETIC_OP', /\+\+?|\-\-?|\*|\%|\// ],
		['PHP_ASSIGNMENT_OP', /\+=|\-=|\*=|\/=|\.=|\%=|\&=|\|=|\^=|<<=|>>=|=>?/ ],
		['PHP_BITWISE_OP', /&|\||\^|\~|<<|>>/ ],
		['PHP_COMPARISON_OP', /===?|!==?|<>|<=?|>=?/ ],
		['PHP_ERROR_CONTROL_OP', /@/ ],
		['PHP_LOGICAL_OP', /and|or|xor|!|&&|\|\|/ ],
		['PHP_STRING_OP', /\./ ],
		['PHP_TYPE_OP', /\((?:int|float|string|array|object|bool)\)/ ]
		])
		
	add( 'PHP',[
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
	add([
		['R_REGULAR_EXPRESSION',/\/(?:(?:[^\n\r\f\*\\\/\[]|(?:\\[^\n\r\f])|(?:\[(?:(?:[^\n\r\f\]\\]|(?:\\[^\n\r\f]))*)\]))(?:(?:[^\n\r\f\\\/\[]|(?:\\[^\n\r\f])|(?:\[(?:(?:[^\n\r\f\]\\]|(?:\\[^\n\r\f]))*)\]))*))\/(?:(?:[a-zA-Z])*)/],
		['REGULAR_EXPRESSION_IN',/[^\t ]+/],
		['JS_IDENTIFIER', /[\$\_a-zA-Z]+[\$_\w\d]*/],
		['JS_KEYWORD', /\b(?:break|case|catch|continue|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with)\b/],
		['JS_LITERAL', /\b(?:true|false|null|undefined|Infinity|NaN)\b/],
		['JS_UNARY_OP',/\+\+|\-\-|\~|\!/],
		['JS_ARITHMETIC_OP',/[\+\-\*\%\/]/],
		['JS_LOGICAL_OP',/&&|\|\|/],
		['JS_COMPARISON_OP',/(?:[<>]|[=!]=)=?/],
		['JS_ASSIGNMENT_OP',/=|\*=|\/=|\%=|\+=|\-=|<<=|>>=|>>>=|\&=|\^=|\|=/]
		])
	add( 'JS',['L_NEW_LINE|SPACES|TAB',
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
	add( 'REGULAR_EXPRESSION', 'TAB|SPACES|REGULAR_EXPRESSION_IN' )

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