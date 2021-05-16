// RegExp2AST require AutomatonLexer + Modules

EPSILON = '&epsilon;'
EMPTY = '&empty;'

throwError =function( s ){ alert( s ); throw new Error ( s ) }

Automate =(function(){
	// 'PRIVÉES'
	var ID = 1
	var epsilonTransition =function( I, F ){ return [ I, EPSILON, F ]} // transition libre !
	var getUniqueID =function(){ return ID++ } // Fonction retournant un identifiant unique ( état nouveau ! )

	// INSTANCES AUTOMATES
	var Automate =function( I, F, A, S, T, aTokensID ){
		Object.assign( this, {
			I: I,	// Etat initial
			F: F,	// Etats finaux
			A: A,	// Alphabet
			S: S,	// Etats
			T: T,	// Transitions
			aTokensID: aTokensID || []
			})
		}
	Automate.prototype ={
		buildTable :function(){
			var oFA = this
			var M = oFA.M = {}
			
			// Construction de la matrice
			for(var i=0, ni=oFA.T.length; i<ni; i++){
				var a = oFA.T[i]
				, stateI = a[0]
				, symb = a[1]
				, stateF = a[2]
				, o = M[stateI] = M[stateI] || {}
				o[symb] = o[symb] || []
				o[symb].push( a[3] ? [ a[3], stateF ] : stateF )
				o[symb] = Array.unique( o[symb])
				o[symb].stateF = stateF
				}

			if( oFA.type=='DFA' ){
				var aCharClasses=[]
				M.nextState =function( sState, sChar ){
					if( ! sState ) return 0
					var o = this[sState]
					if( o[ sChar ]) return o[ sChar ][0]
					sState = 0
					for(var i=0, ni=aCharClasses.length; i<ni; i++){
						var sCharClass = aCharClasses[i]
						// o[ sCharClass ] défini que pour les états > 0
						if( ! o[ sCharClass ]) continue;
						var a = o[ sCharClass ][0]
						sState = a[0]( sChar, a[1]) // ( sState == -1 )-> sChar not in charclass !
						if( sState >= 0 ) break;
						}
					return sState > 0 ? sState : 0
					}
				
				// Enumération des charclass
				for(var j=0, nj=oFA.A.length; j<nj; j++){
					var symb = oFA.A[j]
					if( symb.length>2 && symb.charAt(0)=='[' ) aCharClasses.push( symb )
					}
					
				// Construction des listes utilisées dans la minimization d'un AFD
				for(var i=0, ni=oFA.S.length; i<ni; i++){
					var stateI = oFA.S[i]
					, o = M[stateI] = M[stateI] || {}
					, aList = []
					for(var j=0, nj=oFA.A.length; j<nj; j++){
						var symb = oFA.A[j]
						aList.push( o[symb] ? o[symb].stateF : 0 )
						}
					o.list = aList  // list used in DFA Minimization
					}
				}
			return oFA
			},
		clone :function(){
			var NEW_ID = {}
			var F=[], S=[], T=[]
			for(var i=0, a=this.S, ni=a.length; i<ni; i++)
				NEW_ID[ a[i]] = S[i] = getUniqueID()
			for(var i=0, a=this.F, ni=a.length; i<ni; i++)
				F[i] = NEW_ID[ a[i]]
			for(var i=0, a=this.T, ni=a.length; i<ni; i++){
				var t = a[i]
				T[i] = t[3]
					? [ NEW_ID[ t[0]], t[1], NEW_ID[ t[2]], t[3] ]
					: [ NEW_ID[ t[0]], t[1], NEW_ID[ t[2]] ]
				}
			return new Automate(
				NEW_ID[ this.I ],
				F,
				this.A.concat([]),
				S,
				T,
				this.aTokensID.concat([])
				)
			},
		epsilonClosures :function(){
			var E={}
			for(var i=0, a=this.S, ni=a.length; i<ni; i++) E[a[i]]=[a[i]]
			var bChanged = true
			while( bChanged ){
				bChanged = false
				for(var i=0, a=this.T, ni=a.length; i<ni; i++){
					var t = a[i]
					if( t[1]==EPSILON ){
						var n = E[ t[0]].length
						E[ t[0]]= Array.unique( E[ t[0]].concat( E[ t[2]]))
						if( n != E[ t[0]].length ) bChanged = true
						}
					}
				}
			return E
			},
		renameStates :function( nStateIDCounter, bAll, aOrder ){
			var oFA = this
			var NEW_ID = {} // NEW STATES ID
			, S = []
			, T = []
			, F = []
			, nCounter = nStateIDCounter || 2
			, calculWeight =function( a ){
				var n=0
				for(var i=0, ni=a.length; i<ni; i++) if( a[i]) n++
				return n
				}
			var TMP = []
			if( ! aOrder ){
				for(var i=0, ni=oFA.S.length; i<ni; i++){
					var o = oFA.M ? oFA.M[ oFA.S[i]] : null	// Plante pour des gros automates !
					TMP.push([ oFA.S[i], o && o.list ? calculWeight( o.list ) : 0 ])
					}
				} else TMP = aOrder
			TMP.sortBy('1','DESC')
			
			// Construction des nouveaux identifiants
			for(var i=0, ni=TMP.length; i<ni; i++){
				var state = TMP[i][0], nNewID
				if( bAll ) nNewID = nCounter++
				else {
					if( state=='0' || state==0 ) nNewID = 0
					else if( state==oFA.I ) nNewID = 1
					else nNewID = nCounter++
					}
				S.push( NEW_ID[state] = nNewID )
				}
			S = Array.unique( S )
			S.sortBy('','ASC')
			
			// Renomme les états
			var Cache = {}
			for(var i=0, ni=oFA.T.length; i<ni; i++){
				var a = oFA.T[i]
				var aNewTransition = a[3]
					? [ NEW_ID[ a[0]], a[1], NEW_ID[ a[2]], a[3] ]
					: [ NEW_ID[ a[0]], a[1], NEW_ID[ a[2]] ]
				var sCacheID = aNewTransition.toString()
				if( ! Cache[ sCacheID ]){
					Cache[ sCacheID ]=1
					T.push( aNewTransition )
					}
				}
			for(var i=0, ni=oFA.F.length; i<ni; i++){
				F[i]= NEW_ID[ oFA.F[i]]
				}
			// màj les états des identifiants de token
			var a = oFA.aTokensID
			if( a && a.length ){
				for(var i=0, ni=a.length; i<ni; i++){
					var aStates = a[i][1]
					for(var j=0, nj=aStates.length; j<nj; j++)
						aStates[j]= NEW_ID[ aStates[j]]
					a[i][1] = Array.unique( aStates )
					a[i][1].sortBy('','ASC')
					}
				}
				
			oFA.type = oFA.type || 'NFA'
			oFA.I = NEW_ID[ oFA.I ]
			oFA.F = F.sortBy('','ASC')
			oFA.S = S
			oFA.T = T
			oFA.buildTable()
			return oFA
			},
		setTokenName :function( sToken, aFinalStates ){
			this.aTokensID = this.aTokensID || []
			this.aTokensID.push([ sToken, aFinalStates || this.F ])
			return this
			},
		validateAlphabet :function(){
			var oNFA = this
			, aAtoms=[], aGroups=[], aNegativeGroups=[]
			, bAnyIn = false
			, oUniqueNegativeCharset
				
			var Item =function( symbol ){
				if( Item[symbol]) return Item[symbol]
				var toString=function(){ return 'Item('+ this.symbol +','+ this.type +')' }
				if( symbol.length==1
					|| symbol.length==2 && symbol.charAt(0)=='\\'
					|| /^(?:\\c[a-zA-Z]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4})$/g.test( symbol )
					)
					return Item[symbol]={ type:'ATOM', symbol:symbol, toString:toString }
				if( symbol==EPSILON )
					return Item[symbol]={ type:'EPSILON', symbol:symbol, toString:toString }
				if( symbol=='ANY' )
					return Item[symbol]={ type:'ANY_CHARACTER', symbol:symbol, toString:toString }
				if( symbol.charAt(0)=='[' && symbol.charAt(symbol.length-1)==']' ){
					var sValue = symbol.replace( /^\[\^?((?:a|[^a])+)\]$/gim, '$1' )
					var bNegated = symbol.substr(0,2)=='[^' && symbol.length>3
					return Item[symbol]={
						type: 'CHAR_CLASS',
						symbol: (bNegated?'[^':'[')+ sValue+']',
						valueIn: sValue,
						negated: bNegated,
						action: Automate.action( sValue, bNegated ),
						toString:toString
						}
					}
				throwError( 'Item('+ symbol +') ???' )
				}
			var ItemWrapper =function( sIn ){
				if( sIn.length==0 ) return null
				var bAtom = /^(?:\\c[a-zA-Z]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|.|\^)$/g.test( sIn )
				if( sIn.charAt(0)=='^' ) sIn = sIn.slice(1) + sIn.charAt(0) // Evite la création d'une classe négative par accident
				if( bAtom && Transitions.getSymbol('['+ sIn +']')) return Item( '['+ sIn +']' )
				return bAtom
					? Item( sIn )
					: Item( '['+ sIn +']' )
				}
			var Transitions =(function(){
				var oBySymbols = {}
				for(var i=0, ni=oNFA.T.length; i<ni; i++ ){
					var a = oNFA.T[i]
					var sSymbol = a[1]
					if( ! oBySymbols[ sSymbol ]) oBySymbols[ sSymbol ] = []
					oBySymbols[ sSymbol ].push( a )
					}
				var T ={
					deleteSymbol :function( sSymbol ){
						delete oBySymbols[ sSymbol ]
						oNFA.A.remove( sSymbol )
						},
					change :function( sSymbol, aReplacmt ){
						aReplacmt = Array.unique( aReplacmt )
						if( aReplacmt.length==1 && sSymbol==aReplacmt[0].symbol ) return ;
						var addTransition =function( oItem, aBase ){
							var a = oBySymbols[ oItem.symbol ]
							, I = aBase[0]
							, F = aBase[2]
							if( ! a.push ) throwError( 'Erreur pas de transition trouvée pour le symbole '+ oItem.symbol +'\n'+ JSON.stringify( a ))
							a.push( oItem.action ? [ I, oItem.symbol, F, oItem.action ] : [ I, oItem.symbol, F ])
							}
						// Ajoute les nouveaux symboles dans l'alphabet
						for(var i=0, ni=aReplacmt.length; i<ni; i++ ){
							if( ! aReplacmt[i]) continue;
							var sNewSymbol = aReplacmt[i].symbol
							if( ! oBySymbols[ sNewSymbol ]){
								oBySymbols[ sNewSymbol ] = []
								oNFA.A.push( sNewSymbol )
								}
							}
						// Ajoute les nouvelles transitions
						if( oBySymbols[sSymbol]){
							for(var i=0, ni=oBySymbols[sSymbol].length; i<ni; i++ ){
								var aTransition = oBySymbols[sSymbol][i]
								for(var j=0, nj=aReplacmt.length; j<nj; j++ ){
									var oItem = aReplacmt[j]
									if( oItem && oItem.symbol!=sSymbol )
										addTransition( oItem, aTransition.concat([]))
									}
								}
							}
						T.deleteSymbol( sSymbol )
						},
					getSymbol: function( sSymbol ){ return oBySymbols[sSymbol] },
					getSymbols: function(){ return oBySymbols },
					get: function(){
						var T = []
						oNFA.A.sort()
						for(var i=0, ni=oNFA.A.length; i<ni; i++ )
							T = T.concat( oBySymbols[ oNFA.A[i]] || [])
						return T
						}
					}
				return T
				})()
			var addNewSymbols =function( aNewSymbols ){
				for(var j=0, nj=aNewSymbols.length; j<nj; j++)
					if( aNewSymbols[j])
						switch( aNewSymbols[j].type ){
							case 'ATOM':
								aAtoms.push( aNewSymbols[j]);
								break;
							case 'CHAR_CLASS': 
								aGroups.push( aNewSymbols[j]);
								break;
							}
				}

			// Enumerate atoms, groups and negative group
			for(var i=0, ni=oNFA.A.length; i<ni; i++){
				var mIn = oNFA.A[i]
				var oItem = Item( mIn )
				if( ! oItem ) continue;
				if( mIn==EPSILON ) continue;
				else if( mIn.length==1 || mIn.charAt(0)=='\\' ) aAtoms.push( oItem )
				else if( mIn.indexOf('[^')==0 ) aNegativeGroups.push( oItem )
				else if( mIn.indexOf('[')==0 ) aGroups.push( oItem )
				else if( mIn=='ANY' ) bAnyIn = true
				else throwError( 'NFA Validation error: '+ mIn )
			//	console.info( '['+ oItem.type +','+ oItem.symbol +'] VS '+ mIn )
				}
			var aNewSymbols

			// Reduction Negative Groups in one
			if( aNegativeGroups.length ){
				if( aNegativeGroups.length==1 ){
					oUniqueNegativeCharset = aNegativeGroups[0]
					addNewSymbols([ ItemWrapper( aNegativeGroups[0].valueIn ) ])
					}
				else{
					var aNot_G_1 = aNegativeGroups[0].valueIn.toArray()
					for(var i=1, ni=aNegativeGroups.length; i<ni; i++){
						var aNot_G_2 = aNegativeGroups[i].valueIn.toArray()
						var sNot_G_1 = aNot_G_1.join('')
						var sNot_G_2 = aNot_G_2.join('')
						sG_inter = '[^'+ Array.unique( aNot_G_1.concat( aNot_G_2 )).join('') +']'
						oUniqueNegativeCharset = Item( sG_inter )

						if( ! Array.intersect( aNot_G_1, aNot_G_2 ).length ){
							var oNot_G_1 = ItemWrapper( sNot_G_1 )
							  , oNot_G_2 = ItemWrapper( sNot_G_2 )
							Transitions.change( '[^'+ sNot_G_1 +']', [ oUniqueNegativeCharset, oNot_G_2 ] )
							Transitions.change( '[^'+ sNot_G_2 +']', [ oUniqueNegativeCharset, oNot_G_1 ] )
							aNewSymbols = [ oNot_G_1, oNot_G_2 ]
							}
						else{
							var oDiff_NotG2_NotG1 = ItemWrapper( Array.diff( aNot_G_2, aNot_G_1 ).join(''))
							  , oDiff_NotG1_NotG2 = ItemWrapper( Array.diff( aNot_G_1, aNot_G_2 ).join(''))
							Transitions.change( '[^'+ sNot_G_1 +']', [ oUniqueNegativeCharset, oDiff_NotG2_NotG1 ] )
							Transitions.change( '[^'+ sNot_G_2 +']', [ oUniqueNegativeCharset, oDiff_NotG1_NotG2 ] )
							aNewSymbols = [ oDiff_NotG2_NotG1, oDiff_NotG1_NotG2 ]
							}
						addNewSymbols( aNewSymbols )
						aNot_G_1 = oUniqueNegativeCharset.valueIn.toArray()
						}
					}
				aNegativeGroups = [ oUniqueNegativeCharset ]
				}

			// Reduction Negative Groups  VS Atoms & Groups : L'intersection doit-être nulle
			if( oUniqueNegativeCharset ){
				var aNegativeCharsetIn = oUniqueNegativeCharset.valueIn.toArray()
				// Groups VS The Negative Group
				for(var i=0; i<aGroups.length; i++){
					var oCharacterClass = aGroups[i]
					, aCharList = oCharacterClass.valueIn.toArray()
					, aIntersection = Array.intersect( aNegativeCharsetIn, aCharList )
					, sCharListDiff = Array.diff( aCharList, aIntersection ).join('')

					if( sCharListDiff.length ){
						aNegativeCharsetIn = Array.unique( aNegativeCharsetIn.concat( aCharList ))
						var oCharSetDiff = ItemWrapper( sCharListDiff )
						, sIntersection = aIntersection.join('')
						, oIntersectionItem = sIntersection ? ItemWrapper( sIntersection ) : null
						Transitions.change( oCharacterClass.symbol, [ oCharSetDiff, oIntersectionItem ] )
						Transitions.change( oUniqueNegativeCharset.symbol, [
									oCharSetDiff,
									oUniqueNegativeCharset = Item( '[^'+ aNegativeCharsetIn.join('') +']' )
									] )
						addNewSymbols([ oIntersectionItem, oCharSetDiff ])
						aGroups.splice( i, 1 )
						i--
						}
					}
				// Atoms VS The Negative Group
				for(var i=0; i<aAtoms.length; i++){
					var oAtom = aAtoms[i]
					var sChar = oAtom.symbol
					var aIntersection = Array.intersect( aNegativeCharsetIn, [sChar])

					if( ! aIntersection.length ){
						aNegativeCharsetIn.push( sChar )
						Transitions.change( oUniqueNegativeCharset.symbol, [
							oAtom,
							oUniqueNegativeCharset = Item( '[^'+ aNegativeCharsetIn.join('') +']' )
							] )
						continue ;
						}
					}
				}

			// Groups VS Groups : L'intersection doit-être nulle
			for(var i=0; i<aGroups.length; i++){
				if( ! aGroups[i]) continue ;
				var aCharList1 = aGroups[i].valueIn.toArray()
				aCharList1.sort()
				for(var j=0; j<aGroups.length; j++){
					if( ! aGroups[j] || i==j ) continue ;
					var aCharList2 = aGroups[j].valueIn.toArray()
					aCharList2.sort()
					var aIntersection = Array.intersect( aCharList1, aCharList2 )

					if( ! aIntersection.length ) continue ;
					aIntersection.sort()
					var oItem1 = ItemWrapper( Array.diff( aCharList1, aIntersection ).join(''))
					var oItem2 = ItemWrapper( Array.diff( aCharList2, aIntersection ).join(''))
					var oIntersectionItem = ItemWrapper( aIntersection.join(''))
					if( oItem1 ) Transitions.change( aGroups[i].symbol, [ oIntersectionItem, oItem1 ] )
					if( oItem2 ) Transitions.change( aGroups[j].symbol, [ oIntersectionItem, oItem2 ] )
					aGroups[j]=null
					aGroups[i]=null
					addNewSymbols([ oIntersectionItem, oItem1, oItem2 ])
					break;
					}
				}
			aGroups = Array.unique( aGroups )

			// Groups VS Atoms
			for(var j=0,nj=aAtoms.length; j<nj; j++){
				var oAtom =aAtoms[j]
				var sChar = oAtom.symbol
				for(var i=0, ni=aGroups.length; i<ni; i++){
					var oCharacterClass = aGroups[i]
					, sCharList = oCharacterClass.valueIn

					if( sCharList.indexOf( sChar ) > -1 ){
						var oChar = Item( sChar )
						, oItem = ItemWrapper( sCharList.replace( sChar, '' ))
						Transitions.change( oCharacterClass.symbol, [ oChar, oItem ] )
						addNewSymbols([ oChar, oItem ])
						aGroups.splice( i, 1 )
						i--
						ni--
						}
					}
				}

			// Cas symbole ANY - deprecated
			if( bAnyIn ){
				var a = aAtoms.concat( aGroups )
				if( oNFA.A.length==1 ){
					var oUniqueNegativeCharset = Item( '[^a]' )
					var oItem = Item( 'a' )
					aAtoms.push( oItem )
					a = [ oItem, oUniqueNegativeCharset ]
					}
				else if( oUniqueNegativeCharset ) a.push( oUniqueNegativeCharset )
				else{
					var aItemIn = []
					for(var i=0, ni=a.length; i<ni; i++){
						var oItem=a[i]
						if( oItem.type=="ATOM" ) aItemIn.push( oItem.symbol )
						else if( oItem.type=="CHAR_CLASS" ) aItemIn = aItemIn.concat( oItem.valueIn.toArray())
						}
					oUniqueNegativeCharset = Item( '[^'+ Array.unique( aItemIn ).join('') +']' )
					a.push( oUniqueNegativeCharset )
					}
				Transitions.change( 'ANY', a, 'Cas symbole ANY' )
				}

			// Création de l'alphabet !
			var A = Transitions.getSymbol( EPSILON ) ? [ EPSILON ] : []
			for(var i=0, ni=aAtoms.length; i<ni; i++ )
				if( Transitions.getSymbol( aAtoms[i].symbol ))
					A.push( aAtoms[i].symbol )
			for(var i=0, ni=aGroups.length; i<ni; i++ )
				if( Transitions.getSymbol( aGroups[i].symbol ))
					A.push( aGroups[i].symbol )
			if( oUniqueNegativeCharset ) A.push( oUniqueNegativeCharset.symbol )

			oNFA.A = Array.unique( A )
			oNFA.T = Transitions.get()
			return oNFA
			}
		}	

	// OBJET AUTOMATE
	Automate.union({
		// MÉTHODES 'INTERNES'
		action :function( sChars, bNegated ){
			var f
			if( bNegated ){
				f =function( symbol, state ){
					if( symbol.length>1 ) return -1
					return sChars.indexOf( symbol )<0?state:-1
					}
				f.toString =function(){ return '[^'+sChars+']' }
				}
			else{
				f =function( symbol, state ){
					if( symbol.length>1 ) return -1
					return sChars.indexOf( symbol )>-1?state:-1
					}
				f.toString =function(){ return '['+sChars+']' }
				}
			return f
			},
		getUniqueID : getUniqueID,
		setUniqueID :function( nUniqueID ){
			if( nUniqueID ) ID = nUniqueID
			},

		// AUTOMATES BASIQUES
		makeEmpty :function( I, F ){
			var I=I||getUniqueID(), F=F||getUniqueID()
			return new Automate( I, [F], [EPSILON], [I,F], [ epsilonTransition( I, F )] )
			},
		makeChar :function( sChar, I, F ){
			var I=I||getUniqueID(), F=F||getUniqueID()
			return new Automate( I, [F], [sChar], [I,F], [[I,sChar,F]])
			},
		makeAnyChar :function( sChar, I, F ){
			var sChar=sChar||'a', I=I||getUniqueID(), F=F||getUniqueID()
			var f1 = Automate.action( sChar, 0 )
			var f2 = Automate.action( sChar, 1 )
			var A = [ f1.toString(), f2.toString() ]
			var T = [[ I, f1.toString(), F, f1 ],[ I, f2.toString(), F, f2 ]]
			return new Automate( I, [F], A, [I,F], T )
			},
		makeCharSet :function( aSet, bNegated, I, F ){
			var I=I||getUniqueID(), F=F||getUniqueID()
			var f = Automate.action( aSet.join(''), bNegated )
			var T = [[ I, f.toString(), F, f ]]
			return new Automate( I, [F], [f.toString()], [I,F], T )
			},
		makeCharRange :function( sChar1, sChar2, I, F ){
			var getCharCode =function( sChar ){
				if( sChar.length==1 ) return sChar.charCodeAt(0)
				switch( sChar.charAt(1)){
					case 'x':
					case 'u':
						return parseInt( sChar.slice( 2 ), 16 )
					default: // number
						return sChar.charCodeAt(1)
					}
				throwError( 'getCharCode '+ sChar )
				}
			var nCode1 = getCharCode( sChar1 )
			var nCode2 = getCharCode( sChar2 )
			if( nCode1 > nCode2 ){
				var tmp=nCode1
				nCode1=nCode2
				nCode2=tmp
				}
			var a=[]
			for(var i=nCode1, ni=nCode2+1; i<ni; i++ ) a.push( i )
			return Automate.makeCharSet( String.fromCharCode.apply( null, a ).toArray(), false, I, F )
			},
		makeString: function( sString ){
			var I=getUniqueID()
			var A=sString.split('')
			var S=[I]
			var T=[]
			var nStateID = I
			for(var i=0, ni=A.length; i<ni; i++ ){
				T.push([ nStateID, A[i], nStateID=getUniqueID() ])
				S.push( nStateID )
				}
		//	throwError( 'NOT IMPLEMENTED' )
			A = Array.unique( A )
			A.sort()
			return new Automate( I, [nStateID], A, S, T )
			},

		// OPÉRATIONS BASIQUES
		and :function(){
			var o = arguments[0]
			, I = o.I
			, F = o.F
			, A = [EPSILON].concat( o.A )
			, S = o.S
			, T = o.T
			for(var i=1; o = arguments[i]; i++){
				A = A.concat( o.A )
				S = S.concat( o.S )
				T = T.concat( o.T )
				for(var j=0, nj=F.length; j<nj; j++)
					T.push( epsilonTransition( F[j], o.I ))
				F = o.F
				}
			A = Array.unique(A)
			A.sort()
			return new Automate( I, F, A, S, T )
			},
		optional :function( oFA ){
			var T = oFA.T
			for(var j=0, nj=oFA.F.length; j<nj; j++)
				T.push( epsilonTransition( oFA.I, oFA.F[j]))
			return new Automate(
				oFA.I,
				oFA.F,
				Array.unique( [EPSILON].concat( oFA.A )),
				oFA.S.concat([]),
				T
				)
			},
		or :function(){
			var I = getUniqueID()
			var F = getUniqueID()
			var A = [EPSILON]
			var S = []
			var T = []
			var aTokensID = [] // aTokensID used in DFA aggregation
			for(var i=0, o; o = arguments[i]; i++ ){
				A = A.concat( o.A )
				var aIntersection = Array.intersect( S, o.S )
				if( aIntersection.length )
					throwError( 'Error: "Automate.or" intersection between automaton states.\n'+ aIntersection )
				S = S.concat( o.S )
				T.push( epsilonTransition( I, o.I ))
				for(var j=0, nj=o.F.length; j<nj; j++)
					T.push( epsilonTransition( o.F[j], F ))
				T = T.concat( o.T )
				if( o.aTokensID ) aTokensID = aTokensID.concat( o.aTokensID )
				}
			S = S.concat([I,F])
			A = Array.unique(A)
			A.sort()
			return new Automate( I, [F], A, S, T, aTokensID )
			},
		repeat :function( oFA, n, m ){
			n = n!==undefined ? n : 0
			m = m!==undefined ? m : 'n'
			switch( n+','+m ){
				case '0,1': return Automate.optional( oFA )
				case '0,n': return Automate.repeat0n( oFA )
				case '1,n': return Automate.and( oFA, Automate.repeat0n( oFA.clone()))
				default:
					if( m == 'n' ){
						var oResultFA = Automate.repeat( oFA, n, n )
						var F = oResultFA.F.concat([])
						oResultFA = Automate.and( oResultFA, Automate.repeat0n( oFA.clone()))
						return new Automate(
							oResultFA.I,
							Array.unique( F.concat( oResultFA.F )),
							oResultFA.A,
							oResultFA.S,
							oResultFA.T
							)
						}
					if( n >= m ) switch( n ){
						case 0: return Automate.makeEmpty()
						case 1: return oFA
						default:
							var oResultFA = oFA.clone()
							for(var i=1; i<n; i++)
								oResultFA = Automate.and( oResultFA, oFA.clone())
							return oResultFA
						}
					if( n < m ){
						var oResultFA = Automate.repeat( oFA, n, n )
						var F = oResultFA.F.concat([])
						for(var i=n; i<m; i++){
							oResultFA = Automate.and( oResultFA, oFA.clone() )
							F = F.concat( oResultFA.F )
							}
						return new Automate(
							oResultFA.I,
							Array.unique( F ),
							oResultFA.A,
							oResultFA.S,
							oResultFA.T
							)
						}
				}
			},
		repeat0n :function( oFA ){ // fermeture de Kleene
			var I=getUniqueID(), F=getUniqueID()
			var T = oFA.T
			T.push( epsilonTransition( I, oFA.I ))
			T.push( epsilonTransition( I, F ))
			for(var j=0, a=oFA.F, nj=a.length; j<nj; j++){
				T.push( epsilonTransition( a[j], F ))
				T.push( epsilonTransition( a[j], oFA.I ))
				}
			return new Automate(
				I,
				[F],
				Array.unique( oFA.A.concat([EPSILON])),
				Array.unique( oFA.S.concat([I,F])),
				T
				)
			},

		// GÉNÉRATEUR D'AUTOMATE	
		fromChar :function( sChar ){
			return function(){ return Automate.makeChar( sChar ) }
			},
		fromCharClass :function( aSet, bNegated ){
			return function(){ return Automate.makeCharSet( aSet, bNegated ) }
			}
		})

	return Automate
	})()

