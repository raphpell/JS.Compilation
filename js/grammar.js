EPSILON = '&epsilon;'

var Grammar =function( sGrammar, sType ){
	var s = sGrammar
	, sSeparator = s.indexOf('->')>-1 ? '->' : String.fromCharCode( 8594 )
	, sEpsilonChar = String.fromCharCode( 949 )
	, aGrammar = []
	s = s.replace( /(?:\r\n|[\r\n\f])/g, "\n" )
	s = s.replace( /\bepsilon\b/gi, EPSILON )
	if( s.indexOf( sEpsilonChar )>-1 )
		s = s.replace( new RegExp ( sEpsilonChar, 'g' ), EPSILON )

	for(var i=0, a=s.split( "\n" ), ni=a.length; i<ni; i++ )
		if( a[i]){
			a[i]=a[i].split( sSeparator )
			aGrammar.push( [a[i][0].trim(),a[i][1].trim()])
			}
	return Grammar.getEngine( aGrammar, sType )
	}

Grammar.getEngine =function( aGrammar, sType ){
	var G = aGrammar
	, s = G[0]?G[0][0]:'' // Symbole de départ
	, PRODUCTION =function( sLHS, aRHS ){
		return {
			LHS: sLHS,
			RHS: aRHS,
			toString :function(){ return '('+ this.id + ') ' + sLHS + ' -> ' + aRHS.join(' ')},
			toHTML :function(){ return sLHS + ' &rarr; ' + aRHS.join(' ')}
			}
		}
	, PRODUCTIONS =(function(){ // Ensemble des productions
		var a = []
		a.push =function( Production ){
			Production.id = a.length
			return Array.prototype.push.call( a, Production )
			}
		return a
		})()
	, ITEM =function( index, Prod, lookahead ){
		var Cache = {}
		, fShow =function( b, s1, s2, lookahead ){
			var sCacheId = b+','+s1+','+s2+','+lookahead
			if( Cache[sCacheId]) return Cache[sCacheId]
			return Cache[sCacheId] = Prod
				? ( b ? '('+ Prod.id +') ' : '' ) +
					Prod.LHS +' '+ s1 +' '+
					Prod.RHS.slice( 0, index ).join(' ') +
					' '+ s2 +' '+
					Prod.RHS.slice( index ).join(' ') +
					( lookahead[0] ? ', ' + lookahead : '' )
				: ''
			}
		return {
			index: index,
			production: Prod,
			lookahead: lookahead ? ( lookahead.constructor==Array? lookahead : [ lookahead ]) : [],
			getSymbol :function( n ){
				var s = Prod ? Prod.RHS[ index+(n||0) ] : null
				return ( s==EPSILON && Prod.RHS.length==1 ) ? null : s
				},
			sameAs :function( Item ){ return this.toString( 1, 1 )==Item.toString( 1, 1 ) },
			toString :function( b, bNoLookahead ){ return fShow( b, '->', '¤', bNoLookahead?[]:this.lookahead )},
			toHTML :function( b ){ return fShow( b, '&rarr;', '<b>¤</b>', this.lookahead )}
			}
		}
	, STATE =function( a ){
		var o=a
		, stringValue = ''
		, toString =function(){
			var s = ''
			for( var i=0,ni=o.length; i<ni; i++ )
				s += o[i].toHTML() + "\n"
			return s
			}
		o.getItem =function( Item ){
			var m = null
			for(var i=0, ni=o.length; i<ni; i++ )
				if( m = Item.sameAs( o[i] ) ? o[i] : false )
					return m
			return false
			}
		o.addItems =function( Items ){
			var bChange = false
			for(var i=0, ni=Items.length; i<ni; i++ ){
				var Item = Items[i]
				var ItemIn = o.getItem( Item )
				if( ! ItemIn ){
					o.push( Item )
					bChange = true
					}
				else{
					var a = ItemIn.lookahead
					a = Array.unique( a.concat( Item.lookahead ))
					a.sort()
					if( a.length > 1 ){
						a.remove( end )
						}
					if( a.toString() != ItemIn.lookahead.toString() ){
						ItemIn.lookahead = a
						bChange = true
						}
					}
				}
			if( bChange ) stringValue = toString()
			return bChange
			}
		o.toString =function( bWithStateId ){
			var s = bWithStateId ?'STATE '+ o.stateID + "\n":''
			return s + stringValue
			}
		return o
		}
	, STATES =(function(){
		var a = []
		a.addState=function( J ){
			if( J.length==0 ) return false
			a.push( J )
			J.stateID = a.length
			return J
			}
		a.haveState=function( J ){
			var b = null
			var JtoString = J.toString()
			for(var i=0, ni=a.length; i<ni; i++ )
				if( a[i].toString() == JtoString )
					return a[i]
			return false
			}
		return a
		})()
	, EDGES =(function(){
		var o = {}
		, nCounter = 0
		o.addEdge =function( S1, X, S2 ){
			nCounter++
			var n=S1.stateID 
			o[n] = o[n] || {}
			o[n][X] = S2.stateID
			}
		o.getEdge =function( S, X ){
			return o[S.stateID] ? o[S.stateID][X] : null
			}
		o.haveEdge =function( S, X ){
			return o[S.stateID] && o[S.stateID][X]
			}
		o.toString =function( S, sX ){
			var s = ''
			for(var i=0, ni=STATES.length; i<ni; i++ ){
				var S = STATES[i]
				for(var j=0, nj=T_and_N.length; j<nj; j++ ){
					var X = T_and_N[j]
					if( o.haveEdge( S, X ))
						s += S.stateID + '  <sub>' + X +' </sub>&rarr;  ' + o.getEdge( S, X ) + "\n"
					}
				}
			return s
			}
		o.every =function( f ){
			for(var i=0, ni=STATES.length; i<ni; i++ ){
				var S = STATES[i]
				for(var j=0, nj=T_and_N.length; j<nj; j++ ){
					var X = T_and_N[j]
					if( o.haveEdge( S, X ))
						f.call( this, S.stateID, X, o.getEdge( S, X ), i )
					}
				}
			}
		return o
		})()
	, N = [] // Ensemble des Symboles Non Terminaux
	, T = [] // Ensemble des Symboles Terminaux
	, end = 'END_TOKENS'
	, T_and_N = [] // Symboles Non Terminaux + Symboles Terminaux
	, FIRST = {}
	, FOLLOW = {}
	, NULLABLE = {}
	, R = {}
	
	;(function initialize (){
		// Créé les productions
		if( sType.indexOf('LR')!=-1 ) PRODUCTIONS.push( PRODUCTION( s+"'", [ s, end ]))
		for(var i=0, ni=G.length; i<ni; i++ ){
			var X = G[i][0]
			N.push( X )
			var aRHS = G[i][1].split(/\s\|\s/)
			for(var j=0, nj=aRHS.length; j<nj; j++ ){
				var aSymbols=aRHS[j].trim().split(/\s+/)
				T_and_N = T_and_N.concat( aSymbols )
				PRODUCTIONS.push( PRODUCTION( X, aSymbols ))
				}
			}
		// ....
		N = Array.unique( N )
		T_and_N = Array.unique( T_and_N )
		T_and_N.remove( EPSILON )
		T_and_N.sort()
		// Create T and initialize SLR calcul
		for(var j=0, nj=T_and_N.length; j<nj; j++ ){
			var sSymbol = T_and_N[j]
			NULLABLE[ sSymbol ] = false
			FOLLOW[ sSymbol ] = []
			if( N.have( sSymbol ))
				FIRST[ sSymbol ] = []
			else{
				FIRST[ sSymbol ] = [ sSymbol ]
				T.push( sSymbol )
				}
			}
		T_and_N = T.concat( N )
		FOLLOW[ s ] = [ end ]
		FIRST[ EPSILON ] = [ EPSILON ]
		NULLABLE[ EPSILON ] = true
		})()

	;(function FirstFollow_calcul (){ // SLR : table NULLABLE/FIRST/FOLLOW ...
		var areNullable =function( aY, n1, n2 ){
			var b = true
			for(var i=n1; i<=n2; i++ ){
				b = b && NULLABLE[ aY[i]]
				if( ! b ) return false
				}
			return b
			}

		// do until FIRST, FOLLOW, and NULLABLE did not change in this iteration.
		for(var bChange=true ; bChange ; ){
			bChange = false
			for(var h=0, nh=PRODUCTIONS.length; h<nh; h++ ){
				var X=PRODUCTIONS[h].LHS, aY=PRODUCTIONS[h].RHS, k=aY.length-1
				if( ! NULLABLE[X] && areNullable( aY, 0, aY.length-1 )){
					NULLABLE[X] = true
					bChange = true
					}
				for(var i=0; i<=k; i++ ){
					var Yi = aY[i]
					if( i==0 || areNullable( aY, 0, i-1 )){
						var FirstX = FIRST[X]||[]
						var aFirst = Array.unique( FirstX.concat( FIRST[Yi]))
						aFirst.sort()
						if( FirstX.toString() != aFirst.toString()){
							FIRST[X] = aFirst
							bChange = true
							}
						}			
					if( ! N.have( Yi )) continue ;
					if( i==k || areNullable( aY, i+1, k )){
						var aFollow = Array.unique( FOLLOW[Yi].concat( FOLLOW[X] ))
						aFollow.remove( EPSILON )
						aFollow.sort()
						if( FOLLOW[Yi].toString() != aFollow.toString()){
							FOLLOW[Yi] = aFollow
							bChange = true
							}
						}
					for(var j=i+1; j<=k; j++ ){
						var Yj = aY[j]
						if( j==i+1 || areNullable( aY, i+1, j-1 )){
							var aFollowYi = Array.unique( FOLLOW[Yi].concat( FIRST[Yj]))
							aFollowYi.remove( EPSILON )
							aFollowYi.sort()
							if( FOLLOW[Yi].toString() != aFollowYi.toString()){
								FOLLOW[Yi] = aFollowYi
								bChange = true
								}
							}
						}
					}
				}
			}
		})()

	switch( sType ){
		case 'LR0':
		case 'SLR':
			var getNonTerminalItems =(function(){
				var Cache = {}
				return function( X ){
					if( Cache[X]) return Cache[X]
					var a = []
					for(var i=0, ni=PRODUCTIONS.length; i<ni; i++ )
						if( PRODUCTIONS[i].LHS==X )
							a.push( ITEM( 0, PRODUCTIONS[i] ))
					return Cache[X]=a
					}
				})()
			var Closure =function( State ){
				do{
					bChange = false
					for( var i=0, ni=State.length; i<ni; i++ ){
						var X = State[i].getSymbol() // Un objet State contient des objets Item
						if( N.have( X ))
							if( State.addItems( getNonTerminalItems( X )))
								bChange = true
						}
					} while( bChange )
				return State
				}
			var Goto =function( State, X ){
				var oNewState = STATE([])
				for(var i=0, ni=State.length; i<ni; i++ ){
					var Item = State[i]
					if( X==Item.getSymbol())
						oNewState.addItems( [ITEM( Item.index+1, Item.production )])
					}
				return Closure( oNewState )
				}
			;(function DFA_calcul (){
				var bChange=false
			//	var oChrono = new Chrono
				STATES.addState( Closure( STATE( [ ITEM( 0, PRODUCTIONS[0]) ] )))
				do{
					bChange = false
					for(var i=0, ni=STATES.length; i<ni; i++ ){
						var State_1 = STATES[i]
						for(var j=0, nj=State_1.length; j<nj; j++ ){
							var X = State_1[j].getSymbol() // Un objet State contient des objets Item
							if( ! X || X==end ) continue;
							if( ! EDGES.haveEdge( State_1, X )){
								var State_2 = Goto( State_1, X )
								var State_2_real = STATES.haveState( State_2 )
								if( ! State_2_real )
									State_2_real = STATES.addState( State_2 )
								EDGES.addEdge( State_1, X, State_2_real )
								bChange = true
								}
							}
						}
					}while( bChange )
			//	alert( oChrono.stop()+'ms')
				})()
			
		case 'LR1':
			if( sType=='LR1' ){
				var getNonTerminalItems =(function(){
					var _Cache = {}
					var _Prod = {}
					for(var i=0, ni=PRODUCTIONS.length; i<ni; i++ ){
						var X = PRODUCTIONS[i].LHS 
						_Prod[ X ] = _Prod[ X ]||[]
						_Prod[ X ].push( PRODUCTIONS[i])
						_Cache[ X ] = {}
						}
					return function( X, w ){
						if( _Cache[X][w]) return _Cache[X][w]
						var a = []
						for(var i=0, ni=_Prod[ X ].length; i<ni; i++ )
							a.push( ITEM( 0, _Prod[ X ][i], w ))
						return _Cache[X][w]=a
						}
					})()
				var Closure =function( State ){
					do{
						bChange = false
						for( var i=0, ni=State.length; i<ni; i++ ){
							var Item = State[i]
							var X = Item.getSymbol()
							if( N.have( X )){
								var a = FIRST[ Item.getSymbol(+1) ] || []
								if( ! a.length || a.have( EPSILON )) a.push( Item.lookahead )
								a = Array.unique( a )
								for( var j=0, nj=a.length; j<nj; j++ )
									bChange = bChange || State.addItems( getNonTerminalItems( X, a[j]))
								}
							}
						} while( bChange )
					return State
					}
				var Goto =function( State, X ){
					var J = STATE([])
					for(var i=0, ni=State.length; i<ni; i++ ){
						var Item = State[i]
						if( X == Item.getSymbol())
							J.addItems( [ITEM( Item.index+1, Item.production, Item.lookahead )])
						}
					return Closure( J )
					}
				;(function DFA_calcul (){ 
					var bChange = false
					STATES.addState( Closure( STATE( [ ITEM( 0, PRODUCTIONS[0], end ) ] )))
					do{
						bChange = false
						for(var i=0, ni=STATES.length ; i<ni ; i++ ){
							var StateI = STATES[i]
							for(var j=0, nj=StateI.length ; j<nj ; j++ ){
								var X = StateI[j].getSymbol() // Item
								if( ! X || X==end ) continue ;
								var StateJ = Goto( StateI, X )
								var __StateJ = STATES.haveState( StateJ )
								if( ! __StateJ ){
									__StateJ = STATES.addState( StateJ )
									bChange = true
									}
								if( ! EDGES.haveEdge( StateI, X )){
									EDGES.addEdge( StateI, X, __StateJ )
									bChange = true
									}
								}
							}
						}while( bChange )
					})()
				}

			(function Reductions_calcul (){
				var Reduction =function( sId, mLookahead ){
					var a = [ sId, mLookahead ]
					a.toString = function(){
						return this[0] + ( this[1].length ? '['+ this[1] +']' : '' )
						}
					a.isReduction = true
					a.mLookahead = mLookahead
					return a
					}
				for(var i=0, ni=STATES.length; i<ni; i++ ){
					var State = STATES[i], nID = State.stateID
					for(var j=0, nj=State.length; j<nj; j++ ){
						var Item = State[j]
						if( ! Item.getSymbol()){
							R[nID] = R[nID] || []
							R[nID].push( Reduction( 'r'+Item.production.id, Item.lookahead ))
							}
						}
					}
				})()
			var M =(function(){
				var o={}
				for(var i=0, ni=STATES.length; i<ni; i++ )
					o[ STATES[i].stateID ] = {}
				o.set =function( nStateID, X, action ){
					if( ! M[ nStateID ][ X ])
						M[ nStateID ][ X ] = [ action ]
					else if( ! M[ nStateID ][ X ].have( action ))
						M[ nStateID ][ X ].push( action )
					}
				o.get =function( nStateID, X, lookahead ){
					var a = M[ nStateID ][ X ]
					if( ! a ) return null
					if( a.length==1 ) return a[0].constructor==String ? a[0] : a[0][0]
					if( lookahead ){
						for(var i=0, ni=a.length; i<ni; i++ ){
							if( a[i].constructor==Array && a[i][1].have( lookahead )){
								return a[i][0]
								}
							}
						}
					return a[0].constructor==String ? a[0] : a[0][0]
					}
				return o
				})()
			;(function LR_calcul (){
				var a = T.concat( [end] )
				EDGES.every( function( nI, X, nJ ){
					if( T.have( X )) M.set( nI, X, 's'+nJ )
					else if( N.have( X )) M.set( nI, X, 'g'+nJ )
					else M.set( nI, X, '?'+nJ )
					return 1
					})
				var bFOLLOW = ['SLR','LR1'].have( sType )
				for(var i=0, ni=STATES.length; i<ni; i++ ){
					var State = STATES[i]
					, nID = State.stateID
					for(var j=0, nj=State.length; j<nj; j++ ){
						var Item = State[j]
						, Y = Item.getSymbol()
						if( Y == end ) M[ nID ][ end ] = ['a']
						if( Y == undefined ){
							var aX = bFOLLOW ? FOLLOW[ Item.production.LHS ] : a
							for(var k=0, nk=aX.length; k<nk; k++ ){
								var X = aX[k]
								for(var l=0, nl=R[nID].length; l<nl; l++ ){
									var reduction = R[nID][l]
									if( nl==1 || reduction[1].length==0 || reduction[1].have( X ))
										M.set( nID, X, reduction[0])
									}
								}
							}
						}
					}
				})()
			break;
		case 'LL1':
			var M =(function(){
				var o={}
				o.set =function( sT, X, RHS ){
					if( M[ sT ][ X ] && M[ sT ][ X ].have( RHS )) return M[ sT ][ X ]
					if( M[ sT ][ X ]){
						M[ sT ][ X ].push( RHS )
						var sError = "Grammar isn't LL(1) : there is a multi-rule entry in table."
							+'\nM[ '+ sT +' ][ '+ X +' ]'
							+'\n\t' + sT +' -> '+ M[ sT ][ X ].toString()
					//	alert( sError )
						}
					else{
						var a = [ RHS ]
						a.toString =function(){
							var aRHS = []
							a.every(function( RHS, i ){ return aRHS[i] = RHS.join(' ') })
							return aRHS.join(' | ')
							}
						return M[ sT ][ X ] = a
						}
					}
				o.get =function( sT, X ){
					var a = M[sT][X]
					return a?a[0]:null
					}
				o.conflict =function( sT, X ){
					return M[sT][X] ? M[sT][X].length > 1 : false
					}
				return o
				})()
			;(function LL_calcul (){
				N.every( function( s ){ return M[s] = {} })
				var setEntry =function( X, RHS, s ){
					if( M[X][s] && M[X][s] != RHS ){
						throw new Error ( sError )
						}
					return M[X][s] = RHS
					}
				PRODUCTIONS.every( function( Production ){
					var X=Production.LHS, RHS=Production.RHS, Y0=RHS[0]
					FIRST[Y0].every( function( A ){
						if( A == EPSILON ){
							FOLLOW[ X ].every( function( B ){ return M.set( X, B, RHS ) })
							}
						return M.set( X, A, RHS )
						})
					return 1
					})
				})()
		}
	
	return { // ENGINE
		epsilon: EPSILON,
		end: end,
		G: aGrammar,
		PRODUCTIONS: PRODUCTIONS,
		s: sType=='LL1' ? s : 's1',
		T: T,
		N: N,
		M: M,
		T_and_N: T_and_N,
		FIRST: FIRST,
		FOLLOW: FOLLOW,
		NULLABLE: NULLABLE,
		STATES: STATES,
		E: EDGES,
		R: R
		}
	}
