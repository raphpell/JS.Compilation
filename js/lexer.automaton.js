// LexerNode REQUIS

var AutomatonLexer =(function(){
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
		, Rules = Dictionary('rule')
		, DFA = Dictionary('DFA')
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

			DFA: DFA,
			addRule :function( sName, aTokens ){
				return Rules.add( sName, aTokens )
				},
			addRules :function( aRules ){
				for(var i=0, aRule; aRule=aRules[i]; i++ )
					Rules.add( aRule[0], aRule[1].split('|'))
				},
			haveRule :function( sName ){
				return Rules.have( sName )
				},
			addTokenFromString :function( sName, sDFA ){
				var o;
				eval('o='+sDFA);
				if( ! o.TokensTable ) o.TokensTable = [,sName]
				DFA.add( sName, o )
				},
			addTokens :function( aTokens ){
				if( aTokens.length )
					for(var i=0, aToken; aToken=aTokens[i]; i++ ){
						var sName=aToken[0], oDFA=aToken[1]
						DFA.add( sName, oDFA )
						if( ! oDFA.TokensTable ) oDFA.TokensTable = [,sName]
						}
				},
			setPreviousTokenOf :function( sToken, sPreviousTokens ){
				if( Previous.ofToken[sToken]) throw new Error ( 'Previous token of '+ sToken +' already defined !' )
				Previous.ofToken[sToken] = sPreviousTokens
				}
			}
		})()
	
	// ...
	, nextState =function( oFA, sStateI, sChar ){
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

	// Données d'analyse
	var sWSTokens ='|WHITE_SPACES|SPACES|SPACE|NEW_LINE|L_NEW_LINE|TAB|'
	, sToken, eNode, bNoSkip
	, Actions ={
		add :function(){
			this.previous.set( eNode.oValue.token )
			return this.appendNode( eNode )
			},
		endParent :function( bPartialScan ){
			this.previous.set( this.eParent.oValue.token )
			this.appendNode( eNode )
			this.stack.pop( bPartialScan )
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
			this.stack.push( eNode )
			this.previous.set( eNode.oValue.token )
			this.sText = this.sText.slice( 0, nEnd )
			do{ this.readToken()}while( this.nPos < nEnd )
			this.sText = sTMP
			this.stack.pop( bPartialScan )
			return eParent
			},
		startParent :function(){
			sToken = sToken.slice( 2 )
			var eNewParent = LexerNode({
				token: LexerRules.Translation[sToken]||sToken,
				css: LexerRules.CSS[sToken]||'',
				rule:sToken,
				value:'',
				index:eNode.oValue.index,
				lineStart:this.nLine,
				parentToken:this.eParent.oValue.rule
				})
			eNode.oValue.parentToken = sToken
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
				WHITE_SPACES:1,SPACES:1,SPACE:1,TAB:1,NEW_LINE:1,L_NEW_LINE:1,
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
	, Stack =function( that ){
		var a =[0,0,0,0,0]
		var n = 0 // StackLength
		return {
			pop :function( bPartialScan ){
				if( bPartialScan ){
					if( that.eEndToken && that.eParent==that.eEndToken.parentNode ){
						// Efface tous les éléments après la fin du parent dans celui-ci
						for(var e=that.eEndToken; e;){
							var eTMP = e
							e = e.nextSibling
							that.eParent.removeChild( eTMP )
							}
						// New End Token
						that.eEndToken = that.eParent.nextSibling
						}
					}
				// A faire après suppression des éléments inutiles
				if( n ){
					var e = a[--n]
					e.oValue.lineEnd = e.lastChild && e.lastChild.oValue.lineEnd || 1
					if( e.setTitle ) e.setTitle()
					}
				if( n ){
					if( that.eParent==that.eScanParent ) that.eScanParent = a[n-1]
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
		Stack: Stack,

	// ...
		rescan :function( eRoot, sSource, nPos, nDeleted, nAdded ){
			return SINGLETON.rescan( eRoot, sSource, nPos, nDeleted, nAdded )
			},
	// Ajout de données
		insert :function( fModule ){
			// Fonctions comprimant la taille des automates
			var f=function( sCharSet, bIn ){
				var cache = {}
				for(var i=0, ni=sCharSet.length; i<ni; i++ ) cache[ sCharSet[i]] = -1
				return bIn
					? function(symb,state){ return cache[symb] ? state : -1 }
					: function(symb,state){ return cache[symb] || state }
				}
			var g=function( /* sSymb1, ... */ ){ 
				var o = {}
				for(var i=0, ni=arguments.length; i<ni; i++ ) o[ arguments[i]] = i
				return o
				}
			var h=function( nLength, nDefaultValue /*,  nIndex1, nValue1, ...*/){
				var a = []
				var o = {}
				for(var i=2, ni=arguments.length; i<ni; i=i+2 ) o[ arguments[i]] = arguments[i+1]
				for(var i=0; i<nLength; i++ ) a[i] = o[i]!=undefined ? o[i] : nDefaultValue
				return a
				}
			fModule( LexerRules, f, g, h )
			}
		})
	Lexer.prototype ={
		searchToken :function( sToken, nStart ){
			var oFA=LexerRules.DFA.have( sToken ), nEnd=nStart, sState=1, oMatched=null
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
				sText: sText,
				skip:Skip(this),
				stack:Stack(this),
				previous:Previous(),
				sSyntax: sRule,
				eRoot: e,
				eParent: e
				})
			this.stack.push( e )
			this.appendNode =function( e ){
				return this.skip( e.oValue.token )
					? true
					: this.eParent.appendChild( e )
				}
			return this.eRoot
			},
		readToken :function( bPartialScan ){
			var sParentToken=this.eParent.oValue.rule
			, a=LexerRules.haveRule( sParentToken )||[sParentToken]
			, o
			bNoSkip = Skip.notFor[ sParentToken ]
			for(var j=0; sToken=a[j]; j++){
				if( o = this.searchToken( sToken, this.nPos )){
					sToken = o.token
					eNode = LexerNode({
						token: LexerRules.Translation[sToken]||sToken,
						css: LexerRules.CSS[sToken]||'',
						rule:sParentToken,
						value:this.sText.substring(o.start,o.end),
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
			return this.stack.pop( bPartialScan ) ? true : null
			},
		scan :function( sText, sSyntax ){
			this.init( sText, sSyntax )
			while( this.readToken());
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
			// Efface les éléments dépassés par le nouveau token eNode
			while( this.eEndToken && this.eEndToken.oValue.index + this.nShift < o1.index )
			// pas <= sinon autant faire une analyse totale
			// mais... a voir
				this.getNextEndToken()
			var o2 = this.eEndToken && this.eEndToken.oValue
			// Si le nouveau token est 'identique' à eEndToken
			if( o2 && o1.token==o2.token && o1.value==o2.value && o1.index==o2.index+this.nShift ){
				// 1. Contrôle si les tokens sont bien identique = ont le même parent
				if( this.stack.top() !== this.eEndToken.parentNode )
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
			//initialisation
			eParent = eParent || this.eRoot
			var a = eParent.childNodes
			, nStart = 0, nMiddle, nEnd = a.length-1
			
			// Recherche dichotomique
			if( a.length )
				do{
					nMiddle = Math.round( nStart + ( nEnd - nStart ) / 2 )
					var e = a[nMiddle]
					if( this.isPartOfRange( e, nPos ))
						return this.isParent( e ) ? this.nodeAt( nPos, e ) : e
					else if( nPos < e.oValue.index ) nEnd = nMiddle - 1
					else nStart = nMiddle + 1
				} while ( nStart <= nEnd )
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
				var eParent = e1.parentNode
				if( e2 || ! this.isParent( eParent )) return this.removeNode( e1 )
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
				throw Error( 'Pas le même parent ! final' )
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
			this.stack = Stack(this)
			for(var e=this.eParent; e; e=e.parentNode ){
				this.stack.unshift( e )
				if( e==eRoot ) break;
				}
			while( this.readToken());
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

	// Analyse par défaut: fichier .txt
	Lexer.insert(function(o,f,g,h){
		o.addTokens([
			['WHITE_SPACES',{A:g("[\t \n\r\f]"),R:[[0,f("\t \n\r\f",1)]],M:[[],[2],[2]],F:[,,1],TokensTable:[,'WHITE_SPACES']}],
			['NOT_WHITE_SPACES',{A:{"[^\t \n\r\f]":0},R:[[0,f("\t \n\r\f")]],M:[[1],[1]],F:{1:1},TokensTable:[,'NOT_WHITE_SPACES']}],
			['TXT',{A:g("\n","[^\t\n\f\r ]","\t","\f","\r"," "),R:[[1,f("\t\n\f\r ")]],M:[[],[5,3,4,5,2,6],[5],[,3]],F:[,,3,5,2,3,4],TokensTable:',,TAB,L_NEW_LINE,SPACES,TEXT'.split(',')}]
			])
		o.addCSSClass( 'whitespaces=WHITE_SPACES&undefined=NOT_WHITE_SPACES' )
		})
		
	SINGLETON = new Lexer
	return Lexer
	})()