RegExp2AST =function( sRegExp ){
	return ParserLR.parse(
		AutomatonLexer( sRegExp, 'RegExp' ),
		RegExpParser.REGEXP
		)
	}

NFA =function( e ){ // Transformation de l'AST d'une expression régulière en automate
	var S = e.nodeName
	, f=function(e){ return e.oValue.value }
	switch( S ){
		case 'RANGE': return Automate.makeCharRange( f( e.firstChild ), f( e.lastChild ))
		case 'QUANTIFIER':
			var o = e.oValue, n = parseInt( o.n ), oFA = NFA( e.firstChild )
			switch( o.m ){
				case '': return Automate.repeat( oFA, n, n )
				case '\u221E': return Automate.repeat( oFA, n )
				default: return Automate.repeat( oFA, n, parseInt( o.m ))
				}
		case 'DOT': return Automate.makeAnyChar()
		default:
			if( NFA[S]){
				var a=to_array( e.childNodes )
				for(var i=0, eChild; eChild=a[i]; i++ ) a[i] = NFA( a[i])
				return NFA[S].apply( null, a )
				}
		}
	if( ! e.oValue ) return false
	if( ! f( e )) throwError( 'Error: symbol='+ S )
	return NFA.wrapper( f( e ))
	}
NFA.union((function(){
	var _getCharSet =function( aDFA ){
		var aCS = [], aNCS = []
		for(var i=0; aDFA[i]; i++ ){
			var symbol = aDFA[i].A[0]
			if( symbol.charAt(0)=='[' && symbol.charAt(symbol.length-1)==']' ){
				if( symbol.charAt(1)!='^' )
					aCS = aCS.concat( symbol.replace( /^\[((?:a|[^a])+)\]$/g, '$1' ).toArray())
				else
					aNCS = aNCS.concat( symbol.replace( /^\[\^((?:a|[^a])+)\]$/g, '$1' ).toArray())
				continue; 
				}
			aCS.push( symbol )
			}
		aCS = Array.unique( aCS )
		aCS.sort() // SUPER IMPORTANT !
		aNCS = Array.unique( aNCS )
		aNCS.sort() // SUPER IMPORTANT !
	//	if( Array.intersect( aCS, aNCS ).length ){}
		return { charset:aCS, negatedcharset:aNCS }
		}
	var NUMBERS = '0123456789'.split('')
	, ASCII_LC = 'abcdefghijklmnopqrstuvwxyz'.split('')
	, ASCII_UC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
	, WHITE_SPACES = '\t\n\v\f\r \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000'.split('')

	return {
		wrapper :function( s ){
			if( s.length==1 ) return Automate.makeChar(s)
			else if( s.charAt(0)=='\\' ){ // symbole prefixé par '\'
				if( NFA[s]) return NFA[s]()
				s = s.length==2 ? s.substring(1) : s
				return Automate.makeChar(s)
				}
			throwError( 'Automate '+ s +'?' )
			},
		// CARACTÈRES SPÉCIAUX
		'\\n': Automate.fromChar('\n'),
		'\\t': Automate.fromChar('\t'),
		'\\f': Automate.fromChar('\f'),
		'\\r': Automate.fromChar('\r'),
		'\\v': Automate.fromChar('\v'),
		// ENSEMBLE DE CARACTÈRES
		'\\d': Automate.fromCharClass( NUMBERS, 0 ),
		'\\D': Automate.fromCharClass( NUMBERS, 1 ),
		'\\s': Automate.fromCharClass( WHITE_SPACES, 0 ),
		'\\S': Automate.fromCharClass( WHITE_SPACES, 1 ),
		'\\w': Automate.fromCharClass( [].concat( NUMBERS, ASCII_LC, ASCII_UC, ['_']), 0 ),
		'\\W': Automate.fromCharClass( [].concat( NUMBERS, ASCII_LC, ASCII_UC, ['_']), 1 ),
		// AST NODE
		CHARCLASS :function(){ // Aucun caractère + ceux en argument
			var o = _getCharSet( arguments )
			, I=Automate.getUniqueID(), F=Automate.getUniqueID(), A, S=[I,F], T
			, f1 = Automate.action( o.charset.join(''), 0 )
			if(	o.negatedcharset.length ){
				var f2 = Automate.action( o.negatedcharset.join(''), 1 )
				A = [f1.toString(),f2.toString()]
				T = [[ I, f1.toString(), F, f1 ],[ I, f2.toString(), F, f2 ]]
				}
			else{
				A = [f1.toString()]
				T = [[ I, f1.toString(), F, f1 ]]
				}
		//	return new Automate( I, [F], A, S, T )
			var oFA = new Automate( I, [F], A, S, T )
			return ( new DFA( oFA.validateAlphabet() )).minimize( I, true )
			},
		NEGATED_CHARCLASS :function(){ // Tous les caractères - ceux en argument
			var o = _getCharSet( arguments )
			, I=Automate.getUniqueID(), F=Automate.getUniqueID(), A, S=[I,F], T
			if(	o.negatedcharset.length ){
				var aCS = Array.diff( o.negatedcharset, o.charset )
				// Aucun caractère valide... TODO: lancer une erreur ?
				if( ! aCS.length ) return Automate.makeEmpty(I,F)
				var f1 = Automate.action( aCS.join(''), 0 )
				A = [f1.toString()]
				T = [[ I, f1.toString(), F, f1 ]]
				return new Automate( I, [F], A, S, T )
				}
			else{
				var f2 = Automate.action( o.charset.join(''), 1 )
				A = [f2.toString()]
				T = [[ I, f2.toString(), F, f2 ]]
				}
			return new Automate( I, [F], A, S, T )
		//	var oFA = new Automate( I, [F], A, S, T )
		//	return ( new DFA( oFA.validateAlphabet() )).minimize()
			},
		CONCAT :function(){ return Automate.and.apply( null, arguments )},
		PIPE :function(){ return Automate.or.apply( null, arguments )},
		}
	})())