Grammar.parseLR =function( aPhrase, ENGINE ){
	Bufferize.init( '<table cellspacing="0" cellpadding="0" class="parser">' )
	Bufferize( '<tr><th colspan="4">'+ aPhrase.join(' ')+'</th></tr>' )
	aPhrase.push( ENGINE.end )
	
	var newNode =function( X ){
		var o = document.createElement('DIV')
		o.className = 'myNode'
		o.innerHTML = '<DIV class="symbol">' + X + '</DIV>'
		o.symbol = X
		o.toString =function(){ return 'Node('+this.firstChild.innerHTML+')' }
		return o
		}
	, aNodes = []
	, aPhraseNodes = []
	, i=0
	, ParseError =function( sMessage ){
		var oFragment = document.createDocumentFragment()
		for(var j=1, nj=aNodes.length; j<nj; j++ )
			oFragment.appendChild( aNodes[j])
		for(var j=i-1, nj=aPhrase.length-1; j<nj; j++ ){
			var e = aPhraseNodes[j]
			if( e ){
				e.className += ' error'
				oFragment.appendChild( e )
				}
			}
		return {
			table: Bufferize( '<span class="bg_red">Erreur: '+ sMessage +'</span></td></tr></table>' ),
			tree: oFragment
			}
		}
	, aStack = [ ENGINE.s ]
	, aSymbols = [ ENGINE.end ]
	, nStateID
	, Token
	, TNodes
	, action
	, oParent
	, ACTIONS={
		's':function(){
			aStack.push( action )
			i++
			aSymbols.push( Token )
			aNodes.push( TNodes )
			Bufferize( "</td></tr>" )
			return false
			},
		'r':function(){
			var Production = ENGINE.PRODUCTIONS[ action.substring(1) ]
			, LHS = Production.LHS, RHS = Production.RHS
			, nPop = RHS.length==1 && RHS[0]==EPSILON ? 0 : RHS.length
			if( nPop ) aStack = aStack.slice( 0, -nPop )
			if( aStack.length ){
				var sPrim = aStack[aStack.length-1].substring(1)
				var goto_ = ENGINE.M.get( sPrim, LHS, aPhrase[i+1])
				if( goto_ ){
					aStack.push( goto_.replace('g','s'))
					aSymbols.splice( aSymbols.length-nPop, nPop, LHS )
					var aChildNodes = aNodes.splice( aNodes.length-nPop, nPop )
					// Parse Tree
					oParent = newNode( LHS )
					for(var j=0, nj=aChildNodes.length; j<nj; j++ )
						oParent.appendChild( aChildNodes[j])
					aNodes.push( oParent )
					Bufferize( '<span class="bg_skyblue">' + Production.toHTML(1) + "</span></td></tr>" )
					} else{
						Bufferize( "Pas de goto ? Pas d'action défini ! réviser la grammaire.</td></tr>" )
						}
				} else Bufferize( "Plus de pile ? Stack est vide !</td></tr>" )
			return false
			},
		'a':function(){
			return {
				table: Bufferize( 'ok</td></tr></table>' ),
				tree: aNodes.pop()
				}
			}
		}
	, f, result
	for(var j=0, nj=aPhrase.length; j<nj; j++ ) aPhraseNodes[j] = newNode( aPhrase[j]) 

	Bufferize( '<tr><th>Stack </th><th>Symbols </th><th>Input </th><th>Action </th></tr>' )
	do{
		nStateID = aStack[aStack.length-1].substring(1)
		Token = aPhrase[i]
		TNodes = aPhraseNodes[i]
		action = ENGINE.M.get( nStateID, Token, aPhrase[i])
		Bufferize( '<tr><td>'+ aStack.join(' ') + '</td><td>'+ aSymbols.join(' ') + '</td><td class="right">'+ aPhrase.slice(i).join(' ') + '</td><td>' + (action||'') + '  ' )
		if( ! action ) return ParseError( 'action ENGINE.M["'+ nStateID +'"]["'+ Token +'"] indéfinie.' )
		else if( f = ACTIONS[ action[0]]){ if( result = f()) return result }
		else return ParseError( 'action '+ action +' inconnue !' )
		}while( i<aPhrase.length && aStack.length )
	return ParseError( 'Phrase incomplète...' )
	}
