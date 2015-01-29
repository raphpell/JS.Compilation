// Lexeme REQUIS

var MultiRegExpLexer =(function(){
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
			setPreviousTokenOf :function( sToken, sPreviousTokens ){
				if( Previous.ofToken[sToken]) throw new Error ( 'Previous token of '+ sToken +' already defined !' )
				Previous.ofToken[sToken] = sPreviousTokens
				},
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

			Tokens: Tokens,
			addRule :function( o ){
				var a = []
				for(var i=0; o.list[i]; i++ ){
					var ID = o.list[i]
					var oToken = Tokens.list[ID]
					if( oToken ) a.push( oToken )
					else {
						var aRule = Rules.list[ID]
						a = Array.merge( a, aRule )
						}
					}
				return Rules.add( o.name, a )
				},
			addRules :function( a ){
				for(var i=0; a[i]; i++ ) LexerRules.addRule( a[i])
				},
			getRule :function( ID ){ return Rules.get( ID )},
			isRule :function( ID ){ return Rules.list[ID]},
			addTokens :function( o ){
				for(var i=0, aToken; aToken = o.list[i]; i++ )
					Tokens.add( aToken[0], {
						name: aToken[0],
						re: new RegExp ( '^(?:'+ aToken[1].source +')' ),
						css: aToken[2]
						})
				},
			getToken :function( ID ){return Tokens.get( ID )}
			}
		})()
	var sToken, oLexeme, bNoSkip, aFound, nMatchLength
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
				var sRule = sToken.slice( 2 )
				, sTextRescan = oLexeme.value
				, nEnd = this.nPos + sTextRescan.length
				, sTMP = this.sText
				oLexeme.value = ''
				oLexeme.rule = sRule
				oLexeme.bParent = oLexeme.bRescan = true
				var eParent = this.appendNode( Lexeme( oLexeme ))
				this.stack.push( eParent )
				this.previous.set( oLexeme.token )
				this.sText = sTextRescan
				do{ this.readToken()}while( this.nPos<nEnd )
				this.sText = sTMP
				this.stack.pop()
				return eParent
				},
			startParent :function(){
				sToken = sToken.slice( 2 )
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
		return function( oInstance ){
			return Actions[
				sToken.charAt(1)=='_'
					? { E:'endParent',
						L:'newLine',
						R:'rescanToken',
						S:'startParent'
						}[ sToken.charAt(0)] || 'add'
					: 'add'
				].call( oInstance )
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
						: s = LexerRules.Translation[sToken]||sToken
					},
				get :function(){ return s }
				}
			}
		o.union({
			excluded :{
				WHITE_SPACES:1,SPACES:1,SPACE:1,TAB:1,// NEW_LINE:1,L_NEW_LINE:1,
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
					that.sSyntax = that.eParent.oValue.rule
					}
				return n
				},
			push :function( e ){
				a[n++] = that.eParent = e
				that.sSyntax = e.oValue.rule
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
	Lexer.prototype ={
		end :function(){
			if( this.sText.length ) alert("Incomplete Scanning !")
			return this.eRoot
			},
		
		bSkip: 0,
		appendNode: null,
		init :function( sText, sSyntax ){
			sSyntax = sSyntax || 'TXT'
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
			this.appendNode =function( eNode ){
				return this.skip( eNode.oValue.token )
					? true
					: this.eParent.appendChild( eNode )
				}
			},
		readToken :function(){
			var a = LexerRules.getRule( this.sSyntax )
			bNoSkip = Skip.notFor[ this.sSyntax ]
			for(var i=0; a[i]; i++ ){
				if( ! a[i].re.test( this.sText ) || this.previous.invalidFor( a[i].name )) continue;
				aFound = a[i].re.exec( this.sText )
				if( nMatchLength = aFound[0].length ){
					sToken = a[i].name
					oLexeme ={
						value:aFound[0],
						token: LexerRules.Translation[sToken]||sToken,
						css: LexerRules.CSS[sToken]||'',
						rule:this.sSyntax,
						index:this.nPos,
						lineStart:this.nLine,
						lineEnd:this.nLine
						}
					this.sText = this.sText.substr( nMatchLength )
					this.nPos += nMatchLength
					return Actions(this)
					}
				}
			return this.stack.pop() ? true : null
			},
		scan :function( sText, sSyntax ){
			this.init( sText, sSyntax )
			while( this.readToken());
			return this.end()
			}
		}

	// Analyse par défaut
	var o = LexerRules
	o.addTokens({ list:[
		// Espaces blancs
		['SPACES',/[ ]/],
		['TAB',/\t/],
		['L_NEW_LINE',/[\n\r]/],
		['WHITE_SPACES',/[\t \n\r\f]+/],
		// Tout sauf un espaces blancs
		['NOT_WHITE_SPACES',/[^\t \n\r\f]+/]
		]})
	// Syntaxe par défaut
	o.addRule({name:'TXT', list:'TAB,L_NEW_LINE,SPACES,NOT_WHITE_SPACES'.split(',')})
	o.addCSSClass( 'space=SPACES&tab=TAB&linefeed=L_NEW_LINE&whitespaces=WHITE_SPACES&undefined=NOT_WHITE_SPACES' )
	o.setTokensTranslation('L_NEW_LINE=NEW_LINE')
		
	SINGLETON = new Lexer
	return Lexer
	})()