DFA =(function(){
	var NFA
	, EpsilonClosure
	, I,F,A,S,T
	, aTokensName
	, oTokensState
	, oNewStates
	, stateID =function( NFAStates ){ return NFAStates.id || NFAStates.join(':') || '0' }
	, getTransitions=(function(){
		var Cache ={}
		getCache =function( sState, sSymbol ){
			return Cache[ sState ] && Cache[ sState ][ sSymbol ] ? Cache[ sState ][ sSymbol ] : null
			}
		setCache =function( sState, sSymbol, a ){
			Cache[ sState ] = Cache[ sState ] || {}
			return Cache[ sState ][ sSymbol ] = a
			}
		var f =function( sState, sSymbol ){
			var aCache = getCache( sState, sSymbol )
			if( aCache ) return aCache
			var a = []
			for(var k=0, t; t=NFA.T[k]; k++)
				if( t[0]==sState && t[1]==sSymbol )
					a.push( t )
			return setCache( sState, sSymbol, a )
			}
		f.init =function(){ Cache={}}
		return f
		})()
	, buildDfaStates =function( NFAStates ){
		// Ajout d'un nouvel état final
		if( NFAStates.haveIntersectionWith( NFA.F )){
			F = F.concat( NFAStates.id )
			// met à jour les tokens
			var a = NFA.aTokensID
			if( a && a.length ){
				var nOwner = 0, aTokensEnd = []
				for(var i=0, ni=a.length; i<ni; i++ ){
					if( NFAStates.haveIntersectionWith( a[i][1])){
						var s = a[i][0]
						aTokensEnd.push( s )
						if( ! oTokensState[ s ]){
							aTokensName.push( s )
							oTokensState[ s ] = []
							}
						oTokensState[ s ].push( NFAStates.id )
						nOwner++
						break; // Premier arrivé, premier servi !
						}
					}
				/* if( nOwner > 1 ) Un état reconnait plusieurs tokens !' */
				}
			}
		// ....
		for(var i=0, ni=A.length; i<ni; i++){
			var symbol = A[i]
			, G = []
			for(var j=0, nj=NFAStates.length; j<nj; j++){
				var aT = getTransitions( NFAStates[j], symbol )
				for(var k=0, t, nk=aT.length; k<nk ; k++){
					t=aT[k]
					if( t && t[0]==NFAStates[j] && t[1]==symbol ){
						G = G.concat( EpsilonClosure[ t[2]])
						}
					}
				}
			G = Array.unique( G )
			G.id = stateID( G )
			if( G.id=='0' ) continue;
			if( symbol.charAt(0)=='[' && symbol.charAt(symbol.length-1)==']' ){
				T.push([ NFAStates.id, symbol, G.id, Automate.action( symbol.replace( /^\[\^?((?:a|[^a])+)\]$/gim, '$1' ), symbol.substr(0,2)=='[^' )])
				}else T.push([ NFAStates.id, symbol, G.id ])
			if( ! oNewStates[ G.id ]){
				oNewStates[ G.id ] = 1
				S.push( G.id )
				buildDfaStates( G )
				}
			}
		}

	return function( oNFA, sTokenName ){
		getTransitions.init()
		NFA = oNFA
		if( sTokenName ) NFA.aTokensID = null
		EpsilonClosure = NFA.epsilonClosures()
		I = EpsilonClosure[ NFA.I ]
		I.id = stateID(I) 
		F = []
		A = NFA.A.concat([])
		A.remove( EPSILON )
		S = [ I.id ]
		T = []
		aTokensName = []
		oTokensState = {}
		oNewStates = {}
		buildDfaStates( I )
		
		if( sTokenName ){
			Automate.call( this, I.id, F, A, S, T )
			this.setTokenName( sTokenName )
			}
		else{
			var aTokensID =[]
			for(var i=0, ni=aTokensName.length; i<ni; i++ ){
				var s = aTokensName[i]
				aTokensID.push([ s, oTokensState[ s ]])
				}
			Automate.call( this, I.id, F, A, S, T, aTokensID )
			}
		this.type = 'DFA'
		this.buildTable()
		}
	})()
