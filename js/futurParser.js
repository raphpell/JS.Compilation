EPSILON = '&epsilon;'
var ParserLR =function( ENGINE ){
	this.union( ENGINE )
	this.aStack = [ this.START ]
	this.aSymbols = []
	this.TreeBuilder = this.AST || ParserLR.ParseTree
	}
ParserLR.prototype ={
	nError: 0,
	getAction :function( nState, sSymbol ){
		return this.MATRICE[ nState ] && this.MATRICE[ nState ][ this.SYMBOLS[ sSymbol ]]
		},
	getResult :function(){
		return this.readToken( Lexeme({ token:this.END }))
		},
	getState :function(){
		return this.aStack[this.aStack.length-1].substring(1)
		},
	readToken :function( oToken ){
		var sSymbol = oToken.nodeName.toUpperCase(), result
		if( ParserLR.sIgnored.indexOf( '|'+sSymbol+'|' )> -1 ) return null
		this.oToken = oToken
		do{
			if( this.action = this.getAction( this.getState(), sSymbol )){
				var s = this.action[0]
				result = this[s]()
				} else this.e()
		}while( this.aStack.length && s=='r' )
		return result
		},
	e :function(){
		throw new Error ( 'Erreur de syntaxe\n token: "'+ JSON.stringify( this.oToken.oValue ) +'"\n état: '+ this.getState())
		// this.nError++
		// this.aSymbols.push( this.oToken )
		},
	s :function(){
		this.aStack.push( this.action )
		this.aSymbols.push( this.oToken )
		},
	r :function(){
		var ProdID = this.action.substring(1)
		, P = this.PRODUCTIONS[ ProdID ]
		, LHS = P[0], RHS = P[1]
		, nPop = RHS.length==1 && RHS[0]==EPSILON ? 0 : RHS.length
		if( nPop ) this.aStack = this.aStack.slice( 0, -nPop )
		nPop += this.nError
		this.nError = 0
		if( this.aStack.length ){
			var goto_ = this.getAction( this.getState(), LHS )
			if( goto_ ){
				this.aStack.push( goto_.replace('g','s'))
				this.aSymbols.push(
					this.TreeBuilder(
						'('+ ProdID +') '+ LHS +' -> '+ RHS.join(' '),
						LHS,
						this.aSymbols.splice( this.aSymbols.length-nPop, nPop )
						)
					)
				}
			}
		},
	a :function(){
		return this.aSymbols.pop()
		}
	}
	
ParserLR.sIgnored = '|WHITE_SPACES|NEW_LINE|TAB|SPACES|SPACE|SLC|MLC|'
ParserLR.parse =function( aTokens, ENGINE ){
	var o = new ParserLR( ENGINE )
	for(var i=0; aTokens[i]; i++ ) o.readToken( aTokens[i])
	return o.getResult()
	}
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
