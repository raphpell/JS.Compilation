// Lexeme REQUIS

var AutomatonLexer =(function(){
	var SINGLETON
	// Fonctions: compression des automates ++
	, f=function( sCharSet, bIn ){
		var cache = {}
		for(var i=0, ni=sCharSet.length; i<ni; i++ ) cache[ sCharSet[i]] = -1
		return bIn
			? function(symb,state){ return cache[symb] ? state : -1 }
			: function(symb,state){ return cache[symb] || state }
		}
	, g=function( /* sSymb1, ... */ ){ 
		var o = {}
		for(var i=0, ni=arguments.length; i<ni; i++ ) o[ arguments[i]] = i
		return o
		}
	, h=function( nLength, nDefaultValue /*,  nIndex1, nValue1, ...*/){
		var a = []
		var o = {}
		for(var i=2, ni=arguments.length; i<ni; i=i+2 ) o[ arguments[i]] = arguments[i+1]
		for(var i=0; i<nLength; i++ ) a[i] = o[i]!=undefined ? o[i] : nDefaultValue
		return a
		}
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
		, DFA=Dictionary('DFA')
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
				}
			}
		})()

	// Données d'analyse
	var sToken, oLexeme, bNoSkip, oFound
	, sWSTokens ='|WHITE_SPACES|SPACES|SPACE|NEW_LINE|L_NEW_LINE|TAB|'
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
				this.sText = this.sText.slice( 0, nEnd )
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
				if( that.bIncremental ){
					// Cas : Un parent est stoppé plus top
					if( that.eEndToken && that.eParent==that.eEndToken.parentNode ){
						// Efface tous les enfants du parent présent après sa nouvelle fin
						for(var e=that.eEndToken; e;){
							var eRemoved = e
							e = e.nextSibling
							that.removeToken( eRemoved )
							}
						// New End Token
						that.eEndToken = that.getTokenAfter( that.eParent )
						}
					}
				// A faire après suppression des éléments inutiles
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
		Stack: Stack,

	// ...
		rescan :function( eRoot, sSource, nPos, nDeleted, nAdded ){
			return SINGLETON.rescan( eRoot, sSource, nPos, nDeleted, nAdded )
			},
	// Ajout de données
		insert :function( fModule ){
			fModule( LexerRules, f, g, h )
			}
		})
	// SCANNING
	Lexer.prototype ={
		end :function(){
			return this.eRoot
			},
		searchToken :function( sToken, nStart ){
			var oFA=LexerRules.DFA.have( sToken ), nEnd=nStart, sState=1, oFound=null
			if( this.previous.invalidFor( sToken )) return false;
			while( ( sState = nextState( oFA, sState, this.sText.charAt( nEnd++ ))) > 0 ){
				if( oFA.F[ sState ]){
					sToken = oFA.TokensTable[ oFA.F[ sState ]]
					if( this.previous.invalidFor( sToken )) continue;
					oFound={ start:nStart, end:nEnd, token:sToken }
					}
				}
			return oFound
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
			var a = LexerRules.haveRule( this.sSyntax ) || [this.sSyntax]
			bNoSkip = Skip.notFor[ this.sSyntax ]
			for(var j=0; sToken=a[j]; j++){
				if( oFound = this.searchToken( sToken, this.nPos )){
					sToken = oFound.token
					oLexeme ={
						value:this.sText.substring(oFound.start,oFound.end),
						token: LexerRules.Translation[sToken]||sToken,
						css: LexerRules.CSS[sToken]||'',
						rule:this.sSyntax,
						index:this.nPos,
						lineStart:this.nLine,
						lineEnd:this.nLine
						}
					if( this.haveLexeme( oLexeme )) return false
					this.nPos = oFound.end
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
	// INCREMENTAL SCANNING only
	Lexer.prototype.union({
		eEndToken:null,
		nShift:null,
		nLineShift:null,
		getTokenAfter :function( e ){
			var eNext
			do{ if( e===this.eRoot ) return null
				eNext = e.nextSibling
				e = e.parentNode
				}while( ! eNext )
			return eNext
			},
		getTokenBefore :function( e ){
			var ePrevious
			do{ if( e===this.eRoot ) return null
				ePrevious = e.previousSibling
				e = e.parentNode
				}while( ! ePrevious )
			return ePrevious
			},
		getNextEndToken :function(){
			var eNext = this.getTokenAfter( this.eEndToken )
			this.removeToken( this.eEndToken )
			this.eEndToken = eNext
			},
		haveLexeme :function( oLexeme ){
			if( ! this.eEndToken ) return false
			// Efface les éléments dépassés par le lexème trouvé
			while( this.eEndToken && this.eEndToken.oValue.index + this.nShift < oLexeme.index )
			// pas <= sinon autant faire une analyse totale
			// mais... a voir
				this.getNextEndToken()
			var o = this.eEndToken && this.eEndToken.oValue
			// Si le nouveau token est 'identique' à eEndToken
			if( o && oLexeme.token==o.token && oLexeme.value==o.value && oLexeme.index==o.index+this.nShift ){
				// 1. Contrôle si les tokens sont bien identique = ont le même parent
				if( this.eParent !== this.eEndToken.parentNode )
					this.getNextEndToken()
				// 2. FIN ANALYSE: Met à jour les éléments suivant ( index et ligne ) 
				else{
					this.nLineEnd = o.lineEnd
					this.nLineShift = oLexeme.lineStart - o.lineStart
					return true
					}
				}
			return false  // Continue l'analyse
			},
		isPartOfRange :function( e, nStart, nLength ){ // Intervalle ouvert
			var nEnd = nStart + (nLength||0) /* - 1 */
			, nTokenStart = e.oValue.index
			while( e.oValue.bParent ) e=e.lastChild
			var nTokenEnd = e.oValue.index + e.oValue.value.length
			return nStart <= nTokenStart && nTokenStart <= nEnd	// Le début du token est dans l'intervalle
				|| nTokenStart <= nStart && nEnd <= nTokenEnd	// L'intervalle est dans le token
				|| nStart <= nTokenEnd && nTokenEnd <= nEnd		// La fin du token est dans l'intervalle
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
						return e.oValue.bParent ? this.nodeAt( nPos, e ) : e
					else if( nPos < e.oValue.index ) nEnd = nMiddle - 1
					else nStart = nMiddle + 1
				} while ( nStart <= nEnd )
			return null
			},
		removeDeletedNodes :function( eParent, nPos, nDeleted ){
			var e = this.nodeAt( nPos, eParent )
			, ePrevious
			, eNext 
			, remove =CallBack( this, function( e ){
				if( e.oValue.bParentLimit || e.parentNode.oValue.bRescan ){
					var eParent = e.parentNode
					ePrevious = eParent.previousSibling
					eNext = eParent.nextSibling
					return remove( eParent )
					}
				ePrevious = e.previousSibling
				eNext = e.nextSibling
				return this.removeToken( e )
				})
			// Efface le premier élément à la position nPos
			if( e ) remove( e )
			// Efface à gauche jusqu'au premier espace trouvé
			while( ePrevious ){
				if( this.isWhiteSpace( ePrevious.oValue.token )) break;
				remove( ePrevious )
				}
			// Efface à droite les éléments inclus dans l'intervalle effacé
			// et efface à droite jusqu'au premier espace trouvé
			while( eNext ){
				if( this.isWhiteSpace( eNext.oValue.token ) && ! this.isPartOfRange( eNext, nPos, nDeleted )) break;
				remove( eNext )
				}
			/* Normalement ePrevious et eNext ont les mêmes parents !!!
			if( ePrevious && eNext && ePrevious.parentNode != eNext.parentNode )
				throw Error( 'Pas le même parent ! final' )
			*/
			return {
				before: ! e ? this.eRoot.lastChild: ePrevious,
				after: eNext
				}
			},
		removeToken :function( e ){
			return e.parentNode.removeChild( e )
			},
		rescan :function( eRoot, sSource, nPos, nDeleted, nAdded ){
			if( ! nDeleted && ! nAdded ) return false;
			
			this.bIncremental = true
			this.appendNode =function( eNode ){
				if( this.skip( eNode.oValue.token )) return true
				return this.eEndToken && this.eEndToken.parentNode==this.eParent
					? this.eParent.insertBefore( eNode, this.eEndToken )
					: this.eParent.appendChild( eNode )
				}
			
			this.eRoot = eRoot
			this.sText = sSource
			this.previous = Previous()
			var nRootOldLineEnd = eRoot.oValue.lineEnd
			this.nShift = nAdded-nDeleted
			this.nLineShift = this.nLineEnd = null // ! important

			var oScanLimit = this.removeDeletedNodes( eRoot, nPos, nDeleted )
			, eBefore = oScanLimit.before

			if( eBefore ){
				var o = eBefore.oValue
				this.eParent = eBefore.parentNode
				this.eEndToken = this.getTokenAfter( eBefore )
				// Calcul de la position courante
				for(var e = eBefore; e.oValue.bParent ; e = e.lastChild );
				this.nPos = e.oValue.index + e.oValue.value.length
				this.nLine = o.token=='NEW_LINE' ? o.lineEnd+1 : o.lineEnd
				// Recherche la valeur du "previous token"...
				for(
					var e = eBefore;
					e && ! this.previous.set( e.oValue.token );
					e = this.getTokenBefore( e )
					);
				}
			else{ // Start from beginning
				this.eParent = oScanLimit.after ? oScanLimit.after.parentNode : eRoot
				this.eEndToken = oScanLimit.after || eRoot.firstChild
				this.nPos = 0
				this.nLine = 1
				}

			var nLineStart = this.nLine
			
			// Création de la pile des parents
			this.stack = Stack(this)
			for(var e=this.eParent; e; e=e.parentNode ){
				this.stack.unshift( e )
				if( e==eRoot ) break;
				}

			// Analyse lexicale partielle
			while( this.readToken( true ));

			this.updateValues()

			this.eEndToken = this.bIncremental = null
			/* this.nShift = this.nLineShift = null */
			
			return {
				lineStart: nLineStart,
				lineEnd: this.nLineEnd || nRootOldLineEnd,
				lineShift: this.nLineShift || eRoot.oValue.lineEnd - nRootOldLineEnd 
				}
			},
		updateValues :function(){
			if( ! this.nShift || ! this.eEndToken ) return ;

			if( this.nLineShift ){
				// màj un elt + ceux suivants et les enfants des éléments parents
				var update =CallBack( this, function( eFirst ){
					for(var e=eFirst, o ; e ; e=e.nextSibling ){
						if( o=e.oValue ){
							o.index += this.nShift
							o.lineEnd += this.nLineShift
							o.lineStart += this.nLineShift
							if( e.setTitle ) e.setTitle()
							if( e.oValue.bParent ) update( e.firstChild )
							}
						}
					})
			
				update( this.eEndToken )
				for(var e=this.eEndToken.parentNode; e; e=e.parentNode ){
					e.oValue.lineEnd += this.nLineShift
					if( e.setTitle ) e.setTitle()
					if( e == this.eRoot ) break;
					update( e.nextSibling )
					}
				}
			else{
				// màj un elt + ceux suivants et les enfants des éléments parents
				var update =CallBack( this, function( eFirst ){
					for(var e=eFirst, o ; e ; e=e.nextSibling ){
						if( o=e.oValue ){
							o.index += this.nShift
							if( e.setTitle ) e.setTitle()
							if( e.oValue.bParent ) update( e.firstChild )
							}
						}
					})
			
				update( this.eEndToken )
				for(var e=this.eEndToken.parentNode; e; e=e.parentNode ){
					if( e == this.eRoot ) break;
					update( e.nextSibling )
					}
				}
			}
		})

	// Analyse par défaut
	var o = LexerRules
	o.addTokens([
		// Espaces blancs
		['SPACES',{A:g(" "),M:[,[2]],F:[,,1]}],
		['TAB',{A:g("\t"),M:[,[2]],F:[,,1]}],
		['L_NEW_LINE',{A:g("\n","\f","\r"),M:[,[3,3,2],[3]],F:[,,1,1]}],
		['WHITE_SPACES',{A:g("[\t \n\r\f]"),R:[[0,f("\t \n\r\f",1)]],M:[[],[2],[2]],F:[,,1],TokensTable:[,'WHITE_SPACES']}],
		// Tout sauf un espaces blancs
		['NOT_WHITE_SPACES',{A:{"[^\t \n\r\f]":0},R:[[0,f("\t \n\r\f")]],M:[[1],[1]],F:{1:1},TokensTable:[,'NOT_WHITE_SPACES']}],
		// Syntaxe par défaut
		['TXT',{A:g("\n","[^\t\n\f\r ]","\t","\f","\r"," "),R:[[1,f("\t\n\f\r ")]],M:[[],[5,3,4,5,2,6],[5],[,3]],F:[,,3,5,2,3,4],TokensTable:',,TAB,L_NEW_LINE,SPACES,TEXT'.split(',')}]
		])
	o.addCSSClass( 'space=SPACES&tab=TAB&linefeed=L_NEW_LINE&whitespaces=WHITE_SPACES&undefined=NOT_WHITE_SPACES' )
	o.setTokensTranslation('L_NEW_LINE=NEW_LINE')
		
	SINGLETON = new Lexer
	return Lexer
	})()