DFA.inheritFrom( Automate ).union({
	minimize :function( nStateIDCounter, bAll ){
		// MINIMISATION DU NOMBRE D'ETATS
		this.minimizeS()
		// MINIMISATION DE L'ALPHABET : regroupement de symbole en char_class
		this.minimizeA()
		return this.renameStates( nStateIDCounter, bAll )
		},
	minimizeA :function(){
		var oDFA = this
		var aID = []
		for(var j=0, nj=oDFA.A.length; j<nj ; j++ ){
			var symb=oDFA.A[j]
			var sID
			if( symb.length == 1 ){ // ATTENTION au symbole espace !
				var a = []
				for(var i=0, ni=oDFA.S.length; i<ni; i++){
					var state = oDFA.S[i]
					if( ! oDFA.M[state]) continue;
					var aStatesF = oDFA.M[state][symb] || '0'
					a.push(
						aStatesF.length==1
							? ( aStatesF[0].constructor==Array
								? aStatesF[0][1]
								: aStatesF[0]
								)
							: oDFA.M[state][symb].join(',')
						)
					}
				sID = '_'+a.join('|')
				} else sID = symb
			if( aID[ sID ]){
				aID[ sID ].push( symb )
				}
			else{
				aID.push( sID )
				aID[ sID ] = [ symb ]
				}
			}
		var A = oDFA.A.concat([])
		for(var i=0, ni=aID.length; i<ni; i++ ){
			var aSymbols = aID[ aID[i]]
			var nj = aSymbols.length
			if( nj > 1 ){
				var aCharClass = []
				for(var j=0; j<nj; j++ ){
					var symb = aSymbols[j]
					if( symb.length==1 ){
						aCharClass.push( symb )
						A.remove( symb )
						}
					}
				if( aCharClass.length > 1 ){
					var sCharClass = aCharClass.join('')
					var fAction = Automate.action( sCharClass, false )
					var symb = aCharClass[0]
					A.push( '['+ sCharClass +']' )
					for(var k=0; k<oDFA.T.length; k++ ){
						var trans = oDFA.T[k]
						if( trans[1] == symb ){
							trans[1] = '['+ sCharClass +']'
							trans[3] = fAction
							}
						else if( sCharClass.indexOf( trans[1])>-1 ){
							oDFA.T.splice( k, 1 )
							k--
							}
						}
					}
				}
			}
		oDFA.A = Array.unique( A )
		oDFA.buildTable()
		return this
		},
	minimizeS :function(){
		var oDFA = this
		var COUNTER = 2
		var STATES_COUNT = -1

		var mergeStates =function( NEW_ID ){
			var getID =function( sState ){ return NEW_ID[sState] || sState }
		
			// Renomme l'état initial
			oDFA.I = getID( oDFA.I )
			// Renomme les états finaux
			for(var i=0, a=oDFA.F, ni=a.length; i<ni; i++) a[i] = getID(a[i])
			oDFA.F = Array.unique( oDFA.F )
			var a = oDFA.aTokensID
			if( a && a.length ){
				for(var i=0, ni=a.length; i<ni; i++){
					var aStates = a[i][1]
					for(var j=0, nj=aStates.length; j<nj; j++){
						aStates[j]= getID(aStates[j])
						}
					a[i][1] = aStates
					}
				oTokens = Tokens().init( oDFA.aTokensID )
				}
			
			// Renomme les états dans les transitions
			var T = []
			for(var i=0, a=oDFA.T, ni=a.length; i<ni; i++){
				var t = oDFA.T[i]
				t =  t[3] ? [ getID(t[0]), t[1], getID(t[2]), t[3] ] : [ getID(t[0]), t[1], getID(t[2]) ]
				if( ! oDFA.T[ t.toString()]) T.push( t )
				oDFA.T[ t.toString()]=1
				}
			oDFA.T = T
			// Renomme les états
			for(var i=0, a=oDFA.S, ni=a.length; i<ni; i++) a[i] = getID(a[i])
			oDFA.S = Array.unique( oDFA.S )
			oDFA.S.sort()
			}
		var Tokens =function(){
			var oSTATES
			return {
				init :function( a ){
					if( a && a.length ){
						oSTATES = {}
						for(var i=0, ni=a.length; i<ni; i++){
							var aStates = a[i][1], sToken = a[i][0]
							for(var j=0, nj=aStates.length; j<nj; j++)
								this.addToken( aStates[j], sToken)
							}
						return this
						}
					return null
					},
				getToken :function( sState ){ return oSTATES[ sState ] },
				addToken :function( sState, sToken ){ oSTATES[ sState ] = sToken }
				}
			}
		var oTokens = Tokens().init( oDFA.aTokensID )
		
		var aPartition = [ Array.diff( oDFA.S, oDFA.F ) ]
		if( oDFA.aTokensID.length )
			for(var i=0, aToken ; aToken = oDFA.aTokensID[i]; i++ )
				aPartition.push( aToken[1])
		else aPartition.push( oDFA.F )
		var nPartitionSize, oStates
		do{
			nPartitionSize = aPartition.length
			oStates = {}
			for(var i=0, aGroup; aGroup=aPartition[i]; i++ ){
				for(var j=0, nj=aGroup.length; j<nj; j++ )
					oStates[ aGroup[j]] = i+1
				}
			for(var i=0, aGroup; aGroup=aPartition[i]; i++ ){
				if( aGroup.length > 1 ){
					var oSubGroups = { size:0, keys:[] }
					for(var j=0, nj=aGroup.length; j<nj; j++ ){
						var a = oDFA.M[ aGroup[j]].list.concat([])
						for(var k=0, nk=a.length; k<nk; k++ ){
							a[k] = oStates[ a[k]] || 0
							}
						var sKey = a.join('#')
						if( oSubGroups[ sKey ]) oSubGroups[ sKey ].push( aGroup[j])
						else {
							oSubGroups[ sKey ] = [ aGroup[j]]
							oSubGroups.keys.push( sKey )
							oSubGroups.size++
							}
						}
					if( oSubGroups.size > 1 ){
						var aNewGroups = []
						for(var j=0, nj=oSubGroups.keys.length; j<nj; j++ ){
							var aSubGroup = oSubGroups[ oSubGroups.keys[j]]
							aNewGroups.push( aSubGroup )
							}
						aPartition.splice.apply( aPartition, [ i, 1 ].concat( aNewGroups ))
						i += aNewGroups.length - 1
						}
					}
				}
			}while( nPartitionSize != aPartition.length )
		
		mergeStates( oStates )
		oDFA.buildTable()

		return this
		},
	test :function( s, n ){
		// Si les états du DFA sont issu de partition d'états du NFA
		if( this.I.constructor == String ) this.renameStates()
		var nIndex = n || 0
		, nStart = nIndex
		, sChar
		, sState=this.I
		, sLongestMatch = this.F.have( sState ) ? '' : null
		if( s.length!=0 )
			while( true ){
				sChar = s[ nIndex ]
				nIndex++ 
				sState = this.M.nextState( sState, sChar )
				if( sState<=0 ) break;
				if( this.F.have( sState )) sLongestMatch = s.substring( nStart, nIndex )
				if( nIndex==s.length ) break;
				}
		return sLongestMatch
		},
	toJS :function( bWhiteSpace, bUnCompressed ){
		var oDFA = this
		// ???
		if( oDFA.S.length > 10 ){
			stats =(function(){
				var aStats =[[0,0],[1,1]]
				var oStatesIndex ={}
				var checkState =function( nState ){
					var nIndex = oStatesIndex[nState]
					if( nIndex!=undefined ) aStats[ nIndex ][1]++
					else{
						oStatesIndex[ nState ] = aStats.length
						aStats.push([ nState, 1 ])
						}
					}
				for(var i=0, t ; t=oDFA.T[i]; i++) if( t[2]>0 ) checkState( t[2])
				return aStats
				})()
			oDFA.renameStates( 2, false, stats )
			}
		oDFA.renameStates()

		var oCharClass = {size:0}
		var oNegatedCharClass = {size:0}
		var aCharacters = []

		// Compression d'un tableau [15,0,0,0,0] devient {0:15} ou [15] selon la taille du résultat
		var compress =function( a ){
			var nLength = a.length
			var sA = '['+ a.join(',') +']'
			if( bUnCompressed ) return sA
			var aTMP = []
			for(var j=0; j<nLength; j++)
				if( a[j])
					aTMP.push( j+':'+a[j])
					else a[j]=0
			var sO = '{'+ aTMP.join(',') +'}'
			var sResult = sA.length > sO.length ? sO : sA
			if( sResult.charAt(0)=='[' && a.length > 3 ){
				var oCount = {}
				var aNumbers = Array.unique( a )
				if( aNumbers.length ){
					for(var i=0, ni=aNumbers.length; i<ni; i++) oCount[ aNumbers[i]] = {total:0,index:[]}
					for(var i=0; i<nLength; i++){
						oCount[ a[i]].total++
						oCount[ a[i]].index.push(i)
						}
					var aTMP =[]
					for(var i=0, ni=aNumbers.length; i<ni; i++)
						aTMP.push([ aNumbers[i], oCount[ aNumbers[i]].total ])
					aTMP.sortBy( '1', 'DESC' )
					var nDefaultValue = aTMP[0][0]
					var sF = 'h('+nLength+','+nDefaultValue
					aNumbers.remove( nDefaultValue )
					aTMP = []
					for(var i=0, ni=aNumbers.length; i<ni; i++){
						var aIndexes = oCount[ aNumbers[i]].index
						for(var j=0, nj=aIndexes.length; j<nj; j++)
							aTMP.push( aIndexes[j]+','+aNumbers[i])
						}
					sF += ( aTMP.length ? ','+aTMP.join(',') : '' ) +')'
					return sA.length > sF.length ? sF : sA
					}
				}
			return sResult
			}

		// Table des symboles de l'alphabet
		var TableSymbols=(function(){
			var nIndex=0, oByIndex={}, oBySymbol={}
			return {
				generateFrom :function( oDFA ){
					// Réorganise l'ordre des symboles de l'alphabet en vue de compresser le code
					// Ceux ayant le plus de transitions sont classés en premier
					var A = []
					var oSymbolIndex = {}
					for(var i=0, a ; a=oDFA.T[i]; i++){
						if( a[2] > 0 ){
							var s = a[1]
							var b = oSymbolIndex[ s ] !== undefined 
							var nIndex = b ? oSymbolIndex[ s ] : oSymbolIndex[ s ] = A.length
							if( ! b ) A[ nIndex ] = { symbol:s, count:1 }
							else A[ nIndex ].count++ 
							}
						}
					A.sortBy( 'count', 'DESC' )
					for(var i=0, ni=A.length; i<ni; i++) TableSymbols.push( A[i] = A[i].symbol )
					return oDFA.A = A
					},
				indexOf :function( symbol ){ return oBySymbol[symbol] },
				symbolAt :function( index ){ return oByIndex[index] },
				push :function( symbol ){
					var n = this.indexOf( symbol )
					if( !isNaN( n )) return n
					oBySymbol[symbol] = nIndex
					oByIndex[nIndex] = symbol
					nIndex++
					if( symbol.length>1 && symbol.charAt( 0 )=='[' ){
						var bNegated = symbol.substr(0,2)=='[^'
						symbol = symbol.replace( /^\[\^?((?:a|[^a])+)\]$/, '$1' )
						if( ! bNegated && oCharClass[symbol]==undefined ){
							oCharClass[ symbol ] = oCharClass.size
							oCharClass[ oCharClass.size ] = symbol
							oCharClass.size++
							}
						if( bNegated && oNegatedCharClass[symbol]==undefined ){
							oNegatedCharClass[ symbol ] = oNegatedCharClass.size
							oNegatedCharClass[ oNegatedCharClass.size ] = symbol
							oNegatedCharClass.size++
							}
						} else aCharacters.push( symbol ) // .replace( \\, \\\\ ))
					return nIndex-1
					},
				toString :function(){
					var aO=[], aF=[]
					for(var i=0, sSymbol; i<nIndex; i++ ){
						sSymbol = JSON.stringify( oByIndex[i])
						aO.push( sSymbol+':'+i )
						aF[i] = sSymbol
						}
					var s = bWhiteSpace ? '\n\t' : ''
					var sO = '{'+ s + aO.join(','+ s ) + s +'}'
					if( bUnCompressed ) return sO
					var sF = 'g('+ aF.join(',') +')'
					return sO.length < sF.length ? sO : sF
					},
				}
			})()
		// Matrice des transitions
		var Matrice =(function(){
			var M
			return {
				generateFrom :function( T, TableSymbols ){
					M = []
					for(var i=0, ni=T.length, a; i<ni; i++ ){
						a = T[i]
						M[a[0]] = M[a[0]] || []
						var nSymbolIndex = TableSymbols.indexOf( a[1])
						if( M[a[0]][ nSymbolIndex ])
							throwError( 'DFA.prototype.toJS:\n Duplicate entry for \n state='+ a[0] +' \n Symbol index='+ nSymbolIndex +' ,value='+ a[1])
						M[a[0]][ nSymbolIndex ] = a[2]
						}
					},
				toString :function(){
					var a = []
					for(var i=0, ni=M.length; i<ni; i++){
						var line = M[i]||[]
						var aLine=[]
						for(var j=0, nj=line.length; j<nj; j++) aLine[j] = line[j] || ''
						if( bUnCompressed ) aLine.length = oDFA.A.length
						else while( aLine.length && ! aLine[ aLine.length-1 ]) aLine.pop()
						a.push( compress( aLine ))
						}
					a[0]=null // index inutilisé...
					var s = ( bWhiteSpace ? '\n\t' : '' )
					return '['+ s + a.join(','+s) + s + ']'
					}
				}
			})()
		// Table des noms de token
		var TokensTable =(function(){
			var TokensTable =[]
			return {
				getFinalStatesTable :function( aTokensID ){
					var aF=[]
					if( aTokensID && aTokensID.length ){
						var o = {}
						for(var i=0, ni=aTokensID.length; i<ni; i++){
							var nTokenID = i+1
							TokensTable[ nTokenID ] = aTokensID[i][0]
							var aStates = aTokensID[i][1]
							for(var j=0, nj=aStates.length; j<nj; j++)
								aF[ aStates[j]] = nTokenID
							}
						}
					else{
						for(var i=0, ni=oDFA.F.length; i<ni; i++)
							aF[ oDFA.F[i]]=1
						}
					return aF
					},
				isDefined :function(){
					return TokensTable.length
					},
				toString :function(){
					var s1 = "'"+ TokensTable.join(',') +"'.split(',')"
					var s2 = ("['"+ TokensTable.join("','") +"']").replace("''",'')
					return s1.length < s2.length ? s1 : s2
					}
				}
			})()

		TableSymbols.generateFrom( oDFA )
		Matrice.generateFrom( oDFA.T, TableSymbols )
		var aF = TokensTable.getFinalStatesTable( oDFA.aTokensID )

		// index R : traitement des charsets
		var aSpecial =(function(){
			var aSpecial = []
			aSpecial.keys = []
			for(var i=0, ni=oDFA.A.length; i<ni; i++ ){
				symb = oDFA.A[i]
				if( symb.length>1 ){
					var s = symb.replace( /^\[\^?((?:a|[^a])+)\]$/gim, '$1' )
					var sFunction = symb.substr(0,2)=='[^'
						? "f(s)"
						: "f(s,1)"
					aSpecial.push([ TableSymbols.indexOf( symb ), sFunction.replace( /s/, JSON.stringify( s )) ])
					}
				}
			aSpecial.toString =function(){
				var a = []
				for( var i=0, ni=this.length; i<ni; i++ )
					a.push( '['+ JSON.stringify( this[i][0])+','+ this[i][1] + ']' )
				var s = bWhiteSpace ? '\n\t' : ''
				return '['+ s + a.join( ','+ s ) + s +']'
				}
			return aSpecial
			})()

		var s = bWhiteSpace ? '\n' : ''
		var sResult = '{'+
			s+'A:'+ TableSymbols.toString() +','+
			s+'M:'+ Matrice.toString() +','+
			s+'F:'+ compress( aF )+
			( aSpecial.length ? ','+ s +'R:'+ aSpecial.toString() : '' )+
			( TokensTable.isDefined() ? ','+ s +'TokensTable:'+ TokensTable.toString() : '' )+
			s+'}'

		// Tentative de réduction de la taille du résultat
		if( /^\{A\:g/.test( sResult )){
			var aStringsRepeated = []
			, aSearch1 = [], aReplacement1 = []
			, aSearch2 = [], aReplacement2 = []
			, aSearch3 = [], aReplacement3 = []
			, aArguments = []
			if( oCharClass.size ){
				for(var i=0, ni=oCharClass.size; i<ni; i++ ){
					aStringsRepeated.push( oCharClass[i])
					aSearch1.push( JSON.stringify( oCharClass[i] ))
					aReplacement1.push( 'a'+i )
					aSearch2.push( new RegExp( '("' + RegExp.escape( '\[' ) + '.*?)('+ RegExp.escape( JSON.stringify( oCharClass[i]).slice(1,-1)) + ')(' + RegExp.escape( '\]' ) + '.*?")' ))
					aReplacement2.push( '$1"+a'+i+'+"$3' )
					aReplacement3.push( 'a'+i )
					aArguments.push( 'a'+i )
					}
				var sResult2 = sResult.str_replace( aSearch1, aReplacement1 )
				sResult2 = sResult2.str_replace( aSearch2, aReplacement2 )
				if( oNegatedCharClass.size==1 ){
					aSearch3.push( JSON.stringify( oNegatedCharClass[0]).slice(1,-1) )
					sResult2 = sResult2.str_replace( aSearch3, [ JSON.stringify( aCharacters.join('')).slice(1,-1) +'"+'+aReplacement3.join('+')+'+"' ] )
					}
				}
			else if( oNegatedCharClass.size==1 ){
				aStringsRepeated.push( oNegatedCharClass[0])
				aArguments.push('a0')
				sResult2 = sResult.str_replace(
					[
						JSON.stringify( oNegatedCharClass[0]),
						new RegExp( '("' + RegExp.escape( '\[\^' ) + ')('+ RegExp.escape( JSON.stringify( oNegatedCharClass[0]).slice(1,-1)) + ')(' + RegExp.escape( '\]' ) + '")' )
					],
					[
						'a0',
						'$1"+a0+"$3'
					])
				}
			sResult2 = '(function('+aArguments+'){return '+ (sResult2||sResult) +'})\n('+JSON.stringify( aStringsRepeated, null,'\t' ).slice(1,-1)+')'
			if( sResult2.length < sResult.length ) return sResult2
			}
		return sResult
		},
	toRE :function(){
		if( this.I !== 1 ) throwError( "DFA.prototype.toRE: L'état initial doit être égale à 1." )

		var group =function( s ){
			return s.length == 1 ? s : '('+ s +')'
			}
		var star =function( s ){
			if( s==EMPTY ) return EPSILON
			if( s==EPSILON ) return EPSILON
			var sStar = new String( '('+ s +')*' )
			sStar.isStar = true
			sStar.repeated = s
			return s ? sStar : ''
			}
		var union =function( s1, s2 ){
			if( s1==EMPTY ) return s2
			if( s2==EMPTY ) return s1
			if( s1==EPSILON ) return s2 +'?'
			if( s2==EPSILON ) return s1 +'?'
			if( s1==s2 ) return s1
			if( s1.isUnion ) s1 = s1.slice(1,-1)
			if( s2.isUnion ) s2 = s2.slice(1,-1)
			var s = new String( '('+ s1 +'|'+ s2 +')' )
			s.isUnion = true
			return s
			}
		var concat =function( s1, s2 ){
			if( s1==EMPTY || s2==EMPTY ) return EMPTY
			if( s1==EPSILON ) return s2
			if( s2==EPSILON ) return s1
			if( s1.isStar && s1.repeated==s2 ) return '('+ s2 +')+'
			if( s2.isStar && s2.repeated==s1 ) return '('+ s1 +')+'
			return s1 + s2
			}
		
		var A=(function(){
			var A =[]
			var get =function( i, j ){
				return A[i] && A[i][j] || EMPTY
				}
			get.set =function( i, j, sValue ){
				A[i] = A[i]||[]
				A[i][j] = A[i][j]
					? union( A[i][j], sValue )
					: sValue
				}
			get.toString =function(){ return A.join('\n' ) }
			return get
			})()
		
		var m = this.S.length
		
		var B =[]
		for(var i=0; i<m; i++ )
			B[i] = this.F.have( this.S[i]) ? EPSILON : EMPTY
			
		for(var i=0, ni=this.T.length; i<ni; i++ ){
			var t = this.T[i]
			A.set( t[0]-1, t[2]-1, t[1])
			}

		for(var n=m-1; n>-1; n-- ){
			B[n] = concat( star( A(n,n)), B[n] )
			for(var j=0; j<n; j++ )
				A.set( n, j, concat( star( A(n,n)), A(n,j) ))
			for(var i=0; i<n; i++ ){
				B[i] = union( B[i], concat( A(i,n), B[n]) )
				for(var j=0; j<n; j++ )
					A.set( i, j, union( A(i,j), concat( A(i,n), A(n,j) )))
				}
			}
		
		return JSON.stringify( B[0]).slice(1,-1)
		}
	})
DFA.aggregate =function( oDFA1, oDFA2 ){
	var oNFA = Automate.or( oDFA1, oDFA2 ).validateAlphabet()
	var oDFA = new DFA( oNFA )
	oDFA.minimize()
	// NB: Ne détecte pas la reconnaissance d'une chaine par 2 tokens: premier arrivé, premier servi.
	if( oNFA.aTokensID.length != oDFA.aTokensID.length )
		oDFA.sError = 'Perte de donnée dans l\'aggrégation.\n'+
			'NFA Tokens ID ('+ oNFA.aTokensID.length +'):\n\t'+oNFA.aTokensID.join('\n\t')+'\n'+
			'DFA Tokens ID ('+ oDFA.aTokensID.length +'):\n\t'+oDFA.aTokensID.join('\n\t')
	return oDFA
	}