Grammar.parseLL =function( aPhrase, ENGINE ){
	Bufferize.init( '<table cellspacing="0" cellpadding="0" class="parser">' )
	Bufferize( '<tr><th colspan="4">'+ aPhrase.join(' ')+'</th></tr>' )
	aPhrase.push( ENGINE.end )
	
	var newNode =function( X ){
		var o = document.createElement('DIV')
		o.innerHTML = '<DIV class="symbol">' + X + '</DIV>'
		o.className = 'myNode'
		return o
		}
	, oStart = newNode( ENGINE.s )
	, aStack = [ ENGINE.end, ENGINE.s ]
	, aNodesStack = [ {symbol:ENGINE.end}, oStart ]
	, i=0
	, X
	, Token
	, oParent
	, nInfinitLoop = 0
	
	Bufferize( '<tr><th class="right">Stack</th><th class="right">Input</th><th class="left">Action </th></tr>' )
	do{
		Bufferize( '<tr><td class="right">'+ aStack.join(',').split(',').reverse().join(' ') + '</td><td class="right">'+ aPhrase.slice(i).join(' ') + '</td><td>' )
		X=aStack.pop()
		oParent=aNodesStack.pop()
		Token=aPhrase[i]
		if( X==Token ){
			if( X==ENGINE.end ){
				Bufferize( "ok </td></tr>" )
				break;
				}
			else{
				i++
				Bufferize( '<span class="bg_green">Dépilage: les symboles terminaux sont identiques.</td></tr>' )
				}
			}
		else{
			if( ENGINE.T.have( X )){
				Bufferize( '<span class="bg_red">Erreur: Les symboles terminaux '+X+' et '+Token+' sont différents !</span></td></tr>' )
				break;
				}
			else if( ENGINE.N.have( X )){
				var RHS = ENGINE.M.get( X, Token )
				var bConflict = ENGINE.M.conflict( X, Token )
				if( ! RHS ){
					Bufferize( "La règle M["+X+"]["+Token+"] n'existe pas.<br>" )
					Bufferize( "La règle M["+X+"]["+EPSILON+"] est prise en alternative.<br>" )
					Token = EPSILON
					RHS = ENGINE.M.get( X, Token )
					bConflict = ENGINE.M.conflict( X, Token )
					}
				if( bConflict ) Bufferize( '<span class="bg_orange">Conflit ( '+ENGINE.M[ X][ Token ]+' ) rencontré.</span><br>' )
				if( RHS ){
					if( RHS[0]==X ){
						nInfinitLoop++
						if( nInfinitLoop==4 ){
							Bufferize( '<span class="bg_red">Erreur: On tente une boucle infinie ?</span></td></tr>' )
							break;
							}
						} else nInfinitLoop = 0
					Bufferize( '<span class="bg_skyblue">'+ X +' &rarr; '+ RHS.join(' ') +'</span>' )
					if( bConflict ) Bufferize( ' a été choisi !' )
					Bufferize( "</td></tr>" )
					var a = RHS.concat([]) // 'cause reverse
					var aNodes = []
					for(var j=0, nj=a.length; j<nj; j++ )
						oParent.appendChild( aNodes[j] = newNode( a[j] ))
					if( a[0]==ENGINE.epsilon ) continue ;
					aStack = aStack.concat( a.reverse() )
					aNodesStack = aNodesStack.concat( aNodes.reverse() )
					}
				else{
					Bufferize( "La règle M["+X+"]["+Token+"] n'existe pas.<br>" )
					Bufferize( "L'analyse est stoppée.</td></tr>" )
					break;
					}
				}
			else{
				Bufferize( "Un conflit ?</td></tr>" )
				break;
				}
			}
		}while( i<aPhrase.length && aStack.length )
	
	for(var ni=aPhrase.length-1; i<ni; i++ ){
		var oError =  newNode( aPhrase[i])
		oError.className += ' error'
		oStart.appendChild( oError )
		}
	return {
		table: Bufferize('</table>'),
		tree: oStart
		}
	}
