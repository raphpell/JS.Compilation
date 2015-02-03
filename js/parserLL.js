/* UNDER REFLEXION ! */

EPSILON = '&epsilon;'
	
var newNode =function( X ){
	var o = document.createElement('DIV')
	o.innerHTML = '<DIV class="symbol">' + X + '</DIV>'
	o.className = 'myNode'
	return o
	}

var ParserLL =function( aTokens, ENGINE ){
	aTokens.push( ENGINE.END )
	, oStart = newNode( ENGINE.START )
	, aStack = [ ENGINE.END, ENGINE.START ]
	, aNodesStack = [ {symbol:ENGINE.END}, oStart ]
	, i=0
	, X
	, Token
	, oParent
	, nInfinitLoop = 0

	do{
		X=aStack.pop()
		oParent=aNodesStack.pop()
		Token=aTokens[i]
		if( X==Token ){
			//	ok terminé
			if( X==ENGINE.END ) break;
			//	Dépilage: les symboles terminaux sont identiques.
			else i++
			}
		else{
			//	Erreur: Les symboles terminaux X et Token sont différents !
			if( ENGINE.T.have( X )) break;
			else if( ENGINE.N.have( X )){
				var RHS = ENGINE.M.get( X, Token )
				var bConflict = ENGINE.M.conflict( X, Token )
				// La règle M[ X ][ Token ] n'existe pas.
				// La règle M[ X ][ EPSILON ] est prise en alternative.
				if( ! RHS ){
					Token = EPSILON
					RHS = ENGINE.M.get( X, Token )
					bConflict = ENGINE.M.conflict( X, Token )
					}
			//	if( bConflict ) Conflit ( '+ENGINE.M[ X][ Token ]+' ) rencontré.
				if( RHS ){
					// Erreur: On tente une boucle infinie ?
					if( RHS[0]==X ){
						nInfinitLoop++
						if( nInfinitLoop==4 ) break;
						} else nInfinitLoop = 0
				//	 X --> RHS.join(' ')
				//	if( bConflict ) a été choisi !

					var a = RHS.concat([]) // 'cause reverse
					var aNodes = []
					for(var j=0, nj=a.length; j<nj; j++ )
						oParent.appendChild( aNodes[j] = newNode( a[j] ))
					if( a[0]==EPSILON ) continue ;
					aStack = aStack.concat( a.reverse() )
					aNodesStack = aNodesStack.concat( aNodes.reverse() )
					}
				else throw Error ( "La règle M["+ X +"]["+ Token +"] n'existe pas." )
				}
			else throw Error ( "Un conflit ?" )
			}
		}while( i<aTokens.length && aStack.length )
	
	for(var ni=aTokens.length-1; i<ni; i++ ){
		var oError =  newNode( aTokens[i])
		oError.className += ' error'
		oStart.appendChild( oError )
		}
	return oStart
	}