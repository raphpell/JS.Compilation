EPSILON = '&epsilon;'
var ParserLR =function( aTokens, ENGINE ){
	aTokens.push( ParserLR.Node( ENGINE.END ))
	var aStack = [ ENGINE.START ]
	, aSymbols = []
	, TreeBuilder = ENGINE.AST || ParserLR.ParseTree
	, i=0, nState1, nState2, Token, o, action
	, M = ENGINE.MATRICE
	, ACTIONS={
		s :function(){
			aStack.push( action )
			aSymbols.push( Token )
			i++
			return false
			},
		r :function(){
			var prodID = action.substring(1)
			, p = ENGINE.PRODUCTIONS[ prodID ]
			, LHS = p[0], RHS = p[1]
			, nPop = RHS.length==1 && RHS[0]==EPSILON ? 0 : RHS.length
			if( nPop ) aStack = aStack.slice( 0, -nPop )
			if( aStack.length ){
				nState2 = aStack[ aStack.length-1 ].substring(1)
				var goto_ = M[ nState2 ] ? M[ nState2 ][ ENGINE.SYMBOLS[ LHS ]] : null
				if( goto_ ){
					aStack.push( goto_.replace( 'g', 's' ))
					aSymbols.push(
						TreeBuilder(
							'('+ prodID +') '+ LHS +' -> '+ RHS.join(' '),
							LHS,
							aSymbols.splice( aSymbols.length-nPop, nPop )
							)
						)
					}
				}
			return false
			},
		a :function(){
			return aSymbols.pop() /* || document.createElement(ERROR_PARSING) */
			}
		}
	do{
		nState1 = aStack[aStack.length-1].substring(1)
		Token = aTokens[i]
		var sTokenName = Token.nodeName.toUpperCase()
		while( ParserLR.sIgnoredToken.indexOf( '|'+sTokenName+'|' )> -1 ){
			i++
			Token = aTokens[i]
			var sTokenName = Token.nodeName.toUpperCase()
			}
		action = M[ nState1 ] ? M[ nState1 ][ ENGINE.SYMBOLS[ sTokenName ]] : null
		if( ! action ) throw new Error ( 'Erreur de syntaxe\n token: "'+ sTokenName +'"\n index: '+ i +'\n état: '+ nState1 )
		var f = ACTIONS[ action[0]]
		if( f ){
			var result = f()
			if( result ) return result
			} else throw new Error ( "Erreur parsing ... action "+ action )
	}while( i < aTokens.length && aStack.length )
	throw new Error ( 'Phrase incomplète...' )
	}
ParserLR.sIgnoredToken = '|WHITE_SPACES|NEW_LINE|TAB|SPACES|SPACE|COMMENT|'
ParserLR.Node =function ( X ){
	var e = document.createElement( X )
	e.className = 'myNode'
	e.toString =function(){return X}
	return e
	}
ParserLR.ParseTree =function ( sProd, LHS, RHS ){
	var o = ParserLR.Node( LHS )
	for(var i=0, ni=RHS.length; i<ni; i++) o.appendChild( RHS[i])
	return o
	}
