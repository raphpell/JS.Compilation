// LexerNode REQUIS
var throwError=function( s ){ alert(s);throw Error ( s );}

var AutomatonLexer =(function(){
	var SINGLETON
	// Fonction comprimant les automates
	,f=function( sCharSet, bIn ){
		var cache = {}
		for(var i=0, ni=sCharSet.length; i<ni; i++ ) cache[ sCharSet[i]] = -1
		return bIn
			? function(symb,state){ return cache[symb] ? state : -1 }
			: function(symb,state){ return cache[symb] || state }
		}
	,g=function( /* sSymb1, ... */ ){ 
		var o = {}
		for(var i=0, ni=arguments.length; i<ni; i++ ) o[ arguments[i]] = i
		return o
		}
	,h=function( nLength, nDefaultValue /*,  nIndex1, nValue1, ...*/){
		var a = []
		var o = {}
		for(var i=2, ni=arguments.length; i<ni; i=i+2 ) o[ arguments[i]] = arguments[i+1]
		for(var i=0; i<nLength; i++ ) a[i] = o[i]!=undefined ? o[i] : nDefaultValue
		return a
		}
	// ...
	,nextState =function( oFA, sStateI, sChar ){
		var cache = oFA.cache || ( oFA.cache = [] )
		cache = cache[sStateI] || ( cache[sStateI] = {} )
		if( cache[sChar]) return cache[sChar]
		var o = oFA.M[sStateI], sStateF
		return cache[sChar] = 
			sChar.length && o && ( o[ oFA.A[sChar]] || (function(){
				if( oFA.R )
					for(var i=0; a=oFA.R[i]; i++)
						if( ( sStateF = a[1]( sChar, o[a[0]]||0 )) > 0 )
							return sStateF
				})())
			|| -2 
		}
	,finalizeParent =function( eNode ){
		eNode.oValue.lineEnd = eNode.lastChild && eNode.lastChild.oValue.lineEnd || 1
		if( eNode.setTitle ) eNode.setTitle()
		return eNode
		}
	// Données d'analyse
	, DFA ={
		WHITE_SPACES:{A:g("[\t \n\r\f]"),R:[[0,f("\t \n\r\f",1)]],M:[[],[2],[2]],F:[,,1],TokensTable:[,'WHITE_SPACES']},
		NOT_WHITE_SPACES:{A:{"[^\t \n\r\f]":0},R:[[0,f("\t \n\r\f")]],M:[[1],[1]],F:{1:1},TokensTable:[,'NOT_WHITE_SPACES']},
		TXT:{A:g("\n","[^\t\n\f\r ]","\t","\f","\r"," "),R:[[1,f("\t\n\f\r ")]],M:[[],[5,3,4,5,2,6],[5],[,3]],F:[,,3,5,2,3,4],TokensTable:',,TAB,L_NEW_LINE,SPACES,TEXT'.split(',')}
		}
	, Rules ={}
	, sWSTokens ='|WHITE_SPACES|SPACES|SPACE|NEW_LINE|L_NEW_LINE|TAB|'
	, sToken, eNode, bNoSkip
	, Actions ={
		add :function(){
			this.previous.set( eNode.oValue.token )
			return this.appendNode( eNode )
			},
		endParent :function( bPartialScan ){
			this.previous.set( this.eParent.oValue.token )
			this.appendNode( eNode )
			this.stackPop( bPartialScan )
			return eNode
			},
		newLine :function(){
			this.previous.set( eNode.oValue.token )
			this.nLine++
			return this.appendNode( eNode )
			},
		rescanToken :function( bPartialScan, sRule ){
			sRule = sToken.slice( 2 )
			this.nPos = eNode.oValue.index
			this.nLine = eNode.oValue.lineStart
			var sTextRescan = eNode.oValue.value
			, nEnd = this.nPos + sTextRescan.length
			, sTMP = this.sText
			eNode.oValue.value = eNode.innerHTML = ''
			eNode.oValue.rule = sRule
			var eParent = this.appendNode( eNode )
			this.stackPush( eNode )
			this.previous.set( eNode.oValue.token )
			this.sText = this.sText.slice( 0, nEnd )
			do{ this.readToken()}while( this.nPos < nEnd )
			this.sText = sTMP
			this.stackPop( bPartialScan )
			return eParent
			},
		startParent :function(){
			sToken = sToken.slice( 2 )
			var eNewParent = LexerNode({
				token: Translation[sToken]||sToken,
				rule:sToken,
				value:'',
				css:CSS[sToken]||'',
				index:eNode.oValue.index,
				lineStart:this.nLine,
				parentToken:this.eParent.oValue.rule
				})
			eNode.oValue.parentToken = sToken
			if( eNode.setTitle ) eNode.setTitle()
			eNewParent.appendChild( eNode )
			this.previous.set( eNode.oValue.token )
			this.appendNode( eNewParent )
			this.stackPush( eNewParent )
			if( Skip.notFor[ this.sSyntax ])
				while( this.eParent==eNewParent && this.readToken());
			return eNewParent
			}
		}
	, CSS ={}
	, Previous =(function(){
		var o =function(){
			var s = ''
			return {
				invalidFor :function( sToken ){
					return o.ofToken[sToken] && o.ofToken[sToken].indexOf(s)<0
					},
				set :function( sToken ){
					if( !o.excluded[sToken]) s = Translation[sToken]||sToken
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
			//	"R_REGULAR_EXPRESSION":"ARITHMETIC_OPERATOR|ASSIGNMENT_OPERATOR|BITWISE_OPERATOR|COMPARISON_OPERATOR|LOGICAL_OPERATOR|ELISION|DOT|LBRACK|LPAREN|LBRACE|COLON|SEMI|QUESTION|JS_KEYWORD"
				}
			})
		return o
		})()
	, Translation ={}
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
	, Lexer =function( sText, sLexerRule ){
		if( sText ) return SINGLETON.scan( sText, sLexerRule )
		}
	Lexer.union({
		Previous: Previous,
		bConsole: false,
		console :function( sType, sText ){
			if( Lexer.bConsole && window.console ) console[sType]( sText )
			},
	// ...
		rescan :function( eRoot, sSource, nPos, nDeleted, nAdded ){
			return SINGLETON.rescan( eRoot, sSource, nPos, nDeleted, nAdded )
			},
	// Ajout de données
		insert :function( fModule ){ fModule( Lexer, f, g, h )},
		addCSSClass :function( sCSSClasses ){ // sCSSClasses = 'class1=TOKEN1|TOKEN2&class2=TOKEN3'
			var o = CSS
			for(var aCouple, i=0, aCouples=sCSSClasses.split('&'), ni=aCouples.length; i<ni ; i++ ){
				aCouple = aCouples[i].split('=')
				var sCSS = aCouple[0]
				for(var sToken, j=0, aTokens=aCouple[1].split('|'), nj=aTokens.length; j<nj ; j++ ){
					sToken = aTokens[j]
					o[ sToken ] = o[ sToken ] ? o[ sToken ].split(' ') : []
					o[ sToken ].push( sCSS )
					o[ sToken ] = Array.unique( o[ sToken ]).join(' ')
					}
				}
			},
		addRule :function( sName, aTokens ){
			if( Rules[sName]) Lexer.console('warn', 'Règle '+ sName +' modifiée.' )
			Rules[sName] = aTokens
			},
		addRules :function( aRules ){
			if( aRules.length )
				for(var i=0, aRule; aRule=aRules[i]; i++ )
					Lexer.addRule( aRule[0], aRule[1].split('|'))
			},
		addTokenFromString :function( sName, sDFA ){ var o; eval('o='+sDFA); DFA[sName]=o },
		addTokens :function( aTokens ){
			if( aTokens.length )
				for(var i=0, aToken; aToken=aTokens[i]; i++ ){
					var oDFA = aToken[1], sName = aToken[0]
					if( DFA[ sName ]) Lexer.console('warn', 'Token '+ sName +' modifié.' )
					DFA[ sName ] = oDFA
					if( ! oDFA.TokensTable ) oDFA.TokensTable = [,sName]
					}
			},
		setPreviousTokenOf :function( sToken, sPreviousTokens ){
			if( Previous.ofToken[sToken]) throw new Error ( 'Previous token of '+ sToken +' already defined !' )
			Previous.ofToken[sToken] = sPreviousTokens
			},
		setTokensTranslation :function( sTranslations ){ // sTranslations = 'TOKEN1=NEWNAME1&TOKEN2=NEWNAME2'
			var o = Translation
			for(var aCouple, sToken, i=0, aCouples=sTranslations.split('&'), ni=aCouples.length; i<ni ; i++ ){
				aCouple = aCouples[i].split('=')
				sToken = aCouple[0]
				if( o[sToken]) Lexer.console('warn', 'Token Translation of '+ sToken +' already defined with '+ o[sToken] +' !' )
				o[sToken] = aCouple[1]
				}
			}
		})
	Lexer.prototype ={
		aStack:null,
		nLine:null,
		nPos:null,
		sText:null,
		
		analyse :function(){
			while( this.readToken());
			while( this.aStack.length ) finalizeParent( this.aStack.pop())
			},		
		searchToken :function( sToken, nStart ){
			var oFA=DFA[sToken], nEnd=nStart, sState=1, oMatched=null
			if( this.previous.invalidFor( sToken )) return false;
			while( ( sState = nextState( oFA, sState, this.sText.charAt( nEnd++ ))) > 0 ){
				if( oFA.F[ sState ]){
					sToken = oFA.TokensTable[ oFA.F[ sState ]]
					if( this.previous.invalidFor( sToken )) continue;
					oMatched={ start:nStart, end:nEnd, token:sToken }
					}
				}
			return oMatched
			},
		stackPop :function( bPartialScan ){
			var a = this.aStack
			if( bPartialScan ){
				if( this.eEndToken && this.eParent==this.eEndToken.parentNode ){
					// Efface tous les éléments après la fin du parent dans celui-ci
					for(var e=this.eEndToken; e;){
						var eTMP = e
						e = e.nextSibling
						this.eParent.removeChild( eTMP )
						}
					// New End Token
					this.eEndToken = this.eParent.nextSibling
					}
				}
			// A faire après suppression des éléments inutiles
			if( a.length ) finalizeParent( a.pop()) 
			if( a.length ){
				if( this.eParent==this.eScanParent ) this.eScanParent = a[a.length-1]
				this.eParent = a[a.length-1]
				this.sSyntax = this.eParent.oValue.rule
				}
			return a.length
			},
		stackPush :function( e ){
			this.aStack.push( this.eParent = e )
			this.sSyntax = e.oValue.rule
			return e
			},

		bSkip: 0,
		eParent:null,
		action :function( bPartialScan ){
			return Actions[
				sToken.charAt(1)=='_'
					? { E:'endParent',
						L:'newLine',
						R:'rescanToken',
						S:'startParent'
						}[ sToken.charAt(0)] || 'add'
					: 'add'
				].call( this, bPartialScan )
			},
		appendNode :null, // varie selon scan ou rescan
		init :function( sText, sRule ){
			var e = LexerNode({
				token:sRule,
				rule:sRule,
				value:'',
				css:sRule.toLowerCase(),
				index:0,
				lineStart:1,
				lineEnd:1
				})
			this.union({
				nLine: 1,
				nPos: 0,
				skip:Skip(this),
				previous:Previous(),
				sText: sText,
				sSyntax: sRule,
				eRoot: e,
				eParent: e,
				aStack: [e]
				})
			this.appendNode =function( e ){
				return this.skip( e.oValue.token )
					? true
					: this.eParent.appendChild( e )
				}
			return this.eRoot
			},
		readToken :function( bPartialScan ){
			var sParentToken=this.eParent.oValue.rule
			, a=Rules[sParentToken]||[sParentToken]
			, o
			bNoSkip = Skip.notFor[ sParentToken ]
			for(var j=0; sToken=a[j]; j++){
				if( o = this.searchToken( sToken, this.nPos )){
					sToken = o.token
					eNode = LexerNode({
						token:Translation[sToken]||sToken,
						rule:sParentToken,
						value:this.sText.substring(o.start,o.end),
						css:CSS[sToken]||'',
						index:this.nPos,
						lineStart:this.nLine,
						lineEnd:this.nLine,
						parentToken:sParentToken
						})
					if( this.haveNode( eNode )) return false
					this.nPos = o.end
					return this.action( bPartialScan )
					}
				}
			return this.stackPop( bPartialScan ) ? true : null
			},
		scan :function( sSource, sRuleName ){
			this.init( sSource, sRuleName )
			this.analyse()
			return this.eRoot
			}
		}
	// RESCAN
	Lexer.prototype.union({
		eEndToken:null,
		eScanParent:null,
	//	nLineEnd:null,
		nShift:null,
		nLineShift:null,
		eRoot:null,
		getTokenAfter :function( e ){
			var eNext
			do{
				if( e===this.eRoot ) return null
				eNext = e.nextSibling
				e = e.parentNode
				}while( ! eNext )
			return eNext
			},
		getNextEndToken :function(){
			var eNext = this.getTokenAfter( this.eEndToken )
			this.removeNode( this.eEndToken )
			this.eEndToken = eNext
			this.nLineEnd = eNext ? eNext.oValue.lineStart : this.eRoot.oValue.lineEnd
			},
		haveNode :function( eNode ){
			if( ! this.eEndToken ) return false
			var o1 = eNode.oValue
		//	console.info( JSON.stringify( o1 ))
			// Efface les éléments dépassés par le nouveau token eNode
			while( this.eEndToken && this.eEndToken.oValue.index + this.nShift < o1.index )
			// pas <= sinon autant faire une analyse totale
			// mais... a voir
				this.getNextEndToken()
			var o2 = this.eEndToken && this.eEndToken.oValue
			// Si le nouveau token est 'identique' à eEndToken
			if( o2 && o1.token==o2.token && o1.value==o2.value && o1.index==o2.index+this.nShift ){
				// 1. Contrôle si les tokens sont bien identique = ont le même parent
				if( this.aStack[this.aStack.length-1] !== this.eEndToken.parentNode )
					this.getNextEndToken()
				// 2. FIN ANALYSE: Met à jour les éléments suivant ( index et ligne ) 
				else{
					this.nLineShift = o1.lineStart - o2.lineStart
					this.updateValues()
					return true
					}
				}
			return false  // Continue l'analyse
			},
		isParentLimit :function( e ){ // Attention cas racine !
			var eP = e.parentNode
			if( /* ! eP ||  */this.isRoot( eP )) return false
			return /* eP.oValue.token==e.oValue.parentToken && */ ( eP.firstChild == e || eP.lastChild == e )
			},
		isParent :function( e ){
			return e.oValue.value==='' && e!=this.eRoot
			},
		isPartOfRange :function( e, nStart, nLength ){ // Intervalle ouvert
			var o = e.oValue
			, nEnd = nStart + (nLength||0)/*  - 1 */
			, nTokenStart = o.index
			, nTokenEnd
			if( this.isParent( e )){
				while( this.isParent( e )) e=e.lastChild
				o = e.oValue
				nTokenEnd = o.index + o.value.length
				} else nTokenEnd = nTokenStart + o.value.length
			
			return nStart <= nTokenStart && nTokenStart <= nEnd	// Le début du token est dans l'intervalle
				|| nTokenStart <= nStart && nEnd <= nTokenEnd	// L'intervalle est dans le token
				|| nStart <= nTokenEnd && nTokenEnd <= nEnd		// La fin du token est dans l'intervalle
			},
		isRoot :function( e ){
			return e==this.eRoot
			},
		isWhiteSpace :function( sToken ){
			return ~sWSTokens.indexOf( '|'+sToken+'|' )
			},
		nodeAt :function( nPos, eParent ){
			eParent = eParent || this.eRoot
			for(var e = eParent.firstChild; e ; e = e.nextSibling ){
				if( ! this.isPartOfRange( e, nPos )) continue;	
				if( this.isParent( e )) this.nodeAt( nPos, e )
				return e
				}
			return null
			},
		removeDeletedNodes :function( eParent, nPos, nDeleted ){
			var ePrevious, eNext
			// Recherche et efface le premier élément
			, e = this.nodeAt( nPos, eParent )
			if( e ){
				if( this.isParent( e ) && ~e.firstChild.oValue.parentToken.indexOf('_SCAN')){
					ePrevious = e.previousSibling
					eNext = e.nextSibling
					this.removeNode( e )
					}
				else{
					if( this.isParentLimit( e )) e = e.parentNode
					ePrevious = e.previousSibling
					eNext = e.nextSibling
					this.removeNode( e )
					}
				}
			
			var remove = CallBack( this, function( e1, e2 ){
				if( e2 ) return this.removeNode( e1 )
				var eParent = e1.parentNode
				if( this.isParent( eParent )){
					ePrevious = eParent.previousSibling
					eNext = eParent.nextSibling
					this.removeNode( eParent )
					}
				})
			while( ePrevious ){
				if( this.isWhiteSpace( ePrevious.oValue.token )) break;
				remove( ePrevious, ePrevious = ePrevious.previousSibling )
				}
			while( eNext ){
				if( this.isWhiteSpace( eNext.oValue.token ) && ! this.isPartOfRange( eNext, nPos, nDeleted )) break;
				remove( eNext, eNext = eNext.nextSibling )
				}
					
			if( ePrevious && eNext && ePrevious.parentNode != eNext.parentNode )
				throwError( 'Pas le même parent ! final' )
			return {
				before: ! e ? this.eRoot.lastChild: ePrevious,
				after: eNext
				}
			},
		removeNode :function( e ){
			if( e!=this.eRoot && e.parentNode )
				return e.parentNode.removeChild( e )
			},
		rescan :function( eRoot, sSource, nPos, nDeleted, nAdded ){
			if( ! nDeleted && ! nAdded ) return false;
			this.appendNode =function( eNode ){
				if( this.haveNode( eNode )) return false
				if( this.skip( eNode.oValue.token )) return true
				var e1=this.eParent, e2=this.eEndToken
				return e1==this.eScanParent && e2 && e2.parentNode==e1
					? e1.insertBefore( eNode, e2 )
					: e1.appendChild( eNode )
				}
			this.eRoot = eRoot
			this.sText = sSource
			this.previous = Previous()
			var nRootOldLineEnd = eRoot.oValue.lineEnd
			this.nShift = nAdded-nDeleted

			var oScanNodes = this.removeDeletedNodes( eRoot, nPos, nDeleted )
			if( oScanNodes.before ){
				var o = oScanNodes.before.oValue
				this.eScanParent = this.eParent = oScanNodes.before.parentNode
				this.eEndToken = oScanNodes.before.nextSibling || this.getTokenAfter( this.eScanParent )
				this.nLine = o.token=='NEW_LINE' ? o.lineEnd+1 : o.lineEnd
				for(var e = oScanNodes.before; this.isParent( e ); e = e.lastChild );
				o = e.oValue
				this.nPos = o.index + o.value.length // ATTENTION : cas parent à faire
				
				var e = oScanNodes.before
				while( e && this.isWhiteSpace( e.oValue.token ))
					e = e.previousSibling
				if( e ) this.previous.set( e.oValue.token )
				}
			else{ //Start from beginning ?
				this.eScanParent = this.eParent = oScanNodes.after ? oScanNodes.after.parentNode : eRoot
				this.eEndToken = oScanNodes.after || eRoot.firstChild
				this.nLine = 1
				this.nPos = 0
				}
			this.nLineEnd = this.eEndToken ? this.eEndToken.oValue.lineStart : eRoot.oValue.lineEnd
			var nLineStart = this.nLine
			this.aStack = []
			for(var e=this.eParent; e; e=e.parentNode ){
				this.aStack.unshift( e )
				if( e==eRoot ) break;
				}
			this.analyse()
			var nLineShift = eRoot.oValue.lineEnd-nRootOldLineEnd 
			if( nLineShift>=0 ) this.nLineEnd = this.eEndToken ? this.eEndToken.oValue.lineStart : eRoot.oValue.lineEnd
			this.eEndToken = null
			return { lineStart:nLineStart, lineEnd:this.nLineEnd, lineShift:nLineShift }
			},
		updateValues :function(){
			if( ! this.nShift && ! this.nLineShift ) return ;
			var update =CallBack( this, function( eFirst ){
				for(var e=eFirst, o ; e ; e=e.nextSibling ){
					if( o=e.oValue ){
						o.index += this.nShift
						o.lineEnd += this.nLineShift
						o.lineStart += this.nLineShift
						if( e.setTitle ) e.setTitle()
						if( this.isParent( e )) update( e.firstChild )
						}
					}
				})
			update( this.eEndToken )
			var eRoot = this.eRoot
			for(var e = this.eEndToken.parentNode ; e ; e = e.parentNode ){
				update( e.nextSibling )
				if( e == eRoot ){
					eRoot.oValue.lineEnd = eRoot.lastChild.oValue.lineEnd
					if( eRoot.setTitle ) eRoot.setTitle()
					break;
					}
				}
			this.eEndToken = null
			this.nShift = null
			this.nLineShift = null
			}
		})

	SINGLETON = new Lexer
	Lexer.addCSSClass( 'whitespaces=WHITE_SPACES&undefined=NOT_WHITE_SPACES' )
	return Lexer
	})()