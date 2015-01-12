// LexerNode REQUIS

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

	var aMatch, nMatchLength, sToken, eNode, eNewParent, bNoSkip
	, Actions ={
		add :function(){
			this.previous.set( eNode.oValue.token )
			return this.appendNode( eNode )
			},
		endParent :function(){
			this.previous.set( this.eParent.oValue.token )
			this.appendNode( eNode )
			this.stack.pop()
			return eNode
			},
		newLine :function(){
			this.previous.set( eNode.oValue.token )
			this.nLine++
			return this.appendNode( eNode )
			},
		rescanToken :function(){
			this.nPos = eNode.oValue.index
			this.nLine = eNode.oValue.lineStart
			var sRescan = sToken.slice( 2 )
			, sTextRescan = eNode.oValue.value
			, nEnd = this.nPos + sTextRescan.length
			, sTMP = this.sText
			eNode.oValue.value = eNode.innerHTML = ''
			eNode.oValue.rule = sRescan
			var eParent = this.appendNode( eNode )
			this.stack.push( eNode )
			this.previous.set( eNode.oValue.token )
			this.sText = sTextRescan
			do{ this.readToken()}while( this.nPos < nEnd )
			this.sText = sTMP
			this.stack.pop()
			return eParent
			},
		startParent :function(){
			sToken=sToken.slice( 2 )
			eNewParent = LexerNode({
				token: LexerRules.Translation[sToken]||sToken,
				css: LexerRules.CSS[sToken]||'',
				rule:sToken,
				value:'',
				index:eNode.oValue.index,
				lineStart:this.nLine,
				parentToken:this.sSyntax
				})
			eNode.oValue.parentToken = eNewParent.oValue.rule
			if( eNode.setTitle ) eNode.setTitle()
			eNewParent.appendChild( eNode )
			this.previous.set( eNode.oValue.token )
			this.appendNode( eNewParent )
			this.stack.push( eNewParent )
			if( Skip.notFor[ this.sSyntax ])
				while( this.eParent==eNewParent && this.readToken());
			return eNewParent
			} 
		}
	, Previous =(function(){
		var o =function(){
			var s = ''
			return {
				invalidFor :function( sToken ){
					return o.ofToken[sToken] && o.ofToken[sToken].indexOf(s)<0
					},
				set :function( sToken ){
					if( !o.excluded[sToken]) s = LexerRules.Translation[sToken]||sToken
					},
				get :function(){ return s }
				}
			}
		o.union({
			excluded :{
				WHITE_SPACES:1,SPACES:1,SPACE:1,TAB:1,
				S_SLC:1,SLC:1,SLC_IN:1,
				S_MLC:1,MLC:1,MLC_IN:1,E_MLC:1,
				COMMENT:1,
				REGULAR_EXPRESSION_IN:1
				},
			ofToken :{
				"R_REGULAR_EXPRESSION":"ARITHMETIC_OPERATOR|ASSIGNMENT_OPERATOR|BITWISE_OPERATOR|COMPARISON_OPERATOR|LOGICAL_OPERATOR|ELISION|DOT|LBRACK|LPAREN|LBRACE|COLON|SEMI|QUESTION|JS_KEYWORD"
				}
			})
		return o
		})()
	, Stack =function( that ){
		var a = []
		return {
		//	value: a,
			pop :function(){
				if( a.length ){
					var e = a.pop()
					e.oValue.lineEnd = e.lastChild && e.lastChild.oValue.lineEnd || 1
					if( e.setTitle ) e.setTitle()
					}
				if( a.length ){
					that.eParent = a[a.length-1]
					that.sSyntax = that.eParent.oValue.rule
					}
				return a.length
				},
			push :function( e ){
				a.push( that.eParent = e )
				that.sSyntax = e.oValue.rule
				return e
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
		if( sText ) return SINGLETON.scan( sText, sSyntax )
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
		eParent: null,
		action :function(){
			return Actions[
				sToken.charAt(1)=='_'
					? { E:'endParent',
						L:'newLine',
						R:'rescanToken',
						S:'startParent'
						}[ sToken.charAt(0)] || 'add'
					: 'add'
				].call( this )
			},
		appendNode :function( e ){
			return this.skip( e.oValue.token )
				? true
				: this.eParent.appendChild( e )
			},
		init :function( sText, sSyntax ){
			this.union({
				nLine:1,
				nPos:0,
				sText:sText,
				skip:Skip(this),
				stack:Stack(this),
				previous:Previous()
				})
			sSyntax = sSyntax || 'RegExp'
			this.eRoot = this.stack.push( LexerNode({
				token:sSyntax,
				rule:sSyntax,
				value:'',
				css:sSyntax.toLowerCase(),
				index:0,
				lineStart:1
				}))
			},
		readToken :function(){
			var a = LexerRules.getRule( this.sSyntax )
			bNoSkip = Skip.notFor[ this.sSyntax ]
			for(var i=0; a[i]; i++ ){
				if( ! a[i].re.test( this.sText ) || this.previous.invalidFor( a[i].name )) continue;
				aMatch = a[i].re.exec( this.sText )
				if( nMatchLength = aMatch[0].length ){
					sToken = a[i].name
					eNode = LexerNode({
						token: LexerRules.Translation[sToken]||sToken,
						css: LexerRules.CSS[sToken]||'',
						rule:sToken,
						value:aMatch[0],
						index:this.nPos,
						lineStart:this.nLine,
						lineEnd:this.nLine,
						parentToken:this.sSyntax
						})
					this.sText = this.sText.substr( nMatchLength )
					this.nPos += nMatchLength
					return this.action()
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
	SINGLETON = new Lexer
	return Lexer